'use client'

import { Clock, ChevronsRight, Phone } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import type { WorkingPeriod } from '@/app/lib/working-status'
import styles from './TopBar.module.css'

const FALLBACK_PERIODS: WorkingPeriod[] = [
  { day: 'mon', from: '09:00', to: '17:00' },
  { day: 'tue', from: '09:00', to: '17:00' },
  { day: 'wed', from: '09:00', to: '17:00' },
  { day: 'thu', from: '09:00', to: '17:00' },
  { day: 'fri', from: '09:00', to: '17:00' },
  { day: 'sat', from: '08:30', to: '17:00' },
]

export default function TopBar() {
  const brand = useBrand()
  const phone = String((brand as any)?.location?.phone || '').trim()
  const phoneTel = phone.replace(/[^\d+]/g, '')

  const workingConfig = useMemo(() => {
    const raw = (brand as any)?.openingHours
    const periods: WorkingPeriod[] = Array.isArray(raw?.periods) && raw.periods.length > 0
      ? raw.periods
      : FALLBACK_PERIODS
    return { periods, timezone: raw?.timezone || 'Europe/London' }
  }, [brand])
  const { isOnline } = useWorkingHours(workingConfig)

  return (
    <div className={styles.topbar} aria-label="Site utility bar">
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/compare" className={styles.utilLink}>
            <ChevronsRight size={13} strokeWidth={2.6} aria-hidden />
            <span>Compare Vehicles</span>
          </Link>
        </div>
        <div className={styles.right}>
          <span className={styles.utilStatic}>
            <Clock size={13} strokeWidth={2.4} aria-hidden />
            <span>{isOnline ? 'Open now' : 'Opening Hours'}</span>
          </span>
          {phone ? (
            <a href={`tel:${phoneTel}`} className={styles.utilLink}>
              <Phone size={13} strokeWidth={2.4} aria-hidden />
              <span>Get in Touch</span>
            </a>
          ) : (
            <Link href="/contact" className={styles.utilLink}>
              <Phone size={13} strokeWidth={2.4} aria-hidden />
              <span>Get in Touch</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
