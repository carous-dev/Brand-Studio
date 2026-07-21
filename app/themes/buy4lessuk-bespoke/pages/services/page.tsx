import Link from 'next/link'
import { Car, Search, Hammer, ShieldCheck, BadgePoundSterling, Truck } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageShell from '../../components/PageShell'
import styles from './page.module.css'

const SERVICES = [
  { Icon: Car, title: 'Used-car sales', body: 'Carefully prepared stock from £3k to £30k+, ready to drive away today.' },
  { Icon: Search, title: 'Vehicle sourcing', body: "Can't see the car you want? Tell us the spec and we'll find it for you." },
  { Icon: BadgePoundSterling, title: 'Finance', body: 'HP and PCP from a panel of lenders — 60-second decision on most applications.' },
  { Icon: Hammer, title: 'Workshop & preparation', body: 'Every car serviced, MOT-checked and detailed before it goes on the forecourt.' },
  { Icon: ShieldCheck, title: 'Warranty', body: 'Optional extended warranty for added peace of mind on any car we sell.' },
  { Icon: Truck, title: 'UK delivery', body: 'Nationwide delivery available — let us bring your next car to your door.' },
]

export function Buy4lessukServicesPage({ brand }: ThemePageProps) {
  const name = (brand?.name || 'Buy4Less UK').trim()
  return (
    <>
      <PageHero title="What we do" eyebrow={`Services at ${name}`} slot="services" />
      <PageShell>
        <ul className={styles.grid}>
          {SERVICES.map(({ Icon, title, body }) => (
            <li key={title} className={styles.card}>
              <span className={styles.iconWrap} aria-hidden>
                <Icon size={22} strokeWidth={2.2} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ul>

        <div className={styles.cta}>
          <Link href="/used-cars" className={styles.ctaPrimary}>Browse stock</Link>
          <Link href="/contact" className={styles.ctaGhost}>Talk to the team</Link>
        </div>
      </PageShell>
    </>
  )
}

export default Buy4lessukServicesPage
