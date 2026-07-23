import { ShieldCheck, BadgePercent, FileText, Headphones } from 'lucide-react'
import styles from './ValuePropsBand.module.css'

const PROPS = [
  {
    Icon: ShieldCheck,
    title: 'Quality You Can Trust',
    text: 'Every vehicle is thoroughly inspected for your safety and peace of mind.',
  },
  {
    Icon: BadgePercent,
    title: 'Best Price Guarantee',
    text: 'We offer competitive pricing and the best value on every vehicle.',
  },
  {
    Icon: FileText,
    title: 'Flexible Financing',
    text: 'Multiple finance options available to fit your budget and needs.',
  },
  {
    Icon: Headphones,
    title: 'Expert Support',
    text: 'Our team is here to help you every step of the way.',
  },
]

export default function ValuePropsBand() {
  return (
    <section className={styles.band} aria-label="Why buy from us">
      <div className={styles.inner}>
        {PROPS.map(({ Icon, title, text }) => (
          <div key={title} className={styles.item}>
            <span className={styles.icon} aria-hidden>
              <Icon size={26} strokeWidth={1.8} />
            </span>
            <div className={styles.copy}>
              <h3 className={styles.itemTitle}>{title}</h3>
              <p className={styles.itemText}>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
