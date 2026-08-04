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
 * Site-wide smooth scrolling for the dual-stock-modern-bespoke theme. Renders
 * no DOM — `<ReactLenis root />` attaches Lenis to the document root. Mounted
 * once in the theme shell, so it only activates when dual-stock-modern-bespoke
 * is the active brand. Mirrors the fbm-motors / redgate-lodge-bespoke /
 * cnhcars-clone / classic-dealer / axis-autos SmoothScroll.
 */
export function SmoothScroll({ options }: SmoothScrollProps = {}) {
  const merged: LenisOptions = { ...DEFAULT_OPTIONS, ...(options ?? {}) }
  return <ReactLenis root options={merged} />
}

export default SmoothScroll
