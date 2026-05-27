'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

const WISHLIST_STORAGE_KEY = 'cnh_cars_wishlist_v1';

export interface WishlistItem {
  id: string;
  reg?: string;
  slug?: string;
  make: string;
  model: string;
  derivative?: string;
  year?: number;
  price?: number | string;
  mileage?: number;
  trans?: string;
  fuel?: string;
  image?: string;
}

export type WishlistVehicleInput = Omit<WishlistItem, 'id'> & { id?: string };

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  isInWishlist: (id: string) => boolean;
  addItem: (item: WishlistVehicleInput) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistVehicleInput) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export const getWishlistVehicleId = (vehicle: { id?: string; slug?: string; reg?: string }): string | null => {
  if (vehicle.id?.trim()) return vehicle.id.trim();
  if (vehicle.slug?.trim()) return `slug:${vehicle.slug.trim()}`;
  if (vehicle.reg?.trim()) return `reg:${vehicle.reg.trim().toUpperCase()}`;
  return null;
};

const normalizeWishlistItem = (item: WishlistVehicleInput, id: string): WishlistItem => ({
  id,
  reg: item.reg,
  slug: item.slug,
  make: item.make?.trim() || 'Unknown',
  model: item.model?.trim() || 'Vehicle',
  derivative: item.derivative,
  year: item.year,
  price: item.price,
  mileage: item.mileage,
  trans: item.trans,
  fuel: item.fuel,
  image: item.image
});

const hydrateWishlist = (value: string): WishlistItem[] => {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.reduce<WishlistItem[]>((acc, rawItem) => {
      if (!rawItem || typeof rawItem !== 'object') return acc;

      const candidate = rawItem as Partial<WishlistItem>;
      const id = typeof candidate.id === 'string' ? candidate.id : '';
      const make = typeof candidate.make === 'string' ? candidate.make : '';
      const model = typeof candidate.model === 'string' ? candidate.model : '';

      if (!id || !make || !model) return acc;
      if (acc.some((item) => item.id === id)) return acc;

      acc.push({
        id,
        make,
        model,
        reg: typeof candidate.reg === 'string' ? candidate.reg : undefined,
        slug: typeof candidate.slug === 'string' ? candidate.slug : undefined,
        derivative: typeof candidate.derivative === 'string' ? candidate.derivative : undefined,
        year: typeof candidate.year === 'number' ? candidate.year : undefined,
        price: typeof candidate.price === 'number' || typeof candidate.price === 'string' ? candidate.price : undefined,
        mileage: typeof candidate.mileage === 'number' ? candidate.mileage : undefined,
        trans: typeof candidate.trans === 'string' ? candidate.trans : undefined,
        fuel: typeof candidate.fuel === 'string' ? candidate.fuel : undefined,
        image: typeof candidate.image === 'string' ? candidate.image : undefined
      });

      return acc;
    }, []);
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      setItems(hydrateWishlist(stored));
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [items, hasHydrated]);

  const isInWishlist = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items]
  );

  const addItem = useCallback((item: WishlistVehicleInput) => {
    const id = getWishlistVehicleId(item);
    if (!id) return;

    setItems((prev) => {
      if (prev.some((existing) => existing.id === id)) return prev;
      return [normalizeWishlistItem(item, id), ...prev];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleItem = useCallback((item: WishlistVehicleInput) => {
    const id = getWishlistVehicleId(item);
    if (!id) return;

    setItems((prev) => {
      if (prev.some((existing) => existing.id === id)) {
        return prev.filter((existing) => existing.id !== id);
      }
      return [normalizeWishlistItem(item, id), ...prev];
    });
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      isInWishlist,
      addItem,
      removeItem,
      toggleItem,
      clearWishlist
    }),
    [items, isInWishlist, addItem, removeItem, toggleItem, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
