import type { Metadata } from 'next';
import Layout from '../../components/Layout';
import Hero from '../../components/Hero';
import BrandsSlider from '../../components/BrandsSlider';
import Stats from '../../components/Stats';
import FeaturedCars from '../../components/FeaturedCars';
import About from '../../components/About';
import Testimonials from '../../components/Testimonials';
import Contact from '../../components/Contact';
import { buildPageMetadata } from '../../lib/seo';
import '../../styles/hero-modern.css';
import '../../styles/stats.css';
import '../../styles/featured.css';
import '../../styles/about.css';
import '../../styles/testimonials.css';
import '../../styles/contact.css';
import '../../styles/home-typography.css';

export const metadata: Metadata = buildPageMetadata({
  title: 'Used Cars in Welwyn, Hertfordshire',
  description:
    'Browse quality used cars from CNH Cars Ltd in Welwyn, Hertfordshire. Honest advice, clear vehicle details, and UK-wide delivery support.',
  path: '/',
  keywords: [
    'used cars welwyn hertfordshire',
    'car dealership welwyn',
    'buy used car hertfordshire',
    'quality used vehicles',
  ],
});

export default function Home() {
  return (
    <Layout>
      <Hero />
      <BrandsSlider />
      <Stats />
      <FeaturedCars />
      <About />
      <Testimonials />
      <Contact />
    </Layout>
  );
}
