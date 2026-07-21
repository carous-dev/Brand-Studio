'use client'

import { ReactLenis } from 'lenis/react'
import type { LenisOptions } from 'lenis'
import 'lenis/dist/lenis.css'
import './SmoothScroll.css'

export type SmoothScrollProps = {
  /**
   * Override Lenis options. Sensible defaults are merged in — pass any field
   * here to tweak them (e.g. shorter `duration` for a more responsive feel,
   * or `syncTouch: true` to smooth-scroll mobile too).
   */
  options?: LenisOptions
}

const DEFAULT_OPTIONS: LenisOptions = {
  duration: 1.1,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: false,
  wheelMultiplier: 1,
  touchMultiplier: 1,
}

/**
 * Site-wide smooth scrolling for the fbm-motors theme. Renders no DOM — uses
 * `<ReactLenis root />` to attach Lenis to the document root. Mirrors the
 * `@carous/smooth-scroll` package used across carous-platform dealer apps.
 *
 * Mounted once in the theme Shell, so it only activates when the fbm-motors
 * theme is the active brand.
 */
export function SmoothScroll({ options }: SmoothScrollProps = {}) {
  const merged: LenisOptions = { ...DEFAULT_OPTIONS, ...(options ?? {}) }
  return <ReactLenis root options={merged} />
}

export default SmoothScroll
