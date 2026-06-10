import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  radii: {
    pill: '999px',
    card: '24px',
    input: '14px',
    button: '999px',
  },
  spacing: {
    sectionInset: '24px',
    sectionGap: '80px',
    containerMax: '1280px',
    headerMax: '1280px',
  },
  typography: {
    headingFamily: "'Space Grotesk', 'Inter', 'Segoe UI', sans-serif",
    bodyFamily: "'Inter', 'Segoe UI', sans-serif",
    headingWeight: 700,
    bodyWeight: 400,
  },
  hero: {
    minHeight: '560px',
    minHeightLg: '640px',
    minHeightSm: '440px',
    overlayStart: 'rgba(7, 9, 14, 0.7)',
    overlayEnd: 'rgba(7, 9, 14, 0.8)',
    searchRadius: '24px',
  },
  reviewStar: '#facc15',
  borders: {
    soft: 'rgba(14, 20, 32, 0.06)',
    softer: 'rgba(14, 20, 32, 0.12)',
  },
  shadows: {
    card: '0 10px 35px -12px rgba(14, 20, 32, 0.12)',
    floating: '0 20px 50px -20px rgba(0, 0, 0, 0.7)',
    button: '0 0 40px -8px rgba(255, 107, 26, 0.45)',
  },
}
