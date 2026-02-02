import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'
import { createRazorpayOrder } from '@/lib/razorpay'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')
    const email = searchParams.get('email')

    // If orderId and email are provided, track specific order
    if (orderId && email) {
      const normalizedOrderId = String(orderId).trim().toLowerCase()
      const normalizedEmail = String(email).trim().toLowerCase()

      if (!normalizedOrderId || !normalizedEmail) {
        return NextResponse.json({ error: 'Order ID and email are required' }, { status: 400 })
      }

      const user = await prisma.user.findFirst({
        where: {
          email: { equals: normalizedEmail, mode: 'insensitive' },
        },
      })

      if (!user) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Try exact match first (full 24-char ObjectId)
      let order = await prisma.order.findFirst({
        where: {
          id: normalizedOrderId,
          userId: user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      // If no match and orderId is short (8 chars), try match by suffix
      if (!order && normalizedOrderId.length >= 6 && normalizedOrderId.length <= 12) {
        const allOrders = await prisma.order.findMany({
          where: { userId: user.id },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        })
        order = allOrders.find(
          (o) => o.id.toLowerCase().endsWith(normalizedOrderId) ||
            o.id.toLowerCase().slice(-8) === normalizedOrderId
        ) ?? null
      }

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json(order)
    }

    // Otherwise, return user's orders (requires auth via session cookie)
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error: unknown) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items, shippingAddress, gstAmount, deliveryCharge, isBuyNow } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      )
    }

    // Calculate subtotal
    let subtotal = 0
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })
      if (product) {
        subtotal += product.salePrice * item.quantity
      }
    }

    // Calculate GST if not provided (5%)
    const gst = gstAmount ?? Math.round(subtotal * 0.05 * 100) / 100
    const delivery = deliveryCharge ?? 0
    const totalAmount = subtotal + gst + delivery

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    })

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session.userId,
        subtotal,
        gstAmount: gst,
        deliveryCharge: delivery,
        totalAmount,
        shippingAddress: shippingAddress || '',
        razorpayOrderId: razorpayOrder.id,
        items: {
          create: items.map((item: { productId: string; quantity: number; price?: number }) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            price: item.price ?? 0,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Clear cart only if not a Buy Now order
    if (!isBuyNow) {
      const cart = await prisma.cart.findUnique({
        where: { userId: session.userId },
      })

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        })
      }
    }

    return NextResponse.json({
      order,
      razorpayOrderId: razorpayOrder.id,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error: unknown) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
