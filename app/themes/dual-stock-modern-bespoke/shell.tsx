'use client'

import DualShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <DualShell>{children}</DualShell>
}
