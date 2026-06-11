'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import styles from './page.module.css'

export type FaqItem = { q: string; a: string }

export default function FaqAccordionClient({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className={styles.faqList} role="list">
      {faqs.map((f, i) => {
        const isOpen = open === i
        return (
          <div key={f.q} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`} role="listitem">
            <button
              type="button"
              className={styles.faqTrigger}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className={styles.faqQuestion}>{f.q}</span>
              <span className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`} aria-hidden>
                <ChevronDown size={18} strokeWidth={2} />
              </span>
            </button>
            {isOpen && <p className={styles.faqAnswer}>{f.a}</p>}
          </div>
        )
      })}
    </div>
  )
}
