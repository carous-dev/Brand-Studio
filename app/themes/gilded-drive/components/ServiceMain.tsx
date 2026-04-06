"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, DollarSign, Shield, Car, ArrowRight, CheckCircle, Star, Clock, MapPin } from 'lucide-react';
import '../styles/services.css';

export default () => {
    const [expandedFaq, setExpandedFaq] = useState(0);
    const [hoveredService, setHoveredService] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setExpandedFaq(expandedFaq === index ? -1 : index);
    };

    const services = [
        {
            icon: Wrench,
            title: 'Servicing & Repairs',
            description: 'Expert diagnostics, MOT preparation, and scheduled maintenance by certified technicians.',
            features: ['Full diagnostics', 'MOT preparation', 'Manufacturer servicing'],
            link: '/car-service/',
            color: 'var(--accent)'
        },
        {
            icon: DollarSign,
            title: 'Finance & Insurance',
            description: 'Flexible financing options and comprehensive insurance solutions for every budget.',
            features: ['Competitive rates', 'Quick approval', 'Tailored plans'],
            link: '/finance/',
            color: 'var(--accent-2)'
        },
        {
            icon: Shield,
            title: 'Warranty & Protection',
            description: 'Extended warranties and protection plans for complete peace of mind.',
            features: ['Up to 3 years', 'Comprehensive cover', '24/7 support'],
            link: '/warranty/',
            color: 'var(--accent)'
        },
        {
            icon: Car,
            title: 'Valuation & Trade-In',
            description: 'Instant vehicle valuations and fair trade-in offers with quick processing.',
            features: ['Instant quotes', 'Fair prices', 'Quick payment'],
            link: '/sell-your-car/',
            color: 'var(--accent-2)'
        }
    ];

    const stats = [
        { value: '15+', label: 'Years Experience', icon: Clock },
        { value: '5000+', label: 'Happy Customers', icon: CheckCircle },
        { value: '4.9/5', label: 'Customer Rating', icon: Star },
        { value: '24h', label: 'Quick Service', icon: MapPin }
    ];

    return (
        <>
            {/* Modern Hero Section */}
            <section className="services-hero-modern">
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                    <div className="hero-pattern"></div>
                </div>
                
                <div className="container">
                    <motion.div 
                        className="hero-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <div className="hero-badge">
                            <Shield className="badge-icon" size={16} />
                            <span>Professional Vehicle Services</span>
                        </div>
                        
                        <h1 className="hero-title">
                            Expert Vehicle Care You Can
                            <span className="title-highlight"> Trust</span>
                        </h1>
                        
                        <p className="hero-description">
                            From routine maintenance to complex repairs, financing, and warranty protection — 
                            we deliver comprehensive automotive services with transparency and expertise.
                        </p>
                        
                        <div className="hero-stats">
                            {stats.map((stat, index) => (
                                <motion.div 
                                    key={index}
                                    className="stat-item"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                                >
                                    <stat.icon className="stat-icon" size={20} />
                                    <div className="stat-content">
                                        <div className="stat-value">{stat.value}</div>
                                        <div className="stat-label">{stat.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        
                        <div className="hero-actions">
                            <motion.a 
                                href="#servicesGrid" 
                                className="btn btn-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Explore Services
                                <ArrowRight size={18} className="btn-arrow" />
                            </motion.a>
                            <motion.a 
                                href="/contact/" 
                                className="btn btn-secondary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Book Consultation
                            </motion.a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Modern Services Grid */}
            <section id="servicesGrid" className="services-modern" aria-label="Services offered">
                <div className="container">
                    <motion.div 
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="section-title">Our Premium Services</h2>
                        <p className="section-subtitle">
                            Comprehensive automotive solutions delivered with expertise and cutting-edge technology
                        </p>
                    </motion.div>
                    
                    <div className="services-grid-modern">
                        {services.map((service, index) => (
                            <motion.article 
                                key={index}
                                className={`service-card-modern ${hoveredService === index ? 'hovered' : ''}`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                onMouseEnter={() => setHoveredService(index)}
                                onMouseLeave={() => setHoveredService(null)}
                                style={{ '--service-color': service.color } as React.CSSProperties}
                            >
                                <div className="service-header">
                                    <div className="service-icon-wrapper">
                                        <service.icon className="service-icon" size={28} />
                                        <div className="icon-glow"></div>
                                    </div>
                                    <h3 className="service-title">{service.title}</h3>
                                </div>
                                
                                <p className="service-description">{service.description}</p>
                                
                                <div className="service-features">
                                    {service.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="feature-item">
                                            <CheckCircle size={14} className="feature-check" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <a href={service.link} className="service-link">
                                    Learn more
                                    <ArrowRight size={16} className="link-arrow" />
                                </a>
                                
                                <div className="card-decoration"></div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modern CTA Section */}
            <section className="cta-modern" aria-label="Ready to get started">
                <div className="cta-background">
                    <div className="cta-gradient"></div>
                    <div className="cta-pattern"></div>
                </div>
                
                <div className="container">
                    <motion.div 
                        className="cta-content"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="cta-badge">
                            <Car className="badge-icon" size={16} />
                            <span>Quality Vehicles</span>
                        </div>
                        
                        <h2 className="cta-title">
                            Ready to Drive Away in Your
                            <span className="title-highlight"> Dream Car?</span>
                        </h2>
                        
                        <p className="cta-description">
                            Explore our carefully curated selection of premium used vehicles. 
                            Each car undergoes rigorous inspection, comes with clear history checks, 
                            and includes competitive financing and warranty options.
                        </p>
                        
                        <div className="cta-features">
                            <div className="cta-feature">
                                <CheckCircle size={20} className="feature-icon" />
                                <span>Thoroughly Inspected</span>
                            </div>
                            <div className="cta-feature">
                                <Shield size={20} className="feature-icon" />
                                <span>Warranty Included</span>
                            </div>
                            <div className="cta-feature">
                                <DollarSign size={20} className="feature-icon" />
                                <span>Best Price Guarantee</span>
                            </div>
                        </div>
                        
                        <div className="cta-actions">
                            <motion.a 
                                href="/used-cars/" 
                                className="btn btn-primary btn-large"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Browse Available Cars
                                <ArrowRight size={20} className="btn-arrow" />
                            </motion.a>
                            <motion.a 
                                href="/contact/" 
                                className="btn btn-secondary btn-large"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Book Test Drive
                            </motion.a>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="faq-futuristic container" aria-labelledby="faqHeading">
                <div className="faq-header">
                    <h2 id="faqHeading" className="section-title">Frequently Asked Questions</h2>
                    <p className="section-sub muted">Quick answers to common questions — use the search to find what you need.</p>
                </div>
                <div className="faq-accordion" role="list" aria-live="polite">
                    <div className="faq-item" role="listitem">
                        <button className="faq-toggle" aria-expanded={expandedFaq === 0} aria-controls="faq-1" id="faq-1-btn" onClick={() => toggleFaq(0)}>
                            <span className="faq-title">What does a full service include?</span>
                                <svg className="faq-caret" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                        </button>
                        <div id="faq-1" className="faq-panel" role="region" aria-labelledby="faq-1-btn" hidden={expandedFaq !== 0}>
                            <p>Our full service includes a multi-point inspection, fluids top-up, brake and tyre checks, parts condition report and recommendations. We also provide an itemised invoice with any suggested repairs.</p>
                        </div>
                    </div>

                    <div className="faq-item" role="listitem">
                        <button className="faq-toggle" aria-expanded={expandedFaq === 1} aria-controls="faq-2" id="faq-2-btn" onClick={() => toggleFaq(1)}>
                            <span className="faq-title">Do you offer courtesy cars?</span>
                                <svg className="faq-caret" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                        </button>
                        <div id="faq-2" className="faq-panel" role="region" aria-labelledby="faq-2-btn" hidden={expandedFaq !== 1}>
                            <p>Courtesy cars are available subject to availability—please request one at the time of booking. We can often reserve a small car for customers during routine services.</p>
                        </div>
                    </div>

                    <div className="faq-item" role="listitem">
                        <button className="faq-toggle" aria-expanded={expandedFaq === 2} aria-controls="faq-3" id="faq-3-btn" onClick={() => toggleFaq(2)}>
                            <span className="faq-title">How long does a typical service take?</span>
                                <svg className="faq-caret" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                        </button>
                        <div id="faq-3" className="faq-panel" role="region" aria-labelledby="faq-3-btn" hidden={expandedFaq !== 2}>
                            <p>Most standard services take between 1.5 and 3 hours depending on the vehicle and any additional work required. MOTs and larger repairs may take longer — we'll give you an estimate when you book.</p>
                        </div>
                    </div>

                    <div className="faq-item" role="listitem">
                        <button className="faq-toggle" aria-expanded={expandedFaq === 3} aria-controls="faq-4" id="faq-4-btn" onClick={() => toggleFaq(3)}>
                            <span className="faq-title">What warranty options do you offer?</span>
                                <svg className="faq-caret" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                        </button>
                        <div id="faq-4" className="faq-panel" role="region" aria-labelledby="faq-4-btn" hidden={expandedFaq !== 3}>
                            <p>We provide several warranty packages and extended coverage options. Visit our Warranty page for plan details and eligibility, or contact our team for a personalised quote.</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
