'use client'

import type { ThemeShellComponent, ThemeShellProps } from './types'
import { DEFAULT_THEME_ID } from './manifest'
import { resolveThemeId } from './theme-selection'
import { THEME_SHELL_REGISTRY } from './generated/theme-shell-registry.generated'

function getFallbackShell(): ThemeShellComponent {
  const defaultShell = THEME_SHELL_REGISTRY[DEFAULT_THEME_ID]
  if (defaultShell) {
    return defaultShell
  }

  const firstAvailableShell = Object.values(THEME_SHELL_REGISTRY)[0]
  if (firstAvailableShell) {
    return firstAvailableShell
  }

  return function IdentityShell({ children }: ThemeShellProps) {
    return <>{children}</>
  }
}

const FALLBACK_SHELL = getFallbackShell()

export function ThemeShell({ children, themeId }: ThemeShellProps & { themeId?: string }) {
  const resolvedThemeId = resolveThemeId(themeId)
  const Shell = THEME_SHELL_REGISTRY[resolvedThemeId] || FALLBACK_SHELL
  return <Shell>{children}</Shell>
}
