import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

// Cancel order (customer) - only pending or confirmed
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const action = body.action as string

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.userId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (action === 'cancel') {
      const cancellable = ['pending', 'confirmed'].includes(order.status)
      if (!cancellable) {
        return NextResponse.json(
          { error: 'Order can only be cancelled when it is pending or confirmed.' },
          { status: 400 }
        )
      }
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'cancelled' },
      })
      return NextResponse.json({ success: true, status: 'cancelled' })
    }

    if (action === 'requestRefund') {
      if (order.paymentStatus !== 'paid') {
        return NextResponse.json(
          { error: 'Refund can only be requested for paid orders.' },
          { status: 400 }
        )
      }
      if (order.refundRequested) {
        return NextResponse.json(
          { error: 'Refund has already been requested for this order.' },
          { status: 400 }
        )
      }
      await prisma.order.update({
        where: { id: orderId },
        data: {
          refundRequested: true,
          refundRequestedAt: new Date(),
        },
      })
      return NextResponse.json({ success: true, refundRequested: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    console.error('Order action error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
