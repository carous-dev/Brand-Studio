'use client'

import { useEffect } from 'react'
import { useBrand } from './BrandClientWrapper'

export const DynamicFavicon: React.FC = () => {
  const brand = useBrand()

  useEffect(() => {
    const updateFavicon = () => {
      const faviconUrl = brand?.favicon || brand?.logo || '/favicon.ico'
      
      // Add cache-busting timestamp
      const timestamp = Date.now()
      const urlWithTimestamp = faviconUrl.includes('?') 
        ? `${faviconUrl}&t=${timestamp}` 
        : `${faviconUrl}?t=${timestamp}`

      // Update all favicon links
      const faviconElements = [
        ...document.querySelectorAll("link[rel='icon']"),
        ...document.querySelectorAll("link[rel='shortcut icon']"),
        ...document.querySelectorAll("link[rel='apple-touch-icon']")
      ]

      if (faviconElements.length === 0) {
        // Create new favicon links if none exist
        const createFaviconLink = (rel: string) => {
          const link = document.createElement('link')
          link.rel = rel
          link.href = urlWithTimestamp
          document.head.appendChild(link)
        }
        
        createFaviconLink('icon')
        createFaviconLink('shortcut icon')
        createFaviconLink('apple-touch-icon')
      } else {
        // Update existing favicon links
        faviconElements.forEach(element => {
          element.setAttribute('href', urlWithTimestamp)
        })
      }

      // Also update the favicon in the tab title area
      const existingFavicon = document.querySelector("link[rel='icon']") as HTMLLinkElement
      if (existingFavicon) {
        existingFavicon.href = urlWithTimestamp
      }
    }

    updateFavicon()
  }, [brand?.favicon, brand?.logo])

  return null // This component doesn't render anything
}

export default DynamicFavicon
