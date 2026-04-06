import { MetadataRoute } from 'next'
import { companyProfile } from './data/profile'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = companyProfile.domain.replace(/\/$/, '')

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/login', '/in', '/api'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
