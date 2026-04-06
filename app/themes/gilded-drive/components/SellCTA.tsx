"use client"

import { ArrowRight } from 'lucide-react'
import "../styles/sell-your-car-modern.css";

export default () => {
    return (
        <section className="sell-cta-minimal">
            <div className="container">
                <div className="cta-content">
                    <h2>Ready to sell your car?</h2>
                    <p>Get a free valuation in seconds</p>
                    <button 
                        className="cta-button"
                        onClick={() => document.getElementById('registration')?.focus()}
                    >
                        Get Your Valuation
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </section>
    )
}
