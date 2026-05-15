'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { BrandConfig } from '@/brands/types'
import './styles.css'

type GateSnapshot = {
  enabled?: boolean
  status?: 'active' | 'locked' | 'disabled' | 'unknown' | string
  locked?: boolean
  slug?: string
  dealerName?: string
  remainingSeconds?: number | null
  maxViewSeconds?: number
  usedSeconds?: number
  visitCount?: number
  maxVisits?: number
  contactUrl?: string
  sessionId?: string
}

type PreviewGateProps = {
  brand?: BrandConfig | null
}

const API_BASE =
  process.env.NEXT_PUBLIC_FLASK_API_URL ||
  process.env.FLASK_API_URL ||
  'http://localhost:5000/api'

function apiUrl(path: string) {
  return `${API_BASE.replace(/\/$/, '')}${path}`
}

function formatRemaining(seconds: number | null | undefined) {
  if (seconds == null) return ''
  const safe = Math.max(Math.floor(seconds), 0)
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

async function postGate(path: string, payload: Record<string, unknown>) {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok && res.status !== 404) {
    throw new Error(`Preview gate request failed: ${res.status}`)
  }
  return (await res.json()) as GateSnapshot
}

export default function PreviewGate({ brand }: PreviewGateProps) {
  const [snapshot, setSnapshot] = useState<GateSnapshot | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [failed, setFailed] = useState(false)
  const bannerRef = useRef<HTMLElement | null>(null)

  const host = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return window.location.host
  }, [])

  const dealerName = snapshot?.dealerName || brand?.name || 'this dealership'
  const enabled = Boolean(snapshot?.enabled)
  const locked = Boolean(snapshot?.locked || snapshot?.status === 'locked')
  const remainingLabel = formatRemaining(snapshot?.remainingSeconds)
  const contactUrl = snapshot?.contactUrl || 'https://carous.co.uk'

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const next = await postGate('/preview-gate/session', {
          host,
          slug: brand?.slug,
        })
        if (cancelled) return
        setSnapshot(next)
        if (next.sessionId) setSessionId(next.sessionId)
      } catch (error) {
        console.error('[PreviewGate] failed to start session', error)
        if (!cancelled) setFailed(true)
      }
    }

    start()
    return () => {
      cancelled = true
    }
  }, [brand?.slug, host])

  useEffect(() => {
    document.documentElement.toggleAttribute('data-preview-gate-enabled', enabled)
    document.body.toggleAttribute('data-preview-gate-locked', enabled && locked)

    return () => {
      document.documentElement.removeAttribute('data-preview-gate-enabled')
      document.body.removeAttribute('data-preview-gate-locked')
    }
  }, [enabled, locked])

  useEffect(() => {
    if (!enabled) {
      document.documentElement.style.removeProperty('--brandstudio-preview-banner-height')
      return
    }

    const el = bannerRef.current
    if (!el) return

    const apply = () => {
      document.documentElement.style.setProperty(
        '--brandstudio-preview-banner-height',
        `${Math.ceil(el.getBoundingClientRect().height)}px`,
      )
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    window.addEventListener('resize', apply)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', apply)
      document.documentElement.style.removeProperty('--brandstudio-preview-banner-height')
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || locked || !sessionId) return

    const timer = window.setInterval(() => {
      setSnapshot((current) => {
        if (!current || current.remainingSeconds == null) return current
        return {
          ...current,
          remainingSeconds: Math.max(current.remainingSeconds - 1, 0),
        }
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [enabled, locked, sessionId])

  useEffect(() => {
    if (!enabled || locked || !sessionId) return

    let stopped = false
    const heartbeat = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        const next = await postGate('/preview-gate/heartbeat', {
          host,
          slug: brand?.slug,
          sessionId,
        })
        if (!stopped) setSnapshot(next)
      } catch (error) {
        console.error('[PreviewGate] heartbeat failed', error)
      }
    }

    const timer = window.setInterval(heartbeat, 10000)
    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [brand?.slug, enabled, host, locked, sessionId])

  if (failed || !enabled || !snapshot) return null

  return (
    <>
      <aside
        ref={bannerRef}
        className="brandstudio-preview-gate"
        role="region"
        aria-label="Private dealer preview"
      >
        <div className="brandstudio-preview-gate-inner">
          <span className="brandstudio-preview-gate-tag">
            <span className="brandstudio-preview-gate-dot" />
            Private Preview
          </span>
          <span className="brandstudio-preview-gate-text">
            <strong>{dealerName}</strong>
            <span aria-hidden="true"> · </span>
            {locked ? 'Preview locked' : remainingLabel ? `${remainingLabel} remaining` : 'Preview active'}
          </span>
        </div>
      </aside>

      {locked ? (
        <div className="brandstudio-preview-lock" role="dialog" aria-live="polite" aria-label="Preview locked">
          <div className="brandstudio-preview-lock-panel">
            <p className="brandstudio-preview-lock-kicker">Preview locked</p>
            <h2>Your private preview time has ended.</h2>
            <p>
              The design remains reserved for {dealerName}. Contact Carous Limited to continue reviewing this theme.
            </p>
            <a href={contactUrl} target="_blank" rel="noopener noreferrer">
              Request access
            </a>
          </div>
        </div>
      ) : null}
    </>
  )
}
