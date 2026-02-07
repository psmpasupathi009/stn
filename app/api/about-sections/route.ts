import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

function requireAdmin(request: NextRequest) {
  return getSessionFromRequest(request).then((session) => {
    if (!session || session.role?.toUpperCase() !== 'ADMIN') {
      return { ok: false as const, status: 401 }
    }
    return { ok: true as const, session }
  })
}

export async function GET() {
  try {
    const sections = await prisma.aboutSection.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(sections)
  } catch (error) {
    console.error('About sections GET:', error)
    return NextResponse.json({ error: 'Failed to fetch about sections' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })

  try {
    const body = await request.json()
    const { title, content, image, imageLeft, order } = body

    const section = await prisma.aboutSection.create({
      data: {
        title: title || 'Section',
        content: content || '',
        image: image || null,
        imageLeft: imageLeft === true,
        order: typeof order === 'number' ? order : 0,
      },
    })
    return NextResponse.json(section, { status: 201 })
  } catch (error) {
    console.error('About sections POST:', error)
    return NextResponse.json({ error: 'Failed to create about section' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })

  try {
    const { orderIds } = (await request.json()) as { orderIds?: string[] }
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'orderIds array required' }, { status: 400 })
    }

    await Promise.all(
      orderIds.map((id, index) =>
        prisma.aboutSection.update({ where: { id }, data: { order: index } })
      )
    )
    const sections = await prisma.aboutSection.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(sections)
  } catch (error) {
    console.error('About sections PUT:', error)
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
  }
}
