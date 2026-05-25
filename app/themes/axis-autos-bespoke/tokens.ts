import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  radii: {
    pill: "999px",
    card: "6px",
    input: "4px",
    button: "4px",
  },
  spacing: {
    sectionInset: "20px",
    sectionGap: "64px",
    containerMax: "1200px",
    headerMax: "1400px",
  },
  typography: {
    headingFamily: "'IBM Plex Mono', 'Courier New', monospace",
    bodyFamily: "'IBM Plex Sans', 'Inter', 'Helvetica Neue', Arial, sans-serif",
    headingWeight: 600,
    bodyWeight: 400,
  },
  hero: {
    minHeight: "520px",
    minHeightLg: "580px",
    minHeightSm: "420px",
    overlayStart: "rgba(10, 14, 20, 0.62)",
    overlayEnd: "rgba(10, 14, 20, 0.88)",
    searchRadius: "4px",
  },
  reviewStar: '#facc15',
  borders: {
    soft: 'rgba(15, 23, 42, 0.08)',
    softer: 'rgba(17, 24, 39, 0.12)',
  },
  shadows: {
    card: "0 18px 40px rgba(15, 22, 35, 0.10)",
    floating: "0 22px 48px rgba(0, 0, 0, 0.28)",
    button: "0 4px 12px rgba(15, 22, 35, 0.10)",
  },
}
