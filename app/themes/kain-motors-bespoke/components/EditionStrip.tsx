import styles from './EditionStrip.module.css'

export default function EditionStrip() {
  const year = new Date().getFullYear()
  return (
    <div className={styles.strip} role="presentation" aria-hidden="true">
      <div className={styles.inner}>
        <span className={styles.left}>Volume 03 · Manchester Edition</span>
        <span className={styles.mid}>The Kain Motors Curation</span>
        <span className={styles.right}>{year} · M12 6LB</span>
      </div>
    </div>
  )
}
