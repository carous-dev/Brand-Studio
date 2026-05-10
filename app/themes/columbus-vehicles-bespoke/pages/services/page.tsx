import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageBody from '../../components/PageBody'

/**
 * Columbus Vehicles — Services page (rugged archetype)
 * Detailed service descriptions. Uses brand.services.items when provided,
 * otherwise a 4×4-specific anchor list.
 */
const FALLBACK_SERVICES = [
  {
    title: 'Hand-picked 4×4 sourcing',
    body: "We don't take in trade-ins blind — every 4×4 in our inventory is hand-picked, inspected, and chosen because we'd put it on our own driveway. If we wouldn't drive it, we won't sell it.",
  },
  {
    title: 'Multi-point inspection',
    body: "Every vehicle goes through a rigorous mechanical and cosmetic inspection before it's listed: drivetrain, transfer case, axles, suspension, electronics, body — full report available on request.",
  },
  {
    title: 'Flexible finance',
    body: 'Access to 15+ lenders means we can find a finance option for almost any credit profile. Soft-search to start, full agreement in principle within an hour. No pushy sales — just numbers that work.',
  },
  {
    title: 'Honest part exchange',
    body: "Send us the registration plus a few photos and we'll have a firm valuation within the working day. No bait-and-switch on collection. Whether you're trading a 4×4 or a saloon, the offer stands.",
  },
  {
    title: 'Nationwide covered delivery',
    body: 'We deliver door-to-door on a covered transporter anywhere in mainland UK. Around 86% of our customers never step foot in the showroom — and they get the same treatment as those who do.',
  },
  {
    title: 'Warranty options',
    body: '3 months included on every vehicle, with options to extend to 6, 12, or 24 months. Claims handled through our partner network so you can use any VAT-registered garage local to you.',
  },
  {
    title: 'Aftersales support',
    body: "We don't disappear after the sale. Specialist 4×4 servicing through trusted partners, parts sourcing for harder-to-find components (looking at you, early Defender), and a phone line you can actually reach a human on.",
  },
] as const

type Service = { title: string; body: string }

export function ColumbusServicesPage({ brand }: ThemePageProps) {
  const userServices = (brand as any)?.services?.items
  const services: Service[] = Array.isArray(userServices) && userServices.length > 0
    ? userServices.map((s: any) => ({
        title: String(s?.title || 'Service'),
        body: String(s?.description || ''),
      }))
    : (FALLBACK_SERVICES as readonly Service[]).slice() as Service[]

  return (
    <main>
      <PageHero
        eyebrow="What we offer"
        title="Built for 4×4 buyers"
        lead="Sourcing, finance, delivery, warranty, aftersales — we handle every moving part of buying a quality used 4×4 so you don't have to."
        imageSlot="services"
      />
      <PageBody>
        {services.map((s) => (
          <article key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </article>
        ))}
      </PageBody>
    </main>
  )
}

export default ColumbusServicesPage
