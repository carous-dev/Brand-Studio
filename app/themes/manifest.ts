import manifest from '@/theme/theme-manifest.json'
import type { ThemeManifestEntry } from './types'

type ThemeManifest = {
  version: number
  defaultTheme: string
  themes: ThemeManifestEntry[]
}

const manifestData = manifest as ThemeManifest

export const themeManifest: ThemeManifest = {
  version: Number.isInteger(manifestData?.version) ? manifestData.version : 1,
  defaultTheme: (manifestData?.defaultTheme || 'classic-dealer').toLowerCase(),
  themes: Array.isArray(manifestData?.themes)
    ? manifestData.themes.map((theme) => ({ ...theme, id: String(theme.id || '').toLowerCase() }))
    : [],
}

export const DEFAULT_THEME_ID = themeManifest.defaultTheme
export const REGISTERED_THEME_IDS = new Set(themeManifest.themes.map((theme) => theme.id))
