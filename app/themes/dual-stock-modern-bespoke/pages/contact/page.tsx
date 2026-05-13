'use client'
// audit-ignore-file: tp-use-client-on-page
// Contact form has tightly-coupled state with brand context; following the
// same pattern as columbus-vehicles-bespoke (Pitfall row 4 follow-up).

import Link from 'next/link'
import { useState } from 'react'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
import { EnquiryModal, useEnquiryModal } from '@/app/widgets/EnquiryModal'
import styles from './page.module.css'

export function DualContactPage() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const enquiryModal = useEnquiryModal()
  const brandName = brand?.name || 'Dual Stock Dealer'
  const [topic, setTopic] = useState<'general' | 'sales' | 'finance' | 'aftersales'>('general')

  // Single source of truth — getBrandContactInfo prefers brand.location.fullAddress
  // (set on most dealer records) and only falls back to joining line1+line2+city+
  // county+postcode when fullAddress is empty. Building the join here separately
  // duplicates city/postcode when a dealer record stuffs the full string into
  // line2 AND populates city/postcode independently.
  const fullAddress = contact.showroomAddress
  const openingHours = (brand as any)?.openingHours || (brand as any)?.location?.openingHours

  return (
    <main>
      <section className="dual-page-hero dual-page-hero--contact">
        <div className="dual-page-hero__inner">
          <nav className="dual-page-hero__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Contact</span>
          </nav>
          <h1 className="dual-page-hero__title">Talk to {brandName}</h1>
          <p className="dual-page-hero__lead">
            Whether you're after a car, a bike, finance or after-sales — get a real person on the phone in seconds.
          </p>
        </div>
      </section>

      <section className="dual-section">
        <div className="dual-container">
          <div className={styles.layout}>
            <article className={styles.copyCol} data-aos="fade-right">
              <span className="dual-eyebrow">Reach us</span>
              <h2 className={styles.h2}>Pick the channel that suits you</h2>
              <p className={styles.lead}>
                Phone, WhatsApp, email, or the enquiry form on the right. We answer all four within
                24 hours, usually a lot less.
              </p>

              <div className={styles.topicChips}>
                {[
                  { id: 'general', label: 'General' },
                  { id: 'sales', label: 'Sales · stock' },
                  { id: 'finance', label: 'Finance' },
                  { id: 'aftersales', label: 'After-sales' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`${styles.topicChip} ${topic === t.id ? styles.topicChipActive : ''}`}
                    onClick={() => setTopic(t.id as any)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <ul className={styles.contactList}>
                {contact.phoneTel && (
                  <li>
                    <a href={`tel:${contact.phoneTel}`}>
                      <span className={styles.contactIcon}><PhoneIcon /></span>
                      <span>
                        <strong>Call</strong>
                        <span>{contact.phoneDisplay}</span>
                      </span>
                    </a>
                  </li>
                )}
                {contact.whatsappUrl && (
                  <li>
                    <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <span className={styles.contactIcon}><WhatsAppIcon size={16} /></span>
                      <span>
                        <strong>WhatsApp</strong>
                        <span>Tap to message</span>
                      </span>
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`}>
                      <span className={styles.contactIcon}><MailIcon /></span>
                      <span>
                        <strong>Email</strong>
                        <span>{contact.email}</span>
                      </span>
                    </a>
                  </li>
                )}
                {fullAddress && (
                  <li>
                    <span>
                      <span className={styles.contactIcon}><MapIcon /></span>
                      <span>
                        <strong>Showroom</strong>
                        <span>{fullAddress}</span>
                      </span>
                    </span>
                  </li>
                )}
              </ul>

              {openingHours && (
                <div className={styles.hoursPanel}>
                  <h3 className={styles.h3}>Opening hours</h3>
                  <dl className={styles.hoursList}>
                    {(Object.entries(openingHours) as Array<[string, any]>).map(([day, h]) => (
                      <div key={day}>
                        <dt>{day}</dt>
                        <dd>{typeof h === 'string' ? h : (h?.closed ? 'Closed' : `${h?.open} – ${h?.close}`)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </article>

            <aside className={styles.formCol} data-aos="fade-left">
              <div className={styles.formCard}>
                <h2 className={styles.h2}>Send us a message</h2>
                <p className={styles.lead}>Fill in once — we'll match you with the right team.</p>
                <button
                  type="button"
                  className="dual-btn dual-btn--primary"
                  onClick={enquiryModal.open}
                >
                  Open enquiry form
                </button>
                <p className={styles.formNote}>
                  Prefer a call back? <Link href="/sell-my-car">Sell your car</Link> or {' '}
                  <Link href="/part-exchange">part-exchange</Link> queries also start here.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <EnquiryModal
        open={enquiryModal.isOpen}
        onClose={enquiryModal.close}
        subject={`Contact (${topic})`}
        contact={contact}
        leadType="general-contact"
        leadSource="contact-page"
        hiddenFields={{ topic, url: typeof window !== 'undefined' ? window.location.href : '' }}
      />
    </main>
  )
}

function PhoneIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.7 3.06a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2.02-1.27a2 2 0 0 1 2.11-.45c.99.33 2.01.57 3.06.7A2 2 0 0 1 22 16.92z" /></svg>
}
function MailIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
}
function MapIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

export default DualContactPage
