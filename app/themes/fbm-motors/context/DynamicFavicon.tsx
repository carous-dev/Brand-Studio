'use client'

import { useEffect } from 'react'
import { useBrand } from './BrandClientWrapper'

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

    const timestamp = Date.now()
    const urlWithTimestamp = faviconUrl.includes('?')
      ? `${faviconUrl}&t=${timestamp}`
      : `${faviconUrl}?t=${timestamp}`

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
