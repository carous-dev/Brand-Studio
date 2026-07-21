import Link from 'next/link'
import styles from './PopularMakes.module.css'

const FALLBACK = [
  'Abarth', 'Alfa Romeo', 'Audi', 'BMW', 'Citroën', 'Dacia', 'Fiat', 'Ford',
  'Honda', 'Hyundai', 'Jaguar', 'Kia', 'Land Rover', 'Lexus', 'Mazda',
  'Mercedes-Benz', 'MINI', 'Nissan', 'Peugeot', 'Renault', 'SEAT', 'Skoda',
  'Suzuki', 'Toyota', 'Vauxhall', 'Volkswagen', 'Volvo',
]

export default function PopularMakes({ makes }: { makes?: string[] }) {
  const showMakes = (makes && makes.length > 0) ? makes : FALLBACK

  return (
    <section className={styles.section} aria-label="Popular makes" data-aos="fade-up">
      <div className={styles.inner}>
        <h2 className={styles.heading}>Popular Makes</h2>
        <ul className={styles.list}>
          {showMakes.map((make) => (
            <li key={make}>
              <Link className={styles.link} href={`/used-cars?make=${encodeURIComponent(make)}`}>
                {make}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
