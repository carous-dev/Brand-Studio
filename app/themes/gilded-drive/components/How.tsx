"use client"

import { Search, FileText, DollarSign, ArrowRight } from 'lucide-react'
import "../styles/sell-your-car-modern.css";

export default () => {
    return (
        <section className="how-section" aria-labelledby="how-heading">
            <div className="how-section__band">
                <div className="container how-section__band-inner">
                    <h2 id="how-heading" className="how-section__title">How It Works</h2>
                    <p className="how-section__subtitle">Sell your car in three simple steps - no hassle, no hidden fees</p>
                </div>
            </div>

            <div className="container how-section__cards">
                <div className="how-card">
                    <div className="how-card__body">
                        <div className="how-card__icon" aria-hidden="true">
                            <Search className="how-card__icon-svg" />
                        </div>
                        <h3 className="how-card__title">Enter Your Details</h3>
                        <p className="how-card__desc">Provide your registration number and mileage for an instant, free valuation in seconds.</p>
                        <div className="how-card__features">
                            <span className="feature-tag">Instant Results</span>
                            <span className="feature-tag">Free Service</span>
                        </div>
                    </div>
                </div>

                <div className="how-card">
                    <div className="how-card__body">
                        <div className="how-card__icon" aria-hidden="true">
                            <FileText className="how-card__icon-svg" />
                        </div>
                        <h3 className="how-card__title">Choose Your Option</h3>
                        <p className="how-card__desc">Review your valuation and choose to accept our offer, book an inspection, or request a video appraisal.</p>
                        <div className="how-card__features">
                            <span className="feature-tag">Flexible Options</span>
                            <span className="feature-tag">Expert Support</span>
                        </div>
                    </div>
                </div>

                <div className="how-card">
                    <div className="how-card__body">
                        <div className="how-card__icon" aria-hidden="true">
                            <DollarSign className="how-card__icon-svg" />
                        </div>
                        <h3 className="how-card__title">Get Paid Fast</h3>
                        <p className="how-card__desc">We collect your car and process payment on the same day. No waiting, no delays.</p>
                        <div className="how-card__features">
                            <span className="feature-tag">Same-Day Payment</span>
                            <span className="feature-tag">Free Collection</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="how-section__disclaimer container" aria-hidden="false">
                <p className="how-section__disclaimer-text">
                    <strong>Transparent Process:</strong> Valuations are indicative and subject to verification, inspection and final agreement. No obligation to sell.
                </p>
            </div>
        </section>
    )
}
