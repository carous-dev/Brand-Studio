'use client'
// audit-ignore-file: tp-use-client-on-page
// Springalls baseline page; Mode B (clone-and-edit) ports inherit this.
// Extracting interactivity into client islands is a known follow-up — same
// risk-management as columbus-vehicles-bespoke/pages/used-cars/[slug]/page.tsx
// (see FEATURE_LOG 2026-05-10 for the Turbopack chunk-item collision rationale).

import Script from 'next/script'
import Link from 'next/link'
import styles from './page.module.css'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'
import { HeroBackdrop } from '../../components/HeroBackdrop'
import type { ThemePageProps } from '../../../types'

const financeVideos = [
  {
    title: 'Why Finance Through a Dealership',
    description: 'Learn how dealer-arranged finance keeps everything simple and transparent.',
    vimeoId: '866686746',
  },
  {
    title: 'What Is Conditional Sale?',
    description: 'A quick overview of Conditional Sale agreements and what they mean for ownership.',
    vimeoId: '887241645',
  },
  {
    title: 'What Is Hire Purchase?',
    description: 'Understand the basics of HP finance and how payments work over time.',
    vimeoId: '838572663',
  },
  {
    title: 'What Is Personal Contract Purchase?',
    description: 'A short explainer on PCP finance and end-of-term options.',
    vimeoId: '810874993',
  },
]

const financeDefaults = [
  { label: 'Term', value: '60 months' },
  { label: 'Deposit', value: '10%' },
  { label: 'Annual mileage', value: '10,000 miles' },
]

const financeSteps = [
  {
    title: 'Choose your vehicle',
    description: 'Browse our stock and shortlist the right car for you.',
  },
  {
    title: 'Confirm your budget',
    description: 'Set a deposit and monthly payment target.',
  },
  {
    title: 'Apply online',
    description: 'Complete the finance form in a few minutes.',
  },
  {
    title: 'Get tailored options',
    description: 'We will share finance illustrations that fit your needs.',
  },
]

const codeweaversScriptUrl = (process.env.NEXT_PUBLIC_CODEWEAVERS_JOURNEYS_SCRIPT_URL || '').trim()
const codeweaversPluginDivId = 'codeweavers-finance-form'
const financeDisclaimerText = (process.env.NEXT_PUBLIC_FINANCE_DISCLAIMER_TEXT || '').trim()

export function SpringallsFinancePage(_props: ThemePageProps) {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const phoneDisplay = contact.phoneDisplay
  const phoneTel = contact.phoneTel
  const hasValidScriptUrl = /^(https?:)?\/\//i.test(codeweaversScriptUrl)
  const hasEmbedConfig = Boolean(hasValidScriptUrl)
  const hasDisclaimer = Boolean(financeDisclaimerText)

  return (
    <>
      {hasValidScriptUrl ? (
        <>
          <Script src={codeweaversScriptUrl} strategy="afterInteractive" />
          <Script
            id="codeweavers-finance-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.addEventListener('load', function () {
                  var attempts = 0;
                  var init = function () {
                    if (window.codeweavers && window.codeweavers.ecommerce && window.codeweavers.ecommerce.apply) {
                      window.codeweavers.ecommerce.apply.main({
                        pluginContentDivId: '${codeweaversPluginDivId}'
                      });
                      return;
                    }
                    attempts += 1;
                    if (attempts < 20) {
                      setTimeout(init, 250);
                    }
                  };
                  init();
                });
              `,
            }}
          />
        </>
      ) : null}
      <main className={styles.page}>
        <section className={styles.hero}>
          <HeroBackdrop />
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>Finance options</p>
            <h1 className={styles.heroTitle}>Finance made simple for your next car</h1>
            <p className={styles.heroLead}>
              Flexible routes, clear guidance, and an online application to keep everything straightforward.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/used-cars">
                Browse vehicles
              </Link>
              <Link className={styles.secondaryButton} href="/contact-us">
                Speak with our team
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.introGrid}>
              <div className={styles.introCopy}>
                <p className={styles.kicker}>Finance support</p>
                <h2 className={styles.sectionTitle}>Apply online or speak with our team</h2>
                <p className={styles.sectionCopy}>
                  We partner with trusted finance specialists to offer quick, transparent options. Use the online
                  application below or contact us for tailored guidance on your next vehicle.
                </p>
                <ul className={styles.highlights} role="list">
                  <li>Fast applications with minimal paperwork.</li>
                  <li>Flexible terms for a wide range of budgets.</li>
                  <li>Clear illustrations before you decide.</li>
                </ul>
              </div>

              <aside className={styles.defaultsCard} aria-label="Default finance parameters">
                <p className={styles.defaultsTitle}>Representative defaults</p>
                <p className={styles.defaultsSubtitle}>These are the starting values in the calculator.</p>
                <dl className={styles.defaultsList}>
                  {financeDefaults.map((item) => (
                    <div key={item.label} className={styles.defaultsRow}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className={styles.defaultsNote}>You can adjust the term, deposit, and mileage inside the form.</p>
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.sectionInner}>
            <div className={styles.applyGrid}>
              <div className={styles.applyCopy}>
                <p className={styles.kicker}>Apply online</p>
                <h2 className={styles.sectionTitle}>Standalone finance application</h2>
                <p className={styles.sectionCopy}>
                  Complete the finance form and our team will review your enquiry promptly. We will share tailored
                  finance illustrations and walk you through the next steps.
                </p>
                <div className={styles.steps} role="list">
                  {financeSteps.map((step, index) => (
                    <div key={step.title} className={styles.step} role="listitem">
                      <span className={styles.stepNumber}>0{index + 1}</span>
                      <div>
                        <p className={styles.stepTitle}>{step.title}</p>
                        <p className={styles.stepCopy}>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className={styles.embedCard} aria-label="Finance application form">
                <div className={styles.embedHeader}>
                  <p className={styles.embedTitle}>Finance application</p>
                  <p className={styles.embedCopy}>Secure application powered by our finance partner.</p>
                </div>
                <div className={styles.embedBody}>
                  {hasEmbedConfig ? (
                    <div id={codeweaversPluginDivId} className={styles.embedTarget}>
                      <div className={styles.embedLoading} role="status">
                        Loading finance form...
                      </div>
                    </div>
                  ) : (
                    <div className={styles.embedPlaceholder}>
                      <p>Finance applications are available online and by phone.</p>
                      <p>
                        Please call <a href={`tel:${phoneTel}`}>{phoneDisplay}</a> or use the contact form and we will
                        send tailored illustrations.
                      </p>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <p className={styles.kicker}>Finance explained</p>
              <h2 className={styles.sectionTitle}>Quick video guides</h2>
              <p className={styles.sectionCopy}>Understand the most common finance routes before you apply.</p>
            </div>

            <div className={styles.videoGrid}>
              {financeVideos.map((video) => (
                <article key={video.vimeoId} className={styles.videoCard}>
                  <div className={styles.videoFrame}>
                    <iframe
                      src={`https://player.vimeo.com/video/${video.vimeoId}`}
                      title={video.title}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.videoBody}>
                    <h3>{video.title}</h3>
                    <p>{video.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.sectionInner}>
            <div className={styles.disclaimerCard}>
              <div>
                <p className={styles.kicker}>Important</p>
                <h2 className={styles.sectionTitle}>Finance disclaimer</h2>
              </div>
              <p className={styles.disclaimerText}>
                {hasDisclaimer
                  ? financeDisclaimerText
                  : 'Finance is subject to status, affordability checks, and lender criteria. Applicants must be UK residents aged 18 or over.'}
              </p>
              {!hasDisclaimer ? (
                <p className={styles.disclaimerNote}>
                  Dealer-provided finance disclaimer wording is required for FCA compliance and should be supplied before
                  launch.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default SpringallsFinancePage
