import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  radii: {
    pill: '999px',
    card: '14px',
    input: '999px',
    button: '999px',
  },
  spacing: {
    sectionInset: '20px',
    sectionGap: '64px',
    containerMax: '1200px',
    headerMax: '1400px',
  },
  typography: {
    headingFamily: "'Oswald', 'Montserrat', 'Segoe UI', sans-serif",
    bodyFamily: "'Montserrat', 'Segoe UI', sans-serif",
    headingWeight: 700,
    bodyWeight: 400,
  },
  hero: {
    minHeight: '520px',
    minHeightLg: '560px',
    minHeightSm: '440px',
    overlayStart: 'rgba(6, 10, 16, 0.34)',
    overlayEnd: 'rgba(6, 10, 16, 0.68)',
    searchRadius: '999px',
  },
  reviewStar: '#facc15',
  borders: {
    soft: 'rgba(15, 23, 42, 0.08)',
    softer: 'rgba(17, 24, 39, 0.12)',
  },
  shadows: {
    card: '0 18px 40px rgba(15, 23, 42, 0.18)',
    floating: '0 22px 48px rgba(0, 0, 0, 0.3)',
    button: '0 8px 22px rgba(6, 122, 116, 0.25)',
  },
}
