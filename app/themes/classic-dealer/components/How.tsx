"use client"

import { useBrand } from '../context/BrandClientWrapper'

type ProcessStep = { title: string; description: string }

export default function How() {
    const brand = useBrand()
    const sellYourCarContent = brand.pages?.sellYourCar || {}
    const processContent = sellYourCarContent.process || {
        title: 'How It Works',
        steps: [
            {
                title: 'Get Your Instant Valuation',
                description: 'Enter your car\'s registration, mileage, and condition for an instant specialist valuation.'
            },
            {
                title: 'Choose Your Option',
                description: 'Accept our offer, book a specialist health check inspection, or request a video appraisal from our team.'
            },
            {
                title: 'Sell & Get Paid',
                description: 'We collect your car at our location and process payment the same day. Part exchange available for upgrading to another vehicle.'
            }
        ]
    }
    const processSteps = (processContent.steps || []) as ProcessStep[]

    return (
        <section className="how-section" aria-labelledby="how-heading">
            <div className="how-section__band">
                <div className="container how-section__band-inner">
                    <h2 id="how-heading" className="how-section__title">How to Sell Your Car at {brand.name}</h2>
                </div>
            </div>


            <div className="container how-section__cards">
                {processSteps.map((step: ProcessStep, index: number) => (
                    <div key={index} className="how-card">
                        <div className="how-card__badge"><span className="how-card__badge-num">{index + 1}</span></div>
                        <div className="how-card__body">
                            <div className="how-card__icon" aria-hidden="true">
                                {index === 0 && (
                                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="how-card__icon-svg"><rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth={1.5} /><path d="M7 11h10" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
                                )}
                                {index === 1 && (
                                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="how-card__icon-svg"><path d="M12 2v20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /><path d="M5 9h14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
                                )}
                                {index === 2 && (
                                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="how-card__icon-svg"><path d="M4 12h16" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /><path d="M8 16h8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
                                )}
                            </div>
                            <h3 className="how-card__title">{step.title}</h3>
                            <p className="how-card__desc">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="how-section__disclaimer container" aria-hidden="false">
                <p className="how-section__disclaimer-text">Disclaimer: Valuations and timescales shown are indicative and subject to verification, inspection and final agreement.</p>
            </div>
        </section>
    )
}
