'use client'

import type { ReactNode } from 'react'

type Brand = {
  primaryColor?: string
  accentColor?: string
  images?: { hero?: string; about?: string; services?: string; finance?: string; partExchange?: string; sellYourCar?: string; recentlySold?: string }
  heroImage?: string
  [key: string]: unknown
}

const fallback = {
  primary: "#4169E1",
  accent: "#5680E9",
}

function pickString(...candidates: Array<string | undefined>): string | undefined {
  for (const c of candidates) if (typeof c === 'string' && c.trim()) return c
  return undefined
}

/**
 * Emits the brand-overridable CSS variables for the CnhcarsClone theme.
 * Brand records may override colors + per-slot images; the rest of the token
 * system stays a fixed contract.
 */
export function BrandStyles({ brand }: { brand: Brand }): ReactNode {
  const primary = pickString(brand?.primaryColor, fallback.primary)
  const accent = pickString(brand?.accentColor, fallback.accent)

  const heroImage = pickString(brand?.heroImage, brand?.images?.hero)
  const aboutImage = pickString(brand?.images?.about)
  const servicesImage = pickString(brand?.images?.services)
  const financeImage = pickString(brand?.images?.finance)
  const partExchangeImage = pickString(brand?.images?.partExchange)
  const sellYourCarImage = pickString(brand?.images?.sellYourCar)
  const recentlySoldImage = pickString(brand?.images?.recentlySold)

  const toUrl = (img?: string) => (img ? `url("${img}")` : 'none')

  const style = `
    [data-theme-id="cnhcars-clone"] {
      --color-primary: ${primary};
      --color-accent: ${accent};
      --brand-image-hero: ${toUrl(heroImage)};
      --brand-image-about: ${toUrl(aboutImage)};
      --brand-image-services: ${toUrl(servicesImage)};
      --brand-image-finance: ${toUrl(financeImage)};
      --brand-image-partExchange: ${toUrl(partExchangeImage)};
      --brand-image-sellYourCar: ${toUrl(sellYourCarImage)};
      --brand-image-recentlySold: ${toUrl(recentlySoldImage)};
    }
  `

  return <style dangerouslySetInnerHTML={{ __html: style }} />
}
