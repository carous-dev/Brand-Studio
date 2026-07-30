import type { ThemePageProps } from '../../../types'
import PageRibbon from '../../components/PageRibbon'
import HowItWorks from '../../components/HowItWorks'
import ContactForm from '../../components/ContactForm'
import { resolveText } from '../../lib/brand-text'
import styles from './finance.module.css'

/**
 * Finance — Server Component (design-language §7): page-ribbon (`surface`) →
 * finance intro + 3 numbered ledger-steps (`bg`, via HowItWorks) → assurance
 * strip: representative-example card + disclaimer captions (`surface`) →
 * enquiry form card (`bg`, ContactForm) → footer chain. The ledger-steps are
 * the route's sole numbered-ledger motif (do-not §5). Every string routes
 * through `resolveText`; `brand` is plain JSON, so it passes safely into the
 * client ContactForm.
 */
export function RedgateFinancePage({ brand }: ThemePageProps) {
  const repEyebrow = resolveText(brand, 'finance.rep_eyebrow')
  const repTitle = resolveText(brand, 'finance.rep_title')
  const repBody = resolveText(brand, 'finance.rep_body')
  const disclaimer = resolveText(brand, 'finance.disclaimer')

  return (
    <>
      <PageRibbon
        brand={brand}
        eyebrowKey="ribbon.eyebrow"
        titleKey="ribbon.finance_title"
        leadKey="ribbon.finance_lead"
      />

      <HowItWorks
        brand={brand}
        eyebrowKey="finance.eyebrow"
        titleKey="finance.intro_title"
        introKey="finance.intro_lead"
        stepKeyPrefix="finance.step"
        stepsTitleSrKey="finance.title_sr"
        background="bg"
      />

      {repTitle || disclaimer ? (
        <section className={styles.assurance} aria-labelledby="finance-rep-title" data-aos="fade-up">
          <div className={styles.inner}>
            {repTitle ? (
              <div className={styles.repCard}>
                {repEyebrow ? <p className={styles.repEyebrow}>{repEyebrow}</p> : null}
                <h2 id="finance-rep-title" className={styles.repTitle}>
                  {repTitle}
                </h2>
                {repBody ? <p className={styles.repBody}>{repBody}</p> : null}
              </div>
            ) : null}
            {disclaimer ? <p className={styles.disclaimer}>{disclaimer}</p> : null}
          </div>
        </section>
      ) : null}

      <section className={styles.formBand} aria-label={resolveText(brand, 'enquiry.contact_title')}>
        <div className={styles.formInner}>
          <ContactForm brand={brand} />
        </div>
      </section>
    </>
  )
}

export default RedgateFinancePage
