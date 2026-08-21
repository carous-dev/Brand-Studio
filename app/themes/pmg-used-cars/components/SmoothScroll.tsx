"use client"

import { ReactLenis } from "lenis/react"
import type { LenisOptions } from "lenis"
import "lenis/dist/lenis.css"
import "./SmoothScroll.css"

export type SmoothScrollProps = {
  /**
   * Override Lenis options. Sensible defaults are merged in — pass any field
   * here to tweak them per dealer (e.g. shorter `duration` for a more
   * responsive feel, or `syncTouch: true` to smooth-scroll mobile too).
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
 * Site-wide smooth scrolling for dealer apps. Renders no DOM — uses
 * `<ReactLenis root />` to attach Lenis to the document root.
 *
 * Usage: drop once near the top of the `<body>` in the dealer-app's root
 * `app/layout.tsx`:
 *
 * ```tsx
 * import { SmoothScroll } from "@carous/smooth-scroll"
 *
 * <body>
 *   <SmoothScroll />
 *   …
 * </body>
 * ```
 *
 * The package handles all the CSS overrides — bundled `lenis.css` (un-pins
 * the `html, body { height: 100% }` rule when Lenis is active) plus a small
 * companion sheet that forces `scroll-behavior: auto` on `html.lenis` (some
 * dealer-app page CSS files ship `scroll-behavior: smooth` which fights
 * Lenis's RAF-driven scrollTop animation).
 */
export function SmoothScroll({ options }: SmoothScrollProps = {}) {
  const merged: LenisOptions = { ...DEFAULT_OPTIONS, ...(options ?? {}) }
  return <ReactLenis root options={merged} />
}

export default SmoothScroll
