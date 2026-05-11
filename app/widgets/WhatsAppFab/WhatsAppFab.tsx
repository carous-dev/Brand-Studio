'use client'

import { useEffect, useMemo, useState } from 'react'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import type { WorkingPeriod } from '@/app/lib/working-status'
import styles from './WhatsAppFab.module.css'

/**
 * Brandstudio global widget — floating WhatsApp call-to-action.
 * =============================================================================
 *
 * Replaces per-theme WhatsAppEnquiry / SupportWidget components so every theme
 * gets the same baseline: bottom-right floating action button + online/offline
 * status pip derived from `brand.openingHours`. Theme-agnostic; the green
 * WhatsApp bubble is universal (NOT brand-token-tinted) so buyers recognize
 * the chat affordance instantly.
 *
 * Usage in a theme's Shell:
 *   import { WhatsAppFab } from '@/app/widgets/WhatsAppFab'
 *   <WhatsAppFab brand={brand} />
 */

type WhatsAppFabProps = {
  /** Brand record from `useBrand()` — used for phone, name, opening hours. */
  brand: any
  /** Optional pre-resolved whatsapp URL (e.g. from `getBrandContactInfo`). */
  whatsappUrl?: string
  /** Custom seed message; defaults to a polite enquiry. */
  message?: string
  /** Position override. Default: bottom-right. */
  side?: 'right' | 'left'
}

const DAY_TOKENS: Record<string, WorkingPeriod['day']> = {
  monday: 'mon', tuesday: 'tue', wednesday: 'wed', thursday: 'thu',
  friday: 'fri', saturday: 'sat', sunday: 'sun',
}

function normalizeTime(value: string): string | null {
  const trimmed = value.trim()
  const colon = /^(\d{1,2}):(\d{2})$/.exec(trimmed)
  if (colon) return `${colon[1].padStart(2, '0')}:${colon[2]}`
  const hourOnly = /^(\d{1,2})$/.exec(trimmed)
  if (hourOnly) return `${hourOnly[1].padStart(2, '0')}:00`
  return null
}

function parseOpeningHours(hours: unknown): WorkingPeriod[] {
  const fallback: WorkingPeriod[] = (['mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map(
    (day) => ({ day, from: '09:00', to: '18:00' }),
  )
  if (!hours || typeof hours !== 'object') return fallback
  const out: WorkingPeriod[] = []
  for (const [rawDay, rawRange] of Object.entries(hours as Record<string, unknown>)) {
    const day = DAY_TOKENS[rawDay.toLowerCase()]
    if (!day) continue
    const range = String(rawRange ?? '').trim()
    if (!range || /closed/i.test(range)) continue
    const parts = range.split(/\s*[-–—]\s*|\s+to\s+/i)
    if (parts.length !== 2) continue
    const from = normalizeTime(parts[0])
    const to = normalizeTime(parts[1])
    if (!from || !to) continue
    out.push({ day, from, to })
  }
  return out.length ? out : fallback
}

function digitsOnly(value: string): string {
  return String(value || '').replace(/\D/g, '')
}

function resolveWhatsAppUrl(brand: any, override?: string): string {
  if (override) return override
  const raw = brand?.location?.phone || ''
  const digits = digitsOnly(raw)
  if (!digits) return ''
  // Strip leading 0, prefix UK country code.
  const intl = digits.startsWith('44') ? digits : digits.replace(/^0/, '44')
  return `https://wa.me/${intl}`
}

export default function WhatsAppFab({
  brand,
  whatsappUrl,
  message,
  side = 'right',
}: WhatsAppFabProps) {
  const [mounted, setMounted] = useState(false)
  const baseHref = resolveWhatsAppUrl(brand, whatsappUrl)

  const periods = useMemo(() => parseOpeningHours(brand?.openingHours), [brand?.openingHours])
  const { isOnline } = useWorkingHours({ periods, timezone: 'Europe/London' })

  useEffect(() => { setMounted(true) }, [])
  if (!mounted || !baseHref) return null

  const seed = message
    || `Hi ${brand?.name || 'team'}, I have a question about a vehicle on your site.`
  const href = `${baseHref}?text=${encodeURIComponent(seed)}`
  const statusLabel = isOnline
    ? 'Online — we typically reply within minutes'
    : 'Offline — leave a message and we will be in touch'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${brand?.name || 'us'} on WhatsApp. ${statusLabel}`}
      title={statusLabel}
      className={`${styles.fab} ${side === 'left' ? styles.fabLeft : ''} ${isOnline ? styles.isOnline : styles.isOffline}`}
      data-widget="whatsapp-fab"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0c3.18 0 6.167 1.24 8.413 3.488a11.82 11.82 0 0 1 3.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.687-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
      </svg>
      <span className={styles.statusDot} aria-hidden="true" />
      <span className={styles.srOnly}>{`Chat on WhatsApp — ${statusLabel}`}</span>
    </a>
  )
}
