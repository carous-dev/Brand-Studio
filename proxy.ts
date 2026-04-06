import { NextRequest, NextResponse } from 'next/server'
import { getBrandFromHost } from './config/domains'

function getRequestHost(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-host') ||
    request.headers.get('x-original-host') ||
    request.headers.get('host') ||
    'localhost'
  )
}

function stripPort(host: string): string {
  return (host || '').toLowerCase().trim().split(':')[0]
}

function isLoopbackHost(host: string): boolean {
  const normalized = stripPort(host)
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1'
}

/**
 * Proxy to handle multi-tenant brand detection based on domain
 * STRICT MODE: Unknown domains are rejected with a 404 response
 * 
 * Runs on every request and:
 * 1. Detects the brand from request domain (strict matching only)
 * 2. If unknown domain: returns 404 "Preview not found"
 * 3. If known domain: sets x-brand header/cookie and continues
 */
export function proxy(request: NextRequest) {
  // Get the host header from the request
  const host = getRequestHost(request)
  const loopback = isLoopbackHost(host)

  // Determine brand from domain (strict matching)
  const cookieBrand = request.cookies.get('x-brand')?.value?.trim().toLowerCase() || ''
  const envBrand = (process.env.NEXT_PUBLIC_BRAND || '').trim().toLowerCase()
  let brand = getBrandFromHost(host)

  // For localhost/loopback traffic, do not force legacy fairfield fallback.
  // Prefer explicit cookie brand or env override; otherwise continue without x-brand.
  if (loopback) {
    brand = cookieBrand || envBrand || ''
  }

  // If domain not recognized, return 404 with preview not found message
  if (!brand) {
    if (loopback) {
      return NextResponse.next()
    }

    return NextResponse.json(
      {
        error: 'Preview not found',
        message: `The domain "${host}" is not configured for this service`,
        status: 404,
      },
      { status: 404 }
    )
  }

  // Make brand available to downstream handlers on the same request.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-brand', brand)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Also set brand in response headers for debugging/visibility.
  response.headers.set('x-brand', brand)

  // Set brand in cookies for client-side access if needed
  // Reduced cookie lifetime to prevent stale brand issues
  response.cookies.set('x-brand', brand, {
    maxAge: 60 * 60, // 1 hour instead of 30 days
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false, // Accessible to client-side JavaScript
    sameSite: 'lax',
  })

  return response
}

/**
 * Configure which routes should run proxy
 * Run on all routes except static assets, API routes to external services, etc.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public/* (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
