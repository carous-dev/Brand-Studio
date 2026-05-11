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
    sectionGap: "72px",
    containerMax: "1240px",
    headerMax: "1440px",
  },
  typography: {
    headingFamily: "'Oswald', 'Arial Narrow', sans-serif",
    bodyFamily: "'DM Sans', system-ui, sans-serif",
    headingWeight: 700,
    bodyWeight: 400,
  },
  hero: {
    minHeight: "620px",
    minHeightLg: "720px",
    minHeightSm: "520px",
    overlayStart: "rgba(20, 4, 8, 0.32)",
    overlayEnd: "rgba(8, 11, 17, 0.78)",
    searchRadius: "4px",
  },
  reviewStar: '#facc15',
  borders: {
    soft: 'rgba(15, 23, 42, 0.08)',
    softer: 'rgba(17, 24, 39, 0.12)',
  },
  shadows: {
    card: "0 18px 40px rgba(15, 23, 42, 0.18)",
    floating: "0 22px 48px rgba(0, 0, 0, 0.3)",
    button: "0 8px 22px rgba(15, 23, 42, 0.20)",
  },
}
