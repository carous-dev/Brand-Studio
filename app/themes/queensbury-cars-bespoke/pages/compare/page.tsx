import type { ThemePageProps } from '../../../types'
import CompareIsland from './CompareIsland'

export function QueensburyComparePage(_props: ThemePageProps) {
  return (
    <>
      <section className="qb-page-hero qb-page-hero--plain" data-aos="fade-up">
        <div className="qb-page-hero__inner">
          <span className="qb-page-hero__eyebrow">Compare</span>
          <h1 className="qb-page-hero__title">Line them up side-by-side.</h1>
          <p className="qb-page-hero__lead">
            Up to three cars at once — specs, finance, the lot. Pick your shortlist from the stock list.
          </p>
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-container">
          <CompareIsland />
        </div>
      </section>
    </>
  )
}

export default QueensburyComparePage
