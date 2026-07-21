import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import ContactClient from './ContactClient'

export function Buy4lessukContactPage(_: ThemePageProps) {
  return (
    <>
      <PageHero title="Contact us" eyebrow="Visit the showroom" slot="about" />
      <ContactClient />
    </>
  )
}

export default Buy4lessukContactPage
