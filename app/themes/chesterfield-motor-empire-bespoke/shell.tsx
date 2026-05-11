'use client'

import ChesterfieldShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <ChesterfieldShell>{children}</ChesterfieldShell>
}
