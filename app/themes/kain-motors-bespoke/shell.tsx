'use client'

import KainShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <KainShell>{children}</KainShell>
}
