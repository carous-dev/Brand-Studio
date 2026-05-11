'use client'

import { useEffect, useMemo, useState } from 'react'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import type { WorkingPeriod } from '@/app/lib/working-status'
import { WhatsAppIcon } from './WhatsAppIcon'
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
      <WhatsAppIcon size={26} />
      <span className={styles.statusDot} aria-hidden="true" />
      <span className={styles.srOnly}>{`Chat on WhatsApp — ${statusLabel}`}</span>
    </a>
  )
}
