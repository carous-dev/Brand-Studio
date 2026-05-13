# dual-stock-modern-bespoke — Component Checklist

Theme id: `dual-stock-modern-bespoke`
Archetype: `modern`
Generated: 2026-05-12T17:17:33.175Z
Source of truth: `.claude/skills/new-theme/Checklist.md`

## Shipped (Phase 8 — 2026-05-12)

**Build complete.** Audit: 0 blockers, 43 advisories (mostly intentional dark-tier neutrals).
TypeScript: clean. Palette policy: 11/11 contrast pairs pass AA.

What ships in this theme:

- **Chrome**: sticky header with announcement bar + top contact bar + mega nav + mobile drawer
  + full-screen search overlay (with `/` keyboard shortcut); mega footer with quick links + Carous credit;
  bespoke `<DualStockCookieBanner>` with three categories.
- **Homepage**: dual-stock hero (cars / bikes / all type tabs, reg lookup, make+price selects),
  live `<StatsBar>` (vehicles / cars / bikes / years counts), `<FeaturedStock>` with parallel
  Cars and Bikes rails, `<ServiceHighlights>` 6-card grid, `<BrandTrust>` chip cluster for
  car + bike marques, dark `<RecentlySoldRail>` with sold treatment, `<Testimonials>`,
  `<CtaBand>` (sell my car / sell my bike), all wrapped in motion (data-aos + brand-tinted glows).
- **Inventory list (`/used-cars`)**: All / Cars / Bikes type tabs, full filter set (make, body,
  fuel, transmission, max price, min year, max mileage, sort), grid with `<VehicleCard>` (bike vs
  car aware — engine_size + body for bikes; transmission + doors for cars), pagination.
- **Vehicle detail (`/used-cars/<slug>`)**: full-bleed mosaic gallery (main + 4-thumb mosaic +
  lightbox), 6-cell quick-specs strip (dark band), bike-vs-car aware specifications + finance
  block, sticky sidebar (price + Enquire + Call/Email/WhatsApp grid), mobile sticky bar,
  Similar vehicles row (filtered by make), Browse-by-make SEO panel, mounted `<EnquiryModal>`,
  WhatsApp uses official `<WhatsAppIcon>` (not generic chat glyph).
- **Inner pages**: about (story + values + stats), contact (channels + topics + hours +
  enquiry modal), services (cars + bikes service grids), finance (3-step + 4 products),
  part-exchange (cross-category trade-in), sell-your-car (mounts global `<SellYourCarWidget>`),
  compare (side-by-side table with up to 3 vehicles), wishlist (saved vehicles), privacy +
  cookie policies, recently-sold (filtered by type).
- **Plumbing**: 7-slot brand-image var chain (hero special-cased via `brand.heroImage` first,
  others via `brand.images.<slot>`, all with theme-default jpeg fallback layered in CSS),
  inventory normaliser detects bike vs car via type / make / body, GarageContext drives
  wishlist + compare with per-brand localStorage, AOS + MotionFX + ScrollProgress + WhatsApp +
  PreviewBanner wired in Shell.

**Intentionally not implemented** (require backing infrastructure):

- 360° / video preview (no video URL field in inventory schema)
- AI smart search (no embeddings backend)
- Saved searches across visits (would need user accounts)
- Exit-intent popups + scarcity / countdown timers (UX trade-off, not built)
- Multi-language switcher (English-only deployment)

These remain `[ ]` below as a record.

## How to use this file

- This file is the **definition of done** for Phase 8 of `/new-theme`.
- Every required item is rendered as `[ ]`. Tick to `[x]` as each component lands.
- Optional items show an `(optional)` suffix — skip unless your archetype calls for them.
- Do NOT invent components from elsewhere. The canonical source is `Checklist.md`.
- The theme is not shippable until every required item is `[x]`.


## Advanced Modern Vehicle Dealership Website Checklist

### Global Website Structure

- [ ] Sticky Header
- [ ] Announcement Bar
- [ ] Top Contact Bar
- [ ] Mega Navigation Menu
- [ ] Mobile Navigation Drawer
- [ ] Search Overlay
- [ ] Breadcrumb Navigation
- [ ] Footer Mega Footer
- [ ] Floating CTA Buttons
- [ ] WhatsApp Chat Button
- [ ] Cookie Consent Banner
- [ ] Accessibility Toolbar
- [ ] Language Switcher _(optional)_
- [ ] Dark/Light Mode Toggle _(optional)_

## Homepage Components

### Hero Section(Combinations of any)

- [ ] Fullscreen Hero Banner
- [ ] Video Background _(optional)_
- [ ] Vehicle Showcase Slider
- [ ] Animated Headlines
- [ ] Vehicle Search Form
- [ ] CTA Buttons
- [ ] Finance CTA
- [ ] Live Inventory Counter _(optional)_
- [ ] Trust Badges
- [ ] Quick Contact Options

### Advanced Vehicle Search

- [ ] Registration Lookup
- [ ] Make/Model Search
- [ ] Body Type Filter
- [ ] Price Range Slider
- [ ] Monthly Payment Filter
- [ ] Fuel Type Filter
- [ ] Transmission Filter
- [ ] Mileage Filter
- [ ] Year Filter
- [ ] Color Filter
- [ ] ULEZ Compliance Filter _(optional)_
- [ ] EV/Hybrid Filter
- [ ] Drive Type Filter
- [ ] Keyword Search
- [ ] Saved Searches
- [ ] AI Smart Search _(optional)_

### Featured Stock Section(Any component or best combination)

- [ ] Featured Vehicles Carousel
- [ ] Recently Added Vehicles
- [ ] Hot Deals
- [ ] Price Reduced Vehicles
- [ ] Finance Friendly Cars
- [ ] Electric Vehicles _(optional)_
- [ ] Premium Vehicles
- [ ] Commercial Vehicles _(optional)_
- [ ] Compare Vehicles Button
- [ ] Wishlist/Favorites

### Vehicle Card Components

- [ ] Vehicle Image Gallery
- [ ] 360° Preview
- [ ] Video Preview
- [ ] Vehicle Title
- [ ] Price
- [ ] Finance From Price
- [ ] Monthly Payments
- [ ] Registration Plate
- [ ] Mileage
- [ ] Fuel Type
- [ ] Transmission
- [ ] Engine Size
- [ ] Horsepower
- [ ] Body Type
- [ ] Doors/Seats
- [ ] ULEZ Status
- [ ] Warranty Badge
- [ ] Dealer Rating _(optional)_
- [ ] Save Vehicle Button _(optional)_
- [ ] Compare Button
- [ ] Reserve Vehicle Button
- [ ] CTA Buttons
- [ ] Finance Eligibility
- [ ] Availability Status
- [ ] Vehicle Tags

## Vehicle Detail Page Components

### Vehicle Gallery

- [ ] HD Image Gallery _(optional)_
- [ ] Zoom Viewer _(optional)_
- [ ] Fullscreen Gallery _(optional)_
- [ ] 360° Spin Viewer _(optional)_
- [ ] Interior/Exterior Tabs _(optional)_
- [ ] Video Walkaround _(optional)_
- [ ] Drone Video _(optional)_
- [ ] Before/After Preparation Images _(optional)_

### Vehicle Information

- [ ] Full Specifications _(optional)_
- [ ] VIN Information _(optional)_
- [ ] Registration Year _(optional)_
- [ ] Mileage _(optional)_
- [ ] Owners History _(optional)_
- [ ] Service History _(optional)_
- [ ] MOT Status _(optional)_
- [ ] Road Tax Information _(optional)_
- [ ] Fuel Economy _(optional)_
- [ ] Emissions Data _(optional)_
- [ ] Safety Ratings _(optional)_
- [ ] Running Costs _(optional)_
- [ ] Insurance Group _(optional)_
- [ ] Performance Stats _(optional)_
- [ ] Vehicle Features List _(optional)_
- [ ] Optional Extras _(optional)_
- [ ] Technical Specifications _(optional)_

### Finance Components

- [ ] Finance Calculator _(optional)_
- [ ] PCP Calculator _(optional)_
- [ ] HP Calculator _(optional)_
- [ ] Deposit Slider _(optional)_
- [ ] Term Slider _(optional)_
- [ ] Credit Score Checker _(optional)_
- [ ] Soft Credit Check _(optional)_
- [ ] Apply for Finance Form _(optional)_
- [ ] Finance Eligibility Checker _(optional)_
- [ ] Monthly Payment Estimator _(optional)_
- [ ] Finance Comparison Table _(optional)_

### Lead Generation Components

- [ ] Enquiry Form _(optional)_
- [ ] Call Back Request _(optional)_
- [ ] WhatsApp Enquiry _(optional)_
- [ ] Reserve Online _(optional)_
- [ ] Part Exchange Form _(optional)_
- [ ] Book Test Drive _(optional)_
- [ ] Video Call Booking _(optional)_
- [ ] Trade-In Valuation _(optional)_
- [ ] Live Chat _(optional)_
- [ ] AI Chat Assistant _(optional)_

### Trust & Social Proof

- [ ] Customer Reviews _(optional)_
- [ ] Google Reviews Integration _(optional)_
- [ ] AutoTrader Reviews _(optional)_
- [ ] Trustpilot Reviews _(optional)_
- [ ] Video Testimonials _(optional)_
- [ ] Dealer Awards _(optional)_
- [ ] Certifications _(optional)_
- [ ] Warranty Information _(optional)_
- [ ] FCA Compliance Badges _(optional)_
- [ ] Dealer Statistics _(optional)_
- [ ] Years in Business Counter _(optional)_

## Inventory Pages

### Vehicle Listing Page

- [ ] Grid/List Toggle _(optional)_
- [ ] Advanced Filtering _(optional)_
- [ ] Sorting Options _(optional)_
- [ ] Infinite Scroll _(optional)_
- [ ] Pagination _(optional)_
- [ ] Quick Compare _(optional)_
- [ ] Sticky Filters _(optional)_
- [ ] Saved Filters _(optional)_
- [ ] Recently Viewed Vehicles _(optional)_
- [ ] Recommended Vehicles _(optional)_
- [ ] AI Vehicle Recommendations _(optional)_

## Services Pages

### Dealer Services

- [ ] Vehicle Finance _(optional)_
- [ ] Part Exchange _(optional)_
- [ ] Warranty _(optional)_
- [ ] Nationwide Delivery _(optional)_
- [ ] Vehicle Sourcing _(optional)_
- [ ] Car Buying Service _(optional)_
- [ ] Sell Your Car _(optional)_
- [ ] MOT Services _(optional)_
- [ ] Servicing _(optional)_
- [ ] Repairs _(optional)_
- [ ] Detailing _(optional)_
- [ ] Ceramic Coating _(optional)_
- [ ] Insurance Services _(optional)_
- [ ] Gap Insurance _(optional)_
- [ ] Breakdown Cover _(optional)_

## Conversion Components

### High Conversion Features

- [ ] Exit Intent Popups _(optional)_
- [ ] Finance Approval CTA _(optional)_
- [ ] Sticky Mobile CTA Bar _(optional)_
- [ ] Scarcity Indicators _(optional)_
- [ ] Recently Viewed Popups _(optional)_
- [ ] Stock Alert Notifications _(optional)_
- [ ] Price Drop Alerts _(optional)_
- [ ] Back-in-Stock Alerts _(optional)_
- [ ] Countdown Timers _(optional)_
- [ ] Lead Magnets _(optional)_

## Media & Content

### Content Marketing

- [ ] Blog System _(optional)_
- [ ] News Section _(optional)_
- [ ] Buying Guides _(optional)_
- [ ] Video Library _(optional)_
- [ ] FAQ System _(optional)_
- [ ] Dealer Stories _(optional)_
- [ ] Vehicle Reviews _(optional)_
- [ ] SEO Landing Pages _(optional)_

## Advanced Modern UI Components

### Premium UI Features

- [ ] Glassmorphism Cards _(optional)_
- [ ] Smooth Animations _(optional)_
- [ ] Scroll-Based Animations _(optional)_
- [ ] Micro Interactions _(optional)_
- [ ] Interactive Hover Effects _(optional)_
- [ ] Animated Counters _(optional)_
- [ ] Parallax Sections _(optional)_
- [ ] Dynamic Gradients _(optional)_
- [ ] Custom Cursor Effects _(optional)_
- [ ] Motion Transitions _(optional)_
- [ ] Skeleton Loaders _(optional)_
- [ ] Modern Typography _(optional)_

## Mobile Experience

### Mobile-First Components

- [ ] Sticky Mobile CTAs _(optional)_
- [ ] Swipeable Galleries _(optional)_
- [ ] Mobile Finance Calculator _(optional)_
- [ ] Tap-to-Call _(optional)_
- [ ] Mobile Search Overlay _(optional)_
- [ ] Progressive Web App _(optional)_
- [ ] Offline Support _(optional)_
