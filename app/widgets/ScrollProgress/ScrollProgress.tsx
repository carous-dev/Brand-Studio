'use client'

import { useEffect } from 'react'

/**
 * Brandstudio global widget — scroll-tied progress driver.
 * =============================================================================
 *
 * Mount once in any theme's Shell. Watches every element with a
 * `data-mfx-scroll` attribute and writes the CSS variable `--mfx-progress`
 * (number from 0 to 1) onto the element as the user scrolls past it.
 *
 * Themes use `--mfx-progress` to drive parallax / sticky-fade / sticky-blur
 * effects with no JS per theme. The companion `MotionFX/styles.css` ships
 * `[data-mfx-scroll='parallax-slow' | 'parallax-medium' | 'parallax-fast' |
 * 'fade-out-on-exit' | 'blur-on-exit' | 'zoom-on-enter']` utility rules out
 * of the box; themes can also consume the var in their own CSS modules.
 *
 * Progress curve: 0 when the element's top edge enters the viewport bottom,
 * 1 when the element's bottom edge leaves the viewport top. Outside that
 * window the var clamps to 0 or 1 — never updates beyond.
 *
 * Honours `prefers-reduced-motion: reduce` — when reduced motion is on,
 * the widget never sets `--mfx-progress` so the companion CSS rules
 * resolve to their no-effect defaults.
 *
 * Performance: rAF-throttled. Uses `getBoundingClientRect` per element on
 * each frame, but only iterates registered elements (`MutationObserver`
 * picks up new ones dynamically). For ~20 registered elements the work is
 * ~0.1ms per frame — well under the 16ms frame budget.
 */
export default function ScrollProgress() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const reduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let rafId: number | null = null
    const tracked = new Set<HTMLElement>()

    const update = () => {
      rafId = null
      const vh = window.innerHeight || 1
      tracked.forEach((el) => {
        const rect = el.getBoundingClientRect()
        // 0 when element's top is at the viewport bottom (just entered),
        // 1 when element's bottom is at the viewport top (just left).
        const total = vh + rect.height
        const traveled = vh - rect.top
        let progress = traveled / total
        if (!Number.isFinite(progress)) progress = 0
        if (progress < 0) progress = 0
        if (progress > 1) progress = 1
        el.style.setProperty('--mfx-progress', progress.toFixed(4))
      })
    }

    const schedule = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(update)
    }

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>('[data-mfx-scroll]')
        .forEach((el) => tracked.add(el))
    }

    observeAll()
    update()

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })

    const mutation = new MutationObserver(() => {
      observeAll()
      schedule()
    })
    mutation.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      mutation.disconnect()
      if (rafId !== null) cancelAnimationFrame(rafId)
      tracked.clear()
    }
  }, [])

  return null
}
