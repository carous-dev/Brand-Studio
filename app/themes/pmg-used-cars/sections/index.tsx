// Empty section registry — app-clone themes render through Next page
// components (per-page composition), not through the dashboard's section
// recipe system. The contract requires this file to exist; the dashboard's
// recipe tab for this theme will simply show no editable sections.
import type { ThemeSectionRegistry } from '../../types'

export const themeSections: ThemeSectionRegistry = {}

export default themeSections
