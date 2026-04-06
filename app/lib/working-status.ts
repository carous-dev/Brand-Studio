export type WorkingPeriod = {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  from: string // "HH:mm" 24h
  to: string   // "HH:mm"
}

const DAY_INDEX: Record<WorkingPeriod['day'], number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
}

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export interface WorkingHoursConfig {
  periods: WorkingPeriod[]
  timezone?: string
}

export function isWithinWorkingHours(config: WorkingHoursConfig, now = new Date()): boolean {
  const local = new Date(now.toLocaleString('en-GB', { timeZone: config.timezone }))
  const day = local.getDay()
  const minutes = local.getHours() * 60 + local.getMinutes()
  return config.periods.some(({ day: d, from, to }) => {
    const target = DAY_INDEX[d]
    if (target !== day) return false
    const start = toMinutes(from)
    const end = toMinutes(to)
    return minutes >= start && minutes < end
  })
}
