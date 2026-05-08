'use client'

import { useEffect } from 'react'

/**
 * Lightweight AOS-style scroll-reveal driver. Mount once in the layout.
 * Watches every element with a `data-aos` attribute and flips
 * `data-aos-animate="true"` when it intersects the viewport. CSS in
 * `styles/aos.css` consumes that flag to run the entry animation.
 *
 * Variants supported (set via `data-aos="…"` on the element):
 *   fade-up | fade-down | fade-left | fade-right | fade | zoom-in | zoom-out
 *
 * Per-element delay: `data-aos-delay="120"` (ms) — applied via CSS variable
 * so we don't have to modify every selector to handle delays.
 *
 * Honours `prefers-reduced-motion`: if reduced motion is set, every element
 * is revealed immediately with no transition.
 */
export function AosProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const reduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const reveal = (el: Element) => {
      const delayAttr = el.getAttribute('data-aos-delay')
      if (delayAttr) {
        ;(el as HTMLElement).style.setProperty('--aos-delay', `${delayAttr}ms`)
      }
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
      }
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

export default AosProvider
