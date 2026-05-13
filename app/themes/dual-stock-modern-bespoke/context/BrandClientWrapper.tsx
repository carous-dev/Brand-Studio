'use client';

import React, { createContext, useContext } from 'react';
import type { BrandConfig } from '@/brands/types';

const BrandContext = createContext<BrandConfig | null>(null);

interface BrandClientWrapperProps {
  children: React.ReactNode;
  brand: BrandConfig;
}

export function BrandClientWrapper({ children, brand }: BrandClientWrapperProps) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandConfig {
  const brand = useContext(BrandContext);
  if (!brand) {
    throw new Error(
      'useBrand must be used within a BrandClientWrapper. ' +
        'This means the brand was not properly detected on the server side. ' +
        'Check your domain configuration or middleware setup.',
    );
  }
  return brand;
}
