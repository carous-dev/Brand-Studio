'use client'

import ColumbusShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <ColumbusShell>{children}</ColumbusShell>
}
