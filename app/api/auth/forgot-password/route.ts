import { NextRequest, NextResponse } from 'next/server'
import { createOTP } from '@/lib/otp'
import { sendOTP, normalizeEmail, isValidEmail, wasEmailSent } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Normalize and validate email
    const normalizedEmail = normalizeEmail(email)
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if user exists (admin or regular user)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Don't reveal if user exists (security best practice)
    // But only send OTP if user actually exists
    if (user) {
      // Create OTP for password reset
      const otpRecord = await createOTP(normalizedEmail, 'FORGOT_PASSWORD', 10)

      const emailResult = await sendOTP(normalizedEmail, otpRecord.code)
      if (!wasEmailSent(emailResult)) {
        console.warn(`Password reset OTP (email not sent) - use OTP: ${otpRecord.code}`)
      }
    }

    // Always return success (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: 'If the email exists, an OTP has been sent to your email',
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
