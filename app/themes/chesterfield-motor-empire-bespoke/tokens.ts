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
    headingFamily: "'Oswald', 'Arial Narrow', sans-serif",
    bodyFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    headingWeight: 700,
    bodyWeight: 400,
  },
  hero: {
    minHeight: "560px",
    minHeightLg: "620px",
    minHeightSm: "460px",
    overlayStart: "rgba(8, 10, 14, 0.86)",
    overlayEnd: "rgba(15, 17, 22, 0.55)",
    searchRadius: "4px",
  },
  reviewStar: '#facc15',
  borders: {
    soft: 'rgba(15, 23, 42, 0.08)',
    softer: 'rgba(17, 24, 39, 0.12)',
  },
  shadows: {
    card: "0 18px 40px rgba(15, 23, 42, 0.18)",
    floating: "0 22px 48px rgba(0, 0, 0, 0.32)",
    button: "0 8px 22px rgba(15, 23, 42, 0.20)",
  },
}
