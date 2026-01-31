import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

// GET - Fetch single hero section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const heroSection = await prisma.heroSection.findUnique({
      where: { id },
    })

    if (!heroSection) {
      return NextResponse.json({ error: 'Hero section not found' }, { status: 404 })
    }

    return NextResponse.json(heroSection)
  } catch (error) {
    console.error('Error fetching hero section:', error)
    return NextResponse.json({ error: 'Failed to fetch hero section' }, { status: 500 })
  }
}

// PUT - Update hero section (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, buttonText, buttonLink, image, icon, order, isActive } = body

    const heroSection = await prisma.heroSection.update({
      where: { id },
      data: {
        title,
        description,
        buttonText,
        buttonLink,
        image: image || null,
        icon: icon || null,
        order: order ?? undefined,
        isActive: isActive ?? undefined,
      },
    })

    return NextResponse.json(heroSection)
  } catch (error) {
    console.error('Error updating hero section:', error)
    return NextResponse.json({ error: 'Failed to update hero section' }, { status: 500 })
  }
}

// DELETE - Delete hero section (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.heroSection.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Hero section deleted successfully' })
  } catch (error) {
    console.error('Error deleting hero section:', error)
    return NextResponse.json({ error: 'Failed to delete hero section' }, { status: 500 })
  }
}
