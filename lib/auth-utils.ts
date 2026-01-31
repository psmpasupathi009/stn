import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from './session'

/**
 * Get session from request - returns session or null
 */
export async function getAuthSession(request: NextRequest) {
  return await getSessionFromRequest(request)
}

/**
 * Require authentication - throws if not authenticated
 * Returns the email of the authenticated user
 */
export async function requireAuth(request: NextRequest): Promise<string> {
  const session = await getSessionFromRequest(request)
  
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  return session.email
}

/**
 * Require admin access - throws if not admin
 * Returns the email of the admin user
 */
export async function requireAdmin(request: NextRequest): Promise<string> {
  const session = await getSessionFromRequest(request)
  
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  if (session.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }
  
  return session.email
}

/**
 * Handle auth errors in API routes
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
