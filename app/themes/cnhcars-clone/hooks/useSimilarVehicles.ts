'use client';

// audit-ignore-file: data-useeffect-fetch — similar-vehicles fetch is keyed
// off the current vehicle's slug which is only known after page render.
// Legitimate per SKILL.md Pitfall row 14.
import { useState, useEffect } from 'react'
import { apiUrl } from '../lib/api'

interface SimilarVehicle {
    reg: string;
    make: string;
    model: string;
    derivative?: string;
    year: number;
    price: number;
    mileage: number;
    trans: string;
    fuel: string;
    body_type?: string;
    image: string;
    images?: string[];
    description: string;
    slug?: string;
    stock_status?: string;
}

interface UseSimilarVehiclesOptions {
    limit?: number;
    enabled?: boolean;
}

export function useSimilarVehicles(
    identifier: string | null,
    options: UseSimilarVehiclesOptions = {}
) {
    const { limit = 6, enabled = true } = options
    const [similarVehicles, setSimilarVehicles] = useState<SimilarVehicle[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!identifier || !enabled) {
            setSimilarVehicles([])
            setError(null)
            return
        }

        const fetchSimilarVehicles = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await fetch(
                    apiUrl(`/vehicle/similar?slug=${encodeURIComponent(identifier)}&limit=${limit}`)
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch similar vehicles: ${response.statusText}`)
                }

                const data = await response.json()
                setSimilarVehicles(data.items || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error occurred')
                setSimilarVehicles([])
            } finally {
                setLoading(false)
            }
        }

        fetchSimilarVehicles()
    }, [identifier, limit, enabled])

    return { similarVehicles, loading, error }
}
