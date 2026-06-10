"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import "../styles/hero.css";

export const Hero: React.FC = () => {
    const router = useRouter()
    const brand = useBrand()
    
    const heroContent = brand.pages?.home?.hero || {
        title: 'Find Quality Used Cars',
        description: 'Browse our hand-picked inventory of quality used vehicles with specialist health checks.',
        cta: 'Start Your Search',
    }
    const [makes, setMakes] = useState<string[]>([])
    const [models, setModels] = useState<string[]>([])
    const [years, setYears] = useState<number[]>([])
    const [prices, setPrices] = useState<number[]>([])
    const [selectedMake, setSelectedMake] = useState('')
    const [selectedModel, setSelectedModel] = useState('')
    const [selectedYear, setSelectedYear] = useState('')
    const [selectedPrice, setSelectedPrice] = useState('')

    useEffect(() => {
        // Fetch makes, years, and prices from API
        const fetchPresets = async () => {
            try {
                const res = await fetch('/api/vehicles?makes=true')
                const data = await res.json()
                if (data.makes) setMakes(data.makes)
                if (data.years) setYears(data.years)
                if (data.prices) setPrices(data.prices)
            } catch (err) {
                console.error('Error fetching vehicle presets:', err)
            }
        }
        fetchPresets()
    }, [])

    useEffect(() => {
        // Fetch models when make is selected
        if (selectedMake) {
            const fetchModels = async () => {
                try {
                    const res = await fetch(`/api/vehicles?make=${encodeURIComponent(selectedMake)}`)
                    const data = await res.json()
                    if (data.models) setModels(data.models)
                } catch (err) {
                    console.error('Error fetching models:', err)
                }
            }
            fetchModels()
        } else {
            setModels([])
            setSelectedModel('')
        }
    }, [selectedMake])

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (selectedMake) params.append('make', selectedMake)
        if (selectedModel) params.append('model', selectedModel)
        if (selectedYear) params.append('year', selectedYear)
        if (selectedPrice) params.append('price', selectedPrice)
        
        router.push(`/used-cars?${params.toString()}`)
    }

    // Generate price ranges from dynamic prices
    const priceRanges = prices.length > 0
        ? [
            { label: 'Any Price', value: '' },
            ...prices.slice(0, -1).map((p, i) => ({
              label: `£${p.toLocaleString()} - £${prices[i + 1].toLocaleString()}`,
              value: `${p}-${prices[i + 1]}`
            })),
            { label: `£${prices[prices.length - 1].toLocaleString()}+`, value: `${prices[prices.length - 1]}` }
          ]
        : [{ label: 'Any Price', value: '' }]

    return (
        <motion.div
            className="hero-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <div className="hero-overlay" />

            <div className="hero-wrapper">
                <div className="hero-content">
                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        {heroContent.title}
                    </motion.h1>

                    <motion.p
                        className="hero-description"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    >
                        {heroContent.description}
                    </motion.p>
                </div>

                <motion.div
                    className="hero-search-container"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                >
                    <div className="search-form">
                        <div className="search-field">
                            <label htmlFor="brand">Brand</label>
                            <select 
                                id="brand"
                                value={selectedMake} 
                                onChange={(e) => setSelectedMake(e.target.value)}
                                className="search-input"
                            >
                                <option value="">Select Brand</option>
                                {makes.map((make) => (
                                    <option key={make} value={make}>{make}</option>
                                ))}
                            </select>
                        </div>

                        <div className="search-field">
                            <label htmlFor="model">Model</label>
                            <select 
                                id="model"
                                value={selectedModel} 
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="search-input"
                                disabled={!selectedMake}
                            >
                                <option value="">Select Model</option>
                                {models.map((model) => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                        </div>

                        <div className="search-field">
                            <label htmlFor="year">Year</label>
                            <select 
                                id="year"
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="search-input"
                            >
                                <option value="">Any Year</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div className="search-field">
                            <label htmlFor="price">Price</label>
                            <select 
                                id="price"
                                value={selectedPrice} 
                                onChange={(e) => setSelectedPrice(e.target.value)}
                                className="search-input"
                            >
                                {priceRanges.map((range) => (
                                    <option key={range.value} value={range.value}>{range.label}</option>
                                ))}
                            </select>
                        </div>

                        <motion.button
                            className="search-btn"
                            onClick={handleSearch}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Search size={20} />
                            <span>Search</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default Hero
