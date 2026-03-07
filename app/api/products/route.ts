import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

/** Ensure image URLs are valid for frontend (live site). Empty string from DB -> null. */
function sanitizeProductImages<T extends { image?: string | null; images?: string[] | null }>(p: T): T {
  const image = p.image && p.image.trim() ? p.image.trim() : null
  const images = Array.isArray(p.images) ? p.images.filter((u): u is string => typeof u === 'string' && u.trim() !== '') : []
  return { ...p, image: image || null, images }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')
    const itemCode = searchParams.get('itemCode')?.trim()

    // Scan / barcode lookup: exact itemCode returns single product (for same name, different variant)
    if (itemCode) {
      const product = await prisma.product.findUnique({
        where: { itemCode },
      })
      if (product) return NextResponse.json(sanitizeProductImages(product))
      return NextResponse.json({ error: 'Product not found for this code' }, { status: 404 })
    }

    let products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Filter by category (case-insensitive)
    if (category?.trim()) {
      const categoryLower = category.toLowerCase()
      products = products.filter((p) =>
        p.category?.toLowerCase().includes(categoryLower)
      )
    }

    // Filter by search term (case-insensitive)
    if (search?.trim()) {
      const searchLower = search.toLowerCase()
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.itemCode?.toLowerCase().includes(searchLower)
      )
    }

    // Apply limit
    if (limit) {
      const n = parseInt(limit, 10)
      if (!Number.isNaN(n) && n > 0) products = products.slice(0, n)
    }

    return NextResponse.json(products.map(sanitizeProductImages))
  } catch (error: unknown) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }
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

    if (!name || !category || !itemCode || !mrp || !salePrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const imageUrls = Array.isArray(images) ? images.filter((u: unknown) => typeof u === 'string' && u.trim()) : []
    const mainImageRaw = image ?? imageUrls[0] ?? null
    const mainImage = typeof mainImageRaw === 'string' && mainImageRaw.trim() ? mainImageRaw.trim() : null

    const product = await prisma.product.create({
      data: {
        name,
        category,
        itemCode,
        weight: weight || '',
        variantLabel: variantLabel != null && String(variantLabel).trim() !== '' ? String(variantLabel).trim() : null,
        mrp: parseFloat(mrp),
        salePrice: parseFloat(salePrice),
        gst: parseFloat(gst || 0),
        hsnCode: hsnCode || '',
        image: mainImage,
        images: imageUrls,
        description: description || null,
        inStock: inStock !== undefined ? inStock : true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
