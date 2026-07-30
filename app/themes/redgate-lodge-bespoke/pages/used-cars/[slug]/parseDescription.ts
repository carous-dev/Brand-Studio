// Vehicle-description refiner — redgate-lodge-bespoke.
// Turns a raw feed blurb into refined highlights + prose and DROPS dealer
// contact / payment / booking / identity-dup noise so the detail page reads
// like a curated listing, never a pasted feed dump. Deterministic (no I/O),
// co-located so DetailClient.tsx can import it directly.

export type ParsedDescription = { highlights: string[]; prose: string[] }

export type DescriptionContext = {
  make: string
  model: string
  derivative: string
  reg: string
  title: string
  priceText: string
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')

const RE_PHONE = /(?:\+?44|\b0)\s*(?:\d\s*){9,}/
const RE_CONTACT = /\b(call|ring|phone|txt|text|whatsapp|dm|e-?mail|contact us|contact me)\b/i
const RE_PAYMENT = /\b(bank transfer|bacs|paypal|payment (?:via|by|is|method|preferred)|cash only|card payment|deposit (?:secures|required|of))\b/i
const RE_BOOKING = /\b(book|arrange|to view|viewing by|test drive|by appointment|appointment only|come and see)\b/i
const RE_PLEASE = /^please\b/i
const RE_BARE_PRICE = /^£?\s?\d[\d,]*(?:\.\d+)?\s*(?:ono|ovno|o\.n\.o\.?)?$/i
const RE_SPEC_TOKEN = /^\d(?:\.\d)?\s?(?:l|litre|tdci|tsi|dci|cdti|hdi|vti|bhp|ps|cc|v\d)\b/i
// Dealer boilerplate opener — "<Dealer> are pleased to offer our lovely <Make>
// <Model>." — leaks the dealer name + is cruft; strip the leading clause from a
// prose fragment (keeps any genuine description that follows). The clause body
// uses `(?:[^.]|\.(?=\d))*` — non-dot chars OR a dot that's part of a decimal
// (engine size "1.6"/"2.0") — so the FIRST real sentence-terminating period ends
// the match, not the decimal point inside the derivative (which used to leave a
// clipped "6 TDCi" / "0 TDI" fragment).
const RE_BOILERPLATE = /^.*?\b(?:are|is)?\s*(?:pleased|proud|delighted|happy)\s+to\s+(?:offer|present)\b(?:[^.]|\.(?=\d))*\.\s*/i

// Sentence-case a shouty ALL-CAPS fragment to Title Case ("GREAT SERVICE
// HISTORY" → "Great Service History"); leave already-mixed-case text alone so
// "HPI clear" / "Long MOT" keep their intentional capitals.
const tidyCase = (s: string): string =>
  /[a-z]/.test(s)
    ? s.charAt(0).toUpperCase() + s.slice(1)
    : s.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase())

export function parseVehicleDescription(
  raw: string,
  ctx: DescriptionContext,
): ParsedDescription {
  if (!raw) return { highlights: [], prose: [] }

  const ids = new Set(
    [ctx.make, ctx.model, `${ctx.make} ${ctx.model}`, ctx.derivative, ctx.reg, ctx.title]
      .map(norm)
      .filter((v) => v.length > 2),
  )
  const priceNorm = norm(ctx.priceText)

  // Split on newlines, bullets, pipes, " / " AND "+" — UK feeds most commonly
  // delimit their feature lists with " + " ("... + GREAT SERVICE HISTORY + ...").
  const fragments = raw
    .split(/[\r\n]+|[•·‣▪|+]+|(?:\s+\/\s+)/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const isNoise = (frag: string): boolean => {
    const nf = norm(frag)
    if (RE_PHONE.test(frag)) return true
    if (frag.replace(/\D/g, '').length >= 10) return true
    if (RE_CONTACT.test(frag)) return true
    if (RE_PAYMENT.test(frag)) return true
    if (RE_BOOKING.test(frag)) return true
    if (RE_PLEASE.test(frag)) return true
    if (ids.has(nf)) return true
    if (RE_BARE_PRICE.test(frag) || (priceNorm.length > 1 && nf === priceNorm)) return true
    if (RE_SPEC_TOKEN.test(frag) && frag.split(' ').length <= 2) return true
    return false
  }

  const highlights: string[] = []
  const seen = new Set<string>()
  const prose: string[] = []

  for (const frag of fragments) {
    if (isNoise(frag)) continue
    if (frag.split(/\s+/).length <= 6 && frag.length <= 48) {
      const clean = frag.replace(/[.!]+$/, '').trim()
      const cap = tidyCase(clean)
      const key = cap.toLowerCase()
      if (!seen.has(key) && highlights.length < 8) {
        seen.add(key)
        highlights.push(cap)
      }
    } else {
      // Strip the leading dealer-boilerplate clause before keeping the prose.
      const trimmed = frag.replace(RE_BOILERPLATE, '').trim()
      if (trimmed) prose.push(trimmed)
    }
  }

  return { highlights, prose }
}
