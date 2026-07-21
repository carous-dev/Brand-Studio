'use client'

import AxisShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <AxisShell>{children}</AxisShell>
}
