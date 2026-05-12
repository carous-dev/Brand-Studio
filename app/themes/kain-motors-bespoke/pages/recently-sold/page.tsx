import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import AcquisitionsRow from '../../components/AcquisitionsRow'
import styles from './page.module.css'

function fmtPrice(value: any) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `£${n.toLocaleString('en-GB')}`
}

export function KainRecentlySoldPage({ initialInventory, brand }: ThemePageProps) {
  const items = Array.isArray(initialInventory) ? initialInventory : []
  const brandName = brand?.name || 'the showroom'

  return (
    <>
      <PageHero
        variant="recently-sold"
        eyebrow="The archive"
        title="Recently sold — the cars that found new homes."
        lead="Every car we send out is a referral seed. Here are the ones that have left the forecourt — proof that the right car finds the right driver."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Recently sold' }]}
        actions={
          <Link href="/used-cars" className="kain-btn kain-btn--gold">View current stock</Link>
        }
      />

      <section className={`kain-section ${styles.archiveSection}`} aria-labelledby="recently-sold-heading">
        <div className={styles.archiveInner} data-aos="fade-up">
          <header className={styles.head}>
            <p className="kain-eyebrow">{items.length || 'A few'} cars sold</p>
            <h2 id="recently-sold-heading" className={styles.title}>The dispatched ledger</h2>
            <p className={styles.lead}>
              We mark cars as sold the moment they’re collected. Bookmark this page if you’re tracking
              market activity — or contact {brandName} if you spotted something just before it went.
            </p>
          </header>

          {items.length === 0 && (
            <div className={styles.empty}>
              <h3>Nothing in the archive yet</h3>
              <p>Once cars start moving off the forecourt, they’ll be remembered here.</p>
              <Link href="/used-cars" className="kain-btn kain-btn--primary">Browse current stock</Link>
            </div>
          )}

          {items.length > 0 && (
            <ol className={styles.archiveGrid}>
              {items.map((v: any, idx: number) => {
                const titleParts = [v.year, v.make, v.model].filter(Boolean)
                const title = titleParts.join(' ') || 'Vehicle'
                const img = (v.images && v.images[0]) || v.image || ''
                return (
                  <li key={v.slug || v.id || idx} className={styles.archiveCard} data-aos="fade-up" data-aos-delay={String(60 + idx * 30)}>
                    <div className={styles.archiveMedia}>
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={title} loading="lazy" />
                      ) : (
                        <div className={styles.archivePlaceholder} aria-hidden="true" />
                      )}
                      <span className={styles.soldStamp} aria-hidden="true">SOLD</span>
                    </div>
                    <div className={styles.archiveBody}>
                      <span className={styles.archiveNumber}>№ {String(idx + 1).padStart(3, '0')}</span>
                      <p className={styles.archiveTitle}>{title}</p>
                      <p className={styles.archivePrice}>
                        <span className={styles.archivePriceWas}>{fmtPrice(v.price)}</span>
                        <span className={styles.archivePriceLabel}>Sold price</span>
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </section>

      <AcquisitionsRow
        title="What’s in stock now"
        eyebrow="Live forecourt"
        description="Latest arrivals you can still see, drive and reserve."
        endpoint="inventory-latest"
        cta={{ label: 'Browse all stock', href: '/used-cars' }}
      />
    </>
  )
}

export default KainRecentlySoldPage
