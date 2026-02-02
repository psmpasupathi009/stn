import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

// GET - Fetch all hero sections (public for display, all for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') !== 'false'

    const heroSections = await prisma.heroSection.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(heroSections)
  } catch (error) {
    console.error('Error fetching hero sections:', error)
    return NextResponse.json({ error: 'Failed to fetch hero sections' }, { status: 500 })
  }
}

// POST - Create new hero section (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, buttonText, buttonLink, image, icon, order, isActive } = body

    // Only buttonLink is required now
    if (!buttonLink) {
      return NextResponse.json({ error: 'Button link is required' }, { status: 400 })
    }

    const heroSection = await prisma.heroSection.create({
      data: {
        title: title || 'Hero Slide',
        description: description || '',
        buttonText: buttonText || 'Shop Now',
        buttonLink,
        image: image || null,
        icon: icon || null,
        order: order || 0,
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(heroSection, { status: 201 })
  } catch (error) {
    console.error('Error creating hero section:', error)
    return NextResponse.json({ error: 'Failed to create hero section' }, { status: 500 })
  }
}

// PUT - Reorder hero sections (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderIds } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'orderIds array required' }, { status: 400 })
    }

    await Promise.all(
      orderIds.map((id: string, index: number) =>
        prisma.heroSection.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    const heroSections = await prisma.heroSection.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(heroSections)
  } catch (error) {
    console.error('Error reordering hero sections:', error)
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
  }
}
