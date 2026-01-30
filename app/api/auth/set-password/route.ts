import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    // Check if user is admin
    const userBeforeUpdate = await prisma.user.findUnique({
      where: { email },
    })

    if (!userBeforeUpdate) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // For admins, don't update name/phone. For users, update if provided
    const updateData: any = {
      password: hashedPassword,
      isVerified: true,
    }

    // Only update name and phone for regular users (not admins)
    if (userBeforeUpdate.role !== 'admin') {
      if (name) updateData.name = name
      if (phone) updateData.phone = phone
    }

    const user = await prisma.user.update({
      where: { email },
      data: updateData,
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error('Set password error:', error)
    return NextResponse.json(
      { error: 'Failed to set password' },
      { status: 500 }
    )
  }
}
