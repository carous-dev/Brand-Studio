/**
 * CanvasFX drawings — the archetype-tuned canvas "drawings" the furnisher mounts
 * as a living backdrop. Each drawer is a small closure over the canvas size; it
 * exposes `resize(w,h)` and `draw(ctx, t)` (t = ms timestamp). All colour comes
 * from the brand tokens read by the host (see CanvasFX.tsx), so every drawing
 * retints per brand. Kept deliberately light (few shapes, no per-pixel work).
 */

export type CanvasVariant = 'particle-drift' | 'aurora-light' | 'vector-grid'

export interface CanvasColors {
  primary: string
  accent: string
  bg: string
}

export interface Drawer {
  resize(w: number, h: number): void
  draw(ctx: CanvasRenderingContext2D, t: number): void
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** color (#hex | rgb[a]()) → rgba string with the given alpha. */
function withAlpha(color: string, a: number): string {
  const c = (color || '').trim()
  if (c.startsWith('#')) {
    let hex = c.slice(1)
    if (hex.length === 3) hex = hex.split('').map((x) => x + x).join('')
    const n = parseInt(hex.slice(0, 6), 16)
    if (!Number.isNaN(n)) return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
  }
  const m = c.match(/^rgba?\(([^)]+)\)/)
  if (m) return `rgba(${m[1].split(',').slice(0, 3).map((s) => s.trim()).join(', ')}, ${a})`
  return `rgba(136, 136, 136, ${a})`
}

export function makeDrawer(variant: CanvasVariant, colors: CanvasColors, density = 1): Drawer {
  switch (variant) {
    case 'particle-drift':
      return particleDrift(colors, density)
    case 'vector-grid':
      return vectorGrid(colors, density)
    case 'aurora-light':
    default:
      return auroraLight(colors, density)
  }
}

/* --- aurora-light: soft flowing brand-colour light field (luxury/editorial) --- */
function auroraLight(colors: CanvasColors, density: number): Drawer {
  let w = 0
  let h = 0
  const n = Math.round(4 * clamp(density, 0.5, 1.5))
  const blobs = Array.from({ length: n }, (_, i) => ({
    hue: i % 2 ? colors.accent : colors.primary,
    sx: 0.00003 + Math.random() * 0.00004,
    sy: 0.00002 + Math.random() * 0.00004,
    phase: Math.random() * Math.PI * 2,
  }))
  return {
    resize(nw, nh) {
      w = nw
      h = nh
    },
    draw(ctx, t) {
      ctx.clearRect(0, 0, w, h)
      const rad = Math.max(w, h) * 0.5
      for (const b of blobs) {
        const x = (0.5 + 0.4 * Math.sin(t * b.sx + b.phase)) * w
        const y = (0.5 + 0.4 * Math.cos(t * b.sy + b.phase)) * h
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
        g.addColorStop(0, withAlpha(b.hue, 0.22))
        g.addColorStop(1, withAlpha(b.hue, 0))
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }
    },
  }
}

/* --- particle-drift: sparse particles + link lines (modern/tech) --- */
function particleDrift(colors: CanvasColors, density: number): Drawer {
  let w = 0
  let h = 0
  let pts: Array<{ x: number; y: number; vx: number; vy: number }> = []
  const target = () => clamp(Math.round((w * h) / 26000) * clamp(density, 0.5, 1.5), 12, 80)
  return {
    resize(nw, nh) {
      w = nw
      h = nh
      const count = target()
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
      }))
    },
    draw(ctx) {
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
      }
      // link lines between near particles
      ctx.lineWidth = 1
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < 120 * 120) {
            ctx.strokeStyle = withAlpha(colors.primary, 0.10 * (1 - d2 / (120 * 120)))
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.stroke()
          }
        }
      }
      ctx.fillStyle = withAlpha(colors.accent, 0.55)
      for (const p of pts) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
    },
  }
}

/* --- vector-grid: dot grid with a gentle travelling wave (industrial/rugged) --- */
function vectorGrid(colors: CanvasColors, density: number): Drawer {
  let w = 0
  let h = 0
  const gap = () => clamp(44 / clamp(density, 0.5, 1.5), 30, 64)
  return {
    resize(nw, nh) {
      w = nw
      h = nh
    },
    draw(ctx, t) {
      ctx.clearRect(0, 0, w, h)
      const g = gap()
      ctx.fillStyle = withAlpha(colors.primary, 0.22)
      for (let x = g / 2; x < w; x += g) {
        for (let y = g / 2; y < h; y += g) {
          const wave = Math.sin(t * 0.0009 + (x + y) * 0.02)
          const r = 0.7 + (wave + 1) * 0.7
          ctx.globalAlpha = 0.35 + (wave + 1) * 0.22
          ctx.beginPath()
          ctx.arc(x, y + wave * 3, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    },
  }
}
