import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  radii: {
    pill: "999px",
    card: "8px",
    input: "6px",
    button: "6px",
  },
  spacing: {
    sectionInset: "20px",
    sectionGap: "64px",
    containerMax: "1200px",
    headerMax: "1400px",
  },
  typography: {
    headingFamily: "'Oswald', 'Arial Narrow', 'Helvetica Condensed', sans-serif",
    bodyFamily: "'DM Sans', 'Inter', 'Helvetica Neue', Arial, sans-serif",
    headingWeight: 600,
    bodyWeight: 400,
  },
  hero: {
    minHeight: "580px",
    minHeightLg: "640px",
    minHeightSm: "480px",
    overlayStart: "rgba(28, 6, 8, 0.42)",
    overlayEnd: "rgba(8, 11, 17, 0.86)",
    searchRadius: "6px",
  },
  reviewStar: '#facc15',
  borders: {
    soft: 'rgba(15, 23, 42, 0.08)',
    softer: 'rgba(17, 24, 39, 0.12)',
  },
  shadows: {
    card: "0 18px 40px rgba(15, 23, 42, 0.18)",
    floating: "0 22px 48px rgba(0, 0, 0, 0.3)",
    button: "0 8px 22px rgba(140, 9, 12, 0.32)",
  },
}
