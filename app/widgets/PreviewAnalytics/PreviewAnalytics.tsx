'use client'

/**
 * PreviewAnalytics — always-on engagement beacon for preview sites.
 *
 * Renders nothing. On every preview render it opens an analytics session,
 * reports a pageview on each client-side route change, heartbeats while the
 * tab is visible (so "time spent" only counts real attention), and finalises
 * the session on unload via sendBeacon. Independent of the PreviewGate access
 * lock — data is collected for every preview so a preview starred later in the
 * dashboard already has history and shows up live.
 *
 * Every call fails soft: a non-2xx or network error is ignored so tracking can
 * never break the dealer preview.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { BrandConfig } from '@/brands/types'

type PreviewAnalyticsProps = {
  brand?: BrandConfig | null
}

const API_BASE = '/api'
const HEARTBEAT_MS = 10_000

function apiUrl(path: string) {
  return `${API_BASE.replace(/\/$/, '')}${path}`
}

function detectDevice(): string {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent || ''
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    return 'tablet'
  }
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return 'mobile'
  return 'desktop'
}

async function post(path: string, payload: Record<string, unknown>) {
  try {
    const res = await fetch(apiUrl(path), {
      method: 'POST',
      cache: 'no-store',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    return (await res.json()) as Record<string, unknown>
  } catch {
    return null
  }
}

export default function PreviewAnalytics({ brand }: PreviewAnalyticsProps) {
  const pathname = usePathname()
  const [sessionId, setSessionId] = useState('')
  const startedRef = useRef(false)
  const lastPathRef = useRef('')

  const slug = brand?.slug || ''
  const host = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return window.location.host
  }, [])

  // Open the session exactly once, folding in the landing page.
  useEffect(() => {
    if (startedRef.current || typeof window === 'undefined') return
    startedRef.current = true

    const initialPath = pathname || window.location.pathname || '/'
    lastPathRef.current = initialPath

    let cancelled = false
    ;(async () => {
      const res = await post('/preview-analytics/session', {
        slug,
        host,
        path: initialPath,
        title: typeof document !== 'undefined' ? document.title : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        device: detectDevice(),
      })
      const id = res && typeof res.sessionId === 'string' ? res.sessionId : ''
      if (!cancelled && id) setSessionId(id)
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Report subsequent client-side route changes as new pageviews.
  useEffect(() => {
    if (!sessionId || !pathname) return
    if (pathname === lastPathRef.current) return
    lastPathRef.current = pathname
    void post('/preview-analytics/pageview', {
      sessionId,
      slug,
      host,
      path: pathname,
      title: typeof document !== 'undefined' ? document.title : '',
    })
  }, [pathname, sessionId, slug, host])

  // Heartbeat only while the tab is actually in the foreground.
  useEffect(() => {
    if (!sessionId) return
    const beat = () => {
      if (document.visibilityState !== 'visible') return
      void post('/preview-analytics/heartbeat', { sessionId })
    }
    const timer = window.setInterval(beat, HEARTBEAT_MS)
    return () => window.clearInterval(timer)
  }, [sessionId])

  // Finalise on real unload (tab close / navigation away). Tab switches are
  // left alone — the heartbeat pause + server live-window handle idle decay.
  useEffect(() => {
    if (!sessionId) return
    const end = () => {
      try {
        navigator.sendBeacon(apiUrl(`/preview-analytics/session/${sessionId}/end`))
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('pagehide', end)
    return () => window.removeEventListener('pagehide', end)
  }, [sessionId])

  return null
}
