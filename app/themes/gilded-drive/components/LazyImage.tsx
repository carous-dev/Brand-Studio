"use client"

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

type LazyImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
  rootMargin?: string
  threshold?: number
  placeholder?: string
  priority?: boolean
}

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

const defaultPlaceholder = 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'

const LazyImage = forwardRef<HTMLImageElement, LazyImageProps>(function LazyImage(
  { src, alt, rootMargin = '200px', threshold = 0.01, placeholder = TRANSPARENT_PIXEL, priority = false, className, style, ...rest },
  ref
) {
  const imgRefInternal = useRef<HTMLImageElement | null>(null)
  useImperativeHandle(ref, () => imgRefInternal.current!)

  const [visible, setVisible] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)

  useEffect(() => {
    if (visible) return
    const el = imgRefInternal.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
          return
        }
      }
    }, { root: null, rootMargin, threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [rootMargin, threshold, visible])

  useEffect(() => {
    if (visible && !loadedSrc) setLoadedSrc(src)
  }, [visible, src, loadedSrc])

  // handle load event
  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setIsLoaded(true)
    if (rest.onLoad) (rest.onLoad as any)(e)
  }

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    background: typeof placeholder === 'string' && placeholder.startsWith('data:') ? `url(${placeholder}) center/cover no-repeat` : (placeholder === TRANSPARENT_PIXEL ? defaultPlaceholder : String(placeholder)),
    // provide a subtle placeholder appearance
    display: 'block',
    width: '100%'
  }

  const imgStyle: React.CSSProperties = {
    width: '100%',
    display: 'block',
    transition: 'filter 350ms ease, opacity 350ms ease, transform 350ms ease',
    filter: isLoaded ? 'none' : 'blur(12px) saturate(80%)',
    transform: isLoaded ? 'scale(1)' : 'scale(1.02)',
    opacity: isLoaded ? 1 : 0.95,
    ...style
  }

  return (
    <span className={className ? `lazy-image-wrapper ${className}` : 'lazy-image-wrapper'} style={wrapperStyle}>
      <img
        {...(rest as any)}
        ref={imgRefInternal}
        src={loadedSrc || TRANSPARENT_PIXEL}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={(priority ? 'high' : 'low') as any}
        style={imgStyle}
        onLoad={handleLoad}
      />
    </span>
  )
})

export default LazyImage
