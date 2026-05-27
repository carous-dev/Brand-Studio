'use client';

import { Handshake, RefreshCw, Truck } from 'lucide-react';
import { useBrand } from '../context/BrandClientWrapper';
import { getBrandContactInfo } from '../lib/contact';

export default function Hero() {
  const brand = useBrand();
  const contact = getBrandContactInfo(brand);
  const cityLabel = contact.showroomCity || 'our';
  const leadCopy = `Discover hand-picked vehicles backed by clear pricing, friendly advice, and nationwide delivery support from ${cityLabel === 'our' ? 'our team' : `our ${cityLabel} team`}.`;

  return (
    <section id="home" className="home-hero">
      <div className="home-hero-overlay" aria-hidden="true" />
      <div className="home-hero-content">
        <ul className="home-hero-trust" aria-label="Dealership highlights">
          <li className="home-hero-trust-item">
            <Handshake className="home-hero-trust-icon" aria-hidden="true" />
            <span>Family-run dealership</span>
          </li>
          <li className="home-hero-trust-item">
            <RefreshCw className="home-hero-trust-icon" aria-hidden="true" />
            <span>Part exchange welcome</span>
          </li>
          <li className="home-hero-trust-item">
            <Truck className="home-hero-trust-icon" aria-hidden="true" />
            <span>Nationwide delivery support</span>
          </li>
        </ul>

        <h1 className="home-hero-title">Quality Used Cars With Honest, Local Service</h1>
        <p className="home-hero-lead">{leadCopy}</p>

        <form className="home-hero-search" method="GET" action="/used-cars" aria-label="Search used car stock">
          <div className="home-hero-fields">
            <div className="home-hero-field">
              <select name="make" defaultValue="" aria-label="Choose make">
                <option value="">Any make</option>
                <option value="Audi">Audi</option>
                <option value="BMW">BMW</option>
                <option value="Ford">Ford</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="Volkswagen">Volkswagen</option>
              </select>
            </div>
            <div className="home-hero-field">
              <select name="model" defaultValue="" aria-label="Choose model">
                <option value="">Any model</option>
                <option value="A3">A3</option>
                <option value="A-Class">A-Class</option>
                <option value="3 Series">3 Series</option>
                <option value="Focus">Focus</option>
                <option value="Golf">Golf</option>
              </select>
            </div>
            <div className="home-hero-field">
              <select name="price" defaultValue="" aria-label="Choose price range">
                <option value="">Any price</option>
                <option value="5000-10000">GBP 5,000 - 10,000</option>
                <option value="10000-15000">GBP 10,000 - 15,000</option>
                <option value="15000-20000">GBP 15,000 - 20,000</option>
                <option value="20000-30000">GBP 20,000 - 30,000</option>
              </select>
            </div>
            <div className="home-hero-field">
              <select name="transmission" defaultValue="" aria-label="Choose transmission">
                <option value="">Any type</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>
          <button type="submit" className="home-hero-search-btn">Search used cars</button>
        </form>
      </div>
    </section>
  );
}
