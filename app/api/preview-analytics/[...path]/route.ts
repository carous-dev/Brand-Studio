import { NextRequest, NextResponse } from 'next/server'

const FLASK_API_BASE =
  process.env.FLASK_API_URL ||
  process.env.NEXT_PUBLIC_FLASK_API_URL ||
  'http://localhost:5000/api'

function targetUrl(request: NextRequest, path: string[]) {
  const base = FLASK_API_BASE.replace(/\/$/, '')
  const suffix = path.map((part) => encodeURIComponent(part)).join('/')
  const url = new URL(`${base}/preview-analytics/${suffix}`)
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })
  return url
}

function proxyHeaders(request: NextRequest) {
  const headers = new Headers()
  headers.set('Accept', 'application/json')
  headers.set('Content-Type', request.headers.get('content-type') || 'application/json')
  headers.set('X-Forwarded-Host', request.headers.get('host') || '')
  headers.set('X-Forwarded-For', request.headers.get('x-forwarded-for') || '')
  headers.set('User-Agent', request.headers.get('user-agent') || '')
  return headers
}

async function proxy(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await context.params
  const method = request.method.toUpperCase()
  const hasBody = !['GET', 'HEAD'].includes(method)

  const response = await fetch(targetUrl(request, path), {
    method,
    headers: proxyHeaders(request),
    body: hasBody ? await request.text() : undefined,
    cache: 'no-store',
  })

  const text = await response.text()
  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, context)
}

export async function POST(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, context)
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: 'GET, POST, OPTIONS',
      'Cache-Control': 'no-store',
    },
  })
}
