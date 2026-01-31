import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP } from '@/lib/otp'
import { normalizeEmail, isValidEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, code, type } = await request.json()

    if (!email || !code || !type) {
      return NextResponse.json(
        { error: 'Email, code, and type are required' },
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

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'OTP must be 6 digits' }, { status: 400 })
    }

    // Verify OTP
    const isValid = await verifyOTP(normalizedEmail, code, type)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'OTP verified successfully',
    })
  } catch (error: any) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
