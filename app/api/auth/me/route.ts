import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.userId) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
        isEmailVerified: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: user ?? null })
  } catch (err) {
    console.error('Get me error:', err)
    return NextResponse.json({ user: null })
  }
}

