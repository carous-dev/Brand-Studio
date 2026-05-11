import Link from 'next/link'
import { MapPin, Phone, Clock } from 'lucide-react'
import styles from './Directory.module.css'

type DirectoryProps = {
  brandName?: string
  address?: string
  phoneDisplay?: string
  phoneTel?: string
}

export default function Directory({
  brandName = 'ELE Car Sales',
  address = 'Shotts, North Lanarkshire, Scotland',
  phoneDisplay = '01501 000 000',
  phoneTel = '+441501000000',
}: DirectoryProps) {
  return (
    <section className={styles.section} aria-labelledby="ele-directory-title">
      <div className={styles.inner}>
        <div className={styles.head} data-aos="fade-up">
          <p className={styles.eyebrow}>Find the showroom</p>
          <h2 id="ele-directory-title" className={styles.title}>
            Easy to reach from Glasgow, Edinburgh, and the central belt.
          </h2>
        </div>

        <div className={styles.grid} data-aos="fade-up" data-aos-delay="80">
          <article className={styles.card}>
            <span className={styles.iconWrap} aria-hidden="true">
              <MapPin size={20} />
            </span>
            <h3 className={styles.cardTitle}>Address</h3>
            <p className={styles.cardBody}>{address}</p>
            <p className={styles.cardMeta}>~30 min from Glasgow · ~45 min from Edinburgh</p>
          </article>

          <article className={styles.card}>
            <span className={styles.iconWrap} aria-hidden="true">
              <Phone size={20} />
            </span>
            <h3 className={styles.cardTitle}>Speak to the team</h3>
            <p className={styles.cardBody}>
              <a href={`tel:${phoneTel}`} className={styles.phoneLink}>
                {phoneDisplay}
              </a>
            </p>
            <p className={styles.cardMeta}>WhatsApp and email also welcome.</p>
          </article>

          <article className={styles.card}>
            <span className={styles.iconWrap} aria-hidden="true">
              <Clock size={20} />
            </span>
            <h3 className={styles.cardTitle}>Showroom hours</h3>
            <p className={styles.cardBody}>Mon–Fri 9:00–18:00<br />Sat 10:00–17:00</p>
            <p className={styles.cardMeta}>Out-of-hours viewings by appointment.</p>
          </article>
        </div>

        <div className={styles.ctaRow}>
          <Link href="/contact" className={styles.cta}>
            Plan a visit to {brandName}
          </Link>
        </div>
      </div>
    </section>
  )
}
