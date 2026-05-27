import type { Metadata } from 'next';
import { FileText, Shield, AlertTriangle, MessageCircle } from 'lucide-react';
import { buildPageMetadata } from '../../lib/seo';
import '../../styles/legal-pages.css';

export const metadata: Metadata = buildPageMetadata({
  title: 'Disclaimer',
  description:
    'Read the CNH Cars Ltd legal disclaimer covering vehicle listings, website information, and service limitations.',
  path: '/disclaimer',
  keywords: ['cnh cars disclaimer', 'vehicle listing disclaimer', 'legal notice dealership', 'hertfordshire car dealer legal'],
});

export default function Disclaimer() {
  return (
    <>
      <main className="legal-page">
        <section className="hero hero-small hero-pattern">
          <div className="container">
            <div className="hero-content">
              <div className="hero-title">
                <span className="glow">Legal</span> <span className="accent">Disclaimer</span>
              </div>
              <div className="hero-subtitle">
                Important information about our website and services
              </div>
              <div className="hero-features">
                <div className="feature-item">
                  <FileText className="icon" />
                  <span>Legal Notice</span>
                </div>
                <div className="feature-item">
                  <Shield className="icon" />
                  <span>Terms & Conditions</span>
                </div>
                <div className="feature-item">
                  <AlertTriangle className="icon" />
                  <span>Important Information</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="legal-content">
          <div className="container">
            <div className="legal-grid">
              <div className="legal-main">
                <h2>General Disclaimer</h2>
                <p>The information provided on CNH Cars Ltd website is for general informational purposes only. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or availability of the information.</p>

                <h2>Vehicle Information</h2>
                <p>All vehicle descriptions, prices, and specifications are provided in good faith based on available information at the time of listing. Vehicle conditions, availability, and pricing are subject to change without notice. We recommend contacting us directly to verify current information about any vehicle of interest.</p>

                <h2>No Professional Advice</h2>
                <p>Nothing on this website should be construed as professional automotive, mechanical, legal, or financial advice. For specific concerns about any vehicle, we recommend consulting with qualified professionals.</p>

                <h2>Limitation of Liability</h2>
                <p>In no event shall CNH Cars Ltd be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the website or its content, regardless of the cause.</p>

                <h2>Third-Party Content</h2>
                <p>Our website may contain links to third-party websites. CNH Cars Ltd is not responsible for the content, accuracy, or practices of these external sites. Your use of third-party websites is at your own risk and subject to their terms.</p>

                <h2>Service Availability</h2>
                <p>We do not guarantee that our website will be available 24/7 or error-free. We may perform maintenance or updates that temporarily affect availability without prior notice.</p>

                <h2>Contact for Clarification</h2>
                <p>If you have questions or concerns about this disclaimer or our services, please contact us at chcars24@yahoo.com or (07537) 164889.</p>
              </div>
              <div className="legal-sidebar">
                <div className="legal-nav">
                  <h3>Legal Documents</h3>
                  <ul>
                    <li><a href="/privacy/">Privacy Policy</a></li>
                    <li><a href="/terms/">Terms of Service</a></li>
                    <li><a href="/cookies/">Cookie Policy</a></li>
                    <li className="active"><a href="/disclaimer/">Disclaimer</a></li>
                  </ul>
                </div>
                <div className="legal-contact">
                  <h3>Questions?</h3>
                  <p>Have questions about our legal policies or services?</p>
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
