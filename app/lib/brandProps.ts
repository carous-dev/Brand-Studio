/**
 * Brand Props Utility
 * 
 * Instead of using React Context (which creates hydration issues),
 * we pass brand as props to components that need it.
 * 
 * This approach:
 * 1. Eliminates client-side context dependency
 * 2. Prevents hydration mismatches
 * 3. Ensures brand is always fresh from server
 * 4. Makes data flow explicit and predictable
 */

import React from 'react';
import type { BrandConfig } from '@/brands/types';

/**
 * Higher-order component to inject brand props
 * Use this for client components that need brand data
 */
export function withBrand<P extends { brand?: BrandConfig }>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, 'brand'> & { brand: BrandConfig }> {
  return function BrandWrappedComponent(props: Omit<P, 'brand'> & { brand: BrandConfig }) {
    const componentProps = props as P;
    return React.createElement(Component, componentProps);
  };
}

/**
 * Hook for server components to get brand
 * Server components should get brand directly from getBrandForRequest()
 */
export function useServerBrand(): never {
  throw new Error(
    'useServerBrand is not needed. ' +
    'Server components should call getBrandForRequest() directly. ' +
    'Client components should receive brand as props.'
  );
}

/**
 * Type helper for components that accept brand props
 */
export type WithBrandProps<P = {}> = P & {
  brand: BrandConfig;
};

/**
 * Type helper for optional brand props
 */
export type WithOptionalBrandProps<P = {}> = P & {
  brand?: BrandConfig;
};
