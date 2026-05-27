const RAW_BASE =
  process.env.NEXT_PUBLIC_CAROUS_API_BASE_URL ||
  process.env.NEXT_PUBLIC_CAROUS_API_PROXY_TARGET ||
  process.env.CAROUS_API_PROXY_TARGET ||
  ''
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || ''
const API_BASE = RAW_BASE.replace(/\/+$/, '')
const LEADS_PATH = process.env.NEXT_PUBLIC_LEADS_API_URL || '/leads'
const LOOKUP_PATH = process.env.NEXT_PUBLIC_LOOKUP_API_URL || '/lookup'

const isLeadPath = (path: string) =>
  /^\/?(?:(?:api|v\d+)\/)*(?:leads|send-lead-email)\/?$/i.test(path.trim())

const isLookupPath = (path: string) =>
  /^\/?(?:(?:api|v\d+)\/)*lookup\/?$/i.test(path.trim())

const isSimilarVehiclePath = (path: string) => {
  const [pathname] = path.trim().split(/[?#]/)
  return /^\/?(?:api\/)?vehicle\/similar\/?$/i.test(pathname)
}

function resolveSameOriginApiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const apiPath = normalized.startsWith('/api/') ? normalized : `/api${normalized}`

  if (typeof window !== 'undefined') return apiPath

  const origin = SITE_ORIGIN || 'http://localhost:3000'
  return `${origin.replace(/\/+$/, '')}${apiPath}`
}

function resolveSpecialPath(path: string): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path

  const normalized = path.startsWith('/') ? path : `/${path}`
  if (!API_BASE) return normalized
  return `${API_BASE}${normalized}`
}

export function apiUrl(path: string): string {
  if (!path) return API_BASE || ''
  if (isLeadPath(path)) return resolveSpecialPath(LEADS_PATH)
  if (isLookupPath(path)) return resolveSpecialPath(LOOKUP_PATH)
  if (isSimilarVehiclePath(path)) return resolveSameOriginApiPath(path)
  if (/^https?:\/\//i.test(path)) return path

  let base = API_BASE
  if (base && !/^https?:\/\//i.test(base) && base.startsWith('/') && typeof window === 'undefined') {
    const origin = SITE_ORIGIN || 'http://localhost:3000'
    base = origin.replace(/\/+$/, '') + base
  }

  if (!base) return path
  const normalizedBase = base.replace(/\/+$/, '')
  if (path === normalizedBase || path.startsWith(`${normalizedBase}/`)) return path
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${suffix}`
}

export function getApiBase(): string {
  return API_BASE
}
