"use client"

import { useBrand } from '../context/BrandClientWrapper'

function SellCTA() {
    const brand = useBrand()
    const sellContent = (brand.pages?.sellYourCar ?? {}) as Record<string, unknown>
    const ctaContent = (sellContent.cta ?? {}) as Record<string, unknown>
    const eyebrow = typeof ctaContent.eyebrow === 'string' && ctaContent.eyebrow.trim().length > 0
        ? ctaContent.eyebrow
        : 'Sell with confidence'
    const headline = typeof ctaContent.headline === 'string' && ctaContent.headline.trim().length > 0
        ? ctaContent.headline
        : `Ready to sell your car at ${brand.name}? Let's make it straightforward.`
    const actionLabel = typeof ctaContent.actionLabel === 'string' && ctaContent.actionLabel.trim().length > 0
        ? ctaContent.actionLabel
        : 'Get your valuation'

    return (
        <section className="sell-cta-underline">
            <div className="container cta-inner">
                <div className="cta-copy">
                    <p className="cta-eyebrow">{eyebrow}</p>
                    <h2>{headline}</h2>
                </div>
                <div className="cta-actions">
                    <a className="btn btn-neon large" href="#sellForm">{actionLabel}</a>
                </div>
            </div>
        </section>
    )
}

export default SellCTA
