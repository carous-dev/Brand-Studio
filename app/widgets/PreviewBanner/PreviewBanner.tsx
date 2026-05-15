'use client'

import { useEffect, useRef, useState } from 'react'
import type { BrandConfig } from '@/brands/types'
import { usePreviewBanner } from '@/app/hooks/usePreviewBanner'
import './styles.css'

type PreviewBannerProps = {
  /**
   * The current brand. Themes pass the result of their own `useBrand()` so
   * the banner shows the dealer name. If omitted, the banner falls back to
   * "this dealership".
   */
  brand?: BrandConfig | null
  /**
   * Override the link target. Defaults to https://carous.co.uk.
   */
  href?: string
  /**
   * Force the banner on/off. By default it reads `NEXT_PUBLIC_PREVIEW === '1'`
   * from the environment; pass `force={true}` to display unconditionally
   * (useful when previewing the banner during theme development).
   */
  force?: boolean
}

/**
 * Brandstudio global widget — preview-mode notice strip.
 * =============================================================================
 *
 * Renders a sticky-top notice strip when `NEXT_PUBLIC_PREVIEW=1` (set by the
 * preview-deploy environment but not by production). Tells the visitor
 * they're looking at a preview build and points them at carous.co.uk.
 *
 * Mount once at the top of every theme's Shell (BEFORE the Header). The
 * banner is brand-token-driven (uses `--color-primary` / `--color-bg`)
 * so it retints automatically per brand. Single implementation across all
 * themes — don't re-roll per theme.
 *
 * The component renders nothing when not in preview mode, so it's safe to
 * always mount; there's no production cost.
 */
export default function PreviewBanner({ brand, href = 'https://carous.co.uk', force }: PreviewBannerProps) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLElement | null>(null)
  const envPreviewBanner = usePreviewBanner()

  useEffect(() => {
    if (force === true) { setShow(true); return }
    if (force === false) { setShow(false); return }
    setShow(envPreviewBanner)
  }, [envPreviewBanner, force])

  // Publishes the banner's rendered height as a CSS variable on <html> so
  // theme headers can stick BELOW the banner via
  // `top: var(--brandstudio-preview-banner-height, 0px)` instead of pinning
  // to `top: 0` and being visually submerged by the banner.
  useEffect(() => {
    if (!show) {
      document.documentElement.style.removeProperty('--brandstudio-preview-banner-height')
      return
    }
    const el = ref.current
    if (!el) return
    const apply = () => {
      document.documentElement.style.setProperty(
        '--brandstudio-preview-banner-height',
        `${Math.ceil(el.getBoundingClientRect().height)}px`,
      )
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    window.addEventListener('resize', apply)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', apply)
      document.documentElement.style.removeProperty('--brandstudio-preview-banner-height')
    }
  }, [show])

  if (!show) return null

  const brandName = brand?.name || 'this dealership'

  return (
    <aside
      ref={ref}
      className="brandstudio-preview-banner"
      role="region"
      aria-label="Preview site notice"
    >
      <div className="brandstudio-preview-banner-inner">
        <span className="brandstudio-preview-banner-tag" aria-hidden="true">
          <span className="brandstudio-preview-banner-dot" />
          Preview
        </span>
        <span className="brandstudio-preview-banner-text">
          You&apos;re viewing a preview of <strong>{brandName}</strong>.{' '}
          <a href={href} target="_blank" rel="noopener noreferrer">
            Talk to Carous Limited
          </a>{' '}
          about going live.
        </span>
      </div>
    </aside>
  )
}
