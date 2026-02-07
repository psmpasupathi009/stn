import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'

/** Routes that require any authenticated user (redirect to login if no session). */
const AUTH_REQUIRED_PATHS = [
  '/home/cart',
  '/home/checkout',
  '/home/orders',
] as const

/** Admin-only routes; require session with role ADMIN. */
const ADMIN_PATH_PREFIX = '/admin'

const LOGIN_PATH = '/home/login'

function pathRequiresAuth(pathname: string): boolean {
  return AUTH_REQUIRED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function pathIsAdmin(pathname: string): boolean {
  return pathname === ADMIN_PATH_PREFIX || pathname.startsWith(`${ADMIN_PATH_PREFIX}/`)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Root → /home; profile is in header dropdown, so /home/profile → /home
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url))
  }
  if (pathname === '/home/profile' || pathname.startsWith('/home/profile/')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  let session: Awaited<ReturnType<typeof getSessionFromRequest>> = null
  try {
    session = await getSessionFromRequest(request)
  } catch {
    session = null
  }

  const isAdminRoute = pathIsAdmin(pathname)
  const isAuthRequiredRoute = pathRequiresAuth(pathname)

  // Admin: must be logged in and have role ADMIN
  if (isAdminRoute) {
    if (!session) {
      const login = new URL(LOGIN_PATH, request.url)
      login.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(login)
    }
    if (session.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return NextResponse.next()
  }

  // Customer protected routes: must be logged in
  if (isAuthRequiredRoute && !session) {
    const login = new URL(LOGIN_PATH, request.url)
    login.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all pathnames except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
