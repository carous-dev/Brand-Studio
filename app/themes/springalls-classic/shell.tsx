'use client'

import SpringallsShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <SpringallsShell>{children}</SpringallsShell>
}
