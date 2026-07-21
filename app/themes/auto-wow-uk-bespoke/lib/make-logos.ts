// Simple-icons logo slug map. Source: ported from carous-platform/kainmotorsltd.
// Use `resolveLogoSlug(name)` to get the CDN slug for a make name, then
// `simpleIconsLogoUrl(slug)` for the SVG URL. Returns null when the make
// has no matching logo — render a monogram fallback instead.

export const MAKE_LOGO_SLUGS: Record<string, string> = {
  'abarth': 'abarth',
  'alfa romeo': 'alfaromeo',
  'aston martin': 'astonmartin',
  'audi': 'audi',
  'bentley': 'bentley',
  'bmw': 'bmw',
  'byd': 'byd',
  'cadillac': 'cadillac',
  'chevrolet': 'chevrolet',
  'chrysler': 'chrysler',
  'citroen': 'citroen',
  'citroën': 'citroen',
  'cupra': 'cupra',
  'dacia': 'dacia',
  'ds': 'ds',
  'ds automobiles': 'ds',
  'ferrari': 'ferrari',
  'fiat': 'fiat',
  'ford': 'ford',
  'genesis': 'genesis',
  'gmc': 'gmc',
  'honda': 'honda',
  'hyundai': 'hyundai',
  'infiniti': 'infiniti',
  'jaguar': 'jaguar',
  'jeep': 'jeep',
  'kia': 'kia',
  'lamborghini': 'lamborghini',
  'lancia': 'lancia',
  'land rover': 'landrover',
  'lexus': 'lexus',
  'lotus': 'lotus',
  'maserati': 'maserati',
  'mazda': 'mazda',
  'mclaren': 'mclaren',
  'mercedes': 'mercedes',
  'mercedes-benz': 'mercedes',
  'mg': 'mg',
  'mini': 'mini',
  'mitsubishi': 'mitsubishi',
  'nissan': 'nissan',
  'opel': 'opel',
  'peugeot': 'peugeot',
  'polestar': 'polestar',
  'porsche': 'porsche',
  'ram': 'ram',
  'renault': 'renault',
  'rolls-royce': 'rollsroyce',
  'rolls royce': 'rollsroyce',
  'seat': 'seat',
  'skoda': 'skoda',
  'škoda': 'skoda',
  'smart': 'smart',
  'subaru': 'subaru',
  'suzuki': 'suzuki',
  'tesla': 'tesla',
  'toyota': 'toyota',
  'vauxhall': 'vauxhall',
  'volkswagen': 'volkswagen',
  'vw': 'volkswagen',
  'volvo': 'volvo',
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
