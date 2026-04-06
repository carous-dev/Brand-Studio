"use client"
import React, { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function Gallery(props: any) {
    const { imgs, displayImgs, thumbImgs, index, prev, next, openLightbox, galleryLoading, longLoading, handleThumbClick, lbOpen, lbIndex, closeLightbox, setLbIndex, mainRef, lbCloseRef, handleMainImageLoad, setGalleryLoading, handleRetry } = props
    const len = imgs?.length || 0
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    useEffect(() => {
        try {
            const thumbsEl = document.getElementById('thumbs') as HTMLElement | null
            if (!thumbsEl) return
            const active = thumbsEl.querySelector('img.active') as HTMLElement | null
            if (active && active.scrollIntoView) {
                // smooth scroll the active thumbnail into view when index changes
                active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
            }
        } catch (e) { /* ignore */ }
    }, [index])

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.changedTouches[0].clientX
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        touchEndX.current = e.changedTouches[0].clientX
        handleSwipe()
    }

    const handleSwipe = () => {
        const swipeThreshold = 50
        const diff = touchStartX.current - touchEndX.current

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // swiped left, show next
                next()
            } else {
                // swiped right, show previous
                prev()
            }
        }
    }

    return (
        <div className="gallery" id="gallery" data-react="1">
            <div className="gallery-main" aria-live="polite">
                <button onClick={() => { console.debug('gallery: prev button clicked'); prev() }} className="gallery-nav gallery-prev" aria-label="Previous image"><ChevronLeft size={22} aria-hidden="true" /></button>
                {longLoading ? (
                    <div className="loader-fallback" role="status" aria-live="polite">
                        <p>We're having trouble loading some vehicle details right now.</p>
                        <div className="button-group">
                            <button type="button" className="btn" onClick={handleRetry}>Try again</button>
                            <a className="muted" href="/contact">Contact us</a>
                        </div>
                    </div>
                ) : null}
                {displayImgs && displayImgs.length ? (
                    <img ref={mainRef} src={displayImgs[index]} alt="Vehicle main" id="mainImage" tabIndex={0}
                        key={`img-${index}`}
                        onLoad={() => { console.debug('gallery: image loaded at index', index, 'src:', displayImgs[index]); handleMainImageLoad() }}
                        onError={() => { console.error('gallery: image error at index', index, 'src:', displayImgs[index]); handleMainImageLoad() }}
                        onClick={openLightbox}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onKeyDown={(e: React.KeyboardEvent) => { if ((e as any).key === 'ArrowLeft') prev(); if ((e as any).key === 'ArrowRight') next(); if ((e as any).key === 'Enter') openLightbox(); }} />
                ) : null}
                {/* galleryLoading spinner removed */}
                <button onClick={() => { console.debug('gallery: next button clicked'); next() }} className="gallery-nav gallery-next" aria-label="Next image"><ChevronRight size={22} aria-hidden="true" /></button>
            </div>
            <div className="gallery-thumbs" id="thumbs" role="list">
                {longLoading ? (
                    <div className="thumb-fallback">Images unavailable right now</div>
                ) : (
                    imgs && imgs.length ? imgs.map((src: string, i: number) => (
                        <img key={i} onClick={() => { console.debug('gallery: thumb click', i); handleThumbClick(i, thumbImgs[i] || src) }} className={i === index ? 'active' : ''} src={thumbImgs[i] || src} alt={`Thumb ${i + 1}`} />
                    )) : null
                )}
            </div>

            <div id="vehicleLightbox" className={`vehicle-lightbox ${lbOpen ? 'open' : ''}`} aria-hidden={!lbOpen} onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}>
                <div className="lb-inner">
                    {/* lightbox spinner removed */}
                    <button className="lb-close" aria-label="Close" ref={lbCloseRef} onClick={closeLightbox}><X size={18} aria-hidden="true" /></button>
                    <button className="lb-nav lb-prev" aria-label="Previous" onClick={() => { setGalleryLoading(true); setLbIndex((i: number) => ((i - 1 + len) % len)) }}><ChevronLeft size={20} aria-hidden="true" /></button>
                    {(displayImgs[lbIndex] || displayImgs[0]) ? (
                        <img src={displayImgs[lbIndex] || displayImgs[0]} alt={'Vehicle image'} onLoad={() => setGalleryLoading(false)} onError={() => setGalleryLoading(false)} />
                    ) : null}
                    <button className="lb-nav lb-next" aria-label="Next" onClick={() => { setGalleryLoading(true); setLbIndex((i: number) => ((i + 1) % len)) }}><ChevronRight size={20} aria-hidden="true" /></button>
                </div>
            </div>
        </div>
    )
}
