"use client"

import { motion } from "framer-motion"
import "../styles/brands-partners.css"

const brandItems = [
  {
    id: "mercedes",
    label: "Mercedes-Benz",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mercedes.svg",
  },
  {
    id: "landrover",
    label: "Land Rover",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/landrover.svg",
  },
  {
    id: "porsche",
    label: "Porsche",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/porsche.svg",
  },
  {
    id: "audi",
    label: "Audi",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/audi.svg",
  },
  {
    id: "astonmartin",
    label: "Aston Martin",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/astonmartin.svg",
  },
  {
    id: "volkswagen",
    label: "Volkswagen",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/volkswagen.svg",
  },
  {
    id: "ford",
    label: "Ford",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ford.svg",
  },
  {
    id: "bmw",
    label: "BMW",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/bmw.svg",
  },
]

const BrandsPartners = () => {
  return (
    <motion.section
      className="brands-partners-section brand-search"
      aria-label="Search by brand"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="brand-search__inner">
        <h2 className="brand-search__title">Search By Brand</h2>

        <div className="brand-search__row">
          <ul className="brand-search__list" role="list">
            {brandItems.map((brand) => (
              <li key={brand.id}>
                <a className={`brand-pill brand-pill--${brand.id}`} href="/used-cars" aria-label={brand.label}>
                  <img
                    className="brand-pill__logo"
                    src={brand.logo}
                    alt={`${brand.label} logo`}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  )
}

export default BrandsPartners
