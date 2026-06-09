'use client'

import WarwickShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <WarwickShell>{children}</WarwickShell>
}
