import { Award, HeartHandshake, Star, Users } from 'lucide-react'
import styles from './page.module.css'
import { HeroBackdrop } from '../../components/HeroBackdrop'
import type { ThemePageProps } from '../../../types'

const VALUES = [
  {
    title: 'Trusted sourcing',
    description: 'Every vehicle is privately sourced and thoroughly vetted before it reaches our forecourt.',
    icon: Award
  },
  {
    title: 'People-first service',
    description: 'We focus on honest advice, friendly guidance, and no-pressure conversations.',
    icon: HeartHandshake
  },
  {
    title: 'Detail obsessed',
    description: 'From inspection to handover, we sweat the small details so you do not have to.',
    icon: Star
  },
  {
    title: 'Local expertise',
    description: 'A locally based team that understands what local drivers value most.',
    icon: Users
  }
]

const STATS = [
  { label: 'Vehicles prepared each month', value: '40+' },
  { label: 'Average customer rating', value: '4.9/5' },
  { label: 'Years serving local drivers', value: '12+' }
]

export function SpringallsAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Springalls Car Sales'
  const city = (brand as any)?.location?.address?.city || 'Reading'
  const county = (brand as any)?.location?.address?.county || 'Berkshire'
  const region = county || city
  const aboutHeadline =
    (brand as any)?.aboutUs?.headline || 'A trusted team built on transparency'
  const aboutLead =
    (brand as any)?.aboutUs?.description ||
    'We are a locally owned dealership committed to honest advice, quality vehicles, and a modern buying experience.'
  const eyebrow = `About ${brandName.replace(/\s*(Ltd|Limited|Car Sales)\.?$/i, '').trim() || brandName}`
  const stats = (brand as any)?.aboutUs?.stats && Array.isArray((brand as any).aboutUs.stats) && (brand as any).aboutUs.stats.length
    ? (brand as any).aboutUs.stats.map((s: any) => ({ label: String(s.label || ''), value: String(s.value || '') })).filter((s: any) => s.label && s.value)
    : STATS

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <HeroBackdrop />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.heroTitle}>{aboutHeadline}</h1>
          <p className={styles.heroLead}>{aboutLead}</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.storyCard}>
            <div>
              <h2 className={styles.sectionTitle}>Our story</h2>
              <p className={styles.sectionText}>
                {brandName} was founded with a simple goal: remove the friction and uncertainty from buying a used
                car. Our team combines deep vehicle knowledge with a no-pressure approach, so you always feel
                confident about your decision.
              </p>
              <p className={styles.sectionText}>
                We focus on vehicles that meet our standards for quality and reliability. That means careful sourcing,
                rigorous preparation, and a transparent handover every time.
              </p>
            </div>
            <div className={styles.statsGrid}>
              {stats.map((stat: { label: string; value: string }) => (
                <div key={stat.label} className={styles.statCard}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What we stand for</h2>
            <p className={styles.sectionText}>
              Every interaction reflects the values that make {brandName} a trusted choice in {region}.
            </p>
          </div>
          <div className={styles.valueGrid}>
            {VALUES.map((value) => {
              const Icon = value.icon
              return (
                <article key={value.title} className={styles.valueCard}>
                  <div className={styles.valueIcon} aria-hidden="true">
                    <Icon size={24} strokeWidth={1.8} />
                  </div>
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                  <p className={styles.valueText}>{value.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.teamCard}>
            <div>
              <h2 className={styles.sectionTitle}>Meet the team</h2>
              <p className={styles.sectionText}>
                A close-knit team that values trust, detail, and clear communication. We are here to support every step
                of your journey.
              </p>
            </div>
            <div className={styles.teamGrid}>
              <div className={styles.teamMember}>
                <strong>Sales & Finance</strong>
                <span>Expert guidance on finance and part exchange.</span>
              </div>
              <div className={styles.teamMember}>
                <strong>Vehicle Prep</strong>
                <span>Inspection and detailing specialists.</span>
              </div>
              <div className={styles.teamMember}>
                <strong>Customer Care</strong>
                <span>After-sales support and delivery coordination.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default SpringallsAboutPage
