import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      category,
      itemCode,
      weight,
      mrp,
      salePrice,
      gst,
      hsnCode,
      image,
      images,
      description,
      inStock,
    } = body

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(itemCode && { itemCode }),
        ...(weight && { weight }),
        ...(mrp && { mrp: parseFloat(mrp) }),
        ...(salePrice && { salePrice: parseFloat(salePrice) }),
        ...(gst !== undefined && { gst: parseFloat(gst) }),
        ...(hsnCode && { hsnCode }),
        ...(image !== undefined && { image }),
        ...(images && { images }),
        ...(description !== undefined && { description }),
        ...(inStock !== undefined && { inStock }),
      },
    })

    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
