'use client';

import React, { createContext, useContext } from 'react';
import type { BrandConfig } from '@/brands/types';

const BrandContext = createContext<BrandConfig | null>(null);

interface BrandClientWrapperProps {
  children: React.ReactNode;
  brand: BrandConfig;
}

/**
 * Client wrapper that receives brand from server and provides it to all client components
 * This ensures client components (Header, Footer, etc.) can access brand data without fallbacks
 */
export function BrandClientWrapper({ children, brand }: BrandClientWrapperProps) {
  return (
    <BrandContext.Provider value={brand}>
      {children}
    </BrandContext.Provider>
  );
}

/**
 * Hook for client components to access brand data
 * NO FALLBACKS - will throw error if brand is not available
 * This ensures strict server-side brand detection
 */
export function useBrand(): BrandConfig {
  const brand = useContext(BrandContext);
  
  if (!brand) {
    throw new Error(
      'useBrand must be used within a BrandClientWrapper. ' +
      'This means the brand was not properly detected on the server side. ' +
      'Check your domain configuration or middleware setup.'
    );
  }
  
  return brand;
}
