/**
 * Domain to Brand Mapping (Auto-Generated)
 * Maps request domains to brand identifiers
 * 
 * Domains are automatically discovered from brands/ directory
 * - Local: {brand-slug}.local:3000
 * - Production: {brand-slug}.carous.co.uk
 * - Also supports: www prefix, .com variant, localhost, Vercel preview
 * 
 * Usage:
 * 1. Create brand file: brands/{slug}.ts
 * 2. Dashboard exports: export const {camelCase}Config: BrandConfig = { ... }
 * 3. Add to brands/index.ts: export { default as {camelCase}Brand } from './{slug}';
 * 4. Domains automatically map {slug} to brand
 */

export type BrandId = string

/**
 * Extract host from request and determine brand slug
 * 
 * Strategy: Extract brand slug directly from domain
 * Examples:
 *   fairfield.local:3000 → fairfield
 *   citi-motors.local:3000 → citi-motors
 *   www.fairfield.local → fairfield
 *   fairfield.carous.co.uk → fairfield
 *   localhost:3000 → fairfield (default)
 */
export function getBrandFromHost(host: string): BrandId | null {
  // Normalize: remove port and whitespace
  const hostWithoutPort = host.toLowerCase().trim().split(':')[0]
  
  // Remove www. prefix if present
  const hostWithoutWww = hostWithoutPort.startsWith('www.') 
    ? hostWithoutPort.slice(4) 
    : hostWithoutPort
  
  // Extract the first part (subdomain or domain slug)
  const parts = hostWithoutWww.split('.')
  const slug = parts[0]
  
  // Special case for localhost
  if (slug === 'localhost' || slug === '127' || slug === '::1') {
    return 'fairfield'
  }
  
  // For all other slugs, assume they're valid brand slugs
  // Brands are dynamically loaded from brands/ directory
  return slug
}

/**
 * Get brand from environment (for backward compatibility)
 * Fallback if domain detection fails
 */
export function getBrandFromEnv(): BrandId {
  const envBrand = process.env.NEXT_PUBLIC_BRAND as BrandId | undefined
  return envBrand || 'fairfield'
}
