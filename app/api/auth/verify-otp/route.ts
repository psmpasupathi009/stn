import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.otp || !user.otpExpires) {
      return NextResponse.json({ error: 'Invalid OTP request' }, { status: 400 })
    }

    if (new Date() > user.otpExpires) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 })
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // Clear OTP
    await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpires: null,
        isVerified: true,
      },
    })

    // Only return token if user has password set (for existing users)
    // If no password, user needs to complete signup
    if (user.password) {
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
    } else {
      // User doesn't have password yet, return user info without token
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          password: false, // Indicate password not set
        },
      })
    }
  } catch (error: any) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
