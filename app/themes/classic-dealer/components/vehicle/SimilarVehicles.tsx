"use client"
import React from 'react'
import InventoryCard from '../InventoryCard'
import '../../styles/similar-vehicles.css'

export default function SimilarVehicles(props: any) {
    const { vehicle, similarList, simLoading } = props

    // Function to filter vehicles by similarity and get up to 3 items
    const getFilteredVehicles = () => {
        if (!similarList || similarList.length === 0) return []
        if (!vehicle) return similarList.slice(0, 3)

        const currentMake = String(vehicle.make || '').toLowerCase().trim()
        const currentModel = String(vehicle.model || '').toLowerCase().trim()

        // First filter: same make
        const sameMake = similarList.filter((v: any) => 
            String(v.make || '').toLowerCase().trim() === currentMake
        )

        // Second filter: same make and model
        const sameMakeAndModel = sameMake.filter((v: any) => 
            String(v.model || '').toLowerCase().trim() === currentModel
        )

        // Priority: return same make+model if available, otherwise same make, otherwise all
        let filtered = sameMakeAndModel.length > 0 ? sameMakeAndModel : sameMake
        if (filtered.length === 0) filtered = similarList

        // Return up to 3 items
        return filtered.slice(0, 3)
    }

    const displayList = getFilteredVehicles()

    return (
        <section className="similar-vehicles container" aria-label="Similar vehicles">
            <h3 className="section-title">Similar Vehicles</h3>
            <div className="similar-slider">
                {simLoading ? (
                    <div className="sim-loading-text">Loading similar vehicles…</div>
                ) : displayList && displayList.length > 0 ? (
                    displayList.map((vehicle: any) => (
                        <InventoryCard 
                            key={vehicle.reg || vehicle.id} 
                            vehicle={vehicle}
                        />
                    ))
                ) : (
                    <div className="muted">No similar vehicles found.</div>
                )}
            </div>
        </section>
    )
}
