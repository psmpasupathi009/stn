import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, isAdminEmail } from '@/lib/auth'
import { sendOTP } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    })

    const isAdmin = await isAdminEmail(email)

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          role: isAdmin ? 'admin' : 'user',
          otp,
          otpExpires,
        },
      })
    } else {
      // Update existing user's OTP
      await prisma.user.update({
        where: { email },
        data: {
          otp,
          otpExpires,
        },
      })
    }

    // Send OTP via email
    await sendOTP(email, otp)

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent to your email',
      isAdmin 
    })
  } catch (error: any) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
