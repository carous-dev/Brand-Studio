'use client';

import { Calendar, Users, Truck } from 'lucide-react';
import { useBrand } from '../context/BrandClientWrapper';
import { getBrandContactInfo } from '../lib/contact';

export default function Stats() {
  const brand = useBrand();
  const contact = getBrandContactInfo(brand);
  const brandName = brand?.name || 'our showroom';
  const cityLabel = contact.showroomCity || 'our city';
  const addressLabel = contact.showroomAddress || 'our showroom';

  const stats = [
    {
      icon: <Calendar />,
      number: 'UK',
      label: 'Trusted Dealer',
      description: 'Active UK-registered car dealership'
    },
    {
      icon: <Users />,
      number: cityLabel,
      label: 'Showroom Base',
      description: addressLabel
    },
    {
      icon: <Truck />,
      number: 'UK-Wide',
      label: 'Delivery Support',
      description: 'Collection and delivery support available nationwide'
    }
  ];

  return (
    <section className="stats-section" aria-labelledby="trust-signals-title">
      <div className="stats-inner">
        <p id="trust-signals-title" className="stats-lead">
          All our stock is privately sourced, checked, and presented clearly so you can buy with confidence from {brandName}.
        </p>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <article key={index} className="stats-card">
              <div className="stats-icon-wrap" aria-hidden="true">
                {stat.icon}
              </div>
              <h3 className="stats-card-title">{stat.label}</h3>
              <p className="stats-card-text">
                <span className="stats-card-value">{stat.number}</span> · {stat.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
