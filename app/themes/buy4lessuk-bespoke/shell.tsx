'use client'

import Buy4lessukShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <Buy4lessukShell>{children}</Buy4lessukShell>
}
