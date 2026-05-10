import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  radii: {
    pill: "999px",
    card: "8px",
    input: "4px",
    button: "4px",
  },
  spacing: {
    sectionInset: "20px",
    sectionGap: "72px",
    containerMax: "1200px",
    headerMax: "1400px",
  },
  typography: {
    headingFamily: "'Oswald', 'Impact', 'Arial Narrow', sans-serif",
    bodyFamily: "'DM Sans', 'Segoe UI', sans-serif",
    headingWeight: 600,
    bodyWeight: 400,
  },
  hero: {
    minHeight: "620px",
    minHeightLg: "680px",
    minHeightSm: "480px",
    overlayStart: "rgba(15, 23, 42, 0.32)",
    overlayEnd: "rgba(15, 23, 42, 0.70)",
    searchRadius: "4px",
  },
  reviewStar: '#facc15',
  borders: {
    soft: 'rgba(15, 23, 42, 0.08)',
    softer: 'rgba(17, 24, 39, 0.12)',
  },
  shadows: {
    card: "0 14px 32px rgba(15, 23, 42, 0.16)",
    floating: "0 22px 48px rgba(15, 23, 42, 0.32)",
    button: "0 6px 18px rgba(30, 41, 59, 0.30)",
  },
}
