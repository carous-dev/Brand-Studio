import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import ServicesBand from '../../components/ServicesBand'
import CtaBanner from '../../components/CtaBanner'
import Directory from '../../components/Directory'

export function AutoServicesPage({ brand }: ThemePageProps) {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Everything between you and the keys."
        lead="From the first browse to the last service interval — finance, part-exchange, delivery, aftercare. One forecourt. Everything covered."
        imageSlot="services"
        pills={['Finance', 'Part-exchange', 'Delivery', 'Aftercare']}
      />

      <div data-aos="fade-up"><ServicesBand /></div>
      <div data-aos="zoom-in-up" data-aos-delay="80"><CtaBanner /></div>
      <div data-aos="fade-up" data-aos-delay="160"><Directory brand={brand} /></div>
    </>
  )
}

export default AutoServicesPage
