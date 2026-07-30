'use client'

import { useEffect, useRef } from 'react'
import './canvas-fx.css'
import { makeDrawer, type CanvasVariant, type Drawer } from './drawings'

/**
 * CanvasFX — a brand-token-driven, self-guarding <canvas> backdrop the furnisher
 * mounts inside a positioned section to give components a "living" backdrop.
 * Opt-in per component (NOT global) so it appears only where a component is
 * furnished with one.
 *
 *   <section style={{ position: 'relative' }}>
 *     <CanvasFX variant="aurora-light" />   // paints behind (z-index 0)
 *     <div style={{ position: 'relative', zIndex: 1 }}>…content…</div>
 *   </section>
 *
 * Guards (all automatic): renders nothing animated under
 * `prefers-reduced-motion` or ≤640px (a static token gradient shows instead via
 * canvas-fx.css); pauses when off-screen (IntersectionObserver) or the tab is
 * hidden; caps devicePixelRatio at 2; a single rAF loop. Decorative only —
 * `aria-hidden`, `pointer-events:none`.
 *
 * Archetype vocabulary: `particle-drift` (modern/tech), `aurora-light`
 * (luxury/editorial), `vector-grid` (industrial/rugged).
 */
export interface CanvasFXProps {
  variant?: CanvasVariant
  /** Relative density of the drawing (0.5–1.5). */
  density?: number
  className?: string
}

export default function CanvasFX({ variant = 'aurora-light', density = 1, className }: CanvasFXProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas || typeof window === 'undefined') return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mqReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const mqSmall = window.matchMedia?.('(max-width: 640px)')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let drawer: Drawer | null = null
    let raf = 0
    let running = false
    let onScreen = true

    const shouldAnimate = () => !mqReduced?.matches && !mqSmall?.matches

    const readColors = () => {
      const cs = getComputedStyle(host)
      const primary = cs.getPropertyValue('--color-primary').trim() || '#8a8a8a'
      const accent = cs.getPropertyValue('--color-accent').trim() || primary
      const bg = cs.getPropertyValue('--color-bg').trim() || '#ffffff'
      return { primary, accent, bg }
    }

    const size = () => {
      const rect = host.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawer?.resize(w, h)
    }

    const frame = (t: number) => {
      if (!running) return
      drawer?.draw(ctx, t)
      raf = window.requestAnimationFrame(frame)
    }
    const start = () => {
      if (running || !drawer || !shouldAnimate() || !onScreen || document.hidden) return
      running = true
      raf = window.requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      if (raf) window.cancelAnimationFrame(raf)
      raf = 0
    }

    const setup = () => {
      const animate = shouldAnimate()
      host.classList.toggle('cfx-static', !animate)
      if (!animate) {
        stop()
        drawer = null
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }
      drawer = makeDrawer(variant, readColors(), density)
      size()
      start()
    }

    setup()

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => size()) : null
    ro?.observe(host)
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              onScreen = entries[0]?.isIntersecting ?? true
              if (onScreen) start()
              else stop()
            },
            { threshold: 0 },
          )
        : null
    io?.observe(host)
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    const onMq = () => setup()
    mqReduced?.addEventListener?.('change', onMq)
    mqSmall?.addEventListener?.('change', onMq)

    return () => {
      stop()
      ro?.disconnect()
      io?.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      mqReduced?.removeEventListener?.('change', onMq)
      mqSmall?.removeEventListener?.('change', onMq)
    }
  }, [variant, density])

  return (
    <div ref={hostRef} className={`cfx${className ? ` ${className}` : ''}`} data-cfx={variant} aria-hidden="true">
      <canvas ref={canvasRef} className="cfx-canvas" />
    </div>
  )
}
