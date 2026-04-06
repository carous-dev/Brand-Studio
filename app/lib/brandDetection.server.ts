import { headers } from "next/headers"
import { getBrandFromHost } from "@/config/domains"
import { fetchBrandByHost, fetchBrandBySlug } from "./brandApi"

function stripPort(host: string): string {
  return (host || "").toLowerCase().trim().split(":")[0]
}

function isLoopbackHost(host: string): boolean {
  const normalized = stripPort(host)
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1"
}

function readCookieBrand(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/(?:^|;\s*)x-brand=([^;]+)/i)
  if (!match || !match[1]) return null
  try {
    return decodeURIComponent(match[1]).trim().toLowerCase() || null
  } catch {
    return match[1].trim().toLowerCase() || null
  }
}

/**
 * Get brand information for the current request by host slug.
 * Fetches from the Flask/SQLite previews API (no local brand files).
 */
export async function getBrandForRequest() {
  const requestHeaders = await headers()
  const host =
    requestHeaders.get("x-forwarded-host") ||
    requestHeaders.get("x-original-host") ||
    requestHeaders.get("host") ||
    "localhost"
  const loopback = isLoopbackHost(host)

  // 1) If proxy injected x-brand, try slug fetch first (fast path).
  const headerBrand = requestHeaders.get("x-brand")?.toLowerCase()
  if (headerBrand) {
    const byHeader = await fetchBrandBySlug(headerBrand)
    if (byHeader) {
      return { brandId: byHeader.slug || headerBrand, brand: byHeader }
    }
  }

  // 1b) If x-brand cookie exists, use it as explicit local override.
  const cookieBrand = readCookieBrand(requestHeaders.get("cookie"))
  if (cookieBrand) {
    const byCookie = await fetchBrandBySlug(cookieBrand)
    if (byCookie) {
      return { brandId: byCookie.slug || cookieBrand, brand: byCookie }
    }
  }

  // 2) For localhost/loopback, avoid domain-lookup noise and accidental "fairfield" fallback.
  // Allow explicit env override for local development.
  if (loopback) {
    const envBrand = (process.env.NEXT_PUBLIC_BRAND || "").trim().toLowerCase()
    if (envBrand) {
      const byEnv = await fetchBrandBySlug(envBrand)
      if (byEnv) {
        return { brandId: byEnv.slug || envBrand, brand: byEnv }
      }
    }
    return null
  }

  // 3) Resolve by host against previews.db (supports custom domains without rebuilds).
  const byHost = await fetchBrandByHost(host)
  if (byHost) {
    return { brandId: byHost.slug || getBrandFromHost(host) || "fairfield", brand: byHost }
  }

  // 4) Fallback: derive slug from host format (subdomain-first).
  const brandId = getBrandFromHost(host)
  if (!brandId) return null

  const brand = await fetchBrandBySlug(brandId)

  if (!brand) {
    return null
  }

  return { brandId, brand }
}
