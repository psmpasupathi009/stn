import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

// Cancel order (customer) - only before shipped (pending, confirmed, processing). Compliant: no cancel after dispatch.
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
      if (order.status === 'cancelled') {
        return NextResponse.json(
          { error: 'This order is already cancelled.' },
          { status: 400 }
        )
      }
      const cancellable = ['pending', 'confirmed', 'processing'].includes(order.status)
      if (!cancellable) {
        return NextResponse.json(
          { error: 'Order can only be cancelled before it is shipped. Once we have shipped your order, cancellation is not possible.' },
          { status: 400 }
        )
      }
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'cancelled', cancelledAt: new Date() },
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
      const reason = (body.reason as string)?.trim()
      const validReasons = ['defective', 'wrong_item', 'damaged_in_transit', 'changed_mind', 'quality_issue', 'other']
      if (!reason || !validReasons.includes(reason)) {
        return NextResponse.json(
          { error: 'Please select a valid refund reason.' },
          { status: 400 }
        )
      }
      const reasonOther = reason === 'other' ? (body.reasonOther as string)?.trim()?.slice(0, 500) : null
      const comment = (body.comment as string)?.trim()?.slice(0, 1000) || null
      await prisma.order.update({
        where: { id: orderId },
        data: {
          refundRequested: true,
          refundRequestedAt: new Date(),
          refundReason: reason,
          refundReasonOther: reasonOther || undefined,
          refundComment: comment || undefined,
          refundStatus: 'requested',
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
