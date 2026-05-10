import type { ThemePageProps } from '../../../types'
import CompareView from '../../components/CompareView'

/**
 * Columbus Vehicles — Compare (rugged archetype)
 *
 * SERVER COMPONENT wrapper. Interactive table is in `<CompareView>`
 * (client). Same rationale as wishlist — keeps the route handler off
 * the 'use client' chunk-item path that collides with springalls's
 * parallel page in Turbopack.
 */
export function ColumbusComparePage(_props: ThemePageProps) {
  return (
    <main>
      <CompareView />
    </main>
  )
}

export default ColumbusComparePage
