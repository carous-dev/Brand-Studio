import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  radii: {
    pill: "999px",
    card: "14px",
    input: "999px",
    button: "999px",
  },
  spacing: {
    sectionInset: "20px",
    sectionGap: "72px",
    containerMax: "1200px",
    headerMax: "1400px",
  },
  typography: {
    headingFamily: "'Cormorant Garamond', 'Times New Roman', Georgia, serif",
    bodyFamily: "'Karla', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    headingWeight: 600,
    bodyWeight: 400,
  },
  hero: {
    minHeight: "580px",
    minHeightLg: "640px",
    minHeightSm: "480px",
    overlayStart: "rgba(15, 10, 37, 0.30)",
    overlayEnd: "rgba(15, 10, 37, 0.65)",
    searchRadius: "999px",
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
