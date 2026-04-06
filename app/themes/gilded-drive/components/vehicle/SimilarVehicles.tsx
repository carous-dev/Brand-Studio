"use client"
import React from 'react'
import Link from 'next/link'
import { Tag, Clock, Droplet, Sliders } from 'lucide-react'
import LazyImage from '../LazyImage'

export default function SimilarVehicles(props: any) {
    const { similarList, simLoading, simIndex, setSimIndex, slideWidth, viewportRef, trackRef, normalizeImageUrl, savedIds, setSavedIds } = props

    return (
        <section className="similar-vehicles container" aria-label="Similar vehicles">
            <h3 className="section-title">Similar Vehicles</h3>
            <div className="similar-slider" aria-hidden={similarList.length === 0}>
                <button className="sim-nav sim-prev" aria-label="Previous similar vehicles" onClick={() => setSimIndex((i: number) => Math.max(0, i - 1))} disabled={simIndex === 0}>‹</button>
                <div className="sim-viewport" aria-live="polite" ref={viewportRef} tabIndex={0} onKeyDown={(e) => { if (e.key === 'ArrowLeft') setSimIndex((i: number) => Math.max(0, i - 1)); if (e.key === 'ArrowRight') setSimIndex((i: number) => Math.min(i + 1, Math.max(0, Math.ceil(similarList.length / 3) - 1))); }}>
                    <div 
                        id="similarTrack" 
                        className="sim-track sim-track-dynamic" 
                        ref={trackRef} 
                        style={{
                            '--track-transform': `-${simIndex * (slideWidth || (viewportRef.current?.clientWidth || 0))}px`,
                            '--track-width': `${(viewportRef.current?.clientWidth || 0) * Math.max(1, Math.ceil(similarList.length / 3))}px`
                        } as React.CSSProperties}
                    >
                        {simLoading ? (
                            <div 
                                className="sim-slide sim-slide-dynamic" 
                                style={{
                                    '--slide-width': `${viewportRef.current?.clientWidth || slideWidth}px`
                                } as React.CSSProperties}
                            >
                                <div className="loading-message">Loading similar vehicles…</div>
                            </div>
                        ) : (similarList.length ? (() => {
                            const per = 3; const slides: any[] = []
                            for (let i = 0; i < similarList.length; i += per) {
                                slides.push(similarList.slice(i, i + per))
                            }
                            return slides.map((group, sIdx) => (
                                <div 
                                    key={sIdx} 
                                    className="sim-slide sim-slide-dynamic" 
                                    style={{
                                        '--slide-width': `${viewportRef.current?.clientWidth || slideWidth}px`
                                    } as React.CSSProperties}
                                >
                                    {group.map((v: any, idx: number) => (
                                        <article key={v.reg || v.meta?.originalId || v.id || idx} className="car-card">
                                            <Link href={`/cars/${encodeURIComponent(String(v.slug || v.reg || ''))}`} className="card-link" aria-label={`View ${(v.year ? v.year + ' ' : '') + (v.make || '') + ' ' + (v.model || '')}`}>
                                                <div className="media">
                                                    <LazyImage src={normalizeImageUrl((Array.isArray(v.images) && v.images.length) ? v.images[0] : v.image || '/images/placeholder.png')} alt={`${v.make || ''} ${v.model || ''}`} loading="lazy" decoding="async" fetchPriority="low" />
                                                    <div className="media-overlay">
                                                        <button type="button" className="icon-btn share-btn" title="Share" onClick={(e) => { e.preventDefault(); e.stopPropagation(); try { if (navigator.share) { navigator.share({ title: (v.year ? v.year + ' ' : '') + (v.make || '') + ' ' + (v.model || ''), url: location.href }); } else { window.prompt('Copy link to share', location.href); } } catch (err) { window.prompt('Copy link to share', location.href); } }}>
                                                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M12 3v13" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" /><path d="M7 8l5-5 5 5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                    </button>
                                                        <button type="button" className={`icon-btn fav-btn ${savedIds[v.reg || v.meta?.originalId || v.id] ? 'saved' : ''}`} title="Save" onClick={(e) => { e.preventDefault(); e.stopPropagation(); const id = v.reg || v.meta?.originalId || v.id; setSavedIds((prev: any) => ({ ...prev, [id]: !prev[id] })); }}>
                                                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                                                        </button>
                                                        <div className="img-count"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 7h-3.2l-1.6-2.4A1 1 0 0 0 15.6 4H8.4a1 1 0 0 0-.6.2L6.2 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth={1.2} fill="none" /><circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth={1.2} fill="none" /></svg><span>{(Array.isArray(v.images) && v.images.length) ? v.images.length : 1}</span></div>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <h3 className="car-title">{((v.year ? v.year + ' ' : '') + (v.make || '') + ' ' + (v.model || '')).trim()}</h3>
                                                    <div className="meta car-meta">
                                                        <span className="reg chip"><span className="chip-icon" aria-hidden="true"><Tag size={14} /></span><div className="chip-body">{v.reg || ''}</div></span>
                                                        <span className="mileage chip"><span className="chip-icon" aria-hidden="true"><Clock size={14} /></span><div className="chip-body">{v.mileage ? (String(v.mileage) + ' mi') : ''}</div></span>
                                                        <span className="fuel chip"><span className="chip-icon" aria-hidden="true"><Droplet size={14} /></span><div className="chip-body">{v.fuel || ''}</div></span>
                                                        <span className="trans chip"><span className="chip-icon" aria-hidden="true"><Sliders size={14} /></span><div className="chip-body">{v.trans || ''}</div></span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </article>
                                    ))}
                                </div>
                            ))
                        })() : <div className="muted">No similar vehicles found.</div>)}
                    </div>
                </div>
                <button className="sim-nav sim-next" aria-label="Next similar vehicles" onClick={() => setSimIndex((i: number) => Math.min(i + 1, Math.max(0, Math.ceil(similarList.length / 3) - 1)))} disabled={simIndex >= Math.max(0, Math.ceil(similarList.length / 3) - 1)}>›</button>
            </div>
        </section>
    )
}
