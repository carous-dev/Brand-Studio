import Link from 'next/link'
import { Car, RefreshCw, Banknote, ShieldCheck, Search, Truck, ArrowRight } from 'lucide-react'
import styles from './ServicesGrid.module.css'

const SERVICES = [
  {
    icon: Car,
    title: 'Car sales',
    body: 'Privately sourced used vehicles, prepared to retail standard, ready to drive away.',
    href: '/used-cars',
  },
  {
    icon: RefreshCw,
    title: 'Part exchange',
    body: 'Honest valuations on your current vehicle so you can upgrade without faff.',
    href: '/part-exchange',
  },
  {
    icon: Banknote,
    title: 'Finance options',
    body: 'Tailored finance packages with clear monthly figures before you commit.',
    href: '/finance',
  },
  {
    icon: ShieldCheck,
    title: 'After-sales support',
    body: 'Minimum 3-month comprehensive warranty plus friendly support after the keys change hands.',
    href: '/services',
  },
  {
    icon: Search,
    title: 'Vehicle inspection',
    body: 'HPI &amp; finance checks with careful preparation so you can buy with full confidence.',
    href: '/services',
  },
  {
    icon: Truck,
    title: 'Delivery service',
    body: 'Local collection support and practical handover for distance customers across the UK.',
    href: '/services',
  },
]

export default function ServicesGrid() {
  return (
    <section className={styles.section} aria-labelledby="services-heading">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <p className={styles.eyebrow}>Our services</p>
          <h2 id="services-heading" className={styles.heading}>
            Complete used-car support, <span className={styles.headingAccent}>handover to handover</span>.
          </h2>
          <p className={styles.lead}>
            Every car undergoes a full specialist health check. Test drives at your convenience.
          </p>
        </header>

        <div className={styles.grid}>
          {SERVICES.map((s, i) => {
            const Icon = s.icon
            return (
              <Link
                key={s.title}
                href={s.href}
                className={styles.card}
                data-aos="fade-up"
                data-aos-delay={String((i % 3) * 80)}
              >
                <span className={styles.cardCorner} aria-hidden="true" />
                <span className={styles.cardIcon} aria-hidden="true">
                  <Icon size={22} strokeWidth={2} />
                </span>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <p
                  className={styles.cardBody}
                  dangerouslySetInnerHTML={{ __html: s.body }}
                />
                <span className={styles.cardLink}>
                  Learn more
                  <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
