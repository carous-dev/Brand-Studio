import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import Directory from '../../components/Directory'
import ContactFormIsland from './ContactFormIsland'
import styles from './page.module.css'

export function AutoContactPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'AUTOWOW UK'

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Talk to the forecourt."
        lead={`Phones answered, WhatsApps replied to, walk-ins welcome. Tell us what you're after and the ${brandName} team will get back within one working day.`}
        imageSlot="hero"
        pills={['Reply within 1 working day', 'WhatsApp ready', 'No bots']}
      />

      <section className={styles.body}>
        <div className={styles.bodyInner} data-aos="fade-up">
          <ContactFormIsland />
        </div>
      </section>

      <div data-aos="fade-up" data-aos-delay="120"><Directory brand={brand} /></div>
    </>
  )
}

export default AutoContactPage
