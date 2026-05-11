import styles from './SpecsBar.module.css'

type Spec = { value: string; label: string; sublabel?: string }

const DEFAULT_SPECS: Spec[] = [
  { value: '12+', label: 'Years on the forecourt', sublabel: 'Family-run' },
  { value: '40+', label: 'Vehicles in stock now', sublabel: 'Updated daily' },
  { value: 'UK', label: 'Mainland delivery', sublabel: 'Door to door' },
  { value: '4.9', label: 'Customer rating', sublabel: 'Google reviews' },
]

export default function SpecsBar({ specs = DEFAULT_SPECS }: { specs?: Spec[] }) {
  return (
    <section className={styles.section} aria-label="Forecourt stats">
      <div className={styles.inner}>
        {specs.map((spec, idx) => (
          <div
            key={spec.label}
            className={styles.card}
            data-aos="fade-up"
            data-aos-delay={String(idx * 90)}
          >
            <span className={styles.value}>{spec.value}</span>
            <span className={styles.label}>{spec.label}</span>
            {spec.sublabel ? <span className={styles.sublabel}>{spec.sublabel}</span> : null}
            <span className={styles.barTop} aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  )
}
