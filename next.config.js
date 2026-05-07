/** @type {import('next').NextConfig} */
import fs from 'fs'
import path from 'path'

function getBrandSlugsFromBrandsDir() {
  try {
    const brandsDir = path.join(process.cwd(), 'brands')
    const entries = fs.readdirSync(brandsDir, { withFileTypes: true })
    const slugs = entries
      .filter((e) => e.isFile() && e.name.endsWith('.ts'))
      .map((e) => e.name.replace(/\.ts$/, ''))
      .filter((name) => !['index', 'types', 'extended-types', 'default'].includes(name))
    return Array.from(new Set(slugs))
  } catch {
    return []
  }
}

const brandSlugs = getBrandSlugsFromBrandsDir()
const localDevOrigins = brandSlugs.flatMap((slug) => [
  `${slug}.local`,
  `${slug}.local:3000`,
  `www.${slug}.local`,
  `www.${slug}.local:3000`,
])

const nextConfig = {
  // Allow local domain aliases for development (multi-tenant testing)
  // Auto-generated from config/domains.ts BRAND_REGISTRY
  // Suppresses CORS warnings when accessing /_next/* from different origins
  allowedDevOrigins: [
    'localhost',
    'localhost:3000',
    '*.local',
    '*.local:3000',
    // Wildcard-DNS local-dev bases (resolve *.<base> -> 127.0.0.1 without
    // hosts edits). Brand Studio's /settings page provisions brands against
    // these for local previews. Keep in sync with LOCAL_PREVIEW_BASE_DOMAINS
    // in app.py.
    '*.lvh.me',
    '*.lvh.me:3000',
    '*.localtest.me',
    '*.localtest.me:3000',
    '*.localhost.test',
    '*.localhost.test:3000',
    '*.sslip.io',
    '*.sslip.io:3000',
    '*.nip.io',
    '*.nip.io:3000',
    'citimotorsuk.local',
    'www.citimotorsuk.local',
    'citimotorsuk.local:3000',
    'www.citimotorsuk.local:3000',
    // Local development
    ...localDevOrigins,
    'fairfield.local',
    'www.fairfield.local',
    'westfield.local',
    'www.westfield.local',
    // Production (carous.co.uk)
    'fairfield.carous.co.uk',
    'www.fairfield.carous.co.uk',
    'westfield.carous.co.uk',
    'www.westfield.carous.co.uk',
    // Vercel preview/staging
    'fairfield-preview.vercel.app',
    'westfield-preview.vercel.app',
  ],
  
  images: {
    // allow external image hosts used across the site (Unsplash + ATCDN demo)
    // Using remotePatterns instead of deprecated domains for better security
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'plus.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'm-qa.atcdn.co.uk', pathname: '/**' },
      { protocol: 'https', hostname: 'static.wixstatic.com', pathname: '/**' }
    ]
  },

  // Empty turbopack config: Next 16 uses Turbopack by default. The legacy
  // `webpack.watchOptions.ignored` block (which tried to keep dev from reloading
  // when Flask wrote to app/data, public/images, .py, .db) doesn't apply under
  // Turbopack. Turbopack only re-runs HMR for files in the import graph, so
  // those non-imported writes don't trigger reloads. Keep this stub to silence
  // the "webpack config but no turbopack config" warning.
  turbopack: {},

  async rewrites() {
    return [
      { source: '/inventory/sync', destination: '/api/inventory/sync' }
    ]
  }
};

export default nextConfig;
