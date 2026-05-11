'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type SavedVehicle = {
  id: string
  title: string
  slug?: string
  reg?: string
  year: number
  price: number
  mileage: number
  fuel: string
  transmission: string
  body: string
  make: string
  color: string
  doors: number
  location: string
  image: string
}

type GarageState = {
  wishlist: SavedVehicle[]
  compare: SavedVehicle[]
}

type GarageContextValue = {
  wishlist: SavedVehicle[]
  compare: SavedVehicle[]
  wishlistCount: number
  compareCount: number
  isWishlisted: (id: string) => boolean
  isCompared: (id: string) => boolean
  toggleWishlist: (vehicle: SavedVehicle) => void
  toggleCompare: (vehicle: SavedVehicle) => void
  removeWishlist: (id: string) => void
  removeCompare: (id: string) => void
  clearWishlist: () => void
  clearCompare: () => void
}

// Storage key keyed per-brand at runtime so multi-tenant deployments don't share state.
function storageKeyFor(brandSlug: string): string {
  const safe = String(brandSlug || 'default').toLowerCase().replace(/[^a-z0-9-]/g, '-')
  return `ele-car-sales-bespoke:${safe}:garage-v1`
}

const GarageContext = createContext<GarageContextValue | null>(null)

const normalizeList = (items: SavedVehicle[]) => {
  const seen = new Set<string>()
  const output: SavedVehicle[] = []
  items.forEach((item) => {
    if (!item?.id || seen.has(item.id)) return
    seen.add(item.id)
    output.push(item)
  })
  return output
}

export function GarageProvider({ children, brandSlug }: { children: React.ReactNode; brandSlug: string }) {
  const STORAGE_KEY = storageKeyFor(brandSlug)
  const [state, setState] = useState<GarageState>({ wishlist: [], compare: [] })
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as GarageState
        setState({
          wishlist: normalizeList(Array.isArray(parsed?.wishlist) ? parsed.wishlist : []),
          compare: normalizeList(Array.isArray(parsed?.compare) ? parsed.compare : []),
        })
      }
    } catch (error) {
      console.warn('Failed to load garage state', error)
    } finally {
      setHasLoaded(true)
    }
  }, [STORAGE_KEY])

  useEffect(() => {
    if (typeof window === 'undefined' || !hasLoaded) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to persist garage state', error)
    }
  }, [STORAGE_KEY, state, hasLoaded])

  const isWishlisted = useCallback((id: string) => state.wishlist.some((item) => item.id === id), [state.wishlist])
  const isCompared = useCallback((id: string) => state.compare.some((item) => item.id === id), [state.compare])

  const toggleWishlist = useCallback((vehicle: SavedVehicle) => {
    setState((prev) => {
      const exists = prev.wishlist.some((item) => item.id === vehicle.id)
      const wishlist = exists
        ? prev.wishlist.filter((item) => item.id !== vehicle.id)
        : normalizeList([...prev.wishlist, vehicle])
      return { ...prev, wishlist }
    })
  }, [])

  const toggleCompare = useCallback((vehicle: SavedVehicle) => {
    setState((prev) => {
      const exists = prev.compare.some((item) => item.id === vehicle.id)
      const compare = exists
        ? prev.compare.filter((item) => item.id !== vehicle.id)
        : normalizeList([...prev.compare, vehicle])
      return { ...prev, compare }
    })
  }, [])

  const removeWishlist = useCallback((id: string) => {
    setState((prev) => ({ ...prev, wishlist: prev.wishlist.filter((item) => item.id !== id) }))
  }, [])

  const removeCompare = useCallback((id: string) => {
    setState((prev) => ({ ...prev, compare: prev.compare.filter((item) => item.id !== id) }))
  }, [])

  const clearWishlist = useCallback(() => {
    setState((prev) => ({ ...prev, wishlist: [] }))
  }, [])

  const clearCompare = useCallback(() => {
    setState((prev) => ({ ...prev, compare: [] }))
  }, [])

  const value = useMemo<GarageContextValue>(
    () => ({
      wishlist: state.wishlist,
      compare: state.compare,
      wishlistCount: state.wishlist.length,
      compareCount: state.compare.length,
      isWishlisted,
      isCompared,
      toggleWishlist,
      toggleCompare,
      removeWishlist,
      removeCompare,
      clearWishlist,
      clearCompare,
    }),
    [state, isWishlisted, isCompared, toggleWishlist, toggleCompare, removeWishlist, removeCompare, clearWishlist, clearCompare],
  )

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>
}

export function useGarage() {
  const ctx = useContext(GarageContext)
  if (!ctx) {
    throw new Error('useGarage must be used within GarageProvider')
  }
  return ctx
}
