import Link from 'next/link'
import { ShieldCheck, Sparkles, HeartHandshake, MapPin } from 'lucide-react'
import { resolveText } from '../../lib/brand-text'
import { aboutImage as defaultAbout, showroomImage as defaultShowroom } from '../../lib/cars'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

type StoryColumn = {
  icon: 'shield' | 'sparkles' | 'handshake'
  title: string
  body: string
}

export function FbmAboutPage({ brand }: ThemePageProps) {
  const heroBg = brand.images?.about || brand.heroImage || defaultShowroom
  const aboutPhoto = brand.images?.about || defaultAbout

  const heroEyebrow = resolveText(brand, 'aboutHeroEyebrow')
  const heroTitle = resolveText(brand, 'aboutHeroTitle')
  const heroLead = resolveText(brand, 'aboutHeroLead')

  const storyEyebrow = resolveText(brand, 'aboutStoryEyebrow')
  const storyTitle = resolveText(brand, 'aboutStoryTitle')
  const storyLead = resolveText(brand, 'aboutStoryLead')

  const col1Title = resolveText(brand, 'aboutCol1Title')
  const col1Body = resolveText(brand, 'aboutStoryParagraph1')
  const col2Title = resolveText(brand, 'aboutCol2Title')
  const col2Body = resolveText(brand, 'aboutStoryParagraph2')
  const col3Title = resolveText(brand, 'aboutCol3Title')
  const col3Body = resolveText(brand, 'aboutStoryParagraph3')

  const columns: StoryColumn[] = [
    { icon: 'shield', title: col1Title, body: col1Body },
    { icon: 'sparkles', title: col2Title, body: col2Body },
    { icon: 'handshake', title: col3Title, body: col3Body },
  ]

  const statsEyebrow = resolveText(brand, 'aboutStatsEyebrow')
  const statsTitle = resolveText(brand, 'aboutStatsTitle')

  // Default stats — brand can override via brand.aboutStats array of {value,label}
  const rawAboutStats = Array.isArray((brand as any)?.aboutStats) ? (brand as any).aboutStats : []
  const stockCount = String((brand as any)?.stats?.stockCount || '103')

  const stats: Array<{ value: string; label: string }> = rawAboutStats.length === 4
    ? rawAboutStats.map((s: any) => ({ value: String(s?.value || ''), label: String(s?.label || '') }))
    : [
        { value: resolveText(brand, 'aboutStat1Value'), label: resolveText(brand, 'aboutStat1Label') },
        { value: stockCount, label: resolveText(brand, 'aboutStat2Label') },
        { value: resolveText(brand, 'aboutStat3Value'), label: resolveText(brand, 'aboutStat3Label') },
        { value: resolveText(brand, 'aboutStat4Value'), label: resolveText(brand, 'aboutStat4Label') },
      ]

  const showroomEyebrow = resolveText(brand, 'aboutShowroomEyebrow')
  const showroomTitle = resolveText(brand, 'aboutShowroomTitle')
  const showroomLead = resolveText(brand, 'aboutShowroomLead')
  const showroomCaption = resolveText(brand, 'aboutShowroomCaption')

  const ctaEyebrow = resolveText(brand, 'aboutCtaEyebrow')
  const ctaTitle = resolveText(brand, 'aboutCtaTitle')
  const ctaLead = resolveText(brand, 'aboutCtaLead')

  const renderColIcon = (kind: StoryColumn['icon']) => {
    if (kind === 'shield') return <ShieldCheck size={22} strokeWidth={1.6} />
    if (kind === 'sparkles') return <Sparkles size={22} strokeWidth={1.6} />
    return <HeartHandshake size={22} strokeWidth={1.6} />
  }

  return (
    <main>
      {/* ─── Hero ─── */}
      <section className={styles.hero} aria-label="About hero">
        {heroBg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroBg} alt="" className={styles.heroImage} />
        )}
        <div className={styles.heroWash} aria-hidden />
        <div className={styles.heroTint} aria-hidden />
        <div className={styles.heroInner}>
          {heroEyebrow && (
            <span className={`fbm-eyebrow ${styles.heroEyebrow} fbm-animate-rise`}>{heroEyebrow}</span>
          )}
          <h1 className={`${styles.heroTitle} fbm-animate-rise`} style={{ animationDelay: '100ms' }}>{heroTitle}</h1>
          {heroLead && (
            <p className={`${styles.heroLead} fbm-animate-rise`} style={{ animationDelay: '180ms' }}>{heroLead}</p>
          )}
        </div>
      </section>

      {/* ─── Story columns ─── */}
      <section className={styles.story}>
        <div className={styles.storyInner}>
          <div className={styles.storyHeading}>
            {storyEyebrow && <p className={`fbm-eyebrow ${styles.storyEyebrow}`}>{storyEyebrow}</p>}
            <h2 className={styles.storyTitle}>{storyTitle}</h2>
            {storyLead && <p className={styles.storyLead}>{storyLead}</p>}
          </div>
          <div className={styles.storyGrid}>
            {columns.map((c) => (
              <article key={c.title} className={styles.storyColumn}>
                <span className={styles.storyColumnRule} aria-hidden />
                <span className={styles.storyColumnIcon} aria-hidden>{renderColIcon(c.icon)}</span>
                <h3 className={styles.storyColumnTitle}>{c.title}</h3>
                <p className={styles.storyColumnBody}>{c.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats strip ─── */}
      <section className={styles.statsBand}>
        <div className={styles.statsTint} aria-hidden />
        <div className={styles.statsInner}>
          <div className={styles.statsHeading}>
            {statsEyebrow && <p className={`fbm-eyebrow ${styles.statsEyebrow}`}>{statsEyebrow}</p>}
            <h2 className={styles.statsTitle}>{statsTitle}</h2>
          </div>
          <div className={styles.statsGrid}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statTile}>
                <p className={styles.statValue}>{s.value}</p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Showroom photo card ─── */}
      <section className={styles.showroom}>
        <div className={styles.showroomInner}>
          <div className={styles.showroomHeading}>
            {showroomEyebrow && <p className={`fbm-eyebrow ${styles.showroomEyebrow}`}>{showroomEyebrow}</p>}
            <h2 className={styles.showroomTitle}>{showroomTitle}</h2>
            {showroomLead && <p className={styles.showroomLead}>{showroomLead}</p>}
          </div>
          <figure className={styles.showroomCard}>
            {aboutPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={aboutPhoto} alt="" className={styles.showroomImage} />
            )}
            <span className={styles.showroomCorner} aria-hidden />
            {showroomCaption && (
              <figcaption className={styles.showroomCaption}>
                <span className={styles.showroomCaptionIcon} aria-hidden>
                  <MapPin size={16} strokeWidth={1.8} />
                </span>
                <span>{showroomCaption}</span>
              </figcaption>
            )}
          </figure>
        </div>
      </section>

      {/* ─── CTA tail ─── */}
      <section className={styles.ctaTail} aria-label="Next steps">
        <div className={styles.ctaTint} aria-hidden />
        <div className={styles.ctaInner}>
          {ctaEyebrow && <p className={`fbm-eyebrow ${styles.ctaEyebrow}`}>{ctaEyebrow}</p>}
          <h2 className={styles.ctaTitle}>{ctaTitle}</h2>
          {ctaLead && <p className={styles.ctaLead}>{ctaLead}</p>}
          <div className={styles.ctaActions}>
            <Link href="/used-cars" className="fbm-btn-primary">View current stock →</Link>
            <Link href="/contact" className="fbm-btn-ghost-dark">Get in touch</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default FbmAboutPage
