import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quantity } = await request.json()

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    })
    if (!cartItem || cartItem.cart.userId !== session.userId) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id },
      })
    } else {
      await prisma.cartItem.update({
        where: { id },
        data: { quantity },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update cart item error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    })
    if (!cartItem || cartItem.cart.userId !== session.userId) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    await prisma.cartItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Delete cart item error:', error)
    return NextResponse.json(
      { error: 'Failed to delete cart item' },
      { status: 500 }
    )
  }
}
