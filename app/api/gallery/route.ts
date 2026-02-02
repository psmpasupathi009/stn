import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

// GET - Fetch all gallery media (public)
export async function GET() {
  try {
    const items = await prisma.galleryMedia.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error: unknown) {
    console.error('Gallery fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
  }
}

// POST - Add gallery media (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null
    if (user?.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url, type, caption } = body

    if (!url || !type || !['image', 'video'].includes(type)) {
      return NextResponse.json({ error: 'Valid url and type (image|video) required' }, { status: 400 })
    }

    const maxOrder = await prisma.galleryMedia.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const order = (maxOrder?.order ?? -1) + 1

    const item = await prisma.galleryMedia.create({
      data: {
        url,
        type,
        caption: caption || null,
        order,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error: unknown) {
    console.error('Gallery create error:', error)
    return NextResponse.json({ error: 'Failed to create gallery item' }, { status: 500 })
  }
}

// PUT - Reorder gallery items (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null
    if (user?.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderIds } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'orderIds array required' }, { status: 400 })
    }

    await Promise.all(
      orderIds.map((id: string, index: number) =>
        prisma.galleryMedia.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    const items = await prisma.galleryMedia.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error: unknown) {
    console.error('Gallery reorder error:', error)
    return NextResponse.json({ error: 'Failed to reorder gallery' }, { status: 500 })
  }
}
