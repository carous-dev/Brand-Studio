"use client"
import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import LazyImage from '../LazyImage'

export default function Gallery(props: any) {
    const { imgs, displayImgs, thumbImgs, index, prev, next, openLightbox, galleryLoading, longLoading, handleThumbClick, lbOpen, lbIndex, closeLightbox, setLbIndex, mainRef, lbCloseRef, handleMainImageLoad, setGalleryLoading, handleRetry, lbImageLoading, setLbImageLoading } = props
    const len = imgs?.length || 0

    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    const minSwipeDistance = 50

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance
        if (isLeftSwipe) {
            setLbIndex((cur: number) => ((cur + 1) % len))
        }
        if (isRightSwipe) {
            setLbIndex((cur: number) => ((cur - 1 + len) % len))
        }
    }

    const onTouchEndGallery = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance
        if (isLeftSwipe) {
            next()
        }
        if (isRightSwipe) {
            prev()
        }
    }

    return (
        <div className="gallery" id="gallery" data-react="1">
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .lb-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255,255,255,0.3); /* photo-scrim-ok */
                    border-top: 4px solid var(--accent);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10;
                }
                .lb-inner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 100%;
                }
                .lb-content {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .lb-image-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    width: 100%;
                    background: #000; /* photo-scrim-ok — prevent white flash while lightbox image loads */
                }
                .lb-image-container img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    background: #000; /* photo-scrim-ok */
                }
                .lb-counter {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.7); /* photo-scrim-ok */
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 14px;
                    z-index: 2;
                }
                .lb-thumbs {
                    position: absolute;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 10px;
                    background: rgba(0,0,0,0.7); /* photo-scrim-ok */
                    padding: 10px;
                    border-radius: 8px;
                }
                .lb-thumbs img {
                    width: 60px;
                    height: 45px;
                    object-fit: cover;
                    cursor: pointer;
                    border: 2px solid transparent;
                    border-radius: 4px;
                    flex-shrink: 0;
                }
                .lb-thumbs img.active {
                    border-color: var(--accent);
                }
                .lb-nav {
                    z-index: 10;
                }
                .lb-close {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 10;
                }
                @media (max-width: 768px) {
                    .lb-thumbs {
                        display: none;
                    }
                    .lb-nav {
                        display: none;
                    }
                    .gallery-nav {
                        display: none;
                    }
                    .lb-spinner {
                        width: 40px;
                        height: 40px;
                        border-width: 3px;
                    }
                    .lb-counter {
                        font-size: 12px;
                        padding: 4px 8px;
                    }
                }
            `}</style>
            <div className="gallery-main" aria-live="polite" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEndGallery}>
                <button onClick={() => prev()} className="gallery-nav gallery-prev" aria-label="Previous image"><ChevronLeft size={22} aria-hidden="true" /></button>
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
                    <LazyImage ref={mainRef as any} src={displayImgs[index]} alt="Vehicle main" id="mainImage" tabIndex={0}
                        key={`img-${index}`}
                        priority={index === 0}
                        onLoad={() => { handleMainImageLoad() }}
                        onError={() => { handleMainImageLoad() }}
                        onClick={openLightbox}
                        onKeyDown={(e: React.KeyboardEvent) => { if ((e as any).key === 'ArrowLeft') prev(); if ((e as any).key === 'ArrowRight') next(); if ((e as any).key === 'Enter') openLightbox(); }} />
                ) : null}
                {/* galleryLoading spinner removed */}
                <button onClick={() => next()} className="gallery-nav gallery-next" aria-label="Next image"><ChevronRight size={22} aria-hidden="true" /></button>
            </div>
            <div className="gallery-thumbs" id="thumbs" role="list">
                {longLoading ? (
                    <div className="thumb-fallback">Images unavailable right now</div>
                ) : (
                    imgs && imgs.length ? imgs.map((src: string, i: number) => (
                        <img
                            key={i}
                            role="listitem"
                            onClick={() => handleThumbClick(i, thumbImgs[i] || src)}
                            className={i === index ? 'active' : ''}
                            src={thumbImgs[i] || src}
                            alt={`Thumb ${i + 1}`}
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                        />
                    )) : null
                )}
            </div>

            <div id="vehicleLightbox" className={`vehicle-lightbox ${lbOpen ? 'open' : ''} ${lbOpen ? 'vehicle-lightbox-visible' : 'vehicle-lightbox-hidden'}`} aria-hidden={!lbOpen} onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}>
                <div className="lb-inner">
                    <button className="lb-close" aria-label="Close" ref={lbCloseRef} onClick={closeLightbox}><X size={18} aria-hidden="true" /></button>
                    <button className="lb-nav lb-prev" aria-label="Previous" onClick={() => setLbIndex((cur: number) => ((cur - 1 + len) % len))}><ChevronLeft size={20} aria-hidden="true" /></button>
                    <div className="lb-content" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                        <div className="lb-image-container">
                            {lbImageLoading && <div className="lb-spinner"></div>}
                            {(displayImgs[lbIndex] || displayImgs[0]) ? (
                                <img key={lbIndex} src={displayImgs[lbIndex] || displayImgs[0]} alt={`Vehicle image ${lbIndex + 1}`} onLoad={() => setTimeout(() => setLbImageLoading(false), 300)} onError={() => setLbImageLoading(false)} />
                            ) : null}
                            <div className="lb-counter">{lbIndex + 1} of {len}</div>
                            {len > 1 && (
                                <div className="lb-thumbs">
                                    {(() => {
                                        const start = Math.max(0, lbIndex - 3);
                                        const end = Math.min(len, lbIndex + 5);
                                        return Array.from({ length: end - start }, (_, idx) => {
                                            const realIdx = start + idx;
                                            return (
                                                <img
                                                    key={realIdx}
                                                    className={realIdx === lbIndex ? 'active' : ''}
                                                    src={thumbImgs[realIdx] || imgs[realIdx]}
                                                    alt={`Thumb ${realIdx + 1}`}
                                                    onClick={() => setLbIndex(realIdx)}
                                                    loading="lazy"
                                                />
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                    <button className="lb-nav lb-next" aria-label="Next" onClick={() => setLbIndex((cur: number) => ((cur + 1) % len))}><ChevronRight size={20} aria-hidden="true" /></button>
                </div>
            </div>
        </div>
    )
}
