import type { Metadata } from 'next';
import React from 'react';
import { getBrandForRequest } from './lib/brandDetection.server';
import { getThemeContextBundle } from '@/app/themes/context-registry';
import { ThemeShell } from '@/app/themes/ThemeShell';
import { resolveThemeIdFromBrand } from '@/app/themes/theme-selection';
import PreviewGate from '@/app/widgets/PreviewGate';
import PreviewAnalytics from '@/app/widgets/PreviewAnalytics';
import './globals.css';
import './styles/font-standardization.css';

export const dynamic = 'force-dynamic';

async function getBrandOnce() {
  const brandResult = await getBrandForRequest();
  if (!brandResult) {
    return null;
  }

  return { brand: brandResult.brand, brandResult };
}

export async function generateMetadata(): Promise<Metadata> {
  const brandResult = await getBrandOnce();
  
  if (!brandResult) {
    return {
      title: '404 - Not Found',
      description: 'The page you are looking for does not exist.',
      robots: 'noindex, nofollow',
    };
  }
  
  const { brand } = brandResult;
  const siteUrl = (brand?.domain || 'http://localhost:3000').replace(/\/$/, '');
  // Defensive: a partial brand (e.g. an API-created record that skipped the
  // scaffold) must never crash SSR here. Guard every optional deref.
  const seo = brand?.seo ?? {};
  const logo = brand?.logo || '/favicon.ico';
  const iconUrl = brand?.favicon || brand?.logo || '/favicon.ico';

  return {
    title: brand?.name,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: brand?.name,
      description: seo.description,
      url: siteUrl,
      siteName: brand?.name,
      images: [{
        url: logo,
        width: 1200,
        height: 630,
        alt: `${brand?.name ?? ''}`
      }],
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: brand?.name,
      description: seo.description,
      images: [logo],
      creator: seo.twitterHandle,
      site: seo.twitterHandle
    },
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: iconUrl,
    },
    alternates: {
      canonical: siteUrl
    }
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use cached brand result to avoid duplicate calls
  const brandResult = await getBrandOnce();
  
  if (!brandResult) {
    // Return 404 page if brand not found
    return (
      <html lang="en">
        <body>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            flexDirection: 'column',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <h1>404 - Brand Not Found</h1>
            <p>The domain you're accessing is not configured for this service.</p>
            <p>Please check the domain configuration or contact support.</p>
          </div>
        </body>
      </html>
    );
  }

  const { brand } = brandResult;
  const themeId = resolveThemeIdFromBrand(brand);
  const {
    BrandClientWrapper,
    BrandStyles,
    AuthProvider,
    DynamicFavicon,
  } = getThemeContextBundle(themeId);

  return (
    <html lang="en">
      <body data-theme-id={themeId}>
        {/* Warm up the Google Fonts connection early. Every theme pulls fonts
            from these two hosts (via @import or <link>); preconnecting saves the
            DNS+TLS round-trip off the critical path. React 19 hoists these to
            <head>. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Inject brand-specific CSS variables */}
        <BrandStyles brand={brand} />
        {/* Client wrapper that provides brand to all components */}
        <BrandClientWrapper brand={brand}>
          <AuthProvider>
            {/* Dynamic favicon that updates with cache-busting */}
            <DynamicFavicon />
            <PreviewGate brand={brand} />
            <PreviewAnalytics brand={brand} />
            <div className="brandstudio-preview-lock-target">
              <ThemeShell themeId={themeId}>{children}</ThemeShell>
            </div>
          </AuthProvider>
        </BrandClientWrapper>
      </body>
    </html>
  );
}
