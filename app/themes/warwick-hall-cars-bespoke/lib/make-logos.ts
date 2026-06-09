/**
 * Make → simple-icons CDN slug mapping + helpers.
 *
 * Ported from carous-platform/apps/kainmotorsltd/app/lib/make-logos.ts so the
 * warwick theme renders real brand glyphs in the BrowseByMakes section.
 * simple-icons is CC0-licensed for the SVG code; brand marks themselves are
 * trademarks of their respective owners — used nominatively to reference
 * vehicles in stock, consistent with the rest of the carous platform.
 */

export const MAKE_LOGO_SLUGS: Record<string, string> = {
  abarth: 'abarth',
  'alfa romeo': 'alfaromeo',
  'aston martin': 'astonmartin',
  audi: 'audi',
  bentley: 'bentley',
  bmw: 'bmw',
  byd: 'byd',
  cadillac: 'cadillac',
  chevrolet: 'chevrolet',
  chrysler: 'chrysler',
  citroen: 'citroen',
  'citroën': 'citroen',
  cupra: 'cupra',
  dacia: 'dacia',
  ds: 'ds',
  'ds automobiles': 'ds',
  ferrari: 'ferrari',
  fiat: 'fiat',
  ford: 'ford',
  genesis: 'genesis',
  gmc: 'gmc',
  honda: 'honda',
  hyundai: 'hyundai',
  infiniti: 'infiniti',
  jaguar: 'jaguar',
  jeep: 'jeep',
  kia: 'kia',
  lamborghini: 'lamborghini',
  lancia: 'lancia',
  'land rover': 'landrover',
  lexus: 'lexus',
  lotus: 'lotus',
  maserati: 'maserati',
  mazda: 'mazda',
  mclaren: 'mclaren',
  mercedes: 'mercedes',
  'mercedes-benz': 'mercedes',
  mg: 'mg',
  mini: 'mini',
  mitsubishi: 'mitsubishi',
  nissan: 'nissan',
  opel: 'opel',
  peugeot: 'peugeot',
  polestar: 'polestar',
  porsche: 'porsche',
  ram: 'ram',
  renault: 'renault',
  'rolls-royce': 'rollsroyce',
  'rolls royce': 'rollsroyce',
  seat: 'seat',
  skoda: 'skoda',
  'škoda': 'skoda',
  smart: 'smart',
  subaru: 'subaru',
  suzuki: 'suzuki',
  tesla: 'tesla',
  toyota: 'toyota',
  vauxhall: 'vauxhall',
  volkswagen: 'volkswagen',
  vw: 'volkswagen',
  volvo: 'volvo',
}

export function resolveLogoSlug(name: string): string | null {
  const key = name.toLowerCase().trim()
  if (MAKE_LOGO_SLUGS[key]) return MAKE_LOGO_SLUGS[key]
  const collapsed = key.replace(/[^a-z0-9]+/g, '')
  return MAKE_LOGO_SLUGS[collapsed] ?? null
}

export function simpleIconsLogoUrl(slug: string): string {
  return `https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/${slug}.svg`
}

export function toMakeUrlSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function normaliseMakeName(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}
