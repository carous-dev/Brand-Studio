import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import ContactFormIsland from './ContactFormIsland'
import ContactInfoPanel from './ContactInfoPanel'
import styles from './page.module.css'

export function NcrContactPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'NCR Van Sales Ltd'
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Talk to the team."
        lead={`Reach ${brandName} by phone, email or the form below. We respond to enquiries within one working day.`}
        imageSlot="services"
        pills={['Quick response', 'Trade welcome', 'Finance available']}
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.formCol} data-aos="fade-up">
            <ContactFormIsland />
          </div>
          <aside className={styles.infoCol} data-aos="fade-up" data-aos-delay="120">
            <ContactInfoPanel />
          </aside>
        </div>
      </section>
    </>
  )
}

export default NcrContactPage
