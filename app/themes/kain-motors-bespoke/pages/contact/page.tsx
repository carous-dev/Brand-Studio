import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import { getBrandContactInfo } from '../../lib/contact'
import KainContactForm from './ContactForm'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
import styles from './page.module.css'

export function KainContactPage({ brand }: ThemePageProps) {
  const contact = getBrandContactInfo(brand)
  const addr = (brand?.location?.address || {}) as Record<string, string | undefined>

  return (
    <>
      <PageHero
        variant="contact"
        eyebrow="Get in touch"
        title="Visit the showroom — by appointment only."
        lead="Midlands Street, Manchester. Book a slot and we’ll have the car prepped, fueled and ready for you."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <section className={`kain-section ${styles.section}`}>
        <div className={styles.grid}>
          <div className={styles.formColumn} data-aos="fade-up">
            <p className="kain-eyebrow">Send a message</p>
            <h2 className={styles.formTitle}>Tell us what you’re after.</h2>
            <p className={styles.formLead}>
              Drop your details and the team will get back to you in showroom hours. For instant replies,
              WhatsApp is usually fastest.
            </p>
            <KainContactForm />
          </div>

          <aside className={styles.aside}>
            <div className={styles.asideCard} data-aos="fade-left">
              <p className="kain-eyebrow">Showroom</p>
              <address className={styles.address}>
                {addr.line1 && <span>{addr.line1}<br /></span>}
                {addr.line2 && <span>{addr.line2}<br /></span>}
                {(addr.city || addr.county) && <span>{[addr.city, addr.county].filter(Boolean).join(', ')}<br /></span>}
                {addr.postcode && <span>{addr.postcode}</span>}
                {!addr.line1 && (
                  <>
                    Midlands Street<br />
                    Manchester<br />
                    M12 6LB
                  </>
                )}
              </address>
              <div className={styles.divider} aria-hidden="true" />
              <p className="kain-eyebrow">Hours</p>
              <dl className={styles.hours}>
                <div><dt>Mon – Fri</dt><dd>09:30 – 17:30</dd></div>
                <div><dt>Saturday</dt><dd>09:30 – 17:30</dd></div>
                <div><dt>Sunday</dt><dd>Closed</dd></div>
              </dl>
              <div className={styles.divider} aria-hidden="true" />
              <p className="kain-eyebrow">Direct lines</p>
              <ul className={styles.lines}>
                {contact.phoneTel && (
                  <li>
                    <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay || contact.phoneTel}</a>
                    <span>· main showroom</span>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    <span>· enquiries</span>
                  </li>
                )}
              </ul>
              {contact.whatsappUrl && (
                <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
                  <WhatsAppIcon size={18} />
                  <span>WhatsApp the showroom</span>
                </a>
              )}
              <p className={styles.note}>
                We typically reply within the hour during showroom times.{' '}
                <Link href="/sell-my-car">Selling a car?</Link>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

export default KainContactPage
