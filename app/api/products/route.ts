import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {}
    if (category) {
      where.category = category
    }
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    if (!name || !category || !itemCode || !mrp || !salePrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        itemCode,
        weight: weight || '',
        mrp: parseFloat(mrp),
        salePrice: parseFloat(salePrice),
        gst: parseFloat(gst || 0),
        hsnCode: hsnCode || '',
        image: image || null,
        images: images || [],
        description: description || null,
        inStock: inStock !== undefined ? inStock : true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
