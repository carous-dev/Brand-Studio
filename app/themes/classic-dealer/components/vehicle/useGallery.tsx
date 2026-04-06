"use client"
import { useEffect, useRef, useState } from 'react'

export default function useGallery(opts: { imgs?: string[]; fetchRemote?: boolean; vehicleProp?: any; remoteVehicle?: any }) {
    const { imgs = [], fetchRemote = false, vehicleProp = null, remoteVehicle = null } = opts

    const [index, setIndex] = useState(0)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [thumbLoading, setThumbLoading] = useState(false)
    const [thumbLoadingIndex, setThumbLoadingIndex] = useState<number | null>(null)
    const [galleryLoading, setGalleryLoading] = useState(false)
    const [longLoading, setLongLoading] = useState(false)
    const [lbOpen, setLbOpen] = useState(false)
    const [lbIndex, setLbIndex] = useState(0)
    const mainRef = useRef<HTMLImageElement | null>(null)
    const lbCloseRef = useRef<HTMLButtonElement | null>(null)
    const prevImgLenRef = useRef(0)

    const len = (imgs && imgs.length) || 0

    function handleThumbClick(i: number, src?: string) {
        try {
            if (i === index) return
            if (!src) return
            console.debug('gallery: thumb click', i, src)
            setThumbLoading(true)
            setThumbLoadingIndex(i)
            setGalleryLoading(true)
            const img = new window.Image()
            img.onload = () => {
                setIndex(i)
                setThumbLoading(false)
                setThumbLoadingIndex(null)
                setGalleryLoading(false)
                if (!imageLoaded) setImageLoaded(true)
            }
            img.onerror = () => {
                setThumbLoading(false)
                setThumbLoadingIndex(null)
                setGalleryLoading(false)
            }
            img.src = src
        } catch (e) {
            setThumbLoading(false)
            setThumbLoadingIndex(null)
            setGalleryLoading(false)
        }
    }

    useEffect(() => {
        // Only reset when the number of images actually changes (not just reference)
        if (len !== prevImgLenRef.current) {
            prevImgLenRef.current = len
            if (len === 0) {
                setIndex(0)
                setLbIndex(0)
                setImageLoaded(true)
                return
            }
            // New set of images: reset to first
            setIndex(0)
            setLbIndex(0)
            setImageLoaded(false)
        }
    }, [len])

    useEffect(() => {
        let t: any = null
        const shouldWatch = !imageLoaded && (fetchRemote || (!vehicleProp && !remoteVehicle))
        if (shouldWatch) {
            t = setTimeout(() => {
                if (!imageLoaded) setLongLoading(true)
            }, 3000)
        } else {
            if (imageLoaded) setLongLoading(false)
        }
        return () => { if (t) clearTimeout(t) }
    }, [imageLoaded, fetchRemote, vehicleProp, remoteVehicle])

    function showIndex(i: number) { if (!len) return; const next = ((i % len) + len) % len; console.debug('gallery: showIndex ->', next); setIndex(() => next) }
    function prev() { if (!len) return; console.debug('gallery: prev'); setGalleryLoading(true); setIndex(i => { const next = ((i - 1 + len) % len); console.debug('gallery: setIndex(prev) ->', next); return next }) }
    function next() { if (!len) return; console.debug('gallery: next'); setGalleryLoading(true); setIndex(i => { const next = ((i + 1) % len); console.debug('gallery: setIndex(next) ->', next); return next }) }
    function openLightbox() { if (!len) return; console.debug('gallery: openLightbox'); setGalleryLoading(true); setLbIndex(() => index); setLbOpen(true) }
    function closeLightbox() { setLbOpen(false); setTimeout(() => mainRef.current?.focus(), 0) }

    function handleMainImageLoad() {
        if (!imageLoaded) setImageLoaded(true)
        if (galleryLoading) setGalleryLoading(false)
    }

    useEffect(() => {
        if (lbOpen) { document.body.style.overflow = 'hidden'; lbCloseRef.current?.focus() } else { document.body.style.overflow = '' }
        return () => { document.body.style.overflow = '' }
    }, [lbOpen])

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (lbOpen) {
                if (e.key === 'Escape') closeLightbox()
                if (e.key === 'ArrowLeft') setLbIndex(i => ((i - 1 + len) % len))
                if (e.key === 'ArrowRight') setLbIndex(i => ((i + 1) % len))
            }
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [lbOpen, len])

    return {
        index, setIndex,
        imageLoaded, setImageLoaded,
        thumbLoading, setThumbLoading,
        thumbLoadingIndex, setThumbLoadingIndex,
        galleryLoading, setGalleryLoading,
        longLoading, setLongLoading,
        lbOpen, setLbOpen,
        lbIndex, setLbIndex,
        mainRef, lbCloseRef,
        handleThumbClick, prev, next, openLightbox, closeLightbox, handleMainImageLoad
    }
}
