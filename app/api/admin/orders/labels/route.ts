import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

// Helper to check if user is admin
async function isAdmin(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return false
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  })
  
  return user?.role?.toUpperCase() === 'ADMIN'
}

// POST - Get order details for shipping labels
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderIds } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'Order IDs are required' }, { status: 400 })
    }

    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
        paymentStatus: 'paid',
      },
      select: {
        id: true,
        shippingAddress: true,
        trackingNumber: true,
        courierName: true,
        user: { select: { name: true } },
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Label data: only what is needed for shipping label (compliance / safety – no PII or financial data)
    const labelData = orders.map((order) => ({
      orderId: order.id,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      customerName: order.user.name || 'Customer',
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber ?? undefined,
      courierName: order.courierName ?? undefined,
    }))

    return NextResponse.json({ labels: labelData })
  } catch (error: unknown) {
    console.error('Get shipping labels error:', error)
    return NextResponse.json(
      { error: 'Failed to get shipping labels' },
      { status: 500 }
    )
  }
}
