"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, Variants, useReducedMotion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function InventoryHero() {
    const carouselRef = useRef<HTMLDivElement | null>(null)
    const trackRef = useRef<HTMLDivElement | null>(null)
    const slidesRef = useRef<HTMLDivElement[] | null>(null)
    const rafRef = useRef<number | null>(null)
    const intervalRef = useRef<number | null>(null)
    const [current, setCurrent] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const currentRef = useRef<number>(0)

    const SLIDE_DELAY = 6000

    const reduce = useReducedMotion()

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
                when: 'beforeChildren'
            }
        }
    }

    const itemVariant: Variants = {
        hidden: {
            opacity: 0,
            y: 30,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: reduce ? 0.3 : 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    }

    const slideVariants: Variants = {
        enter: {
            opacity: 0,
            scale: 0.95
        },
        center: {
            zIndex: 1,
            opacity: 1,
            scale: 1
        },
        exit: {
            zIndex: 0,
            opacity: 0,
            scale: 0.95
        }
    }

    const slidesData = [
        {
            title: 'Quality Used Cars',
            lead: 'Handpicked vehicles with warranty and local delivery.',
            bg: 'https://images.unsplash.com/photo-1682351963775-a1e1df0607f0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        },
        {
            title: 'Finance Available',
            lead: 'Flexible payment plans with quick approval.',
            bg: 'https://images.unsplash.com/photo-1630165356811-645a4914aaca?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        },
        {
            title: '6 Month Warranty',
            lead: 'Every vehicle inspected and fully guaranteed.',
            bg: 'https://images.unsplash.com/photo-1685091955352-4bb8796aef12?q=80&w=1071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        }
    ]

    // Enhanced carousel logic with direction tracking
    const [[page, direction], setPage] = useState([0, 0])

    // helper: lazy-load background image for a slide index
    const preload = useCallback((i: number) => {
        const slides = slidesRef.current
        if (!slides || !slides[i]) return
        const el = slides[i]
        if (el.dataset.loaded === '1') return
        const bg = el.dataset.bg
        if (!bg) { el.dataset.loaded = '1'; return }
        const img = new Image()
        img.src = bg
        img.onload = () => {
            el.style.backgroundImage = `url('${bg}')`
            el.dataset.loaded = '1'
        }
        img.onerror = () => { el.dataset.loaded = '1' }
    }, [])

    const paginate = useCallback((newDirection: number) => {
        const len = slidesData.length
        const newPage = (page + newDirection + len) % len
        setPage([newPage, newDirection])
        setCurrent(newPage)
        currentRef.current = newPage
    }, [page])

    const goToSlide = useCallback((index: number) => {
        const direction = index > page ? 1 : -1
        setPage([index, direction])
        setCurrent(index)
        currentRef.current = index
    }, [page])

    const next = useCallback(() => paginate(1), [paginate])
    const prev = useCallback(() => paginate(-1), [paginate])

    // Touch/swipe support removed for simpler design

    // Preload images on mount
    useEffect(() => {
        setIsLoading(true)
        const preloadImages = async () => {
            const promises = slidesData.map((slide, index) => {
                return new Promise<void>((resolve) => {
                    const img = new Image()
                    img.src = slide.bg
                    img.onload = () => resolve()
                    img.onerror = () => resolve() // Continue even if image fails
                })
            })
            await Promise.all(promises)
            setIsLoading(false)
        }
        preloadImages()
    }, [])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault()
                prev()
            } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                next()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [next, prev])

    return (
        <div className="inventory-hero" aria-label="Inventory carousel">
            <div className="container">
                <div
                    ref={carouselRef}
                    className="hero-carousel"
                    id="heroCarousel"
                    role="region"
                    aria-roledescription="carousel"
                    aria-label="Featured inventory slides"
                    tabIndex={0}
                >
                    {/* Loading overlay */}
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                className="loading-overlay"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Main carousel */}
                    <div className="carousel-wrapper" ref={trackRef}>
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={page}
                                className="carousel-slide"
                                data-bg={slidesData[page].bg}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    opacity: { duration: 0.5 },
                                    scale: { duration: 0.5 }
                                }}
                                style={{
                                    backgroundImage: `url('${slidesData[page].bg}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            >
                                {/* Gradient overlays */}
                                <div className="slide-overlay slide-overlay-primary" />
                                <div className="slide-overlay slide-overlay-secondary" />
                                <div className="slide-overlay slide-overlay-tertiary" />

                                <motion.div
                                    className="slide-inner"
                                    initial="hidden"
                                    animate="visible"
                                    variants={containerVariants}
                                >
                                    <div className="slide-content">
                                        <motion.div className="slide-header" variants={itemVariant}>
                                            <h1 className="slide-title">{slidesData[page].title}</h1>
                                        </motion.div>

                                        <motion.p className="slide-lead" variants={itemVariant}>
                                            {slidesData[page].lead}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation arrows */}
                    <button
                        className="carousel-nav carousel-prev"
                        onClick={() => { prev() }}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        className="carousel-nav carousel-next"
                        onClick={() => { next() }}
                        aria-label="Next slide"
                    >
                        <ChevronRight size={24} />
                    </button>

                </div>
            </div>
        </div>
    )
}
