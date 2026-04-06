import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  radii: {
    card: '12px',
    button: '8px',
  },
  spacing: {
    section: '4rem',
    container: '1.25rem',
  },
  typography: {
    headingWeight: 700,
    bodyWeight: 400,
  },
  aboutPage: {
    heroMinHeight: '500px',
    sectionGap: '70px',
    cardRadius: '14px',
    ctaRadius: '16px',
    badgeHeight: '38px',
  },
  contactPage: {
    heroMinHeight: '500px',
    contentGap: '22px',
    cardRadius: '14px',
    formRadius: '16px',
    badgeHeight: '38px',
  },
  vehicleDetailPage: {
    breadcrumbOffsetTop: '70px',
    shellMaxWidth: '1200px',
    contentGap: '26px',
    cardRadius: '14px',
    galleryRatio: '16 / 9',
    summaryStickyTop: '18px',
  },
}
