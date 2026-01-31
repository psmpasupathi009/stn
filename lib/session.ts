import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Session cookie name - use one constant everywhere
export const SESSION_COOKIE_NAME = 'stn_session'

// Get AUTH_SECRET from environment
const getSecret = () => {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET or JWT_SECRET environment variable is required')
  }
  if (secret.length < 32) {
    throw new Error('AUTH_SECRET must be at least 32 characters long')
  }
  return new TextEncoder().encode(secret)
}

export interface SessionPayload {
  userId: string
  email: string
  role: string
}

/**
 * Sign a session JWT with the given payload
 */
export async function signSession(payload: SessionPayload): Promise<string> {
  const secret = getSecret()
  
  const token = await new SignJWT({ ...payload } as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  return token
}

/**
 * Verify a session JWT token
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    })

    return payload as unknown as SessionPayload
  } catch (error) {
    return null
  }
}

/**
 * Get session from server-side cookies (Next.js 13+ App Router)
 */
export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie?.value) {
      return null
    }

    return await verifySession(sessionCookie.value)
  } catch (error) {
    return null
  }
}

/**
 * Get session from request (for API routes)
 */
export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionPayload | null> {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie?.value) {
      return null
    }

    return await verifySession(sessionCookie.value)
  } catch (error) {
    return null
  }
}

/**
 * Cookie options for setting session
 */
export function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }
}
