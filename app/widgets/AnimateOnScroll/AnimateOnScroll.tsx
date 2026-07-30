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

    // MotionFX `.mfx-spotlight` — write the pointer's element-relative position
    // to --mfx-mx / --mfx-my so the radial glow follows the cursor. Skipped
    // under reduced-motion and on coarse/small screens (no cursor; the CSS
    // hides the overlay there anyway). One passive, rAF-throttled listener.
    const fine =
      window.matchMedia &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
    let spotlightMove: ((e: PointerEvent) => void) | null = null
    let spotRaf = 0
    if (fine && !reduced) {
      spotlightMove = (e: PointerEvent) => {
        const target = (e.target as Element | null)?.closest?.('.mfx-spotlight') as HTMLElement | null
        if (!target) return
        if (spotRaf) return
        spotRaf = window.requestAnimationFrame(() => {
          spotRaf = 0
          const r = target.getBoundingClientRect()
          target.style.setProperty('--mfx-mx', `${e.clientX - r.left}px`)
          target.style.setProperty('--mfx-my', `${e.clientY - r.top}px`)
        })
      }
      window.addEventListener('pointermove', spotlightMove, { passive: true })
    }

    return () => {
      if (rafId1) window.cancelAnimationFrame(rafId1)
      if (rafId2) window.cancelAnimationFrame(rafId2)
      if (spotRaf) window.cancelAnimationFrame(spotRaf)
      if (spotlightMove) window.removeEventListener('pointermove', spotlightMove)
      observer.disconnect()
      mutation.disconnect()
    }
  }, [])

  // Render the reveal CSS inline rather than relying on the `import './aos.css'`
  // side-effect in index.ts — that import is tree-shaken in some theme bundles,
  // which silently kills every animation (see memory feedback_aos_css_inline).
  // Emitting the stylesheet from the driver guarantees the CSS exists exactly
  // where (and only where) the driver is mounted: no orphaned `opacity: 0`
  // content if a theme forgets the import, and no 14 duplicated base.css copies.
  // SSR'd with the initial hidden state, so there's no flash-then-hide.
  return <style dangerouslySetInnerHTML={{ __html: AOS_CSS }} />
}

const AOS_CSS = `
:where([data-aos]) {
  opacity: 0;
  will-change: transform, opacity;
  transition:
    opacity var(--aos-duration, 720ms) var(--aos-easing, cubic-bezier(0.22, 1, 0.36, 1)) var(--aos-delay, 0ms),
    transform var(--aos-duration, 760ms) var(--aos-easing, cubic-bezier(0.22, 1, 0.36, 1)) var(--aos-delay, 0ms),
    filter var(--aos-duration, 760ms) var(--aos-easing, cubic-bezier(0.22, 1, 0.36, 1)) var(--aos-delay, 0ms);
  transform-origin: center;
  backface-visibility: hidden;
}
:where([data-aos='fade'])            { transform: none; }
:where([data-aos='fade-up'])         { transform: translate3d(0, 28px, 0); }
:where([data-aos='fade-down'])       { transform: translate3d(0, -28px, 0); }
:where([data-aos='fade-left'])       { transform: translate3d(28px, 0, 0); }
:where([data-aos='fade-right'])      { transform: translate3d(-28px, 0, 0); }
:where([data-aos='fade-up-right'])   { transform: translate3d(-22px, 22px, 0); }
:where([data-aos='fade-up-left'])    { transform: translate3d(22px, 22px, 0); }
:where([data-aos='fade-down-right']) { transform: translate3d(-22px, -22px, 0); }
:where([data-aos='fade-down-left'])  { transform: translate3d(22px, -22px, 0); }
:where([data-aos='zoom-in'])       { transform: scale(0.92); }
:where([data-aos='zoom-out'])      { transform: scale(1.06); }
:where([data-aos='zoom-in-up'])    { transform: scale(0.92) translate3d(0, 28px, 0); }
:where([data-aos='zoom-out-down']) { transform: scale(1.06) translate3d(0, -28px, 0); }
:where([data-aos='flip-up'])    { transform: perspective(800px) rotateX(-60deg); }
:where([data-aos='flip-down'])  { transform: perspective(800px) rotateX(60deg); }
:where([data-aos='flip-left'])  { transform: perspective(800px) rotateY(60deg); }
:where([data-aos='flip-right']) { transform: perspective(800px) rotateY(-60deg); }
:where([data-aos='slide-up'])   { transform: translate3d(0, 60px, 0); }
:where([data-aos='slide-down']) { transform: translate3d(0, -60px, 0); }
:where([data-aos='blur-in']) { filter: blur(12px); transform: scale(1.02); }
:where([data-aos][data-aos-animate='true']) {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1) perspective(800px) rotate(0deg);
  filter: blur(0);
}
@media (prefers-reduced-motion: reduce) {
  :where([data-aos]) { opacity: 1; transform: none; filter: none; transition: none; }
}
@media (max-width: 720px) {
  :where([data-aos]) { opacity: 1 !important; transform: none !important; filter: none !important; transition: none !important; }
}
`.trim()
