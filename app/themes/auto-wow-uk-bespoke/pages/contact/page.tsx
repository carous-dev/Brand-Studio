import type { ThemePageProps } from '../../../types'
import ContactIsland from './ContactIsland'

export function AutoContactPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'AUTOWOW UK LTD'
  const city = brand?.location?.address?.city || 'Barking'

  return (
    <>
      <section className="auto-page-hero">
        <div className="auto-page-hero-inner">
          <p className="auto-page-hero-crumb">Get in touch</p>
          <h1>Speak to {brandName}</h1>
          <p>
            Visit the showroom in {city}, give us a call, or send a message &mdash; same-day
            callbacks are normal. We&rsquo;re here Mon&ndash;Sat 09:00&ndash;18:00.
          </p>
        </div>
      </section>
      <ContactIsland />
    </>
  )
}

export default AutoContactPage
