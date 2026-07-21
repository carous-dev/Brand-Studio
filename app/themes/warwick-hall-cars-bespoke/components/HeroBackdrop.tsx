'use client'

import React from 'react'

/**
 * Full-bleed decorative backdrop for hero sections. All colours derive from
 * `--color-accent` (with --color-primary as a secondary tone), so the same
 * markup retints automatically when the dashboard palette changes.
 *
 * Design language: neon glow + irregular geometric polygons + crossed diagonals.
 * Sits absolutely positioned inside any container with `position: relative`.
 */
export function HeroBackdrop({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <defs>
        <linearGradient id="hb-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
          <stop offset="55%" stopColor="var(--color-primary)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--color-primary) 80%, var(--color-text))" stopOpacity="1" />
        </linearGradient>

        <radialGradient id="hb-glow-tr" cx="82%" cy="-10%" r="55%">
          <stop offset="0%" stopColor="var(--color-bg)" stopOpacity="0.5" />
          <stop offset="55%" stopColor="var(--color-primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="hb-glow-bl" cx="6%" cy="108%" r="62%">
          <stop offset="0%" stopColor="var(--color-accent, var(--color-primary))" stopOpacity="0.45" />
          <stop offset="60%" stopColor="var(--color-primary)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="hb-orb-1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-bg)" stopOpacity="0.7" />
          <stop offset="55%" stopColor="var(--color-bg)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-bg)" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="hb-poly-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-bg)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-bg)" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="hb-poly-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-accent, var(--color-primary))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="hb-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-bg)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--color-bg)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-bg)" stopOpacity="0" />
        </linearGradient>

        <filter id="hb-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="22" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* base gradient field */}
      <rect width="1440" height="600" fill="url(#hb-base)" />

      {/* corner glows */}
      <rect width="1440" height="600" fill="url(#hb-glow-tr)" />
      <rect width="1440" height="600" fill="url(#hb-glow-bl)" />

      {/* irregular polygons */}
      <polygon
        points="-40,420 220,260 380,360 280,580 60,560"
        fill="url(#hb-poly-2)"
        opacity="0.85"
      />
      <polygon
        points="980,-40 1280,80 1420,260 1300,340 1080,200"
        fill="url(#hb-poly-1)"
        opacity="0.9"
      />
      <polygon
        points="640,40 880,120 820,260 720,300 580,180"
        fill="url(#hb-poly-1)"
        opacity="0.55"
      />
      <polygon
        points="1100,420 1320,360 1460,500 1380,640 1180,620"
        fill="url(#hb-poly-2)"
        opacity="0.55"
      />

      {/* polygon outlines (geometric line work) */}
      <polygon
        points="160,180 360,80 540,180 460,360 240,360"
        fill="none"
        stroke="var(--color-bg)"
        strokeOpacity="0.18"
        strokeWidth="1"
      />
      <polygon
        points="900,460 1080,380 1280,440 1240,580 1020,600"
        fill="none"
        stroke="var(--color-bg)"
        strokeOpacity="0.16"
        strokeWidth="1"
      />

      {/* crossing diagonals (neon lines) */}
      <line x1="0" y1="120" x2="1440" y2="500" stroke="url(#hb-line)" strokeWidth="1.4" />
      <line x1="0" y1="500" x2="1440" y2="120" stroke="url(#hb-line)" strokeWidth="1" />
      <line x1="200" y1="600" x2="600" y2="0" stroke="url(#hb-line)" strokeWidth="0.8" />
      <line x1="900" y1="0" x2="1240" y2="600" stroke="url(#hb-line)" strokeWidth="0.8" />

      {/* glowing orbs */}
      <g filter="url(#hb-glow)">
        <circle cx="1180" cy="120" r="64" fill="url(#hb-orb-1)" />
        <circle cx="220" cy="460" r="48" fill="url(#hb-orb-1)" opacity="0.85" />
        <circle cx="760" cy="520" r="34" fill="url(#hb-orb-1)" opacity="0.6" />
      </g>

      {/* small geometric accents */}
      <circle cx="400" cy="120" r="3" fill="var(--color-bg)" opacity="0.7" />
      <circle cx="1320" cy="540" r="3" fill="var(--color-bg)" opacity="0.6" />
      <circle cx="980" cy="380" r="2" fill="var(--color-bg)" opacity="0.5" />
      <rect x="540" y="440" width="6" height="6" fill="var(--color-bg)" opacity="0.45" transform="rotate(45 543 443)" />
      <rect x="1080" y="240" width="5" height="5" fill="var(--color-bg)" opacity="0.5" transform="rotate(45 1082.5 242.5)" />

      {/* bottom edge fade so text above is always legible */}
      <linearGradient id="hb-bottom-fade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="var(--color-text)" stopOpacity="0" />
        <stop offset="100%" stopColor="var(--color-text)" stopOpacity="0.32" />
      </linearGradient>
      <rect width="1440" height="600" fill="url(#hb-bottom-fade)" />

      {/* uniform darken pass for legibility */}
      <rect width="1440" height="600" fill="var(--color-text)" opacity="0.22" />
    </svg>
  )
}

export default HeroBackdrop
