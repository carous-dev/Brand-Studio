import Link from 'next/link'
import styles from './ServicesSection.module.css'

const SERVICES = [
  {
    title: 'Offers',
    description: 'View our latest offers and deals.',
    cta: 'Offers',
    href: '/used-cars',
    cardClassName: 'cardOffers' as const
  },
  {
    title: 'Servicing',
    description: 'Book your car service or MOT online.',
    cta: 'Servicing',
    href: '/services',
    cardClassName: 'cardServicing' as const
  },
  {
    title: 'Parts & Accessories',
    description: 'Genuine parts and accessories.',
    cta: 'Parts & Accessories',
    href: '/contact-us',
    cardClassName: 'cardParts' as const
  },
  {
    title: 'Sell My Car',
    description: 'Get a hassle-free valuation.',
    cta: 'Sell My Car',
    href: '/sell-my-car',
    cardClassName: 'cardSell' as const
  }
]

export default function ServicesSection() {
  return (
    <section className={styles.services}>
      <div className={styles.servicesInner}>
        <div className={styles.servicesGrid}>
          {SERVICES.map((service) => (
            <article key={service.title} className={`${styles.serviceCard} ${styles[service.cardClassName]}`}>
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceText}>{service.description}</p>
                <Link href={service.href} className={styles.serviceButton}>
                  {service.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
