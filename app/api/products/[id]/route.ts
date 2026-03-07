import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

/** Ensure image URLs are valid for frontend (live site). Empty string from DB -> null. */
function sanitizeProductImages<T extends { image?: string | null; images?: string[] | null }>(p: T): T {
  const image = p.image && p.image.trim() ? p.image.trim() : null
  const images = Array.isArray(p.images) ? p.images.filter((u): u is string => typeof u === 'string' && u.trim() !== '') : []
  return { ...p, image: image || null, images }
}

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

    return NextResponse.json(sanitizeProductImages(product))
  } catch (error: unknown) {
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
    const session = await getSessionFromRequest(request)
    if (!session || session.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }
    const { id } = await params
    const body = await request.json()
    const {
      name,
      category,
      itemCode,
      weight,
      variantLabel,
      mrp,
      salePrice,
      gst,
      hsnCode,
      image,
      images,
      description,
      inStock,
    } = body

    const imageUrls = Array.isArray(images) ? images.filter((u: unknown) => typeof u === 'string' && u.trim()) : []
    const mainImageRaw = image !== undefined ? image : (imageUrls.length > 0 ? imageUrls[0] : null)
    const mainImage = typeof mainImageRaw === 'string' && mainImageRaw.trim() ? mainImageRaw.trim() : null
    const hasImagesPayload = images !== undefined

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(itemCode && { itemCode }),
        ...(weight !== undefined && { weight }),
        ...(variantLabel !== undefined && { variantLabel: variantLabel != null && String(variantLabel).trim() !== '' ? String(variantLabel).trim() : null }),
        ...(mrp && { mrp: parseFloat(mrp) }),
        ...(salePrice && { salePrice: parseFloat(salePrice) }),
        ...(gst !== undefined && { gst: parseFloat(gst) }),
        ...(hsnCode && { hsnCode }),
        ...(hasImagesPayload && { image: mainImage, images: imageUrls }),
        ...(description !== undefined && { description }),
        ...(inStock !== undefined && { inStock }),
      },
    })

    return NextResponse.json(sanitizeProductImages(product))
  } catch (error: unknown) {
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
    const session = await getSessionFromRequest(request)
    if (!session || session.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }
    const { id } = await params
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
