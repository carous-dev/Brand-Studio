import Link from 'next/link'
import { ArrowRight, Wrench, Handshake, ShieldCheck } from 'lucide-react'
import styles from './WhyUsStrip.module.css'

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Quality assured',
    body: 'Every car undergoes a full specialist health check before it hits the forecourt.',
  },
  {
    icon: Handshake,
    title: 'Family-run',
    body: 'Personal service from a small Chesterfield team that&rsquo;s been doing this for years.',
  },
  {
    icon: Wrench,
    title: 'Backed for the long haul',
    body: '3-month warranty as standard, plus part exchange and finance under one roof.',
  },
]

export default function WhyUsStrip() {
  return (
    <section className={styles.section} aria-labelledby="why-us-heading">
      <div className={styles.bgImage} style={{ backgroundImage: 'var(--brand-image-about)' }} aria-hidden="true" />
      <div className={styles.bgOverlay} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-right">
          <p className={styles.eyebrow}>Why Chesterfield Motor Empire</p>
          <h2 id="why-us-heading" className={styles.heading}>
            A family-owned dealership built on three things.
          </h2>
          <p className={styles.body}>
            We&rsquo;re a small team in Shuttlewood. We sell cars we&rsquo;d be happy to drive ourselves —
            checked, prepared, and backed.
          </p>
          <Link href="/about" className={styles.cta}>
            About us
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </header>

        <ul className={styles.pillars}>
          {PILLARS.map((p, i) => {
            const Icon = p.icon
            return (
              <li
                key={p.title}
                className={styles.pillar}
                data-aos="fade-left"
                data-aos-delay={String(i * 80)}
              >
                <span className={styles.pillarIcon} aria-hidden="true">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <div>
                  <h3 className={styles.pillarTitle}>{p.title}</h3>
                  <p
                    className={styles.pillarBody}
                    dangerouslySetInnerHTML={{ __html: p.body }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
