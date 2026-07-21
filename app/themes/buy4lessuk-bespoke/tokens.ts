import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  radii: {
    pill: "999px",
    card: "6px",
    input: "4px",
    button: "4px",
  },
  spacing: {
    sectionInset: "clamp(20px, 4vw, 40px)",
    sectionGap: "clamp(56px, 7vw, 96px)",
    containerMax: "1240px",
    headerMax: "1440px",
  },
  typography: {
    headingFamily: "Playfair Display",
    bodyFamily: "Inter",
    headingWeight: 700,
    bodyWeight: 400,
  },
  hero: {
    minHeight: "440px",
    minHeightLg: "560px",
    minHeightSm: "360px",
    overlayStart: "rgba(8, 8, 10, 0.10)",
    overlayEnd: "rgba(8, 8, 10, 0.62)",
    searchRadius: "4px",
  },
  reviewStar: '#facc15',
  borders: {
    soft: 'rgba(15, 23, 42, 0.08)',
    softer: 'rgba(17, 24, 39, 0.12)',
  },
  shadows: {
    card: "0 14px 32px rgba(15, 23, 42, 0.16)",
    floating: "0 20px 44px rgba(0, 0, 0, 0.28)",
    button: "0 6px 18px rgba(225, 29, 42, 0.28)",
  },
}
