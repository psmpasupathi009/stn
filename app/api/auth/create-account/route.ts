import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { createUser } from '@/lib/auth'
import { verifyOTP } from '@/lib/otp'
import { signSession, getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/session'
import { normalizeEmail, isValidEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phoneNumber } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Verify OTP was used (optional check - you might want to require OTP verification first)
    // For now, we'll create the account if OTP was verified or if this is a new signup

    // Check if user already exists with password
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser && existingUser.password) {
      return NextResponse.json(
        { error: 'Account already exists. Please sign in.' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser({
      email: normalizedEmail,
      password,
      name: name?.trim(),
      phoneNumber: phoneNumber?.trim(),
    })

    // Create session and set cookie (auto-login after signup)
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const sessionJwt = await signSession(sessionPayload)
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionJwt, getSessionCookieOptions())

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create account'
    const isPrismaP2002 =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    if (message === 'Account already exists' || isPrismaP2002) {
      return NextResponse.json(
        { error: 'Account already exists. Please sign in.' },
        { status: 400 }
      )
    }
    console.error('Create account error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
