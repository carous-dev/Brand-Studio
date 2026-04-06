import type { ThemePageProps } from '../../../types'
import '../../styles/policy.css'

export function GildedPrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Our Dealership'
  const city = brand?.location?.address?.city || brand?.location?.city || 'your area'
  const email = brand?.location?.email || 'info@example.com'
  const phone = brand?.location?.phone || ''

  return (
    <main className="policy-page">
      <div className="container">
        <article className="policy-content">
          <header className="policy-header">
            <h1>Privacy Policy</h1>
            <p className="last-updated">Last updated: December 2024</p>
          </header>

          <section className="policy-section">
            <h2>Key privacy policy summary</h2>
            <ul>
              <li>We only process personal data that is necessary and relevant to our business</li>
              <li>We do not sell or share your data with third parties without your consent</li>
              <li>You have full control over your personal information and preferences</li>
              <li>We implement strict security measures to protect your data</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Introduction</h2>
            <p>
              {brandName} ("we", "us", "our" or "Company") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you visit our website and use our
              services.
            </p>
            <p>
              We are a data controller under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act
              2018. This means we are responsible for how we collect and use your personal data.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with our policies and practices, please do not use
              our Website. By accessing and using our Website, you signify that you have read, understood, and agree to be bound
              by all the terms of this Privacy Policy.
            </p>
          </section>

          <section className="policy-section">
            <h2>Data we collect</h2>
            <p>We collect personal data in several ways:</p>

            <h3>Information you provide directly:</h3>
            <ul>
              <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
              <li><strong>Vehicle Information:</strong> Preferred makes/models, budget, specific requirements</li>
              <li><strong>Account Information:</strong> Login credentials, password, preferences</li>
              <li><strong>Communication Data:</strong> Messages, enquiries, feedback you send us</li>
              <li><strong>Transaction Data:</strong> Payment information, purchase history, quotes requested</li>
            </ul>

            <h3>Information collected automatically:</h3>
            <ul>
              <li><strong>Browsing Data:</strong> Pages visited, time spent, links clicked, referring website</li>
              <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address</li>
              <li><strong>Location Data:</strong> General location derived from IP address (not precise location)</li>
              <li><strong>Cookies & Tracking:</strong> See our <a href="/cookie-policy/">Cookie Policy</a></li>
            </ul>

            <h3>Information from third parties:</h3>
            <ul>
              <li><strong>Credit Reference Agencies:</strong> For finance application verification</li>
              <li><strong>Marketing Partners:</strong> For campaign optimisation and targeting</li>
              <li><strong>Social Media Platforms:</strong> If you link your social account</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>How we use data</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul>
              <li><strong>Service Delivery:</strong> Process vehicle enquiries, quotes, and test drive bookings</li>
              <li><strong>Customer Communication:</strong> Respond to your messages, provide customer support</li>
              <li><strong>Marketing:</strong> Send promotional emails and personalised vehicle recommendations (with your consent)</li>
              <li><strong>Financial Processing:</strong> Process payments, finance applications, and valuations</li>
              <li><strong>Website Improvement:</strong> Analyse user behaviour to enhance website functionality</li>
              <li><strong>Legal Compliance:</strong> Meet regulatory requirements, prevent fraud, ensure contract compliance</li>
              <li><strong>Analytics:</strong> Understand website usage patterns and user preferences</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Legal bases for processing</h2>
            <p>We process your personal data based on the following legal grounds:</p>
            <ul>
              <li><strong>Contract:</strong> Processing necessary to provide services you've requested</li>
              <li><strong>Consent:</strong> You have explicitly agreed to processing (e.g., marketing emails)</li>
              <li><strong>Legal Obligation:</strong> We are required by law to process your data</li>
              <li><strong>Legitimate Interest:</strong> Processing is necessary for our legitimate business interests</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Sharing & disclosure</h2>
            <p>We do not sell or trade your personal data. However, we may share information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Payment processors, email providers, analytics services</li>
              <li><strong>Finance Partners:</strong> Finance companies for loan processing (when applicable)</li>
              <li><strong>Legal Requirements:</strong> Law enforcement, courts, or regulators when required</li>
              <li><strong>Business Transfers:</strong> In case of merger, sale, or acquisition of our business</li>
            </ul>
            <p>All third parties are bound by confidentiality agreements and must comply with data protection laws.</p>
          </section>

          <section className="policy-section">
            <h2>Data retention</h2>
            <p>We retain your personal data only for as long as necessary:</p>
            <ul>
              <li><strong>Enquiry Data:</strong> Retained for 2 years or as long as an active interest is shown</li>
              <li><strong>Transaction Data:</strong> Retained for 7 years for accounting and legal purposes</li>
              <li><strong>Marketing Data:</strong> Retained until you unsubscribe or withdraw consent</li>
              <li><strong>Website Analytics:</strong> Typically retained for 12-24 months</li>
            </ul>
            <p>You can request deletion of your data at any time, subject to legal retention requirements.</p>
          </section>

          <section className="policy-section">
            <h2>Your rights</h2>
            <p>Under UK GDPR, you have the following rights:</p>
            <ul>
              <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how your data is used</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object:</strong> Opt out of marketing or certain processing activities</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw previous consent at any time</li>
            </ul>
            <p>To exercise any of these rights, please contact us using the details in the "Contact Us" section below.</p>
          </section>

          <section className="policy-section">
            <h2>Security</h2>
            <p>We implement industry-standard security measures to protect your personal data:</p>
            <ul>
              <li>SSL/TLS encryption for all data in transit</li>
              <li>Secure password policies and multi-factor authentication</li>
              <li>Regular security audits and penetration testing</li>
              <li>Limited access to personal data (need-to-know basis)</li>
              <li>Regular staff training on data protection and security</li>
              <li>Secure data disposal and deletion procedures</li>
            </ul>
            <p>
              While we strive to protect your personal data, no security system is 100% secure. If you become aware of a
              security breach, please contact us immediately.
            </p>
          </section>

          <section className="policy-section">
            <h2>Marketing communications</h2>
            <p>
              We would like to keep you informed about vehicles, offers, and services that may interest you. We will only send
              marketing communications if you have opted in or consented to receive them.
            </p>
            <p>You can unsubscribe or update your marketing preferences at any time by:</p>
            <ul>
              <li>Clicking "unsubscribe" in any email we send</li>
              <li>Contacting us directly using the details below</li>
              <li>Updating your preferences in your account settings</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Third-party links</h2>
            <p>
              Our Website may contain links to third-party websites. This Privacy Policy applies only to our Website. We are
              not responsible for the privacy practices of external websites. Please review the privacy policies of any
              third-party sites before providing your personal information.
            </p>
          </section>

          <section className="policy-section">
            <h2>Children's privacy</h2>
            <p>
              Our Website is not directed towards children under 13. We do not knowingly collect personal data from children
              under 13. If we become aware that a child under 13 has provided us with personal data, we will promptly delete
              such information and terminate the child's use of our Website.
            </p>
          </section>

          <section className="policy-section">
            <h2>International transfers</h2>
            <p>
              Your personal data is primarily stored and processed in the United Kingdom. If we transfer data to countries
              outside the UK, we ensure adequate safeguards are in place, such as Standard Contractual Clauses or adequacy
              decisions recognised by the UK Information Commissioner's Office (ICO).
            </p>
          </section>

          <section className="policy-section">
            <h2>Changes to this policy</h2>
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal
              requirements, and other factors. We will notify you of any material changes by updating the "Last Updated" date
              and posting the revised policy on our Website. Your continued use of our Website signifies your acceptance of
              any changes to this Privacy Policy.
            </p>
          </section>

          <section className="policy-section">
            <h2>Contact us</h2>
            <p>
              If you have questions about this Privacy Policy, wish to exercise your rights, or have concerns about how we
              handle your data, please contact us:
            </p>
            <div className="contact-info">
              <p>
                <strong>{brandName}</strong><br />
                Data Protection Officer<br />
                {city}<br />
                Email: <a href={`mailto:${email}`}>{email}</a><br />
                {phone ? (
                  <>Phone: <a href={`tel:${String(phone).replace(/[^0-9+]/g, '')}`}>{phone}</a></>
                ) : null}
              </p>
            </div>
            <p>
              You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) if you believe we
              have breached data protection laws:
            </p>
            <div className="contact-info">
              <p>
                <strong>Information Commissioner's Office</strong><br />
                Wycliffe House, Water Lane<br />
                Wilmslow, Cheshire SK9 5AF<br />
                Phone: <a href="tel:+441625545745">+44 (0) 1625 545 745</a><br />
                Website: <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer">www.ico.org.uk</a>
              </p>
            </div>
          </section>

          <nav className="policy-nav">
            <a href="/cookie-policy/" className="policy-link">Cookie Policy ?</a>
          </nav>
        </article>
      </div>
    </main>
  )
}

export default GildedPrivacyPolicyPage
