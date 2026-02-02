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

// GET - Fetch all orders for admin
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        (where.createdAt as Record<string, Date>).gte = new Date(dateFrom)
      }
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        ;(where.createdAt as Record<string, Date>).lte = endDate
      }
    }

    const orders = await prisma.order.findMany({
      where,
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
                image: true,
                itemCode: true,
                weight: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter by search if provided
    let filteredOrders = orders
    if (search) {
      const searchLower = search.toLowerCase()
      filteredOrders = orders.filter((order) => {
        return (
          order.id.toLowerCase().includes(searchLower) ||
          order.user.email.toLowerCase().includes(searchLower) ||
          order.user.name?.toLowerCase().includes(searchLower) ||
          order.user.phoneNumber?.includes(search)
        )
      })
    }

    return NextResponse.json(filteredOrders)
  } catch (error: unknown) {
    console.error('Admin get orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// PUT - Update order status/shipping details
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, status, trackingNumber, courierName, expectedDelivery, adminNotes } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    
    if (status) {
      updateData.status = status
      
      // Set shippedAt when status changes to shipped
      if (status === 'shipped') {
        updateData.shippedAt = new Date()
      }
      
      // Set deliveredAt when status changes to delivered
      if (status === 'delivered') {
        updateData.deliveredAt = new Date()
      }
    }
    
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber
    }
    
    if (courierName !== undefined) {
      updateData.courierName = courierName
    }
    
    if (expectedDelivery) {
      updateData.expectedDelivery = new Date(expectedDelivery)
    }
    
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
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
            product: true,
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error: unknown) {
    console.error('Admin update order error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// POST - Bulk update orders (for shipping multiple orders)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderIds, status, courierName, expectedDelivery } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'Order IDs are required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    
    if (status) {
      updateData.status = status
      if (status === 'shipped') updateData.shippedAt = new Date()
      if (status === 'delivered') updateData.deliveredAt = new Date()
    }
    
    if (courierName) {
      updateData.courierName = courierName
    }
    
    if (expectedDelivery) {
      updateData.expectedDelivery = new Date(expectedDelivery)
    }

    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: updateData,
    })

    // Fetch updated orders
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
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
            product: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, orders })
  } catch (error: unknown) {
    console.error('Admin bulk update orders error:', error)
    return NextResponse.json(
      { error: 'Failed to update orders' },
      { status: 500 }
    )
  }
}
