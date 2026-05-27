'use client';

import { Search, Truck, Shield } from 'lucide-react';
import { useBrand } from '../context/BrandClientWrapper';

export default function About() {
  const brand = useBrand();
  const brandName = brand?.name || 'Our showroom';
  const features = [
    {
      icon: <Search className="feature-icon" />,
      title: 'Quality Checks',
      description: 'Vehicles are reviewed carefully and listed with clear, practical details.'
    },
    {
      icon: <Truck className="feature-icon" />,
      title: 'Delivery Support',
      description: 'Collection and UK-wide delivery support can be arranged to suit your plans.'
    },
    {
      icon: <Shield className="feature-icon" />,
      title: 'Expert Buying Advice',
      description: 'Straightforward guidance to help you choose confidently with no sales pressure.'
    }
  ];

  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-content">
          <h2>Why Choose {brandName}</h2>
          <p>We handpick and inspect our vehicles carefully, provide honest guidance, and keep every step straightforward so you can buy with confidence.</p>
          <div className="features">
            {features.map((feature, index) => (
              <div key={index} className="feature">
                {feature.icon}
                <div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
