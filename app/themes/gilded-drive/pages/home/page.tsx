import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import CTAHero from '../../components/CTAHero'
import Services from '../../components/Services'
import Featured from '../../components/Featured'
import AboutSection from '../../components/AboutSection'

export function GildedHomePage(_: ThemePageProps) {
  return (
    <div suppressHydrationWarning>
      <Hero />
      <CTAHero />
      <Services />
      <Featured />
      <AboutSection />
    </div>
  )
}

export default GildedHomePage
