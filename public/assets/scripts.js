  // Search button -> apply filters (guard if button missing)
  const searchBtn = document.getElementById('search-btn');
  if(searchBtn) searchBtn.addEventListener('click', applyFilters);

  function applyFilters(){
    const makeEl = document.getElementById('filter-make');
    const modelEl = document.getElementById('filter-model');
    const minEl = document.getElementById('filter-min');
    const maxEl = document.getElementById('filter-max');
    const make = makeEl ? makeEl.value : '';
    const model = modelEl ? modelEl.value : '';
    const min = minEl ? parseInt(minEl.value || 0, 10) : 0;
    const max = maxEl && maxEl.value ? parseInt(maxEl.value, 10) : Infinity;

    document.querySelectorAll('#vehicle-cards .card').forEach(card=>{
      const cMake = card.getAttribute('data-make');
      const cModel = card.getAttribute('data-model');
      const price = parseInt(card.getAttribute('data-price')||0,10);

      let visible = true;
      if(make && cMake !== make) visible = false;
      if(model && cModel !== model) visible = false;
      if(price < min) visible = false;
      if(price > max) visible = false;

      card.style.display = visible ? '' : 'none';
    });
  }
  // Sticky topbar: make nav appear seamless over hero, then fix it when scrolling
  const topbar = document.querySelector('.topbar');
  const hero = document.querySelector('.hero');
  // Do not enable sticky behavior on pages where .topbar has the `no-sticky` marker
  if(topbar && hero && !topbar.classList.contains('no-sticky')){
    // ensure hero has initial padding to account for overlaid nav when it becomes fixed
    hero.classList.add('hero--with-nav-padding');
    const stickyThreshold = 20; // px scrolled before nav snaps
    function onScroll(){
      if(window.scrollY > stickyThreshold){
        if(!topbar.classList.contains('sticky')) topbar.classList.add('sticky');
      } else {
        topbar.classList.remove('sticky');
      }
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    // initialize
    onScroll();
  }
  // Mobile hamburger toggle for menu
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if(hamburger && topbar && mobileMenu){
    // create overlay once
    let mobileOverlay = document.querySelector('.mobile-overlay');
    if(!mobileOverlay){
      mobileOverlay = document.createElement('div');
      mobileOverlay.className = 'mobile-overlay';
      document.body.appendChild(mobileOverlay);
    }

    // Ensure mobileMenu is a direct child of <body> so stacking contexts and z-index
    // behave predictably relative to the overlay. This avoids the overlay appearing
    // above the panel on some browsers due to stacking context rules.
    try{
      if(mobileMenu && mobileMenu.parentNode !== document.body){
        document.body.appendChild(mobileMenu);
      }
    }catch(e){ /* ignore if move fails */ }

    function openMobile(){
      // Compensate for scrollbar disappearance to avoid layout shift
      const hasVScroll = document.documentElement.clientWidth < window.innerWidth;
      if(hasVScroll){
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = scrollBarWidth + 'px';
      }
      mobileMenu.classList.add('open');
      try{ mobileMenu.setAttribute('aria-hidden','false'); }catch(e){}
      mobileOverlay.classList.add('open');
      document.body.classList.add('mobile-open');
      hamburger.setAttribute('aria-expanded','true');
      // move focus into first focusable element in mobileMenu
      const focusable = mobileMenu.querySelector('a,button,input,select,textarea,[tabindex]');
      if(focusable) focusable.focus();
    }

    function closeMobile(){
      mobileMenu.classList.remove('open');
      try{ mobileMenu.setAttribute('aria-hidden','true'); }catch(e){}
      mobileOverlay.classList.remove('open');
      document.body.classList.remove('mobile-open');
      // remove scrollbar compensation
      document.body.style.paddingRight = '';
      hamburger.setAttribute('aria-expanded','false');
      hamburger.focus();
    }

    hamburger.addEventListener('click', ()=>{
      if(mobileMenu.classList.contains('open')) closeMobile(); else openMobile();
    });

    // wire the close button inside the mobile-panel (if present)
    try{
      const closeBtn = mobileMenu.querySelector('.mobile-close');
      if(closeBtn) closeBtn.addEventListener('click', ()=> closeMobile());
    }catch(e){}

    // close when clicking overlay
    mobileOverlay.addEventListener('click', closeMobile);

    // close on Escape key
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && mobileMenu.classList.contains('open')){
        closeMobile();
      }
    });
  }
  // Neon underline: set active link class when clicked
  const navLinks = document.querySelectorAll('.nav-links a');
  if(navLinks && navLinks.length){
    navLinks.forEach(a=>{
      a.addEventListener('click', (e)=>{
        navLinks.forEach(x=>x.classList.remove('active'));
        a.classList.add('active');
      });
    });
  }
  // Mobile menu links should close menu and set active state
  const mobileLinks = document.querySelectorAll('.mobile-menu a');
  if(mobileLinks && mobileLinks.length){
    mobileLinks.forEach(m=>{
      m.addEventListener('click', ()=>{
        // close the panel using new API
        const open = mobileMenu && mobileMenu.classList.contains('open');
        if(open){
          mobileMenu.classList.remove('open');
          const overlay = document.querySelector('.mobile-overlay');
          if(overlay) overlay.classList.remove('open');
          document.body.classList.remove('mobile-open');
          if(hamburger) hamburger.setAttribute('aria-expanded','false');
        }
        // sync active link in desktop nav if href matches
        const href = m.getAttribute('href');
        if(href){
          const match = document.querySelector('.nav-links a[href="'+href+'"]');
          if(match){ navLinks.forEach(x=>x.classList.remove('active')); match.classList.add('active'); }
        }
      });
    });
  }
  // Persist active nav state on page load by matching link hrefs to current URL
  (function persistActiveNav(){
    try{
      const origin = location.origin;
      const allLinks = Array.from(document.querySelectorAll('.nav-links a, .mobile-menu a'));
      if(!allLinks.length) return;
      // clear existing
      allLinks.forEach(l=>l.classList && l.classList.remove('active'));

      function linkMatchesCurrent(href){
        if(!href) return false;
        // hash-only links
        if(href.startsWith('#') && href === location.hash) return true;
        try{
          const url = new URL(href, origin);
          // exact match (including search/hash)
          if(url.href === location.href) return true;
          // same pathname (useful for index.html vs /)
          if(url.pathname === location.pathname) return true;
          // index.html normalization
          if((url.pathname === '/index.html' || url.pathname === '/index.htm') && (location.pathname === '/' || location.pathname === '/index.html' || location.pathname === '/index.htm')) return true;
        }catch(e){
          return false;
        }
        return false;
      }

      for(const link of allLinks){
        const href = link.getAttribute('href');
        if(linkMatchesCurrent(href)){
          // mark link active
          link.classList.add('active');
          // also try to find and mark corresponding desktop nav link
          const desktop = document.querySelector('.nav-links a[href="'+href+'"]');
          if(desktop) desktop.classList.add('active');
          break;
        }
      }
    }catch(err){
      // fail silently
      console.warn('persistActiveNav error', err);
    }
  })();

// --- Robust brand carousel + brand->filter bridge (self-contained initializer)
(function(){
  function ready(fn){ if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function(){
    const brandList = document.getElementById('brand-list');
    const brandScroll = document.querySelector('.brand-scroll') || brandList;
    const left = document.getElementById('brand-left');
    const right = document.getElementById('brand-right');
    if(!brandList) return; // nothing to do

    // Helper to get non-placeholder children
    function realChildren(){ return Array.from(brandList.children).filter(ch => !ch.classList.contains || !ch.classList.contains('placeholder')); }

    const BREAKPOINT = 900; // >= => 5 per slide, else 3
    let state = { per: 3, itemFullWidth: 0, totalItems: 0, totalPages: 1, currentPage: 0 };

    function computeState(){
      const first = brandList.querySelector('.brand-item:not(.placeholder)');
      if(!first){ state.totalItems = 0; state.totalPages = 1; state.itemFullWidth = brandList.clientWidth || 0; return state; }
      const rect = first.getBoundingClientRect();
      let gap = 12;
      try{ const cs = window.getComputedStyle(brandList); const g = cs.getPropertyValue('gap') || cs.getPropertyValue('column-gap'); if(g) gap = parseFloat(g) || gap; }catch(e){}
      const itemFullWidth = Math.round(rect.width + gap);
      const totalItems = realChildren().length || brandList.children.length;
      const per = (window.innerWidth >= BREAKPOINT) ? 5 : 3;
      const totalPages = Math.max(1, Math.ceil(totalItems / per));
      state.per = per; state.itemFullWidth = itemFullWidth; state.totalItems = totalItems; state.totalPages = totalPages;
      if(state.currentPage >= state.totalPages) state.currentPage = state.totalPages - 1;
      if(state.currentPage < 0) state.currentPage = 0;
      return state;
    }

    function goToPage(idx){
      computeState();
      const target = Math.max(0, Math.min(idx, state.totalPages - 1));
      state.currentPage = target;
      const children = realChildren();
      const el = children[target * state.per] || children[children.length - 1];
      if(el){
        // compute el left relative to the scroll container
        const scrollContainer = brandScroll || brandList;
        const elRect = el.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const left = Math.round(elRect.left - containerRect.left + scrollContainer.scrollLeft);
        scrollContainer.scrollTo({ left: left, behavior: 'smooth' });
      }
    }

    if(left) left.addEventListener('click', ()=> goToPage(state.currentPage - 1));
    if(right) right.addEventListener('click', ()=> goToPage(state.currentPage + 1));

    // sync page index on manual scroll (listen on the scroll wrapper if present)
    let t = null;
    const scrollEl = brandScroll || brandList;
    scrollEl.addEventListener('scroll', ()=>{ clearTimeout(t); t = setTimeout(()=>{ computeState(); if(state.itemFullWidth > 0){ const p = Math.round(scrollEl.scrollLeft / (state.per * state.itemFullWidth)); state.currentPage = Math.max(0, Math.min(p, state.totalPages - 1)); } }, 80); }, { passive: true });

    // recompute on resize and keep current leftmost item visible
    let r = null;
    window.addEventListener('resize', ()=>{ clearTimeout(r); r = setTimeout(()=>{ const before = state.currentPage * (state.per || 1); computeState(); const newPage = Math.floor(before / (state.per || 1)); goToPage(newPage); }, 120); }, { passive: true });

    // wire brand click -> set filter and call applyFilters if available
    brandList.addEventListener('click', function(e){ const btn = e.target.closest && e.target.closest('.brand-item'); if(!btn) return; const brand = btn.getAttribute('data-brand') || btn.textContent.trim(); const makeSelect = document.getElementById('filter-make'); if(makeSelect){ try{ makeSelect.value = brand; }catch(e){} try{ if(typeof applyFilters === 'function'){ applyFilters(); } else { makeSelect.dispatchEvent(new Event('change')); } }catch(err){} } });

    // ensure initial state computed
    computeState();
  });
})();

  // Inventory JSON loader: fetches data/inventory.json and renders cards into #inventoryGrid
  (function inventoryLoader(){
    if(!('fetch' in window)) return; // guard older environments
    // We're already inside DOMContentLoaded when this script runs, so run immediately.
    const grid = document.getElementById('inventoryGrid');
    if(!grid) return;

    function slugify(v){
      const t = [v.year, v.make, v.model, v.reg].filter(Boolean).join(' ');
      return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    }

    function fmtPrice(p){ if(typeof p !== 'number') return p||''; return '£' + p.toLocaleString(); }
    function fmtMileage(m){ if(!m && m !== 0) return ''; try{ return (typeof m === 'number' ? m.toLocaleString() : m) + ' mi'; }catch(e){ return m; } }

    if(!window.__inventoryPromise){
      // Request a reasonable page size for legacy consumers; avoid huge unbounded requests.
      window.__inventoryPromise = fetch('/api/inventory?page=1&per_page=100', {cache:'no-cache'}).then(function(r){ if(!r.ok) throw new Error('inventory fetch failed'); return r.json(); }).then(function(payload){ return Array.isArray(payload.items) ? payload.items : []; }).catch(function(err){ window.__inventoryPromise = null; throw err; });
    }
    window.__inventoryPromise.then(function(list){
      if(!Array.isArray(list) || !list.length) return;
      try{ console.info('inventoryLoader: fetched', Array.isArray(list) ? list.length : 0, 'vehicles'); }catch(e){}
      // clear existing static cards (we treat the JSON as truth)
      grid.innerHTML = '';

      // pagination settings
      const PER_PAGE = 12;
      window.__inventory = list;

      function getPageFromQuery(){
        try{ const p = parseInt(new URLSearchParams(location.search).get('page')||'1',10); return (isNaN(p) || p < 1) ? 1 : p; }catch(e){ return 1; }
      }
      function setPageInUrl(page){ try{ const u = new URL(location.href); u.searchParams.set('page', page); history.replaceState(null, '', u); }catch(e){} }

      function createCard(v){
        const a = document.createElement('article');
        a.className = 'car-card';
        a.setAttribute('data-make', v.make || '');
        a.setAttribute('data-model', v.model || '');
        a.setAttribute('data-price', (v.price||0));
        a.setAttribute('data-mileage', (v.mileage||0));
        a.setAttribute('data-trans', v.trans || '');
        a.setAttribute('data-fuel', v.fuel || '');
        a.setAttribute('data-reg', v.reg || '');

        const media = document.createElement('div'); media.className = 'media';
        const img = document.createElement('img'); img.alt = ((v.year||'') + ' ' + (v.make||'') + ' ' + (v.model||'')).trim(); img.src = v.image || '';
        media.appendChild(img);

        // overlay
        (function(){
          const overlay = document.createElement('div'); overlay.className = 'media-overlay';
          const shareBtn = document.createElement('button'); shareBtn.type = 'button'; shareBtn.className = 'icon-btn share-btn'; shareBtn.title = 'Share';
          shareBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 3v13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 8l5-5 5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          const slug = slugify(v);
          const vehicleHref = '/vehicle/?car=' + encodeURIComponent(slug);
          shareBtn.addEventListener('click', function(e){ e.stopPropagation(); try{ if(navigator.share){ navigator.share({ title: (v.make+' '+v.model), text: v.description || '', url: vehicleHref }); } else { window.prompt('Copy link to share', vehicleHref); } }catch(err){ window.prompt('Copy link to share', vehicleHref); } });

          const favBtn = document.createElement('button'); favBtn.type = 'button'; favBtn.className = 'icon-btn fav-btn'; favBtn.title = 'Save'; favBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
          favBtn.addEventListener('click', function(e){ e.stopPropagation(); favBtn.classList.toggle('saved'); });

          overlay.appendChild(shareBtn); overlay.appendChild(favBtn);

          const count = document.createElement('div'); count.className = 'img-count';
          const imgs = (v.images && v.images.length) ? v.images.length : (v.gallery && v.gallery.length ? v.gallery.length : (v.image ? 1 : 0));
          count.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 7h-3.2l-1.6-2.4A1 1 0 0 0 15.6 4H8.4a1 1 0 0 0-.6.2L6.2 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="1.2" fill="none"/></svg><span>' + (imgs || 1) + '</span>';
          media.appendChild(overlay); media.appendChild(count);
        })();

        const body = document.createElement('div'); body.className = 'card-body';
        const titleRow = document.createElement('div'); titleRow.className = 'title-row';
        const h3 = document.createElement('h3'); h3.className = 'car-title'; h3.textContent = ((v.year||'') + ' ' + (v.make||'') + ' ' + (v.model||'')).trim();
        const priceEl = document.createElement('div'); priceEl.className = 'price'; priceEl.textContent = v.price ? fmtPrice(v.price) : '';
        titleRow.appendChild(h3); titleRow.appendChild(priceEl);
        const meta = document.createElement('div'); meta.className = 'meta';
        const parts = [];
        if(v.trim) parts.push(v.trim);
        if(v.features && v.features.length) parts.push(v.features.slice(0,2).join(' — '));
        if(v.mileage) parts.push(fmtMileage(v.mileage));
        if(v.trans) parts.push(v.trans);
        meta.textContent = parts.filter(Boolean).join(' — ');
        const carMeta = document.createElement('div'); carMeta.className = 'car-meta';
        const spYear = document.createElement('span'); spYear.className = 'year'; spYear.textContent = v.year || '';
        const spMileage = document.createElement('span'); spMileage.className = 'mileage'; spMileage.textContent = fmtMileage(v.mileage || '');
        const spFuel = document.createElement('span'); spFuel.className = 'fuel'; spFuel.textContent = v.fuel || '';
        const spTrans = document.createElement('span'); spTrans.className = 'trans'; spTrans.textContent = v.trans || '';

        // inject small inline SVG icon wrappers (matches fallback used elsewhere)
        try{
          const icons = {
            year: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.6"/></svg>` ,
            mileage: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 12l4-4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`,
            fuel: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2s5 5 5 9a5 5 0 0 1-10 0c0-4 5-9 5-9z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`,
            trans: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 6h10M4 12h16M4 18h7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`
          };

          function attachIcon(span, key){
            if(!span) return;
            const wrapper = document.createElement('div');
            wrapper.className = 'lucide-fallback';
            wrapper.setAttribute('aria-hidden','true');
            wrapper.innerHTML = icons[key] || icons['mileage'];
            span.insertBefore(wrapper, span.firstChild);
          }

          attachIcon(spYear, 'year');
          attachIcon(spMileage, 'mileage');
          attachIcon(spFuel, 'fuel');
          attachIcon(spTrans, 'trans');
        }catch(e){ /* ignore icon injection errors */ }

        [spYear, spMileage, spFuel, spTrans].forEach(s=> carMeta.appendChild(s));
        // Details link removed for generated cards (card click handles navigation)

        body.appendChild(titleRow); body.appendChild(meta);
        if(v.description){ const short = document.createElement('div'); short.className = 'short-desc'; const txt = String(v.description||'').trim(); short.textContent = txt.length>140 ? txt.slice(0,137).replace(/\s+[^\s]*$/,'') + '…' : txt; body.appendChild(short); }
        body.appendChild(carMeta);
        a.appendChild(media); a.appendChild(body);

        // permalink behaviour: clicking the card navigates to the vehicle permalink
        try{ const vehicleHref = '/vehicle/?car=' + encodeURIComponent(slugify(v)); a.addEventListener('click', function(e){ if(e.target.closest('a,button,input')) return; window.location.assign(vehicleHref); }); }catch(e){}

        return a;
      }

      // pagination UI
      const paginationId = 'inventoryPagination';
      let paginationEl = document.getElementById(paginationId);
      if(!paginationEl){ paginationEl = document.createElement('nav'); paginationEl.id = paginationId; paginationEl.className = 'inventory-pagination'; grid.parentNode.insertBefore(paginationEl, grid.nextSibling); }

      function renderPage(page){
        const total = list.length;
        const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
        if(page < 1) page = 1; if(page > totalPages) page = totalPages;
        grid.innerHTML = '';
        const start = (page - 1) * PER_PAGE;
        const pageItems = list.slice(start, start + PER_PAGE);
        pageItems.forEach(v=> grid.appendChild(createCard(v)));
        buildPagination(totalPages, page);
      }

      function buildPagination(totalPages, current){
        paginationEl.innerHTML = '';
        function makeBtn(label, cls, disabled, page){ const b = document.createElement('button'); b.type='button'; b.className = cls || ''; if(disabled) b.disabled = true; b.textContent = label; if(!disabled) b.addEventListener('click', ()=>{ setPageInUrl(page); renderPage(page); grid.scrollIntoView({behavior:'smooth', block:'start'}); }); return b; }

        paginationEl.appendChild(makeBtn('« First','first-btn', current===1, 1));
        paginationEl.appendChild(makeBtn('‹ Prev','prev-btn', current===1, Math.max(1, current-1)));

        const windowSize = 3; let start = Math.max(1, current - windowSize); let end = Math.min(totalPages, current + windowSize);
        if(start > 1){ const b = makeBtn('1','page-btn', false, 1); paginationEl.appendChild(b); if(start > 2) paginationEl.appendChild(Object.assign(document.createElement('span'), {className:'ellipsis', textContent:'…'})); }
        for(let i=start;i<=end;i++){ const btn = makeBtn(String(i), 'page-btn' + (i===current ? ' active' : ''), false, i); paginationEl.appendChild(btn); }
        if(end < totalPages){ if(end < totalPages - 1) paginationEl.appendChild(Object.assign(document.createElement('span'), {className:'ellipsis', textContent:'…'})); const b = makeBtn(String(totalPages), 'page-btn', false, totalPages); paginationEl.appendChild(b); }

        paginationEl.appendChild(makeBtn('Next ›','next-btn', current===totalPages, Math.min(totalPages, current+1)));
        paginationEl.appendChild(makeBtn('Last »','last-btn', current===totalPages, totalPages));
      }

      // initial render
      const initial = getPageFromQuery(); renderPage(initial);
      }).catch(err=>{ console.warn('Failed to load inventory.json', err); });
  })();

  /* Hero background LQIP blur-up loader (uses local image path in data-bg) */
  (function heroBgLQIP(){
    const bg = document.querySelector('.hero-cta__bg');
    if(!bg) return;
    const full = bg.dataset && bg.dataset.bg;
    if(!full) return;
    if(bg.classList.contains('loaded')) return;

    function loadFull(){
      const pre = new Image();
      pre.onload = function(){
        try{ bg.style.backgroundImage = 'url("' + full + '")'; }catch(e){ bg.style.backgroundImage = 'url("' + full + '")'; }
        bg.classList.add('loaded');
        bg.classList.remove('lqip');
      };
      pre.onerror = function(){
        bg.style.backgroundImage = 'url("' + full + '")';
        bg.classList.add('loaded');
        bg.classList.remove('lqip');
      };
      pre.src = full;
    }

    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries, obs)=>{
        entries.forEach(en=>{
          if(en.isIntersecting){ loadFull(); obs.unobserve(en.target); }
        });
      }, {rootMargin:'400px 0px 400px 0px', threshold:0.01});
      io.observe(bg);
    } else {
      // fallback
      setTimeout(loadFull, 300);
    }
  })();

  /* Site-wide LQIP blur-up for other images (services mosaic, hero, about, etc.) */
  (function siteWideLQIP(){
    const selectors = ['.services-mosaic img', '.about-image img', '.hero img', '.service-card img'];
    const nodes = Array.from(document.querySelectorAll(selectors.join(',')));
    if(!nodes.length) return;

    // prepare low-res placeholders for each image unless already prepared
    nodes.forEach(img=>{
      if(!img || img.dataset && img.dataset.src) return;
      const full = img.getAttribute('src');
      if(!full) return;
      img.dataset.src = full;
      let lq = full;
      try{
        if(/w=\d+/.test(full) || /q=\d+/.test(full)){
          lq = full.replace(/w=\d+/, 'w=60').replace(/q=\d+/, 'q=10');
        } else {
          lq = full + (full.includes('?') ? '&' : '?') + 'auto=format&fit=crop&w=60&q=10';
        }
      }catch(e){ lq = full; }
      img.src = lq;
      img.classList.add('lqip');
    });

    function loadFull(img){
      if(!img || !img.dataset || !img.dataset.src) return;
      if(img.classList.contains('loaded')) return;
      const full = img.dataset.src;
      const pre = new Image();
      pre.onload = function(){ img.src = full; img.classList.add('loaded'); img.classList.remove('lqip'); };
      pre.onerror = function(){ img.src = full; img.classList.add('loaded'); img.classList.remove('lqip'); };
      pre.src = full;
    }

    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries, obs)=>{
        entries.forEach(en=>{
          if(en.isIntersecting){
            loadFull(en.target);
            obs.unobserve(en.target);
          }
        });
      }, {rootMargin:'200px 0px 200px 0px', threshold:0.01});
      nodes.forEach(n=> io.observe(n));
    } else {
      // fallback: progressively load after short delay
      setTimeout(()=> nodes.forEach(loadFull), 800);
    }
  })();

  /* Featured vehicles carousel: accessible, autoplay, keyboard and swipe support */
  (function featuredCarousel(){
    const carousel = document.getElementById('featuredCarousel');
    if(!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    const dotsWrap = carousel.querySelector('.carousel-dots');
    if(!track) return;

    // group size (cards per slide)
    const groupSize = 3;

    // helper to build a DOM `.card` element from an inventory item
    function buildCardFromInventory(item){
      const art = document.createElement('article'); art.className = 'card';
      art.dataset.make = item.make || '';
      art.dataset.model = item.model || '';
      art.dataset.price = item.price || '';

      const img = document.createElement('img'); img.alt = (item.year ? item.year + ' ' : '') + (item.make||'') + ' ' + (item.model||'');
      img.src = item.image || (item.images && item.images[0]) || '/images/placeholder-car.jpg';
      art.appendChild(img);

      const body = document.createElement('div'); body.className = 'card-body';
      const h3 = document.createElement('h3'); h3.textContent = ((item.year||'') + ' ' + (item.make||'') + ' ' + (item.model||'')).trim(); body.appendChild(h3);
      const meta = document.createElement('p'); meta.className = 'meta';
      const engine = item.engineCapacity || item.engineCapacityLitres ? (item.engineCapacity || (item.engineCapacityLitres ? (Math.round(item.engineCapacityLitres*10)/10 + 'L') : '')) : '';
      meta.textContent = [engine, item.mileage ? (typeof item.mileage === 'number' ? item.mileage.toLocaleString() + ' mi' : item.mileage) : '', item.trans || ''].filter(Boolean).join(' — ');
      body.appendChild(meta);

      const badges = document.createElement('div'); badges.className = 'spec-badges';
      const addBadge = (title, value)=>{
        const sp = document.createElement('span'); sp.className = 'spec-badge'; sp.title = title;
        const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('class','spec-icon'); svg.setAttribute('viewBox','0 0 24 24');
        // icon map for matching visuals used elsewhere in the markup
        const badgeIcons = {
          'Engine': '<path d="M3 11h4l2-4h6l2 4h4v6a1 1 0 0 1-1 1h-1v1H5v-1H4a1 1 0 0 1-1-1v-6z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
          'Transmission': '<path d="M7 7v10M12 7v10M17 7v10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
          'Mileage': '<path d="M12 7a5 5 0 1 1-4.9 6.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M12 3v4l1 1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
        };
        svg.innerHTML = badgeIcons[title] || '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.2"></circle>';
        const txt = document.createElement('span'); txt.className = 'spec-text'; txt.textContent = value || '';
        sp.appendChild(svg); sp.appendChild(txt); badges.appendChild(sp);
      };
      if(engine) addBadge('Engine', engine);
      if(item.trans) addBadge('Transmission', item.trans);
      if(item.mileage) addBadge('Mileage', (typeof item.mileage === 'number' ? item.mileage.toLocaleString() + ' mi' : item.mileage));
      body.appendChild(badges);

      const price = document.createElement('div'); price.className = 'price'; price.textContent = item.price ? '£' + (Number(item.price).toLocaleString()) : ''; body.appendChild(price);

      art.appendChild(body);

      // make clickable: navigate to vehicle page using slug
      art.style.cursor = 'pointer';
      art.addEventListener('click', function(){ const slug = ((item.year||'') + ' ' + (item.make||'') + ' ' + (item.model||'') + ' ' + (item.subTitle||item.reg||'')).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); window.location.href = '/vehicle/?car=' + encodeURIComponent(slug); });

      return art;
    }

    // init carousel from an array of card elements
    function initCarouselWithCards(sourceCards){
      // Prepare LQIP blur-up placeholders
      sourceCards.forEach(card=>{
        const img = card.querySelector('img');
        if(!img) return;
        const full = img.getAttribute('src') || img.src;
        if(!full) return;
        img.dataset.src = full;
        let lq = full;
        try{
          if(/w=\d+/.test(full) || /q=\d+/.test(full)){
            lq = full.replace(/w=\d+/, 'w=60').replace(/q=\d+/, 'q=10');
          } else {
            lq = full + (full.includes('?') ? '&' : '?') + 'auto=format&fit=crop&w=60&q=10';
          }
        }catch(e){ lq = full; }
        img.src = lq;
        img.classList.add('lqip');
      });

      // rebuild track as grouped slides
      track.innerHTML = '';
      for(let i=0;i<sourceCards.length;i+=groupSize){
        const slide = document.createElement('div'); slide.className = 'carousel-slide';
        const grid = document.createElement('div'); grid.className = 'cards-grid';
        for(let j=i;j<i+groupSize && j<sourceCards.length;j++) grid.appendChild(sourceCards[j]);
        slide.appendChild(grid); track.appendChild(slide);
      }

      let index = 0;
      const slides = Array.from(track.querySelectorAll('.carousel-slide'));
      let autoplay = carousel.getAttribute('data-autoplay') === 'true';
      let interval = parseInt(carousel.getAttribute('data-interval')||'6000',10);
      let timer = null;

      // build dots
      slides.forEach((s,i)=>{
        const btn = document.createElement('button'); btn.className = i===0 ? 'active' : ''; btn.type='button'; btn.setAttribute('aria-label','Go to slide '+(i+1)); btn.setAttribute('role','tab'); btn.addEventListener('click', ()=> goTo(i)); dotsWrap.appendChild(btn);
      });
      const dots = Array.from(dotsWrap.querySelectorAll('button'));

      function loadImagesInSlide(i){
        if(!slides || slides.length === 0) return;
        const idx = ((i % slides.length) + slides.length) % slides.length;
        const slide = slides[idx]; if(!slide) return;
        const imgs = Array.from(slide.querySelectorAll('img'));
        imgs.forEach(img=>{
          const full = img.dataset && img.dataset.src;
          if(!full) return;
          if(img.classList.contains('loaded')) return;
          const pre = new Image(); pre.onload = function(){ img.src = full; img.classList.add('loaded'); img.classList.remove('lqip'); }; pre.onerror = function(){ img.src = full; img.classList.add('loaded'); img.classList.remove('lqip'); }; pre.src = full;
        });
      }

      function update(){ const x = -index * 100; track.style.transform = 'translate3d(' + x + '%, 0, 0)'; dots.forEach((d,i)=> d.classList.toggle('active', i===index)); slides.forEach((s,i)=>{ const active = i === index; s.classList.toggle('active', active); s.setAttribute('aria-hidden', active ? 'false' : 'true'); }); loadImagesInSlide(index); loadImagesInSlide(index+1); }
      function goTo(i){ index = (i + slides.length) % slides.length; update(); resetAutoplay(); }
      function nextSlide(){ goTo(index+1); } function prevSlide(){ goTo(index-1); }
      if(prev) prev.addEventListener('click', prevSlide); if(next) next.addEventListener('click', nextSlide);
      carousel.addEventListener('keydown', (e)=>{ if(e.key === 'ArrowRight') { e.preventDefault(); nextSlide(); } if(e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); } });
      function startAutoplay(){ if(!autoplay) return; stopAutoplay(); timer = setInterval(nextSlide, interval); } function stopAutoplay(){ if(timer) { clearInterval(timer); timer = null; } } function resetAutoplay(){ stopAutoplay(); startAutoplay(); }
      carousel.addEventListener('mouseenter', stopAutoplay); carousel.addEventListener('mouseleave', startAutoplay); carousel.addEventListener('focusin', stopAutoplay); carousel.addEventListener('focusout', startAutoplay);
      let startX = 0, currentX = 0, isDragging = false;
      carousel.addEventListener('touchstart', (e)=>{ if(e.touches && e.touches[0]){ startX = e.touches[0].clientX; isDragging=true; stopAutoplay(); } }, {passive:true});
      carousel.addEventListener('touchmove', (e)=>{ if(!isDragging) return; if(e.touches && e.touches[0]){ currentX = e.touches[0].clientX; } }, {passive:true});
      carousel.addEventListener('touchend', ()=>{ if(!isDragging) return; const dx = currentX - startX; isDragging=false; if(Math.abs(dx) > 40){ if(dx < 0) nextSlide(); else prevSlide(); } resetAutoplay(); });

      // init
      update(); startAutoplay();
    }

    // Try to fetch inventory via API and populate carousel; fall back to static markup on failure.
    fetch('/api/inventory?per_page=12', {cache:'no-cache'})
      .then(function(res){ if(!res.ok) throw new Error('no inventory'); return res.json(); })
      .then(function(payload){
        const list = Array.isArray(payload && payload.items) ? payload.items : [];
        if(Array.isArray(list) && list.length){
          const items = list.slice(0,12);
          const cards = items.map(buildCardFromInventory);
          initCarouselWithCards(cards);
          return;
        }
        const fallbackCards = Array.from(carousel.querySelectorAll('.card'));
        initCarouselWithCards(fallbackCards);
      }).catch(function(){
        const fallbackCards = Array.from(carousel.querySelectorAll('.card'));
        initCarouselWithCards(fallbackCards);
      });
  })();

  // Animate hero-right cards only when they enter the viewport
  (function heroCardsInView(){
    const cards = Array.from(document.querySelectorAll('.hero-right .mini-card'));
    if(!cards.length) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReduced){
      // Respect reduced motion — reveal immediately
      cards.forEach(c=> c.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          const el = en.target;
          el.classList.add('in-view');
          obs.unobserve(el);
        }
      });
    },{threshold:0.25, rootMargin:'0px 0px -10% 0px'});

    cards.forEach(c=> observer.observe(c));
  })();

  // Animate services section (left text + mosaic cards) on scroll
  (function servicesInView(){
    const left = document.querySelector('.services-left');
    const cards = Array.from(document.querySelectorAll('.services-mosaic .service-card'));
    if(!left && !cards.length) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReduced){
      if(left) left.classList.add('in-view');
      cards.forEach(c=> c.classList.add('in-view'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          const el = en.target;
          if(el.classList && el.classList.contains('services-left')){
            el.classList.add('in-view');
            obs.unobserve(el);
            return;
          }
          if(el.classList && el.classList.contains('service-card')){
            el.classList.add('in-view');
            obs.unobserve(el);
            return;
          }
        }
      });
    },{threshold:0.18, rootMargin:'0px 0px -8% 0px'});

    // helper: conservative visibility check to handle cases where the observer
    // can be flaky (sticky headers, layout shifts, etc.)
    function isVisible(el, margin = 0){
      if(!el) return false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return (r.top + margin) < vh && (r.bottom - margin) > 0;
    }

    // Observe cards normally
    cards.forEach(c=> observer.observe(c));

    // If the left panel is already visible, reveal immediately; otherwise observe it.
    if(left){
      if(isVisible(left, -40)){
        left.classList.add('in-view');
      } else {
        observer.observe(left);
        // fallback: in rare cases where IntersectionObserver misses, reveal after short timeout
        setTimeout(()=>{
          if(left && !left.classList.contains('in-view')){
            left.classList.add('in-view');
            try{ observer.unobserve(left); }catch(e){}
          }
        }, 900);
      }
    }
  })();

  // Parallax effect for service cards (subtle) — uses CSS variable --parallax on each card
  (function servicesParallax(){
    const cards = Array.from(document.querySelectorAll('.services-mosaic .service-card'));
    if(!cards.length) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if(mq.matches) return; // disable if reduced motion

    let ticking = false;

    function update(){
      const vh = window.innerHeight;
      const centerY = vh / 2;
      cards.forEach(card=>{
        const rect = card.getBoundingClientRect();
        // small buffer: only update if card is near viewport
        if(rect.bottom < -40 || rect.top > vh + 40) {
          card.style.setProperty('--parallax','0px');
          return;
        }
        const cardCenter = rect.top + rect.height/2;
        // percentage distance from center (-1 .. 1)
        let pct = (cardCenter - centerY) / centerY;
        if(pct < -1) pct = -1; if(pct > 1) pct = 1;
        const amplitude = 18; // px max movement
        const y = -pct * amplitude; // invert so top moves down slightly
        card.style.setProperty('--parallax', y.toFixed(2) + 'px');
      });
      ticking = false;
    }

    function onScroll(){
      if(!ticking){
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    // initial update and listeners
    update();
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll);
  })();

  /* Tabs for services-left: Overview / Sell Your Car */
  (function servicesTabs(){
    const tabBtns = Array.from(document.querySelectorAll('.services-tabs .tab-btn'));
    const panels = Array.from(document.querySelectorAll('.tab-panel'));
    if(!tabBtns.length || !panels.length) return;

    function activate(index){
      tabBtns.forEach((b,i)=>{
        const active = i === index;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      panels.forEach((p,i)=> p.classList.toggle('active', i === index));
    }

    tabBtns.forEach((btn, idx)=>{
      btn.addEventListener('click', ()=> activate(idx));
      btn.addEventListener('keydown',(e)=>{
        if(e.key === 'ArrowRight') { e.preventDefault(); activate((idx+1)%tabBtns.length); tabBtns[(idx+1)%tabBtns.length].focus(); }
        if(e.key === 'ArrowLeft') { e.preventDefault(); activate((idx-1+tabBtns.length)%tabBtns.length); tabBtns[(idx-1+tabBtns.length)%tabBtns.length].focus(); }
      });
    });

    // simple sell form handling
    const sellForm = document.getElementById('sellForm');
    if(sellForm){
      sellForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const reg = (document.getElementById('registration')||{}).value || '';
        const mileage = (document.getElementById('mileage')||{}).value || '';
        // minimal validation
        if(!reg.trim() || !mileage.trim()){
          alert('Please enter registration and mileage to get a quote.');
          return;
        }
        // In a real app we'd send to server — for now show a short confirmation
        alert('Thanks — we\'ll fetch an instant valuation for ' + reg.toUpperCase() + ' ('+ mileage +' miles).');
        // optionally reset or switch tab back
        // sellForm.reset();
      });
    }

    // Cancel button removed — no handler required
  })();
    // Back-to-top smooth scroll + visibility toggle
    (function backToTop(){
      const btn = document.querySelector('.back-to-top');
      if(!btn) return;

      // Smooth scroll to top on click
      btn.addEventListener('click', function(e){
        e.preventDefault();
        // Use native smooth scroll where available
        try{
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }catch(err){
          // fallback
          window.scrollTo(0,0);
        }
      });

      // Toggle visibility based on scroll position
      const showAt = 320; // px
      function check(){
        if(window.scrollY > showAt){
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      }
      window.addEventListener('scroll', check, { passive: true });
      // init
      check();
    })();

  /* Reveal sections on scroll: generic observer that applies `.in-view` to elements with
     the `.reveal` class (or attaches `.reveal` automatically). Elements can opt-in
     to animation variations via `data-anim="slide-left|slide-right|zoom|fade"`.
  */
  (function sectionReveal(){
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Enable debug logging when URL contains ?revealDebug=1
    const DEBUG = !!(function(){ try{ return new URLSearchParams(location.search).get('revealDebug') === '1' }catch(e){ return false } })();
    const nodes = Array.from(document.querySelectorAll('section, .site-header, .site-footer, .footer-legal'));
    if(!nodes.length){ if(DEBUG) console.log('[reveal] no target nodes found'); return; }

    // Initialize: add base .reveal class if not present
    nodes.forEach(n=>{
      if(!n.classList.contains('reveal')) n.classList.add('reveal');
      const anim = n.dataset && n.dataset.anim;
      if(anim) n.classList.add('reveal--' + anim);
      if(DEBUG) console.log('[reveal] init target:', n.tagName, n.id || '', 'anim=', anim || 'default');
    });

    // If debug mode, create an on-screen panel to manually reveal and watch events
    let debugPanel = null;
    if(DEBUG){
      try{
        debugPanel = document.createElement('div');
        debugPanel.className = 'reveal-debug-panel';
        const title = document.createElement('h4');
        title.textContent = 'Reveal Debug';
        debugPanel.appendChild(title);
        const list = document.createElement('div');
        nodes.forEach((n, i)=>{
          const entry = document.createElement('div');
          entry.className = 'reveal-debug-entry';
          const label = document.createElement('div');
          label.textContent = (n.tagName.toLowerCase() || '') + (n.id ? '#' + n.id : '');
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = 'Reveal';
          btn.addEventListener('click', ()=>{ n.classList.add('in-view'); log('manual reveal: ' + label.textContent); updateStatus(); });
          const status = document.createElement('div');
          status.className = 'status';
          status.textContent = n.classList.contains('in-view') ? 'shown' : 'hidden';
          entry.appendChild(label);
          entry.appendChild(btn);
          entry.appendChild(status);
          list.appendChild(entry);
        });
        debugPanel.appendChild(list);
        const logWrap = document.createElement('div'); logWrap.className = 'reveal-debug-log'; debugPanel.appendChild(logWrap);
        function log(msg){
          const p = document.createElement('p'); p.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg; logWrap.insertBefore(p, logWrap.firstChild);
        }
        function updateStatus(){
          const statuses = Array.from(debugPanel.querySelectorAll('.reveal-debug-entry'));
          statuses.forEach((el, idx)=> el.querySelector('.status').textContent = nodes[idx].classList.contains('in-view') ? 'shown' : 'hidden');
        }
        document.body.appendChild(debugPanel);
        // expose helper to console if needed
        window.__revealDebugLog = log;
        window.__revealDebugUpdate = updateStatus;
      }catch(e){ console.warn('[reveal] debug panel failed', e); }
    }

    if(prefersReduced){
      nodes.forEach(n=> n.classList.add('in-view'));
      return;
    }

    // helper: conservative visibility test (works even with odd layout/headers)
    function isVisible(el, margin = 0){
      if(!el) return false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return (r.top + margin) < vh && (r.bottom - margin) > 0;
    }

    let io = null;
    try{
      io = new IntersectionObserver((entries, obs)=>{
        entries.forEach(en=>{
          const el = en.target;
          if(DEBUG) console.log('[reveal] intersect:', el.tagName, el.id || '', 'isIntersecting=', en.isIntersecting, 'ratio=', en.intersectionRatio.toFixed(3));
          if(en.isIntersecting){
            el.classList.add('in-view');
            if(DEBUG){
              console.log('[reveal] revealed:', el.tagName, el.id || '');
              if(debugPanel && window.__revealDebugLog) window.__revealDebugLog('observer reveal: ' + (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '')));
              if(debugPanel && window.__revealDebugUpdate) window.__revealDebugUpdate();
            }
            try{ obs.unobserve(el); if(DEBUG) console.log('[reveal] unobserved:', el.tagName, el.id || ''); }catch(e){}
          }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -8% 0px' });
    }catch(err){ io = null; if(DEBUG) console.warn('[reveal] IntersectionObserver not available', err); }

    nodes.forEach(n=>{
      // If element already visible (e.g. above the fold), reveal immediately
      if(isVisible(n, -8)){
        n.classList.add('in-view');
        if(DEBUG) console.log('[reveal] already visible, in-view set:', n.tagName, n.id || '');
      } else if(io){
        io.observe(n);
        if(DEBUG) console.log('[reveal] observing:', n.tagName, n.id || '');
        if(debugPanel && window.__revealDebugLog) window.__revealDebugLog('observing: ' + (n.tagName.toLowerCase() + (n.id ? '#'+n.id : '')));
      } else {
        // fallback: reveal after brief delay
        if(DEBUG) console.log('[reveal] fallback reveal scheduled for:', n.tagName, n.id || '');
        setTimeout(()=> n.classList.add('in-view'), 220);
      }
    });
  })();

  /* Cookie consent banner injector
     - Injects a futuristic consent banner if the user hasn't set preferences
     - Stores choices in localStorage under key `kain_cookies`
     - Provides Accept All, Manage (open prefs) and Save buttons
  */
  (function cookieConsent(){
    const KEY = 'kain_cookies';
    function getStored(){ try{ return JSON.parse(localStorage.getItem(KEY) || 'null'); }catch(e){ return null } }
    function setStored(obj){ try{ localStorage.setItem(KEY, JSON.stringify(obj)); }catch(e){}
    }

    const existing = getStored();
    if(existing && existing.version && typeof existing.accepted !== 'undefined') return;

    // build banner
    const banner = document.createElement('div');
    banner.className = 'cookie-banner reveal';
    banner.innerHTML = `
      <div class="cb-icon" aria-hidden="true">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm3.5 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9 12.5a1 1 0 110 2 1 1 0 010-2zm4.5 3a.9.9 0 11-1.8 0 .9.9 0 011.8 0z" fill="currentColor"/></svg>
      </div>
      <div class="cb-copy">
        <h4>We use cookies to improve your experience</h4>
        <p>We use essential and optional cookies — manage preferences or accept all.</p>
      </div>
      <div class="cb-actions">
        <button class="cb-manage" type="button"><svg class="btn-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 12a8 8 0 10-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Manage</span></button>
        <button class="btn-ghost" type="button" id="cb-decline"><svg class="btn-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Decline</span></button>
        <button class="btn-accept" type="button" id="cb-accept"><svg class="btn-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Accept All</span></button>
      </div>
    `;

    // overlay + side-panel (left)
    const overlay = document.createElement('div');
    overlay.className = 'cookie-overlay';

    const panel = document.createElement('aside');
    panel.className = 'cookie-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
      <div class="panel-head"><h3>Cookie Preferences</h3><button id="cb-close" class="icon-btn" aria-label="Close preferences">\
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L12 13.41l-6.29 6.3-1.42-1.42L10.59 12 4.29 5.71 5.71 4.29 12 10.59l6.29-6.3 1.42 1.42z" fill="currentColor"/></svg>
      </button></div>
      <div class="panel-body">
        <div class="prefs">
          <div class="pref">
            <div class="left">
              <div class="pref-icon necessary"> 
                <!-- lock icon -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 8h-1V6a4 4 0 10-8 0v2H7a1 1 0 00-1 1v9a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 00-1-1z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="meta"><strong>Necessary</strong><div class="desc">Required for core site functionality</div></div>
            </div>
            <div class="badge required">Required</div>
          </div>

          <div class="pref">
            <div class="left">
              <div class="pref-icon analytics"> 
                <!-- analytics chart icon -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v18h18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><rect x="7" y="10" width="2" height="7" rx="0.5" fill="currentColor"/><rect x="11" y="6" width="2" height="11" rx="0.5" fill="currentColor"/><rect x="15" y="13" width="2" height="4" rx="0.5" fill="currentColor"/></svg>
              </div>
              <div class="meta"><strong>Analytics</strong><div class="desc">Help us improve the site by sending anonymised usage data</div></div>
            </div>
            <div class="switch" role="switch" aria-checked="false" tabindex="0" data-key="analytics"><div class="track"><div class="knob"></div></div><input type="checkbox" aria-hidden="true"></div>
          </div>

          <div class="pref">
            <div class="left">
              <div class="pref-icon marketing"> 
                <!-- megaphone / marketing icon -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 11v2a2 2 0 002 2h3l7 4V5L8 9H5a2 2 0 00-2 2z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="meta"><strong>Marketing</strong><div class="desc">Personalised offers and promotions (optional)</div></div>
            </div>
            <div class="switch" role="switch" aria-checked="false" tabindex="0" data-key="marketing"><div class="track"><div class="knob"></div></div><input type="checkbox" aria-hidden="true"></div>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <div class="panel-actions"><button class="btn btn-primary save-btn" id="cb-save"> 
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>Save preferences</span>
        </button></div>
      </div>
    `;

    document.body.appendChild(banner);
    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    // reveal banner (slight delay so entrance feels less abrupt)
    setTimeout(()=> banner.classList.add('in-view'), 320);

    // helper: sync panel UI from stored prefs
    function syncPanel(){
      const prefs = getStored() || {};
      panel.querySelectorAll('.switch').forEach(s=>{
        const k = s.dataset.key;
        if(prefs[k]) s.classList.add('on'); else s.classList.remove('on');
        const isOn = !!prefs[k];
        s.setAttribute('aria-checked', isOn ? 'true' : 'false');
        const input = s.querySelector('input'); if(input) input.checked = isOn;
      });
    }

    // open panel
    const manageBtn = banner.querySelector('.cb-manage');
    if(manageBtn) manageBtn.addEventListener('click', function(e){
      e.preventDefault();
      overlay.classList.add('open');
      panel.style.display = 'block';
      setTimeout(()=>{ panel.classList.add('open'); syncPanel(); }, 12);
    });

    // accept / decline
    const acceptBtn = banner.querySelector('#cb-accept');
    const declineBtn = banner.querySelector('#cb-decline');
    if(acceptBtn) acceptBtn.addEventListener('click', function(){ setStored({ version:1, accepted:true, analytics:true, marketing:true }); dismiss(); });
    if(declineBtn) declineBtn.addEventListener('click', function(){ setStored({ version:1, accepted:false, analytics:false, marketing:false }); dismiss(); });

    // panel controls
    function closePanel(){ panel.classList.remove('open'); overlay.classList.remove('open'); setTimeout(()=> panel.style.display = 'none', 360); }
    overlay.addEventListener('click', closePanel);
    panel.querySelector('#cb-close').addEventListener('click', closePanel);
    // removed Cancel button per design; closing handled by close icon and overlay

    // switch toggle (click + keyboard)
    panel.addEventListener('click', function(e){
      const sw = e.target.closest('.switch'); if(!sw) return;
      toggleSwitch(sw);
    });
    panel.addEventListener('keydown', function(e){
      const sw = e.target.closest('.switch'); if(!sw) return;
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault(); toggleSwitch(sw);
      }
    });

    function toggleSwitch(sw){
      sw.classList.toggle('on');
      const isOn = sw.classList.contains('on');
      sw.setAttribute('aria-checked', isOn ? 'true' : 'false');
      const input = sw.querySelector('input'); if(input) input.checked = isOn;
    }

    panel.querySelector('#cb-save').addEventListener('click', function(){
      const prefs = getStored() || {};
      panel.querySelectorAll('.switch').forEach(s=> prefs[s.dataset.key] = !!s.classList.contains('on'));
      prefs.version = 1; prefs.accepted = true;
      setStored(prefs);
      // pulse the button briefly for feedback
      const btn = panel.querySelector('#cb-save');
      btn && btn.classList.add('pulse');
      setTimeout(()=>{ btn && btn.classList.remove('pulse'); closePanel(); dismiss(); }, 520);
    });

    function dismiss(){ banner.classList.remove('in-view'); setTimeout(()=>{ try{ banner.remove(); }catch(e){} }, 320); try{ overlay.remove(); }catch(e){} try{ panel.remove(); }catch(e){} }

    // expose for debug
    window.__cookieBanner = { banner, panel, overlay, getStored };
  })();

  // Color palette update function for dashboard theme customization
  function updatePaletteColor(colorType, newColor) {
    // Update the color display
    const displayElement = document.getElementById(colorType + 'Display');
    if (displayElement) {
      displayElement.style.backgroundColor = newColor;
    }
    
    // Update the hex value display
    const hexElement = document.getElementById(colorType + 'Hex');
    if (hexElement) {
      hexElement.textContent = newColor;
    }
    
    // Update the color picker value
    const pickerElement = document.getElementById(colorType + 'ColorPicker');
    if (pickerElement) {
      pickerElement.value = newColor;
    }
    
    // Update hidden form inputs
    const hiddenInput = document.getElementById(colorType);
    if (hiddenInput) {
      hiddenInput.value = newColor;
    }
    
    // Update live preview elements
    updateLivePreview();
  }

  // Update live preview colors
  function updateLivePreview() {
    const primaryColor = document.getElementById('primaryHex')?.textContent || '#c41e3a';
    const secondaryColor = document.getElementById('secondaryHex')?.textContent || '#e64153';
    const accentColor = document.getElementById('accentHex')?.textContent || '#c41e3a';
    const backgroundColor = document.getElementById('backgroundHex')?.textContent || '#0f172a';
    const textColor = document.getElementById('textHex')?.textContent || '#f8fafc';
    
    // Update preview buttons
    const primaryBtn = document.getElementById('previewPrimaryBtn');
    if (primaryBtn) {
      primaryBtn.style.backgroundColor = primaryColor;
      primaryBtn.style.color = textColor;
    }
    
    const secondaryBtn = document.getElementById('previewSecondaryBtn');
    if (secondaryBtn) {
      secondaryBtn.style.backgroundColor = secondaryColor;
      secondaryBtn.style.color = textColor;
    }
    
    const badge = document.getElementById('previewBadge');
    if (badge) {
      badge.style.backgroundColor = accentColor;
      badge.style.color = textColor;
    }
    
    const link = document.getElementById('previewLink');
    if (link) {
      link.style.color = accentColor;
    }
  }

  /* Preview banner injection: shows a green fixed bar at top of pages indicating this is a preview. */
  (function(){
    function insertPreviewBanner(){
      try{
        if(document.querySelector('.preview-banner')) return;
        var banner = document.createElement('div');
        banner.className = 'preview-banner';
        banner.setAttribute('role','region');
        banner.setAttribute('aria-label','Preview site notice');
        var inner = document.createElement('div'); inner.className = 'pb-note';
        inner.innerHTML = 'Preview version of <strong>Fairfield Cars Ltd</strong> — this site is a preview. For the full version contact <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">Carous Limited</a>.';
        banner.appendChild(inner);
        // insert banner as the first child of <body> to avoid affecting HTML-level layout
        if(document.body && document.body.firstChild){
          document.body.insertBefore(banner, document.body.firstChild);
        } else if(document.body){
          document.body.appendChild(banner);
        } else {
          document.documentElement.insertBefore(banner, document.documentElement.firstChild);
        }
        // add class to body so layout can account for banner height
        document.body.classList.add('has-preview-banner');
      }catch(e){console.warn('preview banner failed', e)}
    }
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', insertPreviewBanner); else insertPreviewBanner();
  })();

