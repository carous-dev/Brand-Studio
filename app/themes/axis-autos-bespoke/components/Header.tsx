'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'

/**
 * SKELETON Header — replace wholesale during Phase 8 design work using the
 * archetype's header pattern (see docs/theme-archetype-specs.md). This stub
 * exists only to make the theme renderable while the design is in progress.
 *
 * Quality bar reminders for the redesign (per .claude/skills/new-theme/SKILL.md):
 *  - Use <nav aria-label="Primary"> with real <a> elements
 *  - Mobile hamburger as <button aria-expanded=>, NOT <div onClick=>
 *  - Touch targets ≥ 44×44px
 *  - Mobile-first responsive (min-width media queries)
 */
export default function Header() {
  const brand = useBrand()
  const brandName = brand?.name || 'Axis'

  return (
    <header className="axis-header">
      <div className="axis-header-inner">
        <Link href="/" className="axis-header-brand" aria-label={brandName}>
          {brandName}
        </Link>
        <nav aria-label="Primary" className="axis-header-nav">
          <Link href="/used-cars">Stock</Link>
          <Link href="/finance">Finance</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  )
}
