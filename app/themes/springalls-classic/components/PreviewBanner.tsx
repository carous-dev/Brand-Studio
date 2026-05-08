'use client'

import { usePreviewBanner } from '@/app/hooks/usePreviewBanner'
import { useBrand } from '../context/BrandClientWrapper'

/**
 * Renders at the very top of the layout (above the Header) when
 * NEXT_PUBLIC_PREVIEW=1. Tells the visitor they're looking at a preview
 * build and points at carous.co.uk for the production site.
 */
export function PreviewBanner() {
  const show = usePreviewBanner()
  const brand = useBrand()

  if (!show) return null

  return (
    <div
      className="springalls-preview-banner"
      role="region"
      aria-label="Preview site notice"
    >
      <div className="springalls-preview-banner-inner">
        <span className="springalls-preview-banner-tag">Preview</span>
        <span className="springalls-preview-banner-text">
          You're viewing a preview of <strong>{brand?.name || 'this dealership'}</strong>. Contact{' '}
          <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">
            Carous Limited
          </a>{' '}
          for the live site.
        </span>
      </div>
    </div>
  )
}

export default PreviewBanner
