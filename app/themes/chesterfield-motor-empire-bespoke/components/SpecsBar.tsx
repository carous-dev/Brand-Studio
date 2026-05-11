import { Award, Car, Clock, Users } from 'lucide-react'
import styles from './SpecsBar.module.css'

const STATS = [
  { icon: Car, value: '500+', label: 'Vehicles available' },
  { icon: Users, value: '300+', label: 'Happy customers' },
  { icon: Clock, value: '6 days', label: 'Open Mon–Sat' },
  { icon: Award, value: '125+', label: 'Makes &amp; models' },
]

export default function SpecsBar() {
  return (
    <section className={styles.bar} aria-label="Showroom by the numbers">
      <div className={styles.bgAccent} aria-hidden="true" />
      <div className={styles.inner}>
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={styles.stat}
              data-aos="fade-up"
              data-aos-delay={String(i * 80)}
            >
              <span className={styles.statIcon} aria-hidden="true">
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel} dangerouslySetInnerHTML={{ __html: stat.label }} />
            </div>
          )
        })}
      </div>
    </section>
  )
}
