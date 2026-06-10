'use client'

import FbmShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <FbmShell>{children}</FbmShell>
}
