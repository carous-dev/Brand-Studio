import styles from './SectionHeading.module.css'

export type SectionHeadingProps = {
  eyebrow?: string
  title: string
  lead?: string
  dark?: boolean
}

export function SectionHeading({ eyebrow, title, lead, dark = false }: SectionHeadingProps) {
  return (
    <div className={styles.wrap}>
      {eyebrow && (
        <p className={`${styles.eyebrow} ${dark ? styles.eyebrowDark : ''}`}>{eyebrow}</p>
      )}
      <h2 className={styles.title}>{title}</h2>
      {lead && (
        <p className={`${styles.lead} ${dark ? styles.leadDark : ''}`}>{lead}</p>
      )}
    </div>
  )
}

export default SectionHeading
