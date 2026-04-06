"use client"
import "../styles/vehicle-panel.css";

import React, { useCallback, useEffect, useRef, useState } from 'react'

type VehicleData = Record<string, any>
type LookupResult = { vehicle?: VehicleData; valuations?: Record<string, any> }

export default function SellVehicleDetails(): React.JSX.Element {
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [vehicle, setVehicle] = useState<VehicleData | null>(null)
  const [valuations, setValuations] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ msg: string; success: boolean; visible: boolean }>({ msg: '', success: true, visible: false })
  const [metaOpen, setMetaOpen] = useState(false)

  // helpers: session storage cache
  const getStored = useCallback(() => {
    try { return JSON.parse(sessionStorage.getItem('carous_lookups') || '[]') as LookupResult[] } catch (e) { return [] }
  }, [])
  const store = useCallback((obj: LookupResult) => {
    try { const arr = getStored(); arr.push(obj); sessionStorage.setItem('carous_lookups', JSON.stringify(arr)); } catch (e) { /* ignore */ }
  }, [getStored])
  const hasRegistration = useCallback((reg?: string) => {
    if (!reg) return false
    try { return getStored().some(it => (it.vehicle && it.vehicle.registration && it.vehicle.registration.toUpperCase()) === reg.toUpperCase()) } catch (e) { return false }
  }, [getStored])

  const showSnackbar = useCallback((msg: string, success = true) => {
    setSnackbar({ msg, success, visible: true })
    window.setTimeout(() => setSnackbar(s => ({ ...s, visible: false })), 4200)
  }, [])

  const lookup = useCallback(async (reg: string, mileage: string) => {
    const url = 'https://api.carous.co.uk/v1/lookup'
    const payload = { reg: reg.toUpperCase(), mileage: Number(mileage) }
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!resp.ok) { const t = await resp.text(); throw new Error(resp.status + ' ' + (t || resp.statusText)) }
    return resp.json() as Promise<LookupResult>
  }, [])

  const openVehiclePanel = useCallback((data: LookupResult) => {
    const v = data.vehicle || {}
    setVehicle(v)
    setValuations(data.valuations || null)
    // prevent body scroll and avoid layout shift by compensating with padding-right
    try {
      const doc = document.documentElement
      const scrollbarWidth = Math.max(0, window.innerWidth - doc.clientWidth)
      // store previous values (use computed style fallback)
      const prevOverflow = document.body.style.overflow || ''
      const prevPadding = document.body.style.paddingRight || getComputedStyle(document.body).paddingRight || '0px'
      document.body.dataset._prevOverflow = prevOverflow
      document.body.dataset._prevPaddingRight = prevPadding

      if (scrollbarWidth > 0) {
        const prevVal = parseFloat(prevPadding) || 0
        document.body.style.paddingRight = (prevVal + scrollbarWidth) + 'px'
      }
      // set overflow hidden before the panel is mounted to avoid initial reflow
      document.body.style.overflow = 'hidden'
    } catch (e) {
      try { document.body.style.overflow = 'hidden' } catch (e) { /* ignore */ }
    }

    // show panel after we've applied body compensation to avoid layout shift
    setVisible(true)
    // focus management and aria will run once panel is mounted
    requestAnimationFrame(() => {
      if (backdropRef.current) backdropRef.current.setAttribute('aria-hidden', 'false')
      if (panelRef.current) { panelRef.current.classList.add('open'); panelRef.current.focus && panelRef.current.focus() }
    })
  }, [])

  const closeVehiclePanel = useCallback(() => {
    // begin close animation by removing open class and hiding backdrop
    if (panelRef.current) panelRef.current.classList.remove('open')
    if (backdropRef.current) backdropRef.current.setAttribute('aria-hidden', 'true')

    // restore body styles immediately to avoid scrollbar reflow/layout shift
    try {
      document.body.style.overflow = document.body.dataset._prevOverflow || ''
      document.body.style.paddingRight = document.body.dataset._prevPaddingRight || ''
      delete document.body.dataset._prevOverflow; delete document.body.dataset._prevPaddingRight
    } catch (e) { try { document.body.style.overflow = '' } catch (e) { /* ignore */ } }

    // unmount panel after CSS close animation completes
    setTimeout(() => { setVisible(false) }, 260)
  }, [])

  // Attach global handlers for the legacy main form (sellForm) and wire to lookup/open
  useEffect(() => {
    const form = document.getElementById('sellForm') as HTMLFormElement | null
    const resultEl = document.getElementById('sellResult') as HTMLElement | null
    const loaderEl = document.getElementById('valuationLoader') as HTMLElement | null

    function showLoader() { if (!loaderEl) return; loaderEl.hidden = false; loaderEl.setAttribute('aria-hidden', 'false'); loaderEl.classList.add('visible') }
    function hideLoader() { if (!loaderEl) return; loaderEl.classList.remove('visible'); setTimeout(() => { loaderEl.hidden = true; loaderEl.setAttribute('aria-hidden', 'true') }, 240) }

    async function handleSubmit(e: Event) {
      e.preventDefault()
      const regInput = document.getElementById('registration') as HTMLInputElement | null
      const mileageInput = document.getElementById('mileage') as HTMLInputElement | null
      const reg = (regInput?.value || '').trim().toUpperCase()
      const mileage = (mileageInput?.value || '').trim()
      if (!reg || !mileage) { showSnackbar('Please enter registration and mileage', false); return }

      // check cached
      if (hasRegistration(reg)) {
        try {
          const arr = getStored() || []
          const rec = arr.slice().reverse().find(it => it.vehicle && it.vehicle.registration && it.vehicle.registration.toUpperCase() === reg)
          if (rec) {
            const hasVehicleData = rec.vehicle && Object.keys(rec.vehicle).length > 1
            if (hasVehicleData) {
              if (resultEl) { resultEl.innerHTML = '<div><strong>Registration:</strong> ' + (rec.vehicle && rec.vehicle.registration ? rec.vehicle.registration : reg) + '</div>'; resultEl.hidden = false }
              showSnackbar('Showing cached valuation for ' + reg, true)
              openVehiclePanel(rec)
              return
            }
            // fetch fresh if cached but missing data
            try {
              showLoader(); const fresh = await lookup(reg, mileage); store(fresh); if (resultEl) { resultEl.innerHTML = '<div><strong>Registration:</strong> ' + (fresh.vehicle && fresh.vehicle.registration ? fresh.vehicle.registration : reg) + '</div>'; resultEl.hidden = false }
              showSnackbar('Fetched vehicle details for ' + reg, true); openVehiclePanel(fresh); return
            } catch (err) { console.warn('Failed to fetch missing vehicle details for cached reg', err); showSnackbar('Failed to refresh vehicle details — showing cached data', false); openVehiclePanel(rec); return }
          }
        } catch (e) { console.warn('Error reading cached valuation', e) }
      }

      const submitBtn = form?.querySelector('button[type="submit"]') as HTMLButtonElement | null
      if (submitBtn) { submitBtn.disabled = true; submitBtn.setAttribute('aria-busy', 'true') }
      if (resultEl) resultEl.hidden = true
      showLoader(); setLoading(true)
      try {
        const data = await lookup(reg, mileage)
        store(data)
        const retail = data.valuations && (data.valuations.retail && (data.valuations.retail.amountGBP || data.valuations.retail.amount))
        if (resultEl) { resultEl.innerHTML = '<div><strong>Registration:</strong> ' + (data.vehicle && data.vehicle.registration ? data.vehicle.registration : reg) + '</div>'; resultEl.hidden = false }
        showSnackbar('Valuation fetched for ' + reg, true)
        openVehiclePanel(data)
      } catch (err: any) { console.error(err); showSnackbar('Failed to fetch valuation — ' + (err && err.message ? err.message : 'Unknown'), false) }
      finally { if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy') } hideLoader(); setLoading(false) }
    }

    if (form) form.addEventListener('submit', handleSubmit)

    return () => { if (form) form.removeEventListener('submit', handleSubmit) }
  }, [getStored, hasRegistration, lookup, openVehiclePanel, showSnackbar, store])

  // Panel controls: attach listeners only while panel is visible
  useEffect(() => {
    if (!visible) return
    const backdrop = backdropRef.current
    const panel = panelRef.current
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeVehiclePanel() }
    function onBackdropClick(e: MouseEvent) { if (e.target === backdrop) closeVehiclePanel() }
    const closeBtn = panel?.querySelector('#vehiclePanelClose') as HTMLButtonElement | null
    const closeBtn2 = panel?.querySelector('#vehiclePanelClose2') as HTMLButtonElement | null
    closeBtn?.addEventListener('click', closeVehiclePanel)
    closeBtn2?.addEventListener('click', closeVehiclePanel)
    backdrop?.addEventListener('click', onBackdropClick)
    document.addEventListener('keydown', onKey)

    return () => {
      closeBtn?.removeEventListener('click', closeVehiclePanel)
      closeBtn2?.removeEventListener('click', closeVehiclePanel)
      backdrop?.removeEventListener('click', onBackdropClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [visible])

  // cond-group behaviour within this panel — attach handlers when panel is visible
  useEffect(() => {
    if (!visible) return
    const panel = panelRef.current
    if (!panel) return
    const condBtns = Array.from(panel.querySelectorAll<HTMLButtonElement>('.cond-group .cond-btn'))
    const condInput = panel.querySelector<HTMLInputElement>('#panel-condition')
    if (!condBtns.length) return

    const removeFns: Array<() => void> = []

    condBtns.forEach((btn, idx) => {
      const isActive = btn.classList.contains('active')
      btn.setAttribute('role', 'radio')
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false')
      btn.setAttribute('tabindex', isActive ? '0' : '-1')

      function onClick() {
        condBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-checked', 'false'); b.setAttribute('tabindex', '-1') })
        btn.classList.add('active'); btn.setAttribute('aria-checked', 'true'); btn.setAttribute('tabindex', '0'); btn.focus()
        if (condInput) condInput.value = btn.dataset.cond || btn.textContent?.trim().toLowerCase() || ''
      }

      function onKey(e: KeyboardEvent) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); const next = condBtns[(idx + 1) % condBtns.length]; next && next.click() }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); const prev = condBtns[(idx - 1 + condBtns.length) % condBtns.length]; prev && prev.click() }
        else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); btn.click() }
      }

      btn.addEventListener('click', onClick)
      btn.addEventListener('keydown', onKey)

      removeFns.push(() => { btn.removeEventListener('click', onClick); btn.removeEventListener('keydown', onKey) })
    })

    // ensure hidden input initialised
    if (condInput && !condInput.value) {
      const active = condBtns.find(b => b.classList.contains('active')) || condBtns[0]
      condInput.value = active ? (active.dataset.cond || active.textContent?.trim().toLowerCase() || '') : ''
    }

    return () => { removeFns.forEach(fn => fn()) }
  }, [visible])

  // panel internal submit handled via React to ensure listeners attach when panel mounts
  const handlePanelSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formEl = e.currentTarget
    const submitBtn = formEl.querySelector<HTMLButtonElement>('button[type="submit"]')
    if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add('loading'); submitBtn.setAttribute('aria-busy', 'true') }
    // show confirmation immediately so the user sees feedback while the panel closes
    showSnackbar('Thanks — we have received your details. A tailored offer is on the way; we will contact you shortly.', true)
    setTimeout(() => {
      if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.removeAttribute('aria-busy'); submitBtn.disabled = false }
      const details = formEl.closest('details') as HTMLDetailsElement | null; if (details) details.removeAttribute('open')
      closeVehiclePanel()
    }, 900)
  }, [closeVehiclePanel, showSnackbar])

  // meta toggle
  useEffect(() => {
    const btn = panelRef.current?.querySelector<HTMLButtonElement>('#metaToggle')
    const target = panelRef.current?.querySelector<HTMLElement>('#metaCollapsed')
    if (!btn || !target) return
    function toggle() { 
      const open = target?.classList.toggle('open'); 
      target?.setAttribute('aria-hidden', open ? 'false' : 'true'); 
      btn?.setAttribute('aria-expanded', open ? 'true' : 'false'); 
      if (btn) btn.textContent = open ? 'Hide details' : 'More details'; 
    }
    btn.addEventListener('click', toggle)
    return () => btn.removeEventListener('click', toggle)
  }, [])

  // expose a global helper for other scripts if needed (optional)
  useEffect(() => {
    // @ts-ignore
    window.__openCarousVehiclePanel = (data: LookupResult) => openVehiclePanel(data)
    return () => { try { // @ts-ignore
      delete window.__openCarousVehiclePanel } catch (e) { } }
  }, [openVehiclePanel])

  // allow backdrop/hidden controlled via state
  return (
    <>
      {visible && (
        <div id="vehiclePanelBackdrop" ref={backdropRef} className={`vehicle-backdrop visible`} aria-hidden={false}>
          <aside id="vehiclePanel" ref={panelRef as any} className={`vehicle-panel open`} role="dialog" aria-modal={true} aria-labelledby="vehiclePanelTitle" tabIndex={-1}>
          <header className="vehicle-panel-header">
            <div className="vehicle-panel-headline">
              <h3 id="vehiclePanelTitle">{vehicle ? ((vehicle.make ? vehicle.make + ' ' : '') + (vehicle.model ? vehicle.model : 'Vehicle details')) : 'Vehicle details'}</h3>
              <div id="vehiclePanelPrice" className="vehicle-panel-price" aria-hidden="true">{valuations && valuations.retail && valuations.retail.amountGBP ? '£' + Number(valuations.retail.amountGBP).toLocaleString() : ''}</div>
            </div>
            <button id="vehiclePanelClose" className="vehicle-close" aria-label="Close vehicle details">×</button>
          </header>

          <div className="vehicle-panel-body" id="vehiclePanelBody">
            <div className="vehicle-meta">
              <div className="vehicle-meta-row"><strong>Registration:</strong> <span id="vp-registration">{vehicle?.registration || '—'}</span></div>
              <div className="vehicle-meta-row"><strong>Make:</strong> <span id="vp-make">{vehicle?.make || '—'}</span></div>
              <div className="vehicle-meta-row"><strong>Model:</strong> <span id="vp-model">{vehicle?.model || '—'}</span></div>
              <div className="vehicle-meta-row"><strong>First reg:</strong> <span id="vp-firstReg">{vehicle?.firstRegistrationDate || vehicle?.firstRegistrationYear || vehicle?.firstReg ? String(vehicle?.firstRegistrationDate || vehicle?.firstRegistrationYear || vehicle?.firstReg).slice(0,4) : '—'}</span></div>
              <div className="vehicle-meta-row"><strong>Colour:</strong> <span id="vp-colour">{vehicle?.colour || '—'}</span></div>

              <div id="metaCollapsed" className={`meta-collapsed${metaOpen ? ' open' : ''}`} aria-hidden={!metaOpen}>
                <div className="vehicle-meta-row"><strong>Fuel:</strong> <span id="vp-fuel">{vehicle?.fuelType || '—'}</span></div>
                <div className="vehicle-meta-row"><strong>Transmission:</strong> <span id="vp-transmission">{vehicle?.transmissionType || '—'}</span></div>
                <div className="vehicle-meta-row"><strong>Power (BHP):</strong> <span id="vp-power">{vehicle?.enginePowerBHP ?? vehicle?.enginePowerKW ?? vehicle?.power ?? '—'}</span></div>
                <div className="vehicle-meta-row"><strong>Doors / Seats:</strong> <span id="vp-doors">{vehicle?.doors ?? '—'}</span> / <span id="vp-seats">{vehicle?.seats ?? '—'}</span></div>
                <div className="vehicle-meta-row"><strong>CO₂ (g/km):</strong> <span id="vp-co2">{vehicle?.co2EmissionGPKM ?? '—'}</span></div>
              </div>

              <button id="metaToggle" className="meta-toggle" type="button" aria-expanded={metaOpen}>{metaOpen ? 'Hide details' : 'More details'}</button>

            </div>

              <div className="sell-form-panel">
                <div className="sell-form-inner">
                  <form id="panelSellForm" className="panel-sell-form" action="#" method="post" onSubmit={handlePanelSubmit}>
                    <label className="label" htmlFor="panel-name">Name</label>
                    <input id="panel-name" name="name" type="text" placeholder="Your Full Name" />

                    <label className="label" htmlFor="panel-email">Email</label>
                    <input id="panel-email" name="email" type="email" placeholder="your.email@example.com" />

                    <label className="label" htmlFor="panel-phone">Phone</label>
                    <input id="panel-phone" name="phone" type="tel" placeholder="+44 7911 123456" />

                    <div className="label">Vehicle Condition</div>
                    <div className="cond-group" role="radiogroup" aria-label="Vehicle condition">
                      <input type="hidden" id="panel-condition" name="condition" defaultValue="good" />
                      <button type="button" className="cond-btn" data-cond="excellent" role="radio" aria-checked={false} tabIndex={-1}>Excellent</button>
                      <button type="button" className="cond-btn active" data-cond="good" role="radio" aria-checked={true} tabIndex={0}>Good</button>
                      <button type="button" className="cond-btn" data-cond="fair" role="radio" aria-checked={false} tabIndex={-1}>Fair</button>
                      <button type="button" className="cond-btn" data-cond="poor" role="radio" aria-checked={false} tabIndex={-1}>Poor</button>
                    </div>

                    <label className="label" htmlFor="panel-notes">Optional Notes</label>
                    <textarea id="panel-notes" name="notes" placeholder="Any additional details about your car..."></textarea>

                    <button type="submit" className="btn-submit">Get an Instant Offer</button>
                  </form>
                </div>
              </div>
          </div>
        </aside>
        </div>
      )}

      {/* Snackbar rendered here so it's available to other handlers attached to the page */}
      {snackbar.visible && (
        <div id="snackbar" className={`snackbar ${snackbar.success ? 'snackbar--success' : 'snackbar--error'} snackbar--visible`} role="status" aria-live="polite">{snackbar.msg}</div>
      )}
    </>
  )
}
