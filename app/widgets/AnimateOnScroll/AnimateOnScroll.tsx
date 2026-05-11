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

    observeAll()

    // Pick up nodes added later (e.g. async-rendered Latest Arrivals slides)
    const mutation = new MutationObserver(() => observeAll())
    mutation.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutation.disconnect()
    }
  }, [])

  return null
}
