'use client';

export default function BrandsSlider() {
  const brands = [
    { name: 'BMW', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/bmw.svg' },
    { name: 'Mercedes-Benz', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mercedes.svg' },
    { name: 'Audi', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/audi.svg' },
    { name: 'Toyota', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/toyota.svg' },
    { name: 'Honda', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/honda.svg' },
    { name: 'Volkswagen', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/volkswagen.svg' },
    { name: 'Ford', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ford.svg' },
    { name: 'Nissan', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nissan.svg' },
    { name: 'Hyundai', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/hyundai.svg' },
    { name: 'Kia', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/kia.svg' },
    { name: 'Land Rover', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/landrover.svg' },
    { name: 'Jaguar', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/jaguar.svg' },
  ];

  // Duplicate brands for seamless loop
  const duplicatedBrands = [...brands, ...brands.slice(0, 5)];

  return (
    <section className="brands-section" data-aos="fade-up">
      <div className="container">
        <div className="brands-slider-container">
          <div className="brands-slider" id="brands-slider">
            {duplicatedBrands.map((brand, index) => (
              <div key={`${brand.name}-${index}`} className="brand-logo">
                <img src={brand.icon} alt={brand.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
