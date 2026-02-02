import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getUserByEmail, comparePassword, isAdminEmail } from '@/lib/auth'
import { signSession, getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/session'
import { normalizeEmail, isValidEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

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

    // Get user from database
    const user = await getUserByEmail(normalizedEmail)

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Resolve role: check ADMIN_EMAIL first
    let role = user.role
    const isAdmin = await isAdminEmail(normalizedEmail)
    if (isAdmin) {
      role = 'ADMIN'
      // Update user role in DB if needed
      if (user.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: normalizedEmail },
          data: { role: 'ADMIN' },
        })
      }
    }

    // Create session payload
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      role,
    }

    // Sign session JWT
    const sessionJwt = await signSession(sessionPayload)

    // Set httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionJwt, getSessionCookieOptions())

    // Return user (exclude password)
    return NextResponse.json({
      message: 'Sign in successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role,
        isEmailVerified: user.isEmailVerified,
      },
    })
  } catch (error: unknown) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}
