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
    headerMax: "1400px",
  },
  typography: {
    headingFamily: "'Oswald', 'Arial Narrow', sans-serif",
    bodyFamily: "'DM Sans', 'Inter', sans-serif",
    headingWeight: 700,
    bodyWeight: 400,
  },
  hero: {
    minHeight: "560px",
    minHeightLg: "640px",
    minHeightSm: "480px",
    overlayStart: "rgba(4, 24, 12, 0.40)",
    overlayEnd: "rgba(2, 12, 6, 0.78)",
    searchRadius: "4px",
  },
  reviewStar: '#facc15',
  borders: {
    soft: 'rgba(15, 23, 42, 0.08)',
    softer: 'rgba(17, 24, 39, 0.12)',
  },
  shadows: {
    card: "0 14px 36px rgba(15, 23, 42, 0.16)",
    floating: "0 22px 48px rgba(0, 0, 0, 0.32)",
    button: "0 6px 18px rgba(6, 125, 55, 0.22)",
  },
}
