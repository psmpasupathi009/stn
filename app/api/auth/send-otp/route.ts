import { NextRequest, NextResponse } from 'next/server'
import { createOTP } from '@/lib/otp'
import { sendOTP, normalizeEmail, isValidEmail, wasEmailSent } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email and type are required' },
        { status: 400 }
      )
    }

    if (type !== 'SIGNUP' && type !== 'FORGOT_PASSWORD') {
      return NextResponse.json(
        { error: 'Type must be SIGNUP or FORGOT_PASSWORD' },
        { status: 400 }
      )
    }

    // Normalize and validate email
    const normalizedEmail = normalizeEmail(email)
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Create OTP
    const otpRecord = await createOTP(normalizedEmail, type, 10)

    const emailResult = await sendOTP(normalizedEmail, otpRecord.code)
    if (!wasEmailSent(emailResult)) {
      console.warn(`OTP (email not sent) - use OTP: ${otpRecord.code}`)
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      expiresIn: 10, // minutes
    })
  } catch (error: unknown) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
