import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  radii: {
    pill: "999px",
    card: "12px",
    input: "8px",
    button: "8px",
  },
  spacing: {
    sectionInset: "20px",
    sectionGap: "64px",
    containerMax: "1200px",
    headerMax: "1400px",
  },
  typography: {
    headingFamily: "'Playfair Display', 'Georgia', serif",
    bodyFamily: "'Montserrat', 'Segoe UI', sans-serif",
    headingWeight: 700,
    bodyWeight: 400,
  },
  hero: {
    minHeight: "560px",
    minHeightLg: "620px",
    minHeightSm: "460px",
    overlayStart: "rgba(37, 9, 13, 0.30)",
    overlayEnd: "rgba(37, 9, 13, 0.65)",
    searchRadius: "8px",
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
