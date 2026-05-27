'use client';

import type { ReactNode } from 'react';
import { WishlistProvider } from '../context/WishlistContext';

export default function Providers({ children }: { children: ReactNode }) {
  return <WishlistProvider>{children}</WishlistProvider>;
}
