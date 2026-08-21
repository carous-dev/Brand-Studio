// PMG Used Car Sales — non-color design scalars (radii / spacing / hero / shadows).
// Colors flow from the brand record via context/BrandStyles.tsx; these are the
// fixed design contract mirrored from the source app's globals.css.
import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  colors: {
    primary: '#de010d',
    primaryStrong: '#b70009',
    accent: '#ff3b45',
    bg: '#ffffff',
    surface: '#f5f5f6',
    text: '#1b1b1f',
    muted: '#5d5d66',
    border: '#e3e3e7',
    heroOverlay: 'rgba(5,5,6,0.66)',
  },
  fonts: {
    heading: "'Chakra Petch', 'Segoe UI', sans-serif",
    body: "'Inter', system-ui, 'Segoe UI', sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,500;0,600;0,700;1,700&family=Inter:wght@400;500;600;700&display=swap',
  },
  radii: { card: '16px', button: '10px', input: '10px', pill: '999px' },
  reviewStar: '#f59e0b',
}

export default themeTokens
