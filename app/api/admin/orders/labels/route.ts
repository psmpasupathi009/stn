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
        paymentStatus: 'paid', // Only paid orders
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                itemCode: true,
                weight: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Format order data for label generation
    const labelData = orders.map((order) => ({
      orderId: order.id,
      orderDate: order.createdAt,
      
      // Customer details
      customerName: order.user.name || 'Customer',
      customerEmail: order.user.email,
      customerPhone: order.user.phoneNumber || '',
      shippingAddress: order.shippingAddress,
      
      // Order details
      totalAmount: order.totalAmount,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      
      // Products
      items: order.items.map((item) => ({
        name: item.product.name,
        itemCode: item.product.itemCode,
        weight: item.product.weight,
        quantity: item.quantity,
        price: item.price,
      })),
      
      // Shipping details
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      expectedDelivery: order.expectedDelivery,
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
