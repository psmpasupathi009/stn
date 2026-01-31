import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { updateUserPassword, isAdminEmail } from '@/lib/auth'
import { verifyOTP } from '@/lib/otp'
import { signSession, getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/session'
import { normalizeEmail, isValidEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, password, code } = await request.json()

    if (!email || !password || !code) {
      return NextResponse.json(
        { error: 'Email, password, and OTP code are required' },
        { status: 400 }
      )
    }

    // Normalize and validate email
    const normalizedEmail = normalizeEmail(email)
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'OTP must be 6 digits' }, { status: 400 })
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(normalizedEmail, code, 'FORGOT_PASSWORD')
    if (!isValidOTP) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update password
    await updateUserPassword(normalizedEmail, password)

    // Resolve role
    let role = user.role
    const isAdmin = await isAdminEmail(normalizedEmail)
    if (isAdmin) {
      role = 'ADMIN'
      if (user.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: normalizedEmail },
          data: { role: 'ADMIN' },
        })
      }
    }

    // Create session and set cookie (auto-login after password reset)
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      role,
    }

    const sessionJwt = await signSession(sessionPayload)
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionJwt, getSessionCookieOptions())

    // Get updated user
    const updatedUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        name: updatedUser!.name,
        phoneNumber: updatedUser!.phoneNumber,
        role,
        isEmailVerified: updatedUser!.isEmailVerified,
      },
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
