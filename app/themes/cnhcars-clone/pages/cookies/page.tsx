import type { Metadata } from 'next';
import { Cookie, Shield, Settings, MessageCircle } from 'lucide-react';
import { buildPageMetadata } from '../../lib/seo';
import '../../styles/legal-pages.css';

export const metadata: Metadata = buildPageMetadata({
  title: 'Cookie Policy',
  description:
    'Read the CNH Cars Ltd cookie policy and learn how cookies are used on our website for essential functions and analytics.',
  path: '/cookies',
  keywords: ['cookie policy cnh cars', 'website cookies', 'cookie settings', 'hertfordshire dealership cookies'],
});

export default function Cookies() {
  return (
    <>
      <main className="legal-page">
        <section className="hero hero-small hero-pattern">
          <div className="container">
            <div className="hero-content">
              <div className="hero-title">
                <span className="glow">Cookie</span> <span className="accent">Policy</span>
              </div>
              <div className="hero-subtitle">
                Understanding how we use cookies on our website
              </div>
              <div className="hero-features">
                <div className="feature-item">
                  <Cookie className="icon" />
                  <span>Cookie Management</span>
                </div>
                <div className="feature-item">
                  <Shield className="icon" />
                  <span>Privacy Protection</span>
                </div>
                <div className="feature-item">
                  <Settings className="icon" />
                  <span>User Preferences</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="legal-content">
          <div className="container">
            <div className="legal-grid">
              <div className="legal-main">
                <h2>What Are Cookies?</h2>
                <p>Cookies are small text files that are stored on your computer or mobile device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and understanding how you use our site.</p>

                <h2>Types of Cookies We Use</h2>
                <p>We use different types of cookies for various purposes:</p>
                <ul>
                  <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly and cannot be disabled. They enable core functionality like secure logins and shopping cart features.</li>
                  <li><strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website's performance and user experience.</li>
                  <li><strong>Marketing Cookies:</strong> These cookies are used to track visitors across websites to display ads that are relevant to their interests. They may be set by our advertising partners with our permission.</li>
                  <li><strong>Functional Cookies:</strong> These cookies allow the website to remember choices you make (such as your username, language, or the region you are in) and provide enhanced, more personal features.</li>
                </ul>

                <h2>Managing Your Cookie Preferences</h2>
                <p>You have control over how cookies are used on our website. You can:</p>
                <ul>
                  <li>Use our cookie preference panel to accept or reject different types of cookies</li>
                  <li>Adjust your browser settings to block or delete cookies</li>
                  <li>Opt out of interest-based advertising through industry tools</li>
                </ul>
                <p>Please note that disabling certain cookies may affect the functionality of our website and your user experience.</p>

                <h2>Third-Party Cookies</h2>
                <p>Some cookies on our website are set by third-party services that appear on our pages. We have no control over these cookies, and they are subject to the respective third party's privacy policy. Examples include:</p>
                <ul>
                  <li>Google Analytics for website analytics</li>
                  <li>Social media plugins for sharing functionality</li>
                  <li>Advertising networks for targeted advertising</li>
                </ul>

                <h2>Cookie Retention</h2>
                <p>The length of time a cookie remains on your device depends on its type:</p>
                <ul>
                  <li><strong>Session Cookies:</strong> These are temporary and expire when you close your browser</li>
                  <li><strong>Persistent Cookies:</strong> These remain on your device for a set period or until you delete them</li>
                </ul>

                <h2>Your Privacy Rights</h2>
                <p>Your privacy is important to us. We are committed to protecting your personal data and complying with applicable privacy laws. For more information about how we handle your data, please review our Privacy Policy.</p>

                <h2>Updates to This Policy</h2>
                <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website.</p>

                <h2>Contact Us</h2>
                <p>If you have any questions about our use of cookies or this Cookie Policy, please contact us at chcars24@yahoo.com or call (07537) 164889.</p>
              </div>
              <div className="legal-sidebar">
                <div className="legal-nav">
                  <h3>Legal Documents</h3>
                  <ul>
                    <li><a href="/privacy/">Privacy Policy</a></li>
                    <li><a href="/terms/">Terms of Service</a></li>
                    <li className="active"><a href="/cookies/">Cookie Policy</a></li>
                    <li><a href="/disclaimer/">Disclaimer</a></li>
                  </ul>
                </div>
                <div className="legal-contact">
                  <h3>Questions?</h3>
                  <p>Have questions about our cookie policy or privacy practices?</p>
                  <a href="/contact/" className="legal-contact-btn">
                    <MessageCircle className="legal-contact-btn-icon" />
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
