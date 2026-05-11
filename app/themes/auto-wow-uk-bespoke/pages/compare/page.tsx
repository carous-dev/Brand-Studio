import type { ThemePageProps } from '../../../types'
import CompareIsland from './CompareIsland'

export function AutoComparePage(_props: ThemePageProps) {
  return (
    <>
      <section className="auto-page-hero">
        <div className="auto-page-hero-inner">
          <p className="auto-page-hero-crumb">Compare</p>
          <h1>Side-by-side, spec-by-spec.</h1>
          <p>
            Stack the cars you&rsquo;re considering against each other and see the differences at a
            glance. Add up to four to compare.
          </p>
        </div>
      </section>
      <CompareIsland />
    </>
  )
}

export default AutoComparePage
