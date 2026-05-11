'use client'

import NcrShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <NcrShell>{children}</NcrShell>
}
