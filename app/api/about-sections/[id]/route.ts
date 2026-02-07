import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

async function requireAdmin(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.role?.toUpperCase() !== 'ADMIN') {
    return null
  }
  return session
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const section = await prisma.aboutSection.findUnique({ where: { id } })
    if (!section) {
      return NextResponse.json({ error: 'About section not found' }, { status: 404 })
    }
    return NextResponse.json(section)
  } catch (error) {
    console.error('About section GET:', error)
    return NextResponse.json({ error: 'Failed to fetch about section' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = (await request.json()) as {
      title?: string
      content?: string
      image?: string | null
      imageLeft?: boolean
      order?: number
    }
    const section = await prisma.aboutSection.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.image !== undefined && { image: body.image || null }),
        ...(body.imageLeft !== undefined && { imageLeft: body.imageLeft === true }),
        ...(typeof body.order === 'number' && { order: body.order }),
      },
    })
    return NextResponse.json(section)
  } catch (error) {
    console.error('About section PUT:', error)
    return NextResponse.json({ error: 'Failed to update about section' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.aboutSection.delete({ where: { id } })
    return NextResponse.json({ message: 'About section deleted successfully' })
  } catch (error) {
    console.error('About section DELETE:', error)
    return NextResponse.json({ error: 'Failed to delete about section' }, { status: 500 })
  }
}
