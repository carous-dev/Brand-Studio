'use client'

import { useEffect } from 'react'
import { useBrand } from './BrandClientWrapper'

/**
 * Mounts <link rel="icon"> tags pointing at the right favicon for the current
 * brand. Resolution order (first hit wins):
 *
 *   1. brand.favicon              — operator-set override per brand
 *   2. /themes/<theme-id>/favicon.svg — modern per-theme SVG mark generated
 *      by tools/generate-theme-favicon.mjs at scaffold time. Brand-token-
 *      driven, archetype-aware, scales from 16×16 tab icon to 512×512 app
 *      icon without rasterizing.
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
      brand?.favicon ||
      themeFavicon ||
      brand?.logo ||
      '/favicon.ico'

    // Add cache-busting timestamp so brand/theme swaps refresh the tab icon
    const timestamp = Date.now()
    const urlWithTimestamp = faviconUrl.includes('?')
      ? `${faviconUrl}&t=${timestamp}`
      : `${faviconUrl}?t=${timestamp}`

    // Update all favicon links (icon / shortcut icon / apple-touch-icon)
    const faviconElements = [
      ...document.querySelectorAll("link[rel='icon']"),
      ...document.querySelectorAll("link[rel='shortcut icon']"),
      ...document.querySelectorAll("link[rel='apple-touch-icon']"),
    ]

    if (faviconElements.length === 0) {
      const createFaviconLink = (rel: string) => {
        const link = document.createElement('link')
        link.rel = rel
        link.href = urlWithTimestamp
        // Hint the browser this is an SVG when our generator produced one
        if (urlWithTimestamp.includes('/favicon.svg')) {
          link.type = 'image/svg+xml'
        }
        document.head.appendChild(link)
      }

      createFaviconLink('icon')
      createFaviconLink('shortcut icon')
      createFaviconLink('apple-touch-icon')
    } else {
      faviconElements.forEach((element) => {
        element.setAttribute('href', urlWithTimestamp)
        if (urlWithTimestamp.includes('/favicon.svg')) {
          element.setAttribute('type', 'image/svg+xml')
        }
      })
    }
  }, [brand?.favicon, brand?.logo, (brand as any)?.themeId, (brand as any)?.theme?.themeId, (brand as any)?.theme?.id])

  return null
}

export default DynamicFavicon
