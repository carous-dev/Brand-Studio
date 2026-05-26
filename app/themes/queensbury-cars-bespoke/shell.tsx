'use client'

import QueensburyShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <QueensburyShell>{children}</QueensburyShell>
}
