import styles from './TrustBand.module.css'

const ITEMS = [
  { label: 'Hand-picked stock', detail: 'Every car driven, photographed and HPI-checked before listing.' },
  { label: 'Finance from 9.9% APR', detail: 'PCP / HP via FCA-regulated lenders. Soft-search, no impact.' },
  { label: 'Independent warranty', detail: '3 / 6 / 12-month options. Service plans available.' },
  { label: 'Nationwide delivery', detail: 'Doorstep handover anywhere in the UK. Test-drive included.' },
]

export default function TrustBand() {
  return (
    <section className={styles.band} aria-label="Why buy from Kain Motors">
      <div className={styles.inner}>
        {ITEMS.map((item, idx) => (
          <div key={item.label} className={styles.cell} data-aos="fade-up" data-aos-delay={String(idx * 80)}>
            <span className={styles.num}>0{idx + 1}</span>
            <h3 className={styles.label}>{item.label}</h3>
            <p className={styles.detail}>{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
