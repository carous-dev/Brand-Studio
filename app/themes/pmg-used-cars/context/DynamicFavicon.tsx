'use client'

import { useEffect } from 'react'
import { useBrand } from './BrandClientWrapper'

/**
 * Mounts <link rel="icon"> tags pointing at the right favicon for the
 * current brand. Resolution order:
 *   1. brand.favicon              — operator-set override per brand
 *   2. /themes/<theme-id>/favicon.svg — per-theme SVG mark (if shipped)
 *   3. brand.logo                 — fallback to the dealer's full logo
 *   4. /favicon.ico               — root brandstudio default
 */
export const DynamicFavicon: React.FC = () => {
  const brand = useBrand()

  useEffect(() => {
    const themeId =
      (brand as any)?.themeId ||
      (brand as any)?.theme?.themeId ||
      (brand as any)?.theme?.id ||
      ''
    const themeFavicon = themeId ? `/themes/${themeId}/favicon.svg` : ''
    const faviconUrl =
      (brand as any)?.favicon ||
      themeFavicon ||
      (brand as any)?.logo ||
      '/favicon.ico'
    const timestamp = Date.now()
    const urlWithTimestamp = String(faviconUrl).includes('?')
      ? `${faviconUrl}&t=${timestamp}`
      : `${faviconUrl}?t=${timestamp}`

    const faviconElements = [
      ...document.querySelectorAll("link[rel='icon']"),
      ...document.querySelectorAll("link[rel='shortcut icon']"),
      ...document.querySelectorAll("link[rel='apple-touch-icon']"),
    ]

    if (faviconElements.length === 0) {
      const createLink = (rel: string) => {
        const link = document.createElement('link')
        link.rel = rel
        link.href = urlWithTimestamp
        if (urlWithTimestamp.includes('/favicon.svg')) link.type = 'image/svg+xml'
        document.head.appendChild(link)
      }
      createLink('icon')
      createLink('shortcut icon')
      createLink('apple-touch-icon')
    } else {
      faviconElements.forEach((el) => {
        el.setAttribute('href', urlWithTimestamp)
        if (urlWithTimestamp.includes('/favicon.svg')) el.setAttribute('type', 'image/svg+xml')
      })
    }
  }, [(brand as any)?.favicon, (brand as any)?.logo, (brand as any)?.themeId, (brand as any)?.theme?.themeId, (brand as any)?.theme?.id])

  return null
}

export default DynamicFavicon
