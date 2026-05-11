import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const SECTIONS = [
  {
    heading: '1. Who we are',
    body: [
      'Showroom Shine Cars (the “dealership”, “we”, “us”) operates from No 1 Oak Cottage, Coventry, CV5 9DA, West Midlands, United Kingdom.',
      'This policy explains how we collect, use, store and share your personal data when you interact with us — whether on our website, by phone, by email, or in person.',
    ],
  },
  {
    heading: '2. What we collect',
    body: [
      'Contact details (name, email, phone) when you enquire about a vehicle, request a valuation, or apply for finance.',
      'Vehicle details (registration, mileage) when you request a part-exchange or trade-in valuation.',
      'Site analytics (pages viewed, referrer) when you accept analytics cookies — see our cookie policy.',
    ],
  },
  {
    heading: '3. How we use it',
    body: [
      'To respond to enquiries and arrange viewings, test drives, finance applications, and after-sales support.',
      'To match you with FCA-regulated finance lenders when you request a finance quote.',
      'To improve our site and services, in aggregate and with your consent for analytics.',
    ],
  },
  {
    heading: '4. Who we share it with',
    body: [
      'FCA-regulated UK finance lenders, when you request a finance quote.',
      'HPI / vehicle data providers for stock checks.',
      'Third-party service providers (email, hosting, analytics) operating under data-processing agreements.',
      'We never sell your data.',
    ],
  },
  {
    heading: '5. How long we keep it',
    body: [
      'Active enquiries: 12 months. Finance applications: 6 years (regulatory requirement). Analytics: 26 months. After that we delete or anonymise the data.',
    ],
  },
  {
    heading: '6. Your rights',
    body: [
      'Under UK GDPR you can request access, correction, deletion, restriction or portability of your data, and withdraw consent at any time. Email us at info@showroomshinecars.co.uk to exercise any of these rights — we respond within 30 days.',
    ],
  },
  {
    heading: '7. Complaints',
    body: [
      'If you&apos;re unhappy with how we handle your data, please tell us first so we can put it right. You can also complain to the UK Information Commissioner&apos;s Office (ICO) at ico.org.uk.',
    ],
  },
]

export function ShowroomPrivacyPolicyPage(_: ThemePageProps) {
  return (
    <article>
      <section className="shr-page-hero shr-page-hero--legal">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Privacy Policy</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            How we handle your data.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Plain-English summary of what we collect, how we use it, and your rights under UK GDPR.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.legalBody}`}>
        <div className="shr-container">
          <div className={styles.layout}>
            <nav className={styles.toc} aria-label="On this page">
              <span className="shr-eyebrow">On this page</span>
              <ul>
                {SECTIONS.map((s, i) => (
                  <li key={i}><a href={`#section-${i}`}>{s.heading}</a></li>
                ))}
              </ul>
            </nav>

            <div className={styles.content}>
              {SECTIONS.map((s, i) => (
                <section key={i} id={`section-${i}`} className={styles.legalSection}>
                  <h2>{s.heading}</h2>
                  {s.body.map((p, j) => <p key={j}>{p}</p>)}
                </section>
              ))}
              <p className={styles.contact}>
                Questions? Email{' '}
                <a href="mailto:info@showroomshinecars.co.uk">info@showroomshinecars.co.uk</a>
                {' '}or see our <Link href="/cookie-policy">cookie policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}

export default ShowroomPrivacyPolicyPage
