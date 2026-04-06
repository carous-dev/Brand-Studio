"use client"
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/vehicle.css";
import "../styles/used.css";
// Similar vehicles are now provided by a server endpoint; no full-list client fetch needed
import { Share2, Heart, FileText } from 'lucide-react'
import Gallery from './vehicle/Gallery'
import useGallery from './vehicle/useGallery'
import Summary from './vehicle/Summary'
import Details from './vehicle/Details'
import SimilarVehicles from './vehicle/SimilarVehicles'

export default function Vehicle({ vehicle: vehicleProp, images, similarList: similarListProp, fetchRemote }: { vehicle: any; images?: string[]; similarList?: any[]; fetchRemote?: boolean }) {
    function normalizeImageUrl(url?: string) {
        if (!url) return ""
        try {
            let s = String(url)
            // convert encoded placeholders to the literal token
            s = s.replace(/%7Bresize%7D/ig, '{resize}')
            s = s.replace(/%7bresize%7d/ig, '{resize}')
            // Remove size segments like '/1200x800/' or the placeholder '/{resize}/' so src points to canonical media
            return s.replace(/\/(?:\d+x\d+|\{resize\})\//g, '/')
        } catch {
            return String(url)
        }
    }

    function normalizeIncoming(vIn: any, altImages?: string[]) {
        if (!vIn) return {} as any

        // already-compact shape (legacy)
        if (!vIn.vehicle && (!Array.isArray(vIn.features) || (vIn.features.length && typeof vIn.features[0] === 'string'))) {
            // ensure images array exists
            const imgArr = Array.isArray(altImages) && altImages.length ? altImages.map(normalizeImageUrl) : (Array.isArray(vIn.images) ? vIn.images.map(normalizeImageUrl) : (vIn.image ? [normalizeImageUrl(vIn.image)] : []))
            return { ...vIn, images: imgArr }
        }

        // grouped API shape
        const api = vIn as any
        const vRow = api.vehicle || {}
        const advert = api.advert || {}
        const advertiser = api.advertiser || {}
        const mk = api.make || {}
        const mo = api.model || {}

        const features = Array.isArray(api.features) ? api.features.map((f: any) => (f && (f.name || f.label) ? String(f.name || f.label) : String(f || ''))) : []

        // Collect candidate image URLs from multiple possible API fields.
        // Priority: altImages (explicit prop) -> api.images (array of strings) -> api.media.href/url -> vRow.image
        const candidateUrls: string[] = []
        if (Array.isArray(altImages) && altImages.length) {
            altImages.forEach((u: any) => { if (u) candidateUrls.push(String(u)) })
        } else if (Array.isArray(api.images) && api.images.length) {
            api.images.forEach((u: any) => { if (u) candidateUrls.push(String(u)) })
        } else if (Array.isArray(api.media) && api.media.length) {
            api.media.forEach((m: any) => { const raw = m?.href ?? m?.url ?? ''; if (raw) candidateUrls.push(String(raw)) })
        } else if (vRow.image) {
            candidateUrls.push(String(vRow.image))
        }

        // Normalize and dedupe while preserving order; remove any `{resize}` or WxH segments
        const seenImgs = new Set<string>()
        const imagesFinal: string[] = []
        candidateUrls.forEach((u) => {
            try {
                const n = normalizeImageUrl(u)
                if (!n) return
                if (!seenImgs.has(n)) { seenImgs.add(n); imagesFinal.push(n) }
            } catch (e) { /* ignore invalid */ }
        })

        const mileage = vRow.odometer_reading_miles ?? vRow.mileage ?? vRow.odometer
        const year = vRow.year_of_manufacture ?? (vRow.first_registration_date ? (new Date(vRow.first_registration_date).getFullYear()) : vRow.year)

        // owners
        const ownersVal = (api.vehicle_history && (api.vehicle_history.previous_owners_count != null)) ? api.vehicle_history.previous_owners_count : (vRow.previous_owners_count ?? vRow.previousOwnersCount ?? vRow.owners)

        // doors
        const doorsVal = vRow.doors ?? vRow.door_count ?? vRow.number_of_doors

        // body type
        const bodyTypeVal = vRow.body_type || vRow.bodyType || vRow.body || vRow.body_style

        // colour
        const colorVal = vRow.colour || vRow.color || vRow.exterior_color || vRow.exteriorColour

        // engine capacity - prefer cc fields, produce friendly string (L or cc)
        const engineCc = (vRow.engine_capacity_cc ?? vRow.engine_capacity ?? vRow.engineSizeCc ?? vRow.engine_size_cc ?? vRow.engine_size)
        const engineLitresFromRow = vRow.engine_capacity_litres ?? vRow.engine_capacity_litre ?? vRow.engine_capacity_l
        let engineDisplay: any = undefined
        if (engineCc != null && !isNaN(Number(engineCc))) {
            const cc = Number(engineCc)
            const litres = +(cc / 1000)
            // show one decimal if <10L, else integer
            engineDisplay = litres < 10 ? `${(Math.round(litres * 10) / 10).toFixed(1)}L` : `${Math.round(litres)}L`
        } else if (engineLitresFromRow != null && !isNaN(Number(engineLitresFromRow))) {
            const l = Number(engineLitresFromRow)
            engineDisplay = l < 10 ? `${(Math.round(l * 10) / 10).toFixed(1)}L` : `${Math.round(l)}L`
        } else if (vRow.engineCapacity) {
            engineDisplay = String(vRow.engineCapacity)
        }

        // shortDescription: prefer existing short field, else derive excerpt from description
        const descText = vRow.description || vRow.details || vRow.long_description || ''
        const shortDesc = (vRow.shortDescription || vRow.summary || vRow.short_description) || (descText ? (descText.length > 120 ? descText.slice(0, 117).trim() + '…' : descText) : '')

        const compact: any = {
            vin: vRow.vin || vRow.VIN,
            reg: vRow.registration || vRow.reg || vRow.registration_number,
            registration: vRow.registration || vRow.reg,
            make: mk.name || vRow.make || vRow.brand,
            model: mo.name || vRow.model,
            year: year,
            derivative: vRow.derivative || vRow.trim || vRow.derivative_name,
            derivative_slug: vRow.derivative_slug,
            price: advert.forecourt_price_gbp || advert.supplied_price_gbp || vRow.price || vRow.price_gbp || vRow.list_price,
            attention_grabber: advert.attention_grabber || vRow.attention_grabber || advert.attentionGrabber,
            advertiser: advertiser,
            description: descText,
            shortDescription: shortDesc,
            features: features,
            images: imagesFinal,
            image: imagesFinal.length ? imagesFinal[0] : (vRow.image || ''),
            mileage: mileage,
            owners: ownersVal,
            bodyType: bodyTypeVal,
            engineCapacity: engineDisplay,
            engineCapacityLitres: engineLitresFromRow ?? (engineCc ? Number(engineCc) / 1000 : undefined),
            enginePower: vRow.engine_power_bhp || vRow.engine_power || vRow.power,
            co2: vRow.co2_emission_gpkm || vRow.co2,
            trans: vRow.transmission_type || vRow.trans || vRow.gearbox,
            fuel: vRow.fuel_type || vRow.fuel || vRow.fuelType,
            doors: doorsVal,
            color: colorVal,
            advert_id: vRow.original_id || advert.advert_id,
        }
        // preserve any categorized specs from the API response so downstream
        // components (Details) can consume them even when we return a compact shape
        compact.specs = api.specs ?? vRow.specs ?? null
        return compact
    }

    // initialize mutable vehicle variable used throughout component
    let vehicle: any = normalizeIncoming(vehicleProp, images)

    // remote fetch for canonical vehicle data (uses new server API) — only when explicitly requested
    const [remoteVehicle, setRemoteVehicle] = useState<any | null>(null);
    // trigger used to re-run the remote fetch effect when retrying
    const [remoteFetchTrigger, setRemoteFetchTrigger] = useState(0)
    useEffect(() => {
        if (!fetchRemote) return; // skip unless caller explicitly asks for remote fetch
        let mounted = true;
        async function fetchVehicle() {
            try {
                if (!vehicle) return;
                const param = vehicle?.reg ? `reg=${encodeURIComponent(vehicle.reg)}` : `slug=${encodeURIComponent(((vehicle?.make || '') + '-' + (vehicle?.model || '') + '-' + (vehicle?.reg || vehicle?.year || '')))}`;
                const res = await fetch(`/api/vehicle?${param}`);
                if (!res.ok) return;
                const data = await res.json();
                if (!mounted) return;
                if (data && data.vehicle) setRemoteVehicle(data.vehicle);
            } catch (e) {
                // silently ignore, keep using passed-in vehicle
            }
        }
        fetchVehicle();
        return () => { mounted = false; }
    }, [fetchRemote, vehicle?.reg, vehicle?.make, vehicle?.model, vehicle?.year, remoteFetchTrigger]);

    // Track view event when component mounts
    useEffect(() => {
        if (vehicle?.advert_id) {
            fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    advert_id: vehicle.advert_id,
                    event_type: 'view',
                    user_agent: navigator.userAgent,
                    referrer: document.referrer
                })
            }).catch(error => {
                console.error('Failed to track view:', error)
            })
        }
    }, [vehicle?.advert_id])

    if (remoteVehicle) vehicle = remoteVehicle as any
    const fallbackImg = vehicle?.image || ''
    const imgs = useMemo(() => {
        // Prefer images returned on the vehicle object (API `images` array)
        if (vehicle && Array.isArray(vehicle.images) && vehicle.images.length) return vehicle.images.map(normalizeImageUrl)
        if (images && images.length) return images.map(normalizeImageUrl)
        if (fallbackImg) return [normalizeImageUrl(fallbackImg)]
        return []
    }, [vehicle, images, fallbackImg])

    // Derive display URLs for different sizes — source URLs are canonical and do not include `{resize}`
    // If needed, callers can request different sizes via explicit CDN parameters, but we return raw media URLs.
    const displayImgs = useMemo(() => {
        if (!imgs || !imgs.length) return []
        return imgs.map((u: string) => String(u))
    }, [imgs])
    const thumbImgs = useMemo(() => {
        if (!imgs || !imgs.length) return []
        return imgs.map((u: string) => String(u))
    }, [imgs])

    const gallery = useGallery({ imgs, displayImgs, fetchRemote, vehicleProp, remoteVehicle })
    const {
        index,
        prev,
        next,
        openLightbox,
        galleryLoading,
        longLoading,
        handleThumbClick,
        lbOpen,
        lbIndex,
        closeLightbox,
        setLbIndex,
        mainRef,
        lbCloseRef,
        handleMainImageLoad,
        setGalleryLoading,
        setLongLoading,
        lbImageLoading,
        setLbImageLoading
    } = gallery

    function handleRetry() {
        try {
            setLongLoading(false)
            if (fetchRemote) {
                setRemoteVehicle(null)
                setRemoteFetchTrigger((n: number) => n + 1)
            } else {
                try { window.location.reload() } catch (e) { /* noop */ }
            }
        } catch (e) { /* noop */ }
    }

    function fmtPrice(p: any) { if (p == null || p === '') return '—'; const n = Number(p); if (!Number.isFinite(n)) return String(p); return `£${n.toLocaleString()}` }
    function fmtMileage(m: any) { const n = Number(m); if (!Number.isFinite(n)) return '—'; return `${n.toLocaleString()} mi` }

    const features: string[] = Array.isArray(vehicle?.features) ? vehicle.features : []

    function findSpecsIn(obj: any, depth = 3): any | null {
        if (!obj || depth < 0) return null
        if (Array.isArray(obj.specs) && obj.specs.length) return obj.specs
        for (const k of Object.keys(obj)) {
            try {
                const v = obj[k]
                if (Array.isArray(v) && k.toLowerCase().includes('spec')) return v
                if (v && typeof v === 'object') {
                    const found = findSpecsIn(v, depth - 1)
                    if (found) return found
                }
            } catch { /* ignore */ }
        }
        return null
    }

    const specs = findSpecsIn(vehicle) || vehicle?.specs || vehicle?.vehicle?.specs || {}
    const chipIcons = useMemo(() => ({
        Year: (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth={1.6}></rect><path d="M16 2v4M8 2v4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"></path></svg>
        ),
        Owners: (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth={1.6}></circle><path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"></path></svg>
        ),
        Body: (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="7" width="20" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth={1.6}></rect><circle cx="7" cy="18" r="1.8" fill="none" stroke="currentColor" strokeWidth={1.6}></circle><circle cx="17" cy="18" r="1.8" fill="none" stroke="currentColor" strokeWidth={1.6}></circle></svg>
        ),
        Engine: (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth={1.6}></rect><path d="M19 8v8" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"></path></svg>
        ),
        Mileage: (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" fill="none" stroke="currentColor" strokeWidth={1.6}></path><path d="M12 12l4-4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"></path></svg>
        ),
        Transmission: (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 3v18" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"></path><path d="M12 3v18" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"></path><path d="M18 3v18" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"></path></svg>
        ),
        Fuel: (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="3" width="12" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth={1.6}></rect><path d="M15 7h4v8" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"></path></svg>
        ),
        Doors: (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="4" y="3" width="12" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth={1.6}></rect><circle cx="9" cy="12" r="0.9" fill="currentColor"></circle></svg>
        ),
        Colour: (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2a8 8 0 1 0 8 8A8 8 0 0 0 12 2z" fill="none" stroke="currentColor" strokeWidth={1.6}></path></svg>
        )
    }), [vehicle]);

    // Chip tooltip
    useEffect(() => {
        let tip = document.getElementById('chipTooltip') as HTMLDivElement | null;
        if (!tip) {
            tip = document.createElement('div'); tip.id = 'chipTooltip'; tip.className = 'chip-tooltip'; tip.setAttribute('role', 'tooltip'); tip.style.position = 'fixed'; tip.style.pointerEvents = 'none'; tip.style.opacity = '0'; tip.style.visibility = 'hidden'; document.body.appendChild(tip);
        }
        return () => { if (tip && tip.parentNode) tip.parentNode.removeChild(tip); }
    }, [])

    function showChipTooltip(target: Element, html: string) {
        const tip = document.getElementById('chipTooltip') as HTMLDivElement | null; if (!tip) return; tip.innerHTML = html || ''; tip.style.opacity = '1'; tip.style.visibility = 'visible'; const r = (target as HTMLElement).getBoundingClientRect(); const top = Math.max(8, r.top - 8 - tip.offsetHeight); const left = Math.min(window.innerWidth - tip.offsetWidth - 8, Math.max(8, r.left + (r.width / 2) - (tip.offsetWidth / 2))); tip.style.top = (top) + 'px'; tip.style.left = (left) + 'px';
    }
    function hideChipTooltip() { const tip = document.getElementById('chipTooltip'); if (!tip) return; tip.style.opacity = '0'; tip.style.visibility = 'hidden'; }
    function chipDetail(key: string) {
        switch (key) {
            case 'Year': return 'Registration year: ' + (vehicle?.year || 'Not specified');
            case 'Owners': return 'Number of previous owners: ' + (vehicle?.owners != null ? vehicle.owners : 'Not specified');
            case 'Body': return 'Body type: ' + (vehicle?.bodyType || 'Not specified');
            case 'Engine': return 'Engine: ' + ((vehicle?.engineCapacity || '') + (vehicle?.engineCapacityLitres ? (' — ' + (Math.round(vehicle.engineCapacityLitres * 10) / 10) + 'L') : '')) || 'Not specified';
            case 'Mileage': return 'Odometer reading: ' + (vehicle?.mileage ? fmtMileage(vehicle.mileage) : 'Not specified');
            case 'Transmission': return 'Transmission: ' + (vehicle?.trans || 'Not specified');
            case 'Fuel': return 'Fuel type: ' + (vehicle?.fuel || 'Not specified');
            case 'Doors': return 'Number of doors: ' + (vehicle?.doors != null ? vehicle.doors : 'Not specified');
            case 'Colour': return 'Exterior colour: ' + (vehicle?.color || 'Not specified');
            default: return key;
        }
    }

    // Description toggle
    const [descClamped, setDescClamped] = useState(false);
    const [showDescToggle, setShowDescToggle] = useState(false);
    useEffect(() => {
        const full = document.getElementById('vehicleFullDesc'); if (!full) return; function ensureToggle() { const hasText = full?.textContent && full.textContent.trim().length > 0; if (!hasText) { setShowDescToggle(false); full?.classList.remove('clamped', 'expanded'); return; } if (window.innerWidth <= 700) { setDescClamped(true); setShowDescToggle(true); full.classList.add('clamped'); full.classList.remove('expanded'); } else { setShowDescToggle(false); setDescClamped(false); full.classList.remove('clamped', 'expanded'); } }
        ensureToggle(); const onResize = () => ensureToggle(); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize);
    }, [vehicle?.description]);
    function toggleDesc() { const full = document.getElementById('vehicleFullDesc'); if (!full) return; const expanded = full.classList.toggle('expanded'); if (expanded) { full.classList.remove('clamped'); setDescClamped(false); } else { full.classList.add('clamped'); setDescClamped(true); } }

    // Neon randomization
    useEffect(() => {
        function rand(min: number, max: number) { return Math.random() * (max - min) + min }
        function parseRGBString(s: string | null) { if (!s) return null; const parts = s.split(',').map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n)); if (parts.length < 3) return null; return parts.slice(0, 3); }
        function cssVar(name: string) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() }
        function rgbaFromRGB(rgbArr: number[], a: string) { return 'rgba(' + rgbArr.join(',') + ',' + a + ')' }
        function hexToRgb(hex?: string | null) { if (!hex) return null; hex = hex.replace('#', '').trim(); if (hex.length === 3) hex = hex.split('').map(h => h + h).join(''); const r = parseInt(hex.substring(0, 2), 16); const g = parseInt(hex.substring(2, 4), 16); const b = parseInt(hex.substring(4, 6), 16); if (isNaN(r)) return null; return [r, g, b]; }
        function applyRandomize() {
            const container = document.querySelector('.neon-bg'); if (!container) return; const blobs = Array.from(container.querySelectorAll('.neon')); if (!blobs.length) return; const accentRGB = parseRGBString(cssVar('--accent-rgb')) || null; const accent2RGB = parseRGBString(cssVar('--accent-2-rgb')) || null; const palette: any[] = []; if (accentRGB) palette.push(accentRGB); if (accent2RGB) palette.push(accent2RGB); if (palette.length === 0) { const ahex = cssVar('--accent'); const a2hex = cssVar('--accent-2'); const a1 = hexToRgb(ahex); const a22 = hexToRgb(a2hex); if (a1) palette.push(a1); if (a22) palette.push(a22); }
            blobs.forEach(function (b: Element) { const b_html = b as HTMLElement; const minSize = 80, maxSize = 520; const size = Math.floor(rand(minSize, maxSize)); b_html.style.width = size + 'px'; b_html.style.height = size + 'px'; const left = rand(-15, 85); const top = rand(-20, 85); b_html.style.left = left + '%'; b_html.style.top = top + '%'; b_html.style.right = 'auto'; b_html.style.bottom = 'auto'; const blur = Math.floor(rand(28, 64)); const opacity = rand(0.28, 0.72).toFixed(2); b_html.style.filter = 'blur(' + blur + 'px)'; b_html.style.opacity = opacity; const dur = Math.floor(rand(7, 16)); const delay = Math.floor(rand(0, 6)); b_html.style.animationDuration = dur + 's'; b_html.style.animationDelay = delay + 's'; if (palette.length) { const pick = palette[Math.floor(rand(0, palette.length))]; const inner = rgbaFromRGB(pick, rand(0.6, 0.9).toFixed(2)); const mid = rgbaFromRGB(pick, rand(0.08, 0.22).toFixed(2)); const gradient = 'radial-gradient(circle at 50% 50%, ' + inner + ' 0%, ' + mid + ' 35%, transparent 65%)'; b_html.style.background = gradient; b_html.style.mixBlendMode = 'screen'; } b_html.style.transformOrigin = (rand(20, 80)).toFixed(0) + '% ' + (rand(20, 80)).toFixed(0) + '%'; });
        }
        applyRandomize(); let t: any; const onResize = () => { clearTimeout(t); t = setTimeout(applyRandomize, 220); }; window.addEventListener('resize', onResize); const timer = setTimeout(applyRandomize, 600); return () => { window.removeEventListener('resize', onResize); clearTimeout(timer); };
    }, []);

    // Similar vehicles: fetch inventory and compute candidates, render slides and init slider
    const [similarList, setSimilarList] = useState<any[]>([]);
    const [simLoading, setSimLoading] = useState(true);
    const [simIndex, setSimIndex] = useState(0);
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [slideWidth, setSlideWidth] = useState(0);
    const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // if a similar list was provided by the server, use it and skip client fetches
        if (Array.isArray(similarListProp)) {
            setSimilarList(similarListProp)
            setSimLoading(false)
            return
        }
        // request server-side similar vehicles (small, scored result)
        let mounted = true;
        setSimLoading(true);
        (async () => {
            try {
                if (!vehicle) return;
                const param = vehicle?.reg ? `reg=${encodeURIComponent(vehicle.reg)}` : `slug=${encodeURIComponent(((vehicle?.make || '') + '-' + (vehicle?.model || '') + '-' + (vehicle?.reg || vehicle?.year || '')))}`;
                const res = await fetch(`/api/vehicle/similar?${param}&limit=6`);
                if (!mounted) return;
                if (!res.ok) { setSimilarList([]); return }
                const data = await res.json();
                if (!mounted) return;
                setSimilarList(Array.isArray(data?.items) ? data.items : []);
            } catch (e) {
                if (mounted) setSimilarList([]);
            } finally {
                if (mounted) setSimLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [vehicle, similarListProp]);

    // slider sizing and behavior
    useEffect(() => {
        function updateSize() {
            const vp = viewportRef.current; if (!vp) return; setSlideWidth(vp.clientWidth);
            // ensure track position remains correct
            const track = trackRef.current; if (!track) return; requestAnimationFrame(() => {
                track.style.width = (slideWidth * Math.ceil(Math.max(1, Math.ceil(similarList.length / 3)))) + 'px';
                track.style.transform = 'translateX(' + (-simIndex * (vp.clientWidth)) + 'px)';
            });
        }
        updateSize(); window.addEventListener('resize', updateSize); const t = setTimeout(updateSize, 120);
        return () => { window.removeEventListener('resize', updateSize); clearTimeout(t); };
    }, [similarList, simIndex, slideWidth]);

    // touch support for viewport
    useEffect(() => {
        const vp = viewportRef.current; if (!vp) return;
        let startX: number | null = null; let dx = 0;
        function onTouchStart(e: TouchEvent) { startX = e.touches[0].clientX; }
        function onTouchMove(e: TouchEvent) { if (startX === null) return; dx = e.touches[0].clientX - startX; }
        function onTouchEnd() { if (startX === null) return; if (Math.abs(dx) > 60) { if (dx < 0) setSimIndex(i => Math.min(i + 1, Math.max(0, Math.ceil(similarList.length / 3) - 1))); else setSimIndex(i => Math.max(0, i - 1)); } startX = null; dx = 0; }
        vp.addEventListener('touchstart', onTouchStart, { passive: true }); vp.addEventListener('touchmove', onTouchMove, { passive: true }); vp.addEventListener('touchend', onTouchEnd);
        return () => { vp.removeEventListener('touchstart', onTouchStart); vp.removeEventListener('touchmove', onTouchMove); vp.removeEventListener('touchend', onTouchEnd); };
    }, [similarList]);

    return (
        <main>
            <div className="neon-bg" aria-hidden="true">
                <span className="neon n1"></span>
                <span className="neon n2"></span>
                <span className="neon n3"></span>
                <span className="neon n4"></span>
                <span className="neon n5"></span>
            </div>
            <div className="container">
                <div className="breadcrumb-row">
                    <nav className="futuristic-breadcrumb" aria-label="Breadcrumb">
                        <ol>
                            <li><a href="/">Home</a></li>
                            <li><a href="/used-cars">Used Cars</a></li>
                            <li id="breadcrumbCurrent" className="current">{vehicle?.make ? `${vehicle.make} ${vehicle.model || ''}` : 'Vehicle'}</li>
                        </ol>
                    </nav>
                    <div className="breadcrumb-controls">
                        <a href="/used-cars" className="btn-cta-ghost">← Back to stock page</a>
                        <button id="breadcrumbShare" className="crumb-btn" aria-label="Share vehicle" title="Share vehicle">
                            <Share2 size={24} aria-hidden="true" />
                        </button>
                        <button id="breadcrumbWishlist" className="crumb-btn" aria-pressed="false" aria-label="Save to wishlist" title="Save to wishlist">
                            <Heart size={24} aria-hidden="true" />
                        </button>
                        <button id="breadcrumbPrint" className="crumb-btn" aria-label="Print brochure" title="Print brochure" onClick={() => window.print()}>
                            <FileText size={24} aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <section id="vehicleRoot" className="vehicle-root">
                    <div className="vehicle-hero" aria-live="polite">
                        <Gallery
                            imgs={imgs}
                            displayImgs={displayImgs}
                            thumbImgs={thumbImgs}
                            index={index}
                            prev={prev}
                            next={next}
                            openLightbox={openLightbox}
                            galleryLoading={galleryLoading}
                            longLoading={longLoading}
                            handleThumbClick={handleThumbClick}
                            lbOpen={lbOpen}
                            lbIndex={lbIndex}
                            closeLightbox={closeLightbox}
                            setLbIndex={setLbIndex}
                            mainRef={mainRef}
                            lbCloseRef={lbCloseRef}
                            handleMainImageLoad={handleMainImageLoad}
                            setGalleryLoading={setGalleryLoading}
                            handleRetry={handleRetry}
                            lbImageLoading={lbImageLoading}
                            setLbImageLoading={setLbImageLoading}
                        />

                        <Summary
                            vehicle={vehicle}
                            fmtPrice={fmtPrice}
                            fmtMileage={fmtMileage}
                            chipIcons={chipIcons}
                            showChipTooltip={showChipTooltip}
                            hideChipTooltip={hideChipTooltip}
                            chipDetail={chipDetail}
                        />
                    </div>
                </section>
                {/* Full description and features: placed below gallery and card */}
                <Details vehicle={vehicle} features={features} specs={specs} descClamped={descClamped} showDescToggle={showDescToggle} toggleDesc={toggleDesc} />
                <SimilarVehicles
                    similarList={similarList}
                    simLoading={simLoading}
                    simIndex={simIndex}
                    setSimIndex={setSimIndex}
                    slideWidth={slideWidth}
                    viewportRef={viewportRef}
                    trackRef={trackRef}
                    normalizeImageUrl={normalizeImageUrl}
                    savedIds={savedIds}
                    setSavedIds={setSavedIds}
                />
            </div>
        </main>
    )
}
