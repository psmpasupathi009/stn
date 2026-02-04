import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPayment } from '@/lib/razorpay'
import { getSessionFromRequest } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = await request.json()

    const isValid = await verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    })
    if (!order || order.userId !== session.userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Order placed + processing: customer sees "Order Placed" & "Processing". Cancel allowed until we ship.
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id,
        status: 'processing',
      },
    })

    return NextResponse.json({ success: true, message: 'Payment verified', order: { status: 'processing', paymentStatus: 'paid' } })
  } catch (error: unknown) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
