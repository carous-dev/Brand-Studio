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
    sectionGap: "72px",
    containerMax: "1240px",
    headerMax: "1440px",
  },
  typography: {
    headingFamily: "'Roboto Condensed', 'Arial Narrow', sans-serif",
    bodyFamily: "'Open Sans', system-ui, sans-serif",
    headingWeight: 700,
    bodyWeight: 400,
  },
  hero: {
    minHeight: "600px",
    minHeightLg: "680px",
    minHeightSm: "480px",
    overlayStart: "rgba(3, 10, 26, 0.92)",
    overlayEnd: "rgba(11, 28, 58, 0.55)",
    searchRadius: "6px",
  },
  reviewStar: '#facc15',
  borders: {
    soft: 'rgba(15, 23, 42, 0.08)',
    softer: 'rgba(17, 24, 39, 0.12)',
  },
  shadows: {
    card: "0 18px 40px rgba(11, 28, 58, 0.14)",
    floating: "0 22px 48px rgba(0, 0, 0, 0.30)",
    button: "0 8px 22px rgba(40, 162, 230, 0.26)",
  },
}
