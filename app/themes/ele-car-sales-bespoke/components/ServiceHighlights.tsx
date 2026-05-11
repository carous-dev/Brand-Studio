import Link from 'next/link'
import { Wallet, Repeat, ShieldCheck, Truck } from 'lucide-react'
import styles from './ServiceHighlights.module.css'

const ITEMS = [
  {
    Icon: Wallet,
    title: 'Finance available',
    body: 'Tailored finance options with competitive rates from multiple lenders.',
    href: '/finance',
    cta: 'Check your eligibility',
  },
  {
    Icon: Repeat,
    title: 'Part-exchange',
    body: 'Fair, instant valuations on your current car against any vehicle in stock.',
    href: '/part-exchange',
    cta: 'Get a valuation',
  },
  {
    Icon: ShieldCheck,
    title: 'Quality checked',
    body: 'Every car HPI-checked and prepared with a 12-month MOT before sale.',
    href: '/services',
    cta: 'How we prep cars',
  },
  {
    Icon: Truck,
    title: 'Nationwide delivery',
    body: 'Door-to-door delivery anywhere in mainland UK on most vehicles.',
    href: '/contact',
    cta: 'Ask about delivery',
  },
]

export default function ServiceHighlights() {
  return (
    <section className={styles.section} aria-labelledby="ele-services-title">
      <div className={styles.inner}>
        <div className={styles.head} data-aos="fade-up">
          <p className={styles.eyebrow}>Why ELE Car Sales</p>
          <h2 id="ele-services-title" className={styles.title}>
            Buying a used car shouldn&apos;t be a guessing game.
          </h2>
          <p className={styles.lead}>
            We&apos;ve been helping drivers across Lanarkshire find the right car at
            the right price — backed by finance, part-exchange, and delivery
            that actually makes life easier.
          </p>
        </div>

        <ul className={styles.grid} role="list">
          {ITEMS.map((item, i) => {
            const Icon = item.Icon
            return (
              <li
                key={item.title}
                className={styles.card}
                data-aos="fade-up"
                data-aos-delay={String(80 + i * 80)}
              >
                <span className={styles.iconWrap} aria-hidden="true">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardBody}>{item.body}</p>
                <Link href={item.href} className={styles.cardCta}>
                  {item.cta} →
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
