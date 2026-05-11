import { Search } from 'lucide-react'
import styles from './SearchStrip.module.css'

const MAKES = ['Audi', 'BMW', 'Ford', 'Mercedes-Benz', 'Nissan', 'Vauxhall', 'Volkswagen']
const BODY_TYPES = ['Hatchback', 'Saloon', 'Estate', 'SUV', 'Coupe', 'Convertible']
const PRICE_MAX = ['£5,000', '£10,000', '£15,000', '£20,000', '£30,000', '£50,000+']

export default function SearchStrip() {
  return (
    <section className={styles.strip} aria-label="Search the stock" data-aos="fade-up">
      <div className={styles.inner}>
        <form className={styles.form} action="/used-cars" method="get" role="search">
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Make</span>
            <select name="make" defaultValue="" className={styles.select}>
              <option value="">Any make</option>
              {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Body</span>
            <select name="body" defaultValue="" className={styles.select}>
              <option value="">Any body type</option>
              {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Max price</span>
            <select name="max_price" defaultValue="" className={styles.select}>
              <option value="">Any price</option>
              {PRICE_MAX.map((p) => {
                const num = p.replace(/[^0-9]/g, '')
                return <option key={p} value={num}>Up to {p}</option>
              })}
            </select>
          </label>

          <button type="submit" className={styles.submit}>
            <Search size={18} aria-hidden="true" />
            Search stock
          </button>
        </form>
      </div>
    </section>
  )
}
