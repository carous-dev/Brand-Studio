import { Metadata } from 'next';
import { Shield, Lock, UserCheck, MessageCircle } from 'lucide-react';
import { buildPageMetadata } from '../../lib/seo';
import '../../styles/legal-pages.css';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'Read the CNH Cars Ltd privacy policy, including how we collect, use, and protect personal information in line with UK data protection requirements.',
  path: '/privacy',
  keywords: ['privacy policy cnh cars', 'data protection uk', 'gdpr dealership', 'personal information policy'],
});

export default function Privacy() {
  return (
    <>
      <main className="legal-page">
        <section className="hero hero-small hero-pattern">
          <div className="container">
            <div className="hero-content">
              <div className="hero-title">
                <span className="glow">Privacy</span> <span className="accent">Policy</span>
              </div>
              <div className="hero-subtitle">
                How we protect and use your information
              </div>
              <div className="hero-features">
                <div className="feature-item">
                  <Shield className="icon" />
                  <span>Data Protection</span>
                </div>
                <div className="feature-item">
                  <Lock className="icon" />
                  <span>Secure Handling</span>
                </div>
                <div className="feature-item">
                  <UserCheck className="icon" />
                  <span>Your Rights</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="legal-content">
          <div className="container">
            <div className="legal-grid">
              <div className="legal-main">
                <h2>Data Collection</h2>
                <p>We collect information you provide directly, such as when you fill out forms, contact us, or make a purchase. This includes your name, email address, phone number, and vehicle preferences.</p>

                <h2>How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul>
                  <li>Process your inquiries and transactions</li>
                  <li>Send you updates about vehicles that match your interests</li>
                  <li>Improve our services and website</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h2>Data Security</h2>
                <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>

                <h2>Third-Party Sharing</h2>
                <p>We do not sell, trade, or rent your personal information to third parties. We may share information with trusted partners who assist us in operating our website or conducting our business.</p>

                <h2>Your Rights</h2>
                <p>You have the right to access, modify, or delete your personal information at any time. Please contact us for assistance with these requests.</p>

                <h2>Contact Us</h2>
                <p>If you have questions about our privacy practices, please contact us at chcars24@yahoo.com or (07537) 164889.</p>
              </div>
              <div className="legal-sidebar">
                <div className="legal-nav">
                  <h3>Legal Documents</h3>
                  <ul>
                    <li className="active"><a href="/privacy/">Privacy Policy</a></li>
                    <li><a href="/terms/">Terms of Service</a></li>
                    <li><a href="/cookies/">Cookie Policy</a></li>
                    <li><a href="/disclaimer/">Disclaimer</a></li>
                  </ul>
                </div>
                <div className="legal-contact">
                  <h3>Questions?</h3>
                  <p>Have questions about our privacy practices?</p>
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
