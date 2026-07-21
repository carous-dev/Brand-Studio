'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './WelcomeBlock.module.css'

export default function WelcomeBlock() {
  const brand = useBrand()
  const name = (brand?.name || 'this dealership').trim()
  const city = (brand as any)?.location?.address?.city
    || (brand as any)?.location?.city
    || ''
  const cityLine = (typeof city === 'string' && city.trim()) ? city.trim() : 'the UK'

  return (
    <section className={styles.section} aria-label={`Welcome to ${name}`} data-aos="fade-up">
      <div className={styles.grid}>
        <div className={styles.imageWrap} aria-hidden>
          <div className={styles.image} />
        </div>
        <div className={styles.body}>
          <h2 className={styles.title}>Welcome to {name}</h2>
          <p>
            {name} is a professional used-car dealership in {cityLine} that has built a reputation
            for providing customers with excellent quality vehicles and outstanding service.
            With years of industry experience, our team goes the extra mile to make sure every
            customer leaves happy.
          </p>
          <h3 className={styles.subhead}>Top quality used cars for sale</h3>
          <p>
            Every car we sell has been carefully hand-selected by our expert team, who take pride
            in sourcing and preparing quality vehicles to suit any budget. We stock a range of
            vehicles, from first-time buyers and family cars to performance and premium models.
          </p>
          <Link href="/about" className={styles.readMore}>
            <span className={styles.dot} aria-hidden />
            Read more
          </Link>
        </div>
      </div>
    </section>
  )
}
