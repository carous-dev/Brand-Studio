import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import RecentlySoldList from './RecentlySoldList'
import CtaImageBand from '../../components/CtaImageBand'

export function ChesterfieldRecentlySoldPage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        eyebrow="Recently sold"
        title={<>Cars that have already <span style={{ color: 'var(--color-accent)' }}>found new homes</span>.</>}
        lead="A snapshot of vehicles that have passed through the Chesterfield Motor Empire forecourt. Browse current stock to see what's available now."
        imageVar="var(--brand-image-recently-sold)"
      />
      <RecentlySoldList />
      <CtaImageBand variant="contact" />
    </>
  )
}

export default ChesterfieldRecentlySoldPage
