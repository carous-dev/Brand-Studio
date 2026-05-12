'use client'

import { useBrand } from '../context/BrandClientWrapper'
import { getBrandText } from '../lib/brand-text'
import styles from './PullQuote.module.css'

type Props = {
  quote?: string
  attribution?: string
}

export default function PullQuote({
  quote = '“We don’t sell from a script. The car is either right for you, or it isn’t — and we tell you which.”',
  attribution,
}: Props) {
  const brand = useBrand()
  const text = getBrandText(brand)
  const finalAttribution = attribution ?? text.founderAttribution
  return (
    <section className={styles.section} aria-label="Pull quote">
      <div className={styles.inner} data-aos="fade-up">
        <span className="kain-gold-rule kain-gold-rule--center" aria-hidden="true" />
        <p className={styles.quote}>{quote}</p>
        <p className={styles.attribution}>{finalAttribution}</p>
        <span className="kain-gold-rule kain-gold-rule--center" aria-hidden="true" />
      </div>
    </section>
  )
}
