'use client'

import EleShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <EleShell>{children}</EleShell>
}
