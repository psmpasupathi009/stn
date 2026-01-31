import { NextRequest, NextResponse } from 'next/server'
import { createOTP } from '@/lib/otp'
import { sendOTP, normalizeEmail, isValidEmail, wasEmailSent } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name, phoneNumber } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Normalize and validate email
    const normalizedEmail = normalizeEmail(email)
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate name
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name is required and must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser && existingUser.password) {
      return NextResponse.json(
        { error: 'Email already registered. Please sign in instead.' },
        { status: 400 }
      )
    }

    // Create OTP for signup
    const otpRecord = await createOTP(normalizedEmail, 'SIGNUP', 10)

    const emailResult = await sendOTP(normalizedEmail, otpRecord.code)
    if (!wasEmailSent(emailResult)) {
      console.warn(`Signup OTP (email not sent) - use OTP: ${otpRecord.code}`)
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      expiresIn: 10, // minutes
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate signup' },
      { status: 500 }
    )
  }
}
