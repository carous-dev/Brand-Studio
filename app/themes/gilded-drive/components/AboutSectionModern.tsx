"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, MapPin, Award, Clock, Heart, ArrowRight, Star, Shield, Car } from 'lucide-react';
import "../styles/about-modern.css";
import { useBrand } from '../context/BrandClientWrapper'

const AboutSectionModern = () => {
    const [activeTab, setActiveTab] = useState(0);
    const brand = useBrand()
    const brandName = brand?.name || 'our dealership'
    const city = brand?.location?.address?.city || brand?.location?.city || 'your area'

    const timeline = [
        { year: '2010', title: 'Founded', description: `${brandName} established with a vision to provide quality used cars in ${city}` },
        { year: '2015', title: 'Expansion', description: 'Expanded our inventory and added comprehensive warranty options' },
        { year: '2020', title: 'Digital Transformation', description: 'Launched online platform with instant valuations and virtual tours' },
        { year: '2024', title: 'Excellence', description: `Recognized as one of ${city}'s most trusted dealerships` }
    ];

    const values = [
        {
            icon: Shield,
            title: 'Quality Assurance',
            description: 'Every vehicle undergoes rigorous inspection by certified technicians',
            color: 'var(--accent)'
        },
        {
            icon: Heart,
            title: 'Customer First',
            description: 'We build lasting relationships through transparency and exceptional service',
            color: 'var(--accent-2)'
        },
        {
            icon: Award,
            title: 'Expertise',
            description: '15+ years of experience in the automotive industry',
            color: 'var(--accent)'
        },
        {
            icon: Users,
            title: 'Community',
            description: `Proudly serving ${city} and surrounding areas`,
            color: 'var(--accent-2)'
        }
    ];

    const stats = [
        { value: '5000+', label: 'Happy Customers', icon: Users },
        { value: '15+', label: 'Years Experience', icon: Clock },
        { value: '4.9/5', label: 'Customer Rating', icon: Star },
        { value: '200+', label: 'Vehicles in Stock', icon: Car }
    ];

    return (
        <div className="about-section">
            {/* Modern Hero Section - Dark Theme */}
            <section className="about-hero-modern">
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
                            <Award className="badge-icon" size={16} />
                            <span>Since 2010</span>
                        </div>
                        
                        <h1 className="hero-title">
                            {brandName}
                            <span className="title-highlight"> Trusted Excellence</span>
                        </h1>
                        
                        <p className="hero-description">
                            For over 15 years, we've been {city}'s trusted destination for quality used vehicles. 
                            Our family-run dealership combines traditional values with modern convenience, 
                            ensuring every customer drives away with confidence and peace of mind.
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
                    </motion.div>
                </div>
            </section>

            {/* Story Section - Light Theme */}
            <section className="about-story-modern">
                <div className="container">
                    <motion.div 
                        className="story-content"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="story-header">
                            <h2 className="section-title">Our Story</h2>
                            <p className="section-subtitle">
                                From a small family business to {city}'s trusted automotive partner
                            </p>
                        </div>
                        
                        <div className="timeline-grid">
                            {timeline.map((item, index) => (
                                <motion.div 
                                    key={index}
                                    className="timeline-item"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <div className="timeline-year">{item.year}</div>
                                    <div className="timeline-content">
                                        <h3 className="timeline-title">{item.title}</h3>
                                        <p className="timeline-description">{item.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section - Dark Theme */}
            <section className="about-values-modern">
                <div className="container">
                    <motion.div 
                        className="values-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="section-title">Our Values</h2>
                        <p className="section-subtitle">
                            The principles that guide everything we do
                        </p>
                    </motion.div>
                    
                    <div className="values-grid">
                        {values.map((value, index) => (
                            <motion.div 
                                key={index}
                                className="value-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                style={{ '--value-color': value.color } as React.CSSProperties}
                            >
                                <div className="value-icon-wrapper">
                                    <value.icon className="value-icon" size={28} />
                                    <div className="icon-glow"></div>
                                </div>
                                <h3 className="value-title">{value.title}</h3>
                                <p className="value-description">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section - Light Theme */}
            <section className="about-features-modern">
                <div className="container">
                    <motion.div 
                        className="features-content"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="features-grid">
                            <div className="features-text">
                                <h2 className="section-title">Why Choose {brandName}?</h2>
                                <p className="section-subtitle">
                                    We're not just selling cars – we're building relationships and delivering peace of mind.
                                </p>
                                
                                <div className="feature-list">
                                    <div className="feature-item">
                                        <CheckCircle className="feature-check" size={20} />
                                        <div>
                                            <strong>Thorough Inspections</strong>
                                            <span>Every vehicle undergoes comprehensive safety and mechanical checks</span>
                                        </div>
                                    </div>
                                    
                                    <div className="feature-item">
                                        <Shield className="feature-check" size={20} />
                                        <div>
                                            <strong>Warranty Protection</strong>
                                            <span>Extended warranty options for complete peace of mind</span>
                                        </div>
                                    </div>
                                    
                                    <div className="feature-item">
                                        <MapPin className="feature-check" size={20} />
                                        <div>
                                            <strong>Local Service</strong>
                                            <span>Conveniently located in {city} with flexible collection options</span>
                                        </div>
                                    </div>
                                    
                                    <div className="feature-item">
                                        <Users className="feature-check" size={20} />
                                        <div>
                                            <strong>Expert Team</strong>
                                            <span>Friendly, knowledgeable staff dedicated to helping you</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="features-actions">
                                    <motion.a 
                                        href="/used-cars" 
                                        className="btn btn-primary"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Browse Our Vehicles
                                        <ArrowRight size={18} className="btn-arrow" />
                                    </motion.a>
                                    <motion.a 
                                        href="/contact" 
                                        className="btn btn-secondary"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Visit Our Showroom
                                    </motion.a>
                                </div>
                            </div>
                            
                            <motion.div 
                                className="features-visual"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <div className="visual-image">
                                    <img 
                                        src="https://images.unsplash.com/photo-1711436977389-8f1205f45f30?q=70&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                        alt={`${brandName} showroom`}
                                        loading="lazy"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section - Light Theme */}
            <section className="about-cta-modern">
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
                            <span>Ready to Find Your Perfect Car?</span>
                        </div>
                        
                        <h2 className="cta-title">
                            Visit {brandName} Today
                            <span className="title-highlight"> Experience the Difference</span>
                        </h2>
                        
                        <p className="cta-description">
                            Discover why thousands of {city} drivers trust us for their automotive needs. 
                            Our friendly team is ready to help you find the perfect vehicle with transparent pricing 
                            and flexible financing options.
                        </p>
                        
                        <div className="cta-actions">
                            <motion.a 
                                href="/used-cars" 
                                className="btn btn-primary btn-large"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Browse Inventory
                                <ArrowRight size={20} className="btn-arrow" />
                            </motion.a>
                            <motion.a 
                                href="/contact" 
                                className="btn btn-secondary btn-large"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Get Directions
                            </motion.a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AboutSectionModern;
