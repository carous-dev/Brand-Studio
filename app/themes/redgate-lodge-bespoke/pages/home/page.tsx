import { Suspense } from 'react'
import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import ProofLedger from '../../components/ProofLedger'
import FeaturedStock, { FeaturedStockSkeleton } from '../../components/FeaturedStock'
import AftercareSuite from '../../components/AftercareSuite'
import PxInvite from '../../components/PxInvite'
import Reviews from '../../components/Reviews'
import VisitLodge from '../../components/VisitLodge'

/**
 * Home page — Server Component. Composes the homepage from theme sections in
 * the design-language §7 route flow: hero (`bg`) → proof-ledger → featured →
 * aftercare → px-invite → reviews → visit-lodge. Interactivity lives inside the
 * client sections (Hero owns its own `'use client'`); this wrapper stays server.
 * ThemeChrome supplies the surrounding <main>, so sections render bare here.
 *
 * FeaturedStock fetches its cars server-side; wrapping it in <Suspense> lets the
 * six-skeleton loading state stream while inventory resolves.
 */
export function RedgateHomePage({ brand }: ThemePageProps) {
  return (
    <>
      <Hero />
      <ProofLedger brand={brand} />
      <Suspense fallback={<FeaturedStockSkeleton brand={brand} />}>
        <FeaturedStock brand={brand} />
      </Suspense>
      <AftercareSuite brand={brand} variant="home" />
      <PxInvite brand={brand} />
      <Reviews brand={brand} />
      <VisitLodge brand={brand} />
    </>
  )
}

export default RedgateHomePage
