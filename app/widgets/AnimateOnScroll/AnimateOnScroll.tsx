'use client'

import { useEffect } from 'react'

/**
 * Brandstudio global widget — AOS-style scroll-reveal driver.
 * =============================================================================
 *
 * Mount once in any theme's Shell. Watches every element with a `data-aos`
 * attribute and flips `data-aos-animate="true"` when it intersects the
 * viewport. The companion `aos.css` (imported via `import './aos.css'`) defines
 * the entry animations.
 *
 * Variants (set via `data-aos="…"`):
 *   fade-up | fade-down | fade-left | fade-right | fade | zoom-in | zoom-out
 *
 * Per-element delay: `data-aos-delay="120"` (ms) — applied as a CSS variable
 * so individual selectors don't need delay-specific rules.
 *
 * Honours `prefers-reduced-motion`: if reduced motion is set, every element
 * is revealed immediately with no transition. MutationObserver picks up
 * nodes added after first paint (async-rendered carousels, etc.).
 *
 * Theme-agnostic — no brand colors, no archetype-specific markup. Lives in
 * `app/widgets/` so every theme imports the same implementation.
 */
export default function AnimateOnScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const reduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const reveal = (el: Element) => {
      const html = el as HTMLElement
      const delay = el.getAttribute('data-aos-delay')
      if (delay) html.style.setProperty('--aos-delay', `${delay}ms`)
      const duration = el.getAttribute('data-aos-duration')
      if (duration) html.style.setProperty('--aos-duration', `${duration}ms`)
      const easing = el.getAttribute('data-aos-easing')
      if (easing) html.style.setProperty('--aos-easing', easing)
      el.setAttribute('data-aos-animate', 'true')
    }

    if (reduced || typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('[data-aos]').forEach(reveal)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          reveal(entry.target)
          observer.unobserve(entry.target) // one-shot
        })
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08,
      },
    )

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>('[data-aos]:not([data-aos-animate])')
        .forEach((el) => observer.observe(el))
    }

    // Defer the FIRST observation until two paint frames have happened.
    // On larger screens many [data-aos] elements are above-the-fold at
    // first paint; the IO fires synchronously-ish on observe() and sets
    // `data-aos-animate="true"` before the browser has rendered the
    // initial opacity:0 / transform state — so the transition has no
    // baseline to animate from and the elements appear instantly.
    // The double-rAF guarantees at least one painted frame of the initial
    // state before observation begins, so the transition plays correctly.
    let rafId1 = 0
    let rafId2 = 0
    rafId1 = window.requestAnimationFrame(() => {
      rafId2 = window.requestAnimationFrame(() => {
        observeAll()
      })
    })

    // Pick up nodes added later (e.g. async-rendered Latest Arrivals slides).
    // These nodes mount AFTER the initial paint, so they don't need the
    // double-rAF defer — they'll already have a painted initial state.
    const mutation = new MutationObserver(() => observeAll())
    mutation.observe(document.body, { childList: true, subtree: true })

    return () => {
      if (rafId1) window.cancelAnimationFrame(rafId1)
      if (rafId2) window.cancelAnimationFrame(rafId2)
      observer.disconnect()
      mutation.disconnect()
    }
  }, [])

  return null
}
