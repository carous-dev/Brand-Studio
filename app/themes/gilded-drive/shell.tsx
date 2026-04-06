'use client'

import ConditionalShell from './components/ConditionalShell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <ConditionalShell>{children}</ConditionalShell>
}
