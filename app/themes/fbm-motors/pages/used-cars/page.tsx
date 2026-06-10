import { resolveText } from '../../lib/brand-text'
import { PageHero } from '../../components/PageHero'
import { heroImage as defaultHero } from '../../lib/cars'
import UsedCarsClient from './UsedCarsClient'
import type { ThemePageProps } from '../../../types'

export function FbmUsedCarsPage({ brand }: ThemePageProps) {
  const heroBg = brand.images?.hero || brand.heroImage || defaultHero
  const heroTitle = resolveText(brand, 'usedCarsHeroTitle')
  const heroLead = resolveText(brand, 'usedCarsHeroLead')

  return (
    <>
      <PageHero image={heroBg} title={heroTitle} lead={heroLead} />
      <UsedCarsClient />
    </>
  )
}

export default FbmUsedCarsPage
