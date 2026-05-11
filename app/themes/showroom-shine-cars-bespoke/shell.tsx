'use client'

import ShowroomShell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <ShowroomShell>{children}</ShowroomShell>
}
