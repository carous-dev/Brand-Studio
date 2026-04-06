'use client'

import { usePreviewBanner } from '@/app/hooks/usePreviewBanner'
import { useBrand } from '../context/BrandClientWrapper'

export function PreviewBanner() {
  const show = usePreviewBanner()
  const brand = useBrand()
  const brandName = brand?.name || 'this dealership'

  if (!show) return null

  return (
    <div
      className="preview-banner"
      role="region"
      aria-label="Preview site notice"
    >
      <div className="pb-note">
        Preview version of <strong>{brandName}</strong> — this site is a preview. For the full version contact{' '}
        <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">
          Carous Limited
        </a>
        .
      </div>
    </div>
  )
}

