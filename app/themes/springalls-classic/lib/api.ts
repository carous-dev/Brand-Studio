/**
 * Brand Studio uses same-origin API routes (/api/inventory, /api/vehicle, etc.)
 * served by Next.js. Client-side fetches accept the relative path verbatim;
 * server-side fetches need an absolute URL, so we prepend the site origin.
 */

function isServer(): boolean {
  return typeof window === 'undefined'
}

function resolveServerOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_INTERNAL_ORIGIN ||
    `http://127.0.0.1:${process.env.PORT || process.env.NEXT_INTERNAL_PORT || '3000'}`
  ).replace(/\/+$/, '')
}

export function apiUrl(path: string): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path

  // Always start with an api-prefixed path
  let normalized = path.startsWith('/') ? path : `/${path}`
  if (!normalized.startsWith('/api/')) {
    normalized = `/api${normalized}`
  }

  // On the server, fetch() rejects relative URLs — prepend the dev origin.
  if (isServer()) {
    return `${resolveServerOrigin()}${normalized}`
  }
  return normalized
}

export function getApiBase(): string {
  return ''
}
