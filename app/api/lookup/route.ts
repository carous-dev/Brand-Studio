import { NextRequest, NextResponse } from 'next/server'

/**
 * `/api/lookup` — vehicle valuation lookup endpoint consumed by the
 * `@/app/widgets/SellYourCarWidget` (the brandstudio port of
 * carous-platform's `@carous/sell-your-car` package).
 *
 * Shape contract — POST `{ reg, mileage }` →
 *   200 OK { vehicle: VehicleLookupData, valuations: LookupValuations | null }
 *   200 OK { vehicle: { registration, ...nulls }, valuations: null }  // graceful fallback
 *   4xx { error, message }                                            // hard fail
 *
 * In carous-platform this proxies to the external Carous vehicle-data
 * service. Brandstudio doesn't have that proxy wired up, and the dealer's
 * local MySQL inventory is the wrong table to search (it contains the
 * dealer's stock, not arbitrary UK vehicles). So this route returns a
 * minimal synthesized vehicle record + null valuations whenever the
 * upstream lookup is unavailable — that lets the widget advance to the
 * "Your details" step regardless, with the trade price shown as
 * "On request".
 *
 * If/when brandstudio gains a real vehicle-data proxy (env-controlled),
 * wire it in here and keep the synthesized fallback as the failure mode.
 */

type LookupRequestBody = {
  reg?: string
  mileage?: number | string
}

function normalizeRegistration(value: unknown): string {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim()
}

function parseMileage(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const digits = String(value).replace(/[^0-9]/g, '')
  if (!digits) return null
  const n = Number.parseInt(digits, 10)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export async function POST(request: NextRequest) {
  let body: LookupRequestBody = {}
  try {
    body = (await request.json()) as LookupRequestBody
  } catch {
    return NextResponse.json(
      { error: 'invalid-body', message: 'Request body must be JSON.' },
      { status: 400 },
    )
  }

  const registration = normalizeRegistration(body.reg)
  const mileage = parseMileage(body.mileage)

  if (!registration) {
    return NextResponse.json(
      { error: 'missing-registration', message: 'Enter a valid registration plate.' },
      { status: 400 },
    )
  }
  if (mileage === null) {
    return NextResponse.json(
      { error: 'missing-mileage', message: 'Enter a valid mileage figure.' },
      { status: 400 },
    )
  }

  // Try the local dealer-inventory lookup first — this only succeeds for cars
  // the dealer themselves has imported. Most user-typed regs will miss.
  try {
    const origin = new URL(request.url).origin
    const internal = new URL(
      `/api/vehicles/lookup?registration=${encodeURIComponent(registration)}&mileage=${encodeURIComponent(String(mileage))}`,
      origin,
    )
    const res = await fetch(internal.toString(), { cache: 'no-store' })
    if (res.ok) {
      const payload = await res.json().catch(() => null)
      const data = (payload && (payload.data || payload)) as Record<string, unknown> | null
      if (data && typeof data === 'object') {
        return NextResponse.json({
          vehicle: {
            registration: data.registration ?? registration,
            vin: data.vin ?? null,
            make: data.make_name ?? data.make ?? null,
            model: data.model_name ?? data.model ?? null,
            derivative: data.derivative ?? null,
            bodyType: data.body_type ?? null,
            fuelType: data.fuel_type ?? null,
            transmissionType: data.transmission_type ?? null,
            colour: data.colour ?? null,
            doors: data.doors ?? null,
            seats: data.seats ?? null,
            engineCapacityCC: data.engine_capacity_cc ?? null,
            enginePowerBHP: data.engine_power_bhp ?? null,
          },
          valuations: null,
        })
      }
    }
  } catch {
    // Fall through to the synthesized response.
  }

  // Fallback: return a minimal vehicle record so the widget advances.
  return NextResponse.json({
    vehicle: {
      registration,
      make: null,
      model: null,
      derivative: null,
      bodyType: null,
      fuelType: null,
      transmissionType: null,
      colour: null,
    },
    valuations: null,
    warnings: [
      {
        type: 'INFO',
        feature: 'vehicle-data',
        message: 'Vehicle data unavailable — please confirm your details below.',
      },
    ],
  })
}

// Some clients (and the carous-platform widget's prefetch path) may probe with GET.
export async function GET() {
  return NextResponse.json(
    { error: 'method-not-allowed', message: 'POST { reg, mileage } to /api/lookup.' },
    { status: 405 },
  )
}
