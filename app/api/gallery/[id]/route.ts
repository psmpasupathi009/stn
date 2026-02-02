import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

async function isAdmin(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return false
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  return user?.role?.toUpperCase() === 'ADMIN'
}

// PUT - Update gallery item
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { url, type, caption, order } = body

    const data: Record<string, unknown> = {}
    if (url) data.url = url
    if (type && ['image', 'video'].includes(type)) data.type = type
    if (caption !== undefined) data.caption = caption
    if (typeof order === 'number') data.order = order

    const item = await prisma.galleryMedia.update({
      where: { id },
      data,
    })
    return NextResponse.json(item)
  } catch (error: unknown) {
    console.error('Gallery update error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE - Remove gallery item
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.galleryMedia.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Gallery delete error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
