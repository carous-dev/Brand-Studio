import { PageHero } from '../../components/PageHero'
import CompareClient from './CompareClient'

export function FbmComparePage() {
  return (
    <>
      <PageHero
        title="Compare vehicles"
        lead="Add cars to your compare list while you browse to see specs side by side."
      />
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px' }}>
        <CompareClient />
      </section>
    </>
  )
}

export default FbmComparePage
