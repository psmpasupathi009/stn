import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminEmail } from '@/lib/auth'
import { createOTP } from '@/lib/otp'
import { sendOTP, normalizeEmail, isValidEmail, wasEmailSent } from '@/lib/email'

// Rate limiting: Store in memory (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const key = `signup:${email}`
  const limit = rateLimitMap.get(key)

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60 * 1000 }) // 1 minute window
    return true
  }

  if (limit.count >= 5) {
    // Max 5 requests per minute
    return false
  }

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Normalize and validate email
    const normalizedEmail = normalizeEmail(email)
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate name (required for non-admin users)
    const isAdmin = await isAdminEmail(normalizedEmail)
    if (!isAdmin && (!name || name.trim().length < 2)) {
      return NextResponse.json(
        { error: 'Name is required and must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Check rate limiting
    if (!checkRateLimit(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser && existingUser.password) {
      // User already exists with password
      return NextResponse.json(
        { error: 'Email already registered. Please login instead.' },
        { status: 400 }
      )
    }

    // Create OTP record (stored in Otp model)
    const otpRecord = await createOTP(normalizedEmail, 'SIGNUP', 5)

    if (existingUser) {
      // Update existing user name/phone if provided
      if (!isAdmin && (name?.trim() || phone?.trim())) {
        await prisma.user.update({
          where: { email: normalizedEmail },
          data: {
            name: name?.trim() || existingUser.name,
            phoneNumber: phone?.trim() || existingUser.phoneNumber,
          },
        })
      }
    } else {
      // Create new user (without password - set on OTP verify/create-account)
      await prisma.user.create({
        data: {
          email: normalizedEmail,
          role: isAdmin ? 'ADMIN' : 'USER',
          name: isAdmin ? undefined : name?.trim(),
          phoneNumber: isAdmin ? undefined : phone?.trim() || undefined,
        },
      })
    }

    const emailResult = await sendOTP(normalizedEmail, otpRecord.code)
    if (!wasEmailSent(emailResult)) {
      console.warn('Signup OTP (email not sent) - check console for OTP')
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      isAdmin,
    })
  } catch (error: any) {
    console.error('Signup init error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate signup. Please try again.' },
      { status: 500 }
    )
  }
}
