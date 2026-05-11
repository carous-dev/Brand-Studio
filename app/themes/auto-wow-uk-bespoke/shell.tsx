'use client'

import AutoShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <AutoShell>{children}</AutoShell>
}
