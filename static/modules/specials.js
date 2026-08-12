/**
 * Live Monitor (Specials) — client controller.
 * Compact paginated table + KPI strip + "viewing now" rail + on-demand drawer
 * (toggled via .is-open, never the hidden attribute). Polls /api/specials/live
 * every 5s (pausable). Pagination is client-side over the starred set.
 */

const API = '/api';
const POLL_MS = 5000;
const PAGE_SIZE = 12;

const state = { specials: [], slugs: new Set(), page: 1, openSlug: null, timer: null, auto: true };

const el = (id) => document.getElementById(id);
const esc = (t) => { const d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; };

function fmtDur(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}
function fmtRel(iso) {
  if (!iso) return 'never';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'never';
  const d = Math.floor((Date.now() - t) / 1000);
  if (d < 15) return 'now';
  if (d < 60) return `${d}s`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}
const dev = (d) => (d === 'mobile' ? '📱' : d === 'tablet' ? '📟' : '💻');
function initials(name) {
  const p = String(name || '?').trim().split(/\s+/).slice(0, 2);
  return (p.map((x) => x[0] || '').join('').toUpperCase()) || '?';
}
function avatar(seed) {
  let h = 0;
  for (const c of String(seed || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `background:hsl(${h % 360} 52% 42%)`;
}
async function getJSON(url) {
  const r = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// ---- KPIs / header ---------------------------------------------------------

function renderKpis() {
  const L = state.specials;
  const live = L.reduce((n, s) => n + (Number(s.metrics?.liveNow) || 0), 0);
  const visits = L.reduce((n, s) => n + (Number(s.metrics?.visits) || 0), 0);
  const secs = L.reduce((n, s) => n + (Number(s.metrics?.totalSeconds) || 0), 0);
  el('lmTracked').textContent = L.length;
  el('lmVisits').textContent = visits;
  el('lmTime').textContent = fmtDur(secs);
  el('lmChipN').textContent = live;
  el('lmChip').classList.toggle('on', live > 0);
}

const pill = (n) => ((Number(n) || 0) > 0
  ? `<span class="lm-pill"><span class="d"></span>${Number(n)}</span>`
  : `<span class="lm-idle">—</span>`);

// ---- table + pagination ----------------------------------------------------

function totalPages() { return Math.max(1, Math.ceil(state.specials.length / PAGE_SIZE)); }

function renderTable() {
  const body = el('lmRows');
  if (!body) return;
  const L = state.specials;

  if (!L.length) {
    body.innerHTML = `<tr><td colspan="6"><div class="lm-msg">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      <p>No previews starred yet.</p>
      <p><a href="/dashboard">Star one on the Dashboard</a> to watch it live.</p>
    </div></td></tr>`;
    el('lmPager').hidden = true;
    return;
  }

  if (state.page > totalPages()) state.page = totalPages();
  const start = (state.page - 1) * PAGE_SIZE;
  const rows = L.slice(start, start + PAGE_SIZE);

  body.innerHTML = rows.map((s) => {
    const m = s.metrics || {};
    const dom = (s.domain || '').replace(/^https?:\/\//, '');
    return `<tr data-slug="${esc(s.slug)}">
      <td>
        <span class="lm-cell-id">
          <span class="lm-av" style="${avatar(s.slug || s.name)}">${esc(initials(s.name))}</span>
          <span class="lm-idwrap">
            <span class="lm-name">${esc(s.name || s.slug)}</span>
            <span class="lm-dom">${esc(dom || 'no domain')}</span>
          </span>
        </span>
      </td>
      <td>${pill(m.liveNow)}</td>
      <td class="num"><span class="lm-num">${Number(m.visits) || 0}</span></td>
      <td class="num"><span class="lm-num">${fmtDur(m.totalSeconds)}</span></td>
      <td class="num"><span class="lm-num">${Number(m.pageviews) || 0}</span></td>
      <td class="num muted">${fmtRel(m.lastSeen)}</td>
    </tr>`;
  }).join('');

  renderPager();
}

function renderPager() {
  const pager = el('lmPager');
  if (!pager) return;
  const total = state.specials.length;
  const pages = totalPages();
  if (total <= PAGE_SIZE) { pager.hidden = true; pager.innerHTML = ''; return; }
  pager.hidden = false;

  const start = (state.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(state.page * PAGE_SIZE, total);

  // windowed page numbers: 1 … c-1 c c+1 … N
  const nums = [];
  const add = (n) => nums.push(n);
  const win = new Set([1, pages, state.page, state.page - 1, state.page + 1]);
  let prev = 0;
  for (let i = 1; i <= pages; i++) {
    if (!win.has(i)) continue;
    if (prev && i - prev > 1) nums.push('…');
    add(i); prev = i;
  }

  const btn = (label, page, opts = {}) => {
    const dis = opts.disabled ? 'disabled' : '';
    const on = opts.on ? 'on' : '';
    if (label === '…') return `<button disabled>…</button>`;
    return `<button class="${on}" data-page="${page}" ${dis}>${label}</button>`;
  };

  pager.innerHTML = `
    <span class="lm-pageinfo">${start}–${end} of ${total}</span>
    <div class="lm-pagebtns">
      ${btn('‹', state.page - 1, { disabled: state.page <= 1 })}
      ${nums.map((n) => (n === '…' ? btn('…') : btn(n, n, { on: n === state.page }))).join('')}
      ${btn('›', state.page + 1, { disabled: state.page >= pages })}
    </div>`;
}

// ---- drawer ----------------------------------------------------------------

function openDrawer(slug) {
  state.openSlug = slug;
  const dw = el('lmDrawer');
  dw.classList.add('is-open');
  dw.setAttribute('aria-hidden', 'false');
  el('lmDwBody').innerHTML = `<p class="lm-muted">Loading…</p>`;
  refreshDrawer();
}
function closeDrawer() {
  state.openSlug = null;
  const dw = el('lmDrawer');
  dw.classList.remove('is-open');
  dw.setAttribute('aria-hidden', 'true');
}

async function refreshDrawer() {
  const slug = state.openSlug;
  if (!slug) return;
  let d;
  try { d = await getJSON(`${API}/previews/${encodeURIComponent(slug)}/metrics`); }
  catch { if (state.openSlug === slug) el('lmDwBody').innerHTML = `<p class="lm-muted">Couldn't load metrics.</p>`; return; }
  if (state.openSlug !== slug) return;

  el('lmDwName').innerHTML = `<span style="color:#f5b301">★</span> ${esc(d.name || slug)}`;
  const a = el('lmDwDomain');
  a.href = d.preview_url || (d.domain ? (d.domain.startsWith('http') ? d.domain : `https://${d.domain}`) : '#');
  a.textContent = (d.domain || '').replace(/^https?:\/\//, '') || 'Open preview';

  const m = d.metrics || {};
  const pages = d.pages || [];
  const live = d.liveSessions || [];
  const recent = d.recentSessions || [];
  const mx = pages.reduce((x, p) => Math.max(x, Number(p.views) || 0), 0) || 1;
  let base = '';
  try {
    base = d.preview_url ? new URL(d.preview_url).origin
      : (d.domain ? new URL(d.domain.startsWith('http') ? d.domain : `https://${d.domain}`).origin : '');
  } catch { base = ''; }

  const tiles = `<div class="lm-grid">
    <div class="lm-tile ${m.liveNow ? 'on' : ''}"><div class="v">${Number(m.liveNow) || 0}</div><div class="k">Viewing now</div></div>
    <div class="lm-tile"><div class="v">${Number(m.visits) || 0}</div><div class="k">Visits</div></div>
    <div class="lm-tile"><div class="v">${fmtDur(m.totalSeconds)}</div><div class="k">Total time</div></div>
    <div class="lm-tile"><div class="v">${fmtDur(m.avgSeconds)}</div><div class="k">Avg / visit</div></div>
    <div class="lm-tile"><div class="v">${Number(m.totalPageviews) || 0}</div><div class="k">Pages</div></div>
    <div class="lm-tile"><div class="v" style="font-size:1rem">${fmtRel(m.lastSeen)}</div><div class="k">Last seen</div></div>
  </div>`;

  const liveSec = live.length ? `<div class="lm-sec">Live now</div>${live.map((s) =>
    `<div class="lm-row"><span class="a"><span class="lm-live">●</span> ${esc(s.current_title || s.current_path || '—')}</span><span class="b">${dev(s.device_type)} ${fmtDur(s.active_seconds)}</span></div>`).join('')}` : '';

  const pagesSec = pages.length
    ? `<div class="lm-sec">Pages</div>${pages.map((p) => {
        const label = esc(p.title || p.path);
        const url = base + encodeURI(p.path || '/');
        const head = base
          ? `<a class="lm-pg-path lm-pg-link" href="${url}" target="_blank" rel="noopener" title="${esc(base + (p.path || ''))}">${label}</a>`
          : `<span class="lm-pg-path" title="${esc(p.path || '')}">${label}</span>`;
        return `<div class="lm-pg"><div class="lm-pg-t">${head}<span class="lm-pg-stat">${Number(p.views) || 0} · ${fmtDur(p.total_seconds)}</span></div><div class="lm-bar"><i style="width:${Math.round(((Number(p.views) || 0) / mx) * 100)}%"></i></div></div>`;
      }).join('')}`
    : `<div class="lm-sec">Pages</div><p class="lm-muted">No page views yet.</p>`;

  const recentSec = recent.length ? `<div class="lm-sec">Recent visits</div>${recent.map((s) =>
    `<div class="lm-row"><span class="a">${esc(fmtRel(s.started_at))}${s.status === 'active' ? ' · <span class="lm-live">live</span>' : ''}</span><span class="b">${dev(s.device_type)} ${fmtDur(s.active_seconds)} · ${Number(s.page_count) || 0} pg</span></div>`).join('')}` : '';

  el('lmDwBody').innerHTML = tiles + liveSec + pagesSec + recentSec;
}

// ---- data + polling --------------------------------------------------------

async function loadSpecials() {
  try {
    const data = await getJSON(`${API}/specials`);
    state.specials = data.specials || [];
    state.slugs = new Set(state.specials.map((s) => s.slug));
    renderKpis();
    renderTable();
  } catch {
    const b = el('lmRows');
    if (b) b.innerHTML = `<tr><td colspan="6"><div class="lm-msg"><p>Couldn't load previews.</p><p class="lm-muted">Are you signed in?</p></div></td></tr>`;
    el('lmPager').hidden = true;
  }
}

async function pollLive() {
  let data;
  try { data = await getJSON(`${API}/specials/live`); } catch { return; }
  const incoming = data.specials || [];
  const set = new Set();
  incoming.forEach((s) => { set.add(s.slug); });

  const same = set.size === state.slugs.size && [...set].every((x) => state.slugs.has(x));
  if (!same) {
    await loadSpecials();
  } else {
    const by = {};
    incoming.forEach((s) => { by[s.slug] = s; });
    state.specials.forEach((s) => {
      const f = by[s.slug];
      if (f) s.metrics = { visits: f.visits, totalSeconds: f.totalSeconds, pageviews: f.pageviews, lastSeen: f.lastSeen, liveNow: f.liveNow };
    });
    renderKpis();
    renderTable();
  }
  if (state.openSlug) refreshDrawer();
}

function startPolling() {
  if (state.timer) window.clearInterval(state.timer);
  state.timer = window.setInterval(() => {
    if (state.auto && document.visibilityState === 'visible') pollLive();
  }, POLL_MS);
}

// ---- init ------------------------------------------------------------------

function init() {
  const rows = el('lmRows');
  if (rows) {
    rows.addEventListener('click', (e) => { const r = e.target.closest('tr[data-slug]'); if (r) openDrawer(r.dataset.slug); });
  }

  const pager = el('lmPager');
  if (pager) {
    pager.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-page]');
      if (!b || b.disabled) return;
      const p = parseInt(b.dataset.page, 10);
      if (!Number.isNaN(p) && p !== state.page) { state.page = p; renderTable(); }
    });
  }

  el('lmDrawer')?.addEventListener('click', (e) => { if (e.target.closest('[data-lm-close]')) closeDrawer(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.openSlug) closeDrawer(); });

  const auto = el('lmAuto');
  if (auto) { state.auto = auto.checked; auto.addEventListener('change', () => { state.auto = auto.checked; if (state.auto) pollLive(); }); }

  el('lmRefresh')?.addEventListener('click', async () => { await loadSpecials(); await pollLive(); });

  loadSpecials().then(pollLive);
  startPolling();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
