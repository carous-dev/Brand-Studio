import type { ThemePageProps } from '../../../types'
import '../../styles/policy.css'

export function GildedCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Our Dealership'
  const city = String(brand?.location?.address?.city || brand?.location?.city || 'your area')
  const email = brand?.location?.email || 'info@example.com'
  const phone = brand?.location?.phone || ''

  return (
    <main className="policy-page">
      <div className="container">
        <article className="policy-content">
          <header className="policy-header">
            <h1>Cookie Policy</h1>
            <p className="last-updated">Last updated: December 2024</p>
          </header>

          <section className="policy-section">
            <h2>What are cookies?</h2>
            <p>
              Cookies are small text files stored on your device (computer, tablet or mobile phone) when you visit our
              website. They help us understand how you use our site and allow us to improve your experience. Cookies also
              enable us to remember your preferences and deliver personalised content.
            </p>
            <p>
              Some cookies are essential for the site to function properly. Others help us analyse traffic and understand how
              visitors use our website. You can control and manage cookies through your browser settings.
            </p>
          </section>

          <section className="policy-section">
            <h2>Types of cookies we use</h2>
            <div className="cookie-types">
              <div className="cookie-type">
                <h3>Necessary Cookies</h3>
                <p>
                  These cookies are essential for the website to function properly. They enable basic functionality such as
                  page navigation and access to secure areas. These cookies cannot be disabled without affecting site
                  functionality.
                </p>
                <ul>
                  <li><strong>Session Management:</strong> Keep you logged in during your visit</li>
                  <li><strong>Security:</strong> Protect against fraud and malicious attacks</li>
                  <li><strong>Preferences:</strong> Remember your basic preferences (e.g., language, currency)</li>
                </ul>
              </div>

              <div className="cookie-type">
                <h3>Analytics Cookies</h3>
                <p>
                  These cookies help us understand how visitors use our website by collecting data about page visits, time
                  spent on pages, and user interactions. This information is used anonymously to improve website
                  functionality and user experience.
                </p>
                <ul>
                  <li><strong>Google Analytics:</strong> Tracks visitor behaviour and traffic patterns</li>
                  <li><strong>Performance Metrics:</strong> Measures page load times and technical performance</li>
                </ul>
              </div>

              <div className="cookie-type">
                <h3>Marketing Cookies</h3>
                <p>
                  These optional cookies are used to deliver personalised marketing messages and advertisements. They track
                  your interests and behaviour to show you relevant promotions and offers from {brandName} and our partners.
                </p>
                <ul>
                  <li><strong>Retargeting:</strong> Show relevant vehicle listings based on your browsing history</li>
                  <li><strong>Campaign Tracking:</strong> Measure effectiveness of marketing campaigns</li>
                  <li><strong>Social Media:</strong> Enable social media features and plugins</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>How we use cookies</h2>
            <p>We use cookies to:</p>
            <ul>
              <li>Remember your preferences and settings on future visits</li>
              <li>Understand how you use our website and improve our services</li>
              <li>Analyse traffic and identify which pages are most popular</li>
              <li>Provide personalised content and vehicle recommendations</li>
              <li>Measure the effectiveness of marketing campaigns</li>
              <li>Prevent fraud and enhance website security</li>
              <li>Enable social media functionality and sharing</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Managing your cookie preferences</h2>
            <p>
              You can control and manage cookies through our cookie banner or by adjusting your browser settings. Most web
              browsers allow you to:
            </p>
            <ul>
              <li>View what cookies are set and delete them</li>
              <li>Block all cookies or just third-party cookies</li>
              <li>Set your browser to notify you when a cookie is being set</li>
            </ul>
            <p className="note">
              <strong>Please note:</strong> Disabling necessary cookies may affect the functionality of our website and prevent
              you from accessing certain features.
            </p>
          </section>

          <section className="policy-section">
            <h2>Third-party cookies</h2>
            <p>We work with trusted third-party partners who may set cookies on our website:</p>
            <ul>
              <li><strong>Google Analytics:</strong> For website analytics and traffic measurement</li>
              <li><strong>Social Media Platforms:</strong> Facebook, LinkedIn, Instagram (social sharing and retargeting)</li>
              <li><strong>Payment Processors:</strong> For secure payment processing</li>
              <li><strong>Advertising Partners:</strong> For personalised advertising and campaign measurement</li>
            </ul>
            <p>
              Third parties are required to comply with applicable data protection laws and use cookies only for specified
              purposes.
            </p>
          </section>

          <section className="policy-section">
            <h2>Cookie retention</h2>
            <p>Cookies are retained for different periods depending on their purpose:</p>
            <ul>
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Stored for a specified period (typically 12 months)</li>
              <li><strong>Analytics Cookies:</strong> Typically retained for 12-24 months</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Your rights</h2>
            <p>Under data protection laws, you have the right to:</p>
            <ul>
              <li>Access information about cookies stored on your device</li>
              <li>Withdraw consent to optional cookies at any time</li>
              <li>Request deletion of cookies</li>
              <li>Opt-out of personalised marketing communications</li>
            </ul>
            <p>
              You can exercise these rights through our cookie management panel or by contacting us directly. See our
              <a href="/privacy-policy/"> Privacy Policy</a> for more information about your rights.
            </p>
          </section>

          <section className="policy-section">
            <h2>Changes to this policy</h2>
            <p>
              We may update this cookie policy from time to time to reflect changes in our practices or applicable laws. We
              encourage you to review this policy periodically. Continued use of our website after changes signifies your
              acceptance of the updated policy.
            </p>
          </section>

          <section className="policy-section">
            <h2>Contact us</h2>
            <p>
              If you have questions about our use of cookies or would like to manage your preferences, please contact us:
            </p>
            <div className="contact-info">
              <p>
                <strong>{brandName}</strong><br />
                {city}<br />
                Email: <a href={`mailto:${email}`}>{email}</a><br />
                {phone ? (
                  <>Phone: <a href={`tel:${String(phone).replace(/[^0-9+]/g, '')}`}>{phone}</a></>
                ) : null}
              </p>
            </div>
          </section>

          <nav className="policy-nav">
            <a href="/privacy-policy/" className="policy-link">? Privacy Policy</a>
          </nav>
        </article>
      </div>
    </main>
  )
}

export default GildedCookiePolicyPage
