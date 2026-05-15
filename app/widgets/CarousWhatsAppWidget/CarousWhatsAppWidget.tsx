'use client'

import Script from 'next/script'
import type { BrandConfig } from '@/brands/types'

const WIDGETS_BASE_URL =
  process.env.NEXT_PUBLIC_WIDGETS_BASE_URL?.replace(/\/+$/, '') || 'https://widgets.carous.co.uk'
const WHATSAPP_WIDGET_SRC = `${WIDGETS_BASE_URL}/widgets/whatsapp-enquiry/latest/whatsapp-enquiry.js`

const DAY_INDEX: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
}

type WidgetDailyHours = { start: string; end: string }
type WidgetWeeklySchedule = Record<number, WidgetDailyHours | null>

const DEFAULT_UK_SCHEDULE: WidgetWeeklySchedule = {
  0: null,
  1: { start: '09:00', end: '18:00' },
  2: { start: '09:00', end: '18:00' },
  3: { start: '09:00', end: '18:00' },
  4: { start: '09:00', end: '18:00' },
  5: { start: '09:00', end: '18:00' },
  6: { start: '10:00', end: '16:00' },
}

function clean(value: unknown): string {
  return String(value || '').trim()
}

function normalizeWhatsAppNumber(value: unknown): string {
  const digits = clean(value).replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('44')) return digits
  return digits.replace(/^0/, '44')
}

function normalizeOwner(value: unknown): string {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeTime(value: string): string | null {
  const trimmed = value.trim().replace(/\./g, ':').toLowerCase()
  const colon = /^(\d{1,2}):(\d{2})$/.exec(trimmed)
  if (colon) {
    const hours = Number(colon[1])
    if (hours > 23) return null
    return `${colon[1].padStart(2, '0')}:${colon[2]}`
  }

  const meridiem = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i.exec(trimmed)
  if (meridiem) {
    let hours = Number(meridiem[1])
    const minutes = meridiem[2] || '00'
    const suffix = meridiem[3].toLowerCase()
    if (suffix === 'pm' && hours < 12) hours += 12
    if (suffix === 'am' && hours === 12) hours = 0
    return `${String(hours).padStart(2, '0')}:${minutes}`
  }

  const hourOnly = /^(\d{1,2})$/.exec(trimmed)
  if (hourOnly) {
    const hours = Number(hourOnly[1])
    if (hours > 23) return null
    return `${hourOnly[1].padStart(2, '0')}:00`
  }

  return null
}

function createEmptySchedule(): WidgetWeeklySchedule {
  return {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  }
}

function createDefaultUkSchedule(): WidgetWeeklySchedule {
  return { ...DEFAULT_UK_SCHEDULE }
}

function dayIndexFromToken(value: unknown): number | null {
  const raw = clean(value).toLowerCase()
  if (!raw) return null
  if (/^[0-6]$/.test(raw)) return Number(raw)
  return DAY_INDEX[raw] ?? null
}

function dayIndexesFromKey(value: unknown): number[] {
  const raw = clean(value).toLowerCase()
  if (!raw) return []

  const single = dayIndexFromToken(raw)
  if (single !== null) return [single]

  const range = raw.match(/^([a-z0-9]+)\s*(?:-|–|—|to)\s*([a-z0-9]+)$/)
  if (!range) return []

  const start = dayIndexFromToken(range[1])
  const end = dayIndexFromToken(range[2])
  if (start === null || end === null) return []

  const days: number[] = []
  for (let day = start; ; day = (day + 1) % 7) {
    days.push(day)
    if (day === end) break
  }
  return days
}

function setRange(schedule: WidgetWeeklySchedule, day: number | null, start: string | null, end: string | null): boolean {
  if (day === null || !start || !end) return false
  schedule[day] = { start, end }
  return true
}

function parseRange(value: unknown): WidgetDailyHours | null {
  if (value && typeof value === 'object') {
    const raw = value as Record<string, unknown>
    const start = normalizeTime(clean(raw.start || raw.from || raw.open || raw.opens))
    const end = normalizeTime(clean(raw.end || raw.to || raw.close || raw.closes))
    return start && end ? { start, end } : null
  }

  const range = clean(value)
  if (!range || /closed/i.test(range)) return null
  if (/24\s*(hours?|hrs?|\/7)|open\s*24/i.test(range)) return { start: '00:00', end: '23:59' }

  const parts = range.split(/\s*(?:-|–|—)\s*|\s+to\s+/i)
  if (parts.length < 2) return null

  const start = normalizeTime(parts[0])
  const end = normalizeTime(parts[1])
  return start && end ? { start, end } : null
}

function applyPeriod(schedule: WidgetWeeklySchedule, period: Record<string, unknown>): boolean {
  const day = dayIndexFromToken(period.day ?? period.weekday ?? period.dayOfWeek)
  const range = parseRange(period)
  return setRange(schedule, day, range?.start || null, range?.end || null)
}

function buildSupportHours(openingHours: unknown): string | undefined {
  if (!openingHours || typeof openingHours !== 'object') return JSON.stringify(createDefaultUkSchedule())

  const schedule = createEmptySchedule()
  let sawValidPeriod = false

  if (Array.isArray(openingHours)) {
    for (const period of openingHours) {
      if (!period || typeof period !== 'object') continue
      sawValidPeriod = applyPeriod(schedule, period as Record<string, unknown>) || sawValidPeriod
    }

    return JSON.stringify(sawValidPeriod ? schedule : createDefaultUkSchedule())
  }

  const source = openingHours as Record<string, unknown>

  if (Array.isArray(source.periods)) {
    for (const period of source.periods) {
      if (!period || typeof period !== 'object') continue
      sawValidPeriod = applyPeriod(schedule, period as Record<string, unknown>) || sawValidPeriod
    }
  }

  for (const [rawDay, rawRange] of Object.entries(source)) {
    if (rawDay === 'periods' || rawDay === 'timezone') continue

    const days = dayIndexesFromKey(rawDay)
    if (days.length === 0) continue

    const range = clean(rawRange)
    if (!range || /closed/i.test(range)) {
      days.forEach((day) => {
        schedule[day] = null
      })
      continue
    }

    const parsed = parseRange(rawRange)
    if (parsed) {
      days.forEach((day) => {
        schedule[day] = parsed
      })
      sawValidPeriod = true
    }
  }

  return JSON.stringify(sawValidPeriod ? schedule : createDefaultUkSchedule())
}

function resolveOpeningHours(brand: BrandConfig): unknown {
  return (brand as any)?.openingHours || (brand as any)?.location?.openingHours
}

function resolveSupportTimezone(openingHours: unknown): string {
  if (openingHours && typeof openingHours === 'object') {
    const timezone = clean((openingHours as Record<string, unknown>).timezone)
    if (timezone) return timezone
  }
  return 'Europe/London'
}

function resolvePhoneDisplay(brand: BrandConfig): string {
  return clean((brand as any)?.location?.phone)
}

function resolveWhatsAppNumber(brand: BrandConfig): string {
  const location = (brand as any)?.location || {}
  return normalizeWhatsAppNumber(
    location.whatsappNumber ||
      location.whatsappHref ||
      location.whatsapp ||
      location.phoneE164 ||
      location.phoneHref ||
      location.phone,
  )
}

export default function CarousWhatsAppWidget({ brand }: { brand: BrandConfig }) {
  const dealerName = brand?.name || 'this dealership'
  const phoneNumber = resolvePhoneDisplay(brand)
  const whatsappNumber = resolveWhatsAppNumber(brand)

  if (!whatsappNumber) return null

  const leadOwner = normalizeOwner(brand.slug || brand.name || 'brandstudio-dealer')
  const openingHours = resolveOpeningHours(brand)
  const supportHours = buildSupportHours(openingHours)
  const supportTimezone = resolveSupportTimezone(openingHours)

  return (
    <Script
      id="carous-whatsapp-enquiry-widget"
      src={WHATSAPP_WIDGET_SRC}
      strategy="afterInteractive"
      data-dealer-name={dealerName}
      data-phone-number={phoneNumber}
      data-whatsapp-number={whatsappNumber}
      data-lead-submit-url="/api/whatsapp-leads"
      data-lead-owner={leadOwner}
      data-support-timezone={supportTimezone}
      data-support-hours={supportHours}
      data-launcher-label="WhatsApp enquiry"
      data-panel-title="WhatsApp enquiry"
      data-panel-description="Send a quick message and the team will reply with availability, finance, or part exchange details."
      data-placement="bottom-right"
    />
  )
}
