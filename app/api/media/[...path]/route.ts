import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Runtime serving of brand-uploaded assets from public/images.
//
// Why this exists: Next.js 16's production server caches the public/ directory
// listing when it first warms. Image files written to public/images AFTER that
// point — i.e. every brand asset a dealer uploads from the dashboard — 404 from
// the static handler until the Next process restarts. Brand Studio deliberately
// does NOT restart the Next process on each save, so freshly-uploaded logos /
// favicons / hero images stayed invisible (on the dashboard and on the dealer
// preview sites) until the next deploy.
//
// This route reads the requested file from disk on every request, so a brand
// asset is served the instant it lands on disk — no restart, no deploy. It is
// wired up via an `afterFiles` rewrite in next.config.js (/images/:path* ->
// /api/media/:path*), which means files Next already knows about keep their
// fast static path and only the cache-missed uploads fall through to here.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
}

// Resolve the request path to an absolute file inside IMAGES_DIR, or null if it
// is empty or attempts to escape the directory (path traversal).
function resolveImagePath(segments: string[]): string | null {
  if (
    segments.length === 0 ||
    segments.some((s) => !s || s === '.' || s === '..' || s.includes('/') || s.includes('\\'))
  ) {
    return null
  }
  const absPath = path.normalize(path.join(IMAGES_DIR, segments.join('/')))
  if (absPath !== IMAGES_DIR && !absPath.startsWith(IMAGES_DIR + path.sep)) {
    return null
  }
  return absPath
}

function headersFor(ext: string, size: number): HeadersInit {
  return {
    'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream',
    'Content-Length': String(size),
    // Short cache: assets show immediately and re-uploads (same filename)
    // refresh within a minute, while repeat views still hit cache.
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path: segments = [] } = await context.params
  const absPath = resolveImagePath(segments)
  if (!absPath) {
    return new NextResponse('Not found', { status: 404 })
  }
  try {
    const data = await fs.readFile(absPath)
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: headersFor(path.extname(absPath).toLowerCase(), data.byteLength),
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}

export async function HEAD(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path: segments = [] } = await context.params
  const absPath = resolveImagePath(segments)
  if (!absPath) {
    return new NextResponse(null, { status: 404 })
  }
  try {
    const stat = await fs.stat(absPath)
    return new NextResponse(null, {
      status: 200,
      headers: headersFor(path.extname(absPath).toLowerCase(), stat.size),
    })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
