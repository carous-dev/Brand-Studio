'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Directory.module.css'

export default function Directory() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'NCR Van Sales Ltd'

  return (
    <section className={styles.section} aria-labelledby="directory-title">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <p className={styles.eyebrow}>Find us</p>
          <h2 id="directory-title" className={styles.title}>
            Drop in. <span className={styles.titleAccent}>Or get in touch.</span>
          </h2>
        </header>

        <div className={styles.grid}>
          <article className={styles.card} data-aos="fade-up" data-aos-delay="80">
            <span className={styles.iconWrap} aria-hidden="true">
              <MapPin size={20} strokeWidth={2} />
            </span>
            <h3 className={styles.cardTitle}>Showroom</h3>
            <address className={styles.body}>
              {contact.showroomAddress || `Visit ${brandName} at our forecourt — full address available on request.`}
            </address>
            <Link href="/contact" className={styles.linkRow}>
              Get directions <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </article>

          <article className={styles.card} data-aos="fade-up" data-aos-delay="160">
            <span className={styles.iconWrap} aria-hidden="true">
              <Phone size={20} strokeWidth={2} />
            </span>
            <h3 className={styles.cardTitle}>Speak to us</h3>
            <div className={styles.body}>
              {contact.phoneDisplay ? (
                <p>
                  <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`}>{contact.phoneDisplay}</a>
                </p>
              ) : (
                <p>Phone number coming soon.</p>
              )}
              {contact.email ? (
                <p>
                  <a href={`mailto:${contact.email}`}>
                    <Mail size={14} strokeWidth={2} aria-hidden="true" /> {contact.email}
                  </a>
                </p>
              ) : null}
            </div>
            <Link href="/contact" className={styles.linkRow}>
              Send an enquiry <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </article>

          <article className={styles.card} data-aos="fade-up" data-aos-delay="240">
            <span className={styles.iconWrap} aria-hidden="true">
              <Clock size={20} strokeWidth={2} />
            </span>
            <h3 className={styles.cardTitle}>Opening hours</h3>
            <dl className={styles.hours}>
              <div><dt>Mon – Fri</dt><dd>09:00 – 18:00</dd></div>
              <div><dt>Saturday</dt><dd>09:00 – 17:00</dd></div>
              <div><dt>Sunday</dt><dd>Closed</dd></div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  )
}
