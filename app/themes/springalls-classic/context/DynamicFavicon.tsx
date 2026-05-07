'use client'

import { useEffect } from 'react'
import { useBrand } from './BrandClientWrapper'

export const DynamicFavicon: React.FC = () => {
  const brand = useBrand()

  useEffect(() => {
    const faviconUrl = brand?.favicon || brand?.logo || '/favicon.ico'

    const elements = [
      ...document.querySelectorAll("link[rel='icon']"),
      ...document.querySelectorAll("link[rel='shortcut icon']"),
      ...document.querySelectorAll("link[rel='apple-touch-icon']"),
    ]

    if (elements.length === 0) {
      const create = (rel: string) => {
        const link = document.createElement('link')
        link.rel = rel
        link.href = faviconUrl
        document.head.appendChild(link)
      }
      create('icon')
      create('shortcut icon')
      create('apple-touch-icon')
    } else {
      elements.forEach((el) => el.setAttribute('href', faviconUrl))
    }
  }, [brand?.favicon, brand?.logo])

  return null
}

export default DynamicFavicon
