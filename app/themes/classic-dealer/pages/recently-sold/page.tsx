import { Suspense } from 'react'
import type { ThemePageProps } from '../../../types'
import RecentlySoldHero from '../../components/RecentlySoldHero'
import RecentlySold from '../../components/RecentlySold'
import '../../styles/recently-sold.css'

export function ClassicRecentlySoldPage(_: ThemePageProps) {
  return (
    <main className="recently-sold-page">
      <RecentlySoldHero />
      <Suspense fallback={<div className="loading-state">Loading recently sold vehicles...</div>}>
        <RecentlySold />
      </Suspense>
    </main>
  )
}

export default ClassicRecentlySoldPage
