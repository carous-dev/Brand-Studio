'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'

type BrandedPlaceholderProps = {
  title: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}

export function BrandedPlaceholder({ title, body, ctaLabel = 'Browse used cars', ctaHref = '/used-cars' }: BrandedPlaceholderProps) {
  const brand = useBrand()
  const brandName = brand?.name || 'us'
  return (
    <section className="springalls-section">
      <div className="springalls-page-placeholder">
        <h1>{title}</h1>
        <p>{body || `Get in touch with ${brandName} for the latest information — this section will follow shortly.`}</p>
        <Link href={ctaHref} className="springalls-cta-link">
          {ctaLabel}
        </Link>
      </div>
    </section>
  )
}

export default BrandedPlaceholder
