import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  radii: {
    pill: "999px",
    card: "4px",
    input: "4px",
    button: "4px",
  },
  spacing: {
    sectionInset: "clamp(80px, 10vw, 140px)",
    sectionGap: "clamp(80px, 10vw, 140px)",
    containerMax: "1240px",
    headerMax: "1240px",
  },
  typography: {
    headingFamily: "Manrope",
    bodyFamily: "IBM Plex Sans",
    headingWeight: 600,
    bodyWeight: 400,
  },
  hero: {
    minHeight: "640px",
    minHeightLg: "720px",
    minHeightSm: "520px",
    overlayStart: "rgba(255, 255, 255, 0.0)",
    overlayEnd: "rgba(255, 255, 255, 0.0)",
    searchRadius: "4px",
  },
  reviewStar: '#facc15',
  borders: {
    soft: 'rgba(15, 23, 42, 0.08)',
    softer: 'rgba(17, 24, 39, 0.12)',
  },
  shadows: {
    card: "0 1px 2px rgba(15, 22, 35, 0.04), 0 0 0 1px rgba(15, 22, 35, 0.05)",
    floating: "0 8px 24px rgba(15, 22, 35, 0.08)",
    button: "none",
  },
}
