import Link from 'next/link'
import { resolveText } from '../../lib/brand-text'
import { PageHero } from '../../components/PageHero'
import { SectionHeading } from '../../components/SectionHeading'
import { aboutImage as defaultAbout, showroomImage as defaultShowroom } from '../../lib/cars'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const partners = ['Handler Protect', 'AA Dealer Promise', 'AutoTrader', 'Zuto Car Finance']

const promises: Array<[string, string]> = [
  ['Transparency first', 'Full history checks, honest condition reports, no hidden fees.'],
  ['Quality over volume', "Every car is inspected and prepared before it's listed."],
  ['Service that lasts', 'Warranty and breakdown cover included — support after the sale, not just during it.'],
]

export function FbmAboutPage({ brand }: ThemePageProps) {
  const heroBg = brand.images?.about || brand.heroImage || defaultShowroom
  const aboutPhoto = brand.images?.about || defaultAbout

  const heroTitle = resolveText(brand, 'aboutHeroTitle')
  const heroLead = resolveText(brand, 'aboutHeroLead')
  const storyEyebrow = resolveText(brand, 'aboutStoryEyebrow')
  const storyTitle = resolveText(brand, 'aboutStoryTitle')
  const para1 = resolveText(brand, 'aboutStoryParagraph1')
  const para2 = resolveText(brand, 'aboutStoryParagraph2')
  const para3 = resolveText(brand, 'aboutStoryParagraph3')

  const stockCount = String((brand as any)?.stats?.stockCount || '103')
  const stats: Array<[string, string]> = [
    ['4.9/5', 'AutoTrader rating'],
    [stockCount, 'Cars in stock'],
    ['12', 'Brands stocked'],
    ['12 mo', 'AA cover on every car'],
  ]

  return (
    <>
      <PageHero image={heroBg} title={heroTitle} lead={heroLead} />

      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          {stats.map(([n, l]) => (
            <div key={l} className={styles.statCard}>
              <p className={styles.statNum}>{n}</p>
              <p className={styles.statLabel}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.story}>
        <div className={styles.storyInner}>
          <div>
            <p className={styles.storyEyebrow}>{storyEyebrow}</p>
            <h2 className={styles.storyTitle}>{storyTitle}</h2>
            <div className={styles.storyParas}>
              {para1 && <p>{para1}</p>}
              {para2 && <p>{para2}</p>}
              {para3 && <p>{para3}</p>}
            </div>
            <Link href="/used-cars" className={`fbm-btn-primary ${styles.storyCta}`}>Browse our stock →</Link>
          </div>
          <div className={styles.storyMediaCol}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={aboutPhoto} alt="" width={600} height={400} className={styles.storyImage} />
            {promises.map(([t, b]) => (
              <div key={t} className={styles.promiseCard}>
                <h3 className={styles.promiseTitle}>{t}</h3>
                <p className={styles.promiseBody}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.partners}>
        <SectionHeading eyebrow="Trusted by" title="Our Partners" lead="We work alongside the names you already trust." />
        <div className={styles.partnersGrid}>
          {partners.map((p) => (
            <div key={p} className={styles.partnerCard}>{p}</div>
          ))}
        </div>
      </section>
    </>
  )
}

export default FbmAboutPage
