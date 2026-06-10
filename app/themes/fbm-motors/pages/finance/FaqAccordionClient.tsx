'use client'

import Link from 'next/link'
import { useState } from 'react'
import styles from './page.module.css'

export type FaqItem = { q: string; a: string }

export default function FaqAccordionClient({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className={styles.faqSection}>
      <h2 className={styles.faqFooterTitle} style={{ textAlign: 'center', marginBottom: '32px' }}>
        Frequently Asked Questions
      </h2>
      <div className={styles.faqList}>
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqTrigger}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className={styles.faqQuestion}>{f.q}</span>
                <span className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`} aria-hidden>+</span>
              </button>
              {isOpen && <p className={styles.faqAnswer}>{f.a}</p>}
            </div>
          )
        })}
      </div>

      <div className={styles.faqFooter}>
        <h3 className={styles.faqFooterTitle}>Still have a question?</h3>
        <p className={styles.faqFooterBody}>Our team typically replies within the hour during opening times.</p>
        <Link href="/contact" className={`fbm-btn-primary ${styles.faqFooterCta}`}>Contact us →</Link>
      </div>
    </section>
  )
}
