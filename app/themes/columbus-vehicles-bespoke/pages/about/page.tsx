import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageBody from '../../components/PageBody'

/**
 * Columbus Vehicles — About page (rugged archetype)
 * Dealer story + credentials + team. Uses brand.aboutUs.description when
 * provided, otherwise a 4×4-specialist anchor narrative.
 */
export function ColumbusAboutPage({ brand }: ThemePageProps) {
  const dealerName = brand?.name || 'Columbus Vehicles'
  const aboutDesc =
    (typeof brand?.aboutUs?.description === 'string' && brand.aboutUs.description) ||
    `${dealerName} has been hand-picking quality used 4×4s for the UK market for over a decade. Our team of dedicated specialists know the difference between a Wrangler that's been pampered and one that's been pushed to its limits — and we only sell the former.`

  return (
    <main>
      <PageHero
        eyebrow="Our story"
        title={`The UK's #1 4×4 specialist`}
        lead={`Five consecutive years voted #1 4×4 dealer, decades of combined experience, and a single obsession: finding the right 4×4 for every customer who walks through our door.`}
        imageSlot="about"
      />
      <PageBody>
        <h2>Why specialists matter</h2>
        <p>{aboutDesc}</p>
        <p>
          A general used-car dealer might know whether a Wrangler runs.
          A 4×4 specialist knows the difference between a Rubicon and a
          Sahara, why the Pentastar is more reliable than the early 3.6,
          how to spot rust on a Defender, and which Land Rover ZF transmissions
          are likely to need work in the next 30,000 miles. That difference
          is why our customers come back when it&apos;s time for the next one.
        </p>

        <h2>What we promise</h2>
        <ul>
          <li>Every 4×4 multi-point inspected before listing.</li>
          <li>Honest valuations — we&apos;ll tell you when to pass on a vehicle.</li>
          <li>Finance options across 15+ lenders for mixed credit profiles.</li>
          <li>Nationwide delivery with covered transport on every sale.</li>
          <li>Aftersales support and parts sourcing through trusted 4×4 specialist partners.</li>
        </ul>

        <h2>Visit us — or don&apos;t</h2>
        <p>
          Around 86% of the 4×4s we sold last year were delivered without
          the customer ever visiting in person. High-resolution walkaround
          videos, full inspection reports, finance arranged over a couple of
          phone calls, then door-to-door delivery on a covered transporter.
          The showroom&apos;s open if you want to inspect in person — but you
          don&apos;t have to.
        </p>
      </PageBody>
    </main>
  )
}

export default ColumbusAboutPage
