// Simple inventory filtering & modal for used-cars.html
document.addEventListener('DOMContentLoaded', function(){
  const grid = document.getElementById('inventoryGrid');
  const cards = grid ? Array.from(grid.querySelectorAll('.car-card')) : [];

  const qInput = document.getElementById('filter-search');
  const makeSelect = document.getElementById('filter-make');
  const minInput = document.getElementById('filter-min');
  const maxInput = document.getElementById('filter-max');
  const transSelect = document.getElementById('filter-trans');
  const sortSelect = document.getElementById('sortBy');

  function matches(card){
    const q = (qInput && qInput.value || '').toLowerCase().trim();
    const make = (makeSelect && makeSelect.value || '').toLowerCase();
    const trans = (transSelect && transSelect.value || '').toLowerCase();
    const min = parseInt((minInput && minInput.value) || 0,10) || 0;
    const max = parseInt((maxInput && maxInput.value) || Infinity,10) || Infinity;

    const meta = (card.dataset.make + ' ' + card.dataset.model + ' ' + (card.dataset.reg || '') + ' ' + (card.dataset.fuel || '')).toLowerCase();
    if(q && !meta.includes(q)) return false;
    if(make && card.dataset.make.toLowerCase() !== make) return false;
    if(trans && card.dataset.trans.toLowerCase() !== trans) return false;
    const price = parseInt(card.dataset.price || 0,10);
    if(price < min) return false;
    if(price > max) return false;
    return true;
  }

  function render(){
    // filter
    const visible = cards.filter(matches);
    // sort
    const sort = sortSelect ? sortSelect.value : 'newest';
    visible.sort((a,b)=>{
      if(sort === 'price-asc') return parseInt(a.dataset.price) - parseInt(b.dataset.price);
      if(sort === 'price-desc') return parseInt(b.dataset.price) - parseInt(a.dataset.price);
      if(sort === 'mileage') return parseInt(a.dataset.mileage) - parseInt(b.dataset.mileage);
      return 0;
    });
    // reflow
    grid.innerHTML = '';
    visible.forEach(c=> grid.appendChild(c));
  }

  // wire inputs
  [qInput, makeSelect, minInput, maxInput, transSelect, sortSelect].forEach(el=>{ if(!el) return; el.addEventListener('input', debounce(render, 180)); el.addEventListener('change', render); });
  render();

  // details modal
  const modal = document.getElementById('carModal');
  const modalImg = modal && modal.querySelector('.modal-media img');
  const modalTitle = modal && modal.querySelector('.modal-title');
  const modalMeta = modal && modal.querySelector('.modal-meta');
  const modalPrice = modal && modal.querySelector('.modal-price');
  const modalClose = modal && modal.querySelector('.modal-close');

  function openModal(card){
    if(!modal) return;
    modalImg.src = card.querySelector('.media img').src;
    modalImg.alt = card.querySelector('.media img').alt || '';
    modalTitle.textContent = card.dataset.make + ' ' + card.dataset.model;
    modalMeta.textContent = card.dataset.reg + ' • ' + card.dataset.mileage + ' mi • ' + card.dataset.trans;
    modalPrice.textContent = '£' + Number(card.dataset.price).toLocaleString();
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){ if(modal) modal.setAttribute('aria-hidden','true'); }

  if(modalClose) modalClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeModal(); });

  grid.addEventListener('click', (e)=>{
    const btn = e.target.closest('.details');
    if(!btn) return;
    const card = btn.closest('.car-card');
    if(card) openModal(card);
  });

  // Share / Save buttons (delegated)
  grid.addEventListener('click', (e)=>{
    const btn = e.target.closest('.icon-btn');
    if(!btn) return;
    const card = btn.closest('.car-card');
    if(!card) return;

    const action = (btn.getAttribute('aria-label') || '').toLowerCase();
    const title = (card.dataset.make || '') + ' ' + (card.dataset.model || '') + ' ' + (card.dataset.reg || '');
    const url = location.href.split('#')[0] + '#'+ (card.dataset.reg || (card.dataset.make+'-'+card.dataset.model));

    if(action === 'share'){
      if(navigator.share){
        navigator.share({title: title, text: 'Check out this car:', url: url}).catch(()=>{});
      } else if(navigator.clipboard){
        navigator.clipboard.writeText(url).then(()=>{
          // quick feedback — can be improved with a toast
          btn.setAttribute('title','Link copied');
        });
      } else {
        // fallback: prompt copy
        window.prompt('Copy link to share', url);
      }
      return;
    }

    if(action === 'save' || action === '❤'){
      try{
        const key = 'savedCars';
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        const id = card.dataset.reg || (card.dataset.make + ' ' + card.dataset.model + ' ' + card.dataset.price);
        const idx = saved.indexOf(id);
        if(idx === -1){ saved.push(id); btn.classList.add('saved'); btn.setAttribute('title','Saved'); }
        else { saved.splice(idx,1); btn.classList.remove('saved'); btn.setAttribute('title','Save'); }
        localStorage.setItem(key, JSON.stringify(saved));
      }catch(e){/* ignore */}
      return;
    }
  });

  // wire any element with [data-open-modal] to open the details modal
  document.querySelectorAll('[data-open-modal]').forEach(el=>{
    el.addEventListener('click', (ev)=>{
      ev.preventDefault();
      if(!modal) return;
      // If the trigger has data-src or data-img, try to populate image
      const src = el.dataset.src || el.getAttribute('href');
      if(src && src.startsWith('#')){
        // anchor to modal id — just open modal
        modal.setAttribute('aria-hidden','false');
        return;
      }
      // fallback: open modal without changing content
      modal.setAttribute('aria-hidden','false');
    });
  });

  // simple debounce
  function debounce(fn, wait){ let t; return function(){ clearTimeout(t); t = setTimeout(()=> fn.apply(this, arguments), wait); } }

  /* Hero carousel: lightweight accessible slider */
  (function setupHeroCarousel(){
    const carousel = document.getElementById('heroCarousel');
    if(!carousel) return;
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const indicators = Array.from(carousel.querySelectorAll('.indicator'));

    let current = 0;
    let interval = null;
    const delay = 5000; // autoplay delay

    function show(index){
      index = (index + slides.length) % slides.length;
      slides.forEach((s,i)=>{
        const isActive = i === index;
        s.setAttribute('aria-hidden', String(!isActive));
        s.classList.toggle('active', isActive);
      });
      indicators.forEach((btn,i)=>{
        btn.classList.toggle('active', i===index);
        btn.setAttribute('aria-selected', String(i===index));
      });
      // lazy-load current + next for smooth transitions
      preload(index);
      preload((index + 1) % slides.length);
      current = index;
    }

    // lazy-load background images (load current + next) and enable local parallax
    let raf = null;
    function preload(i){
      const s = slides[i];
      if(!s) return;
      if(s.dataset.loaded === '1') return;
      const bg = s.dataset.bg;
      if(!bg){ s.dataset.loaded = '1'; return }
      const img = new Image();
      img.src = bg;
      img.onload = ()=>{
        s.style.backgroundImage = `url('${bg}')`;
        s.dataset.loaded = '1';
      };
      img.onerror = ()=>{ s.dataset.loaded = '1' };
    }

    // preload initial slides
    preload(0);
    preload(1);

    // parallax: move background-position for the active slide on pointer move
    function applyParallax(e){
      if(window.innerWidth < 900) return;
      const rect = carousel.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const moveX = (x - 0.5) * 8; // small offset in percent
      const moveY = (y - 0.5) * 6;
      const s = slides[current];
      if(s && s.dataset.loaded === '1'){
        s.style.backgroundPosition = `${50 + moveX}% ${50 + moveY}%`;
      }
    }
    carousel.addEventListener('mousemove', (e)=>{
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{ applyParallax(e); raf = null; });
    });
    carousel.addEventListener('mouseleave', ()=>{
      const s = slides[current]; if(s) s.style.backgroundPosition = '50% 50%';
    });

    function next(){ show((current+1) % slides.length); }
    function prev(){ show((current-1 + slides.length) % slides.length); }

    // autoplay
    function start(){ stop(); interval = setInterval(next, delay); }
    function stop(){ if(interval) { clearInterval(interval); interval = null; } }

    // wire controls
    if(nextBtn) nextBtn.addEventListener('click', ()=>{ next(); stop(); });
    if(prevBtn) prevBtn.addEventListener('click', ()=>{ prev(); stop(); });
    indicators.forEach((btn, idx)=> btn.addEventListener('click', ()=>{ show(idx); stop(); }));

    // pause on hover/focus
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);

    // keyboard navigation
    carousel.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowLeft') prev();
      if(e.key === 'ArrowRight') next();
    });

    // initialize
    show(0);
    start();
  })();
    // Inline SVG fallback map (used directly by the deterministic injector)
    const inlineFallbacks = {
      hash: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 7h10M7 12h10M10 3v18M14 3v18" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
      speedometer: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 12l4-4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
      droplet: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2s5 5 5 9a5 5 0 0 1-10 0c0-4 5-9 5-9z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
      sliders: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 6h10M4 12h16M4 18h7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
      calendar: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.6"/></svg>'
    };
    const snapshotCards = Array.from(grid.querySelectorAll('.car-card'));

    function slugify(text){
      return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g,'')
        .trim()
        .replace(/\s+/g,'-');
    }

    snapshotCards.forEach(card => {
      const body = card.querySelector('.card-body');
      if(!body) return;

      const titleEl = body.querySelector('.car-title');
      const priceEl = body.querySelector('.card-footer .price') || body.querySelector('.price');

      // remove details link(s)
      body.querySelectorAll('.details-link, .card-footer .actions').forEach(el=> el.remove());

      // create title-row and move title + price into it
      const titleRow = document.createElement('div');
      titleRow.className = 'title-row';

      // ensure title exists and wrap with anchor (permalink)
      if(titleEl){
        const titleText = titleEl.textContent.trim();
        const link = document.createElement('a');
        link.className = 'car-link';
        // permalink priority: data-reg, else slug(make-model)
        const reg = card.dataset.reg && card.dataset.reg.trim();
        const slugSource = reg || (card.dataset.make + ' ' + card.dataset.model);
        const slug = slugify(slugSource) || ('car-' + Math.random().toString(36).slice(2,9));
        link.href = '#' + slug;
        link.title = titleText;
        link.textContent = titleText;

        // replace title text node with link
        titleEl.textContent = '';
        titleEl.appendChild(link);
      }

      if(priceEl){
        // detach price and append to title-row
        const movedPrice = priceEl.cloneNode(true);
        // remove original price container
        priceEl.remove();
        titleRow.appendChild(titleEl);
        titleRow.appendChild(movedPrice);
      } else {
        titleRow.appendChild(titleEl);
      }

      // insert titleRow at top of card-body (before meta)
      const meta = body.querySelector('.meta');
      if(meta) body.insertBefore(titleRow, meta);
      else body.insertBefore(titleRow, body.firstChild);

      // set up card-level click to follow permalink when clicking the card (but ignore clicks on interactive elements)
      const targetHref = (titleEl && titleEl.querySelector('a')) ? titleEl.querySelector('a').getAttribute('href') : null;
      if(targetHref){
        card.style.cursor = 'pointer';
        card.addEventListener('click', (ev)=>{
          // ignore clicks on links, buttons, inputs, or svg icons
          if(ev.target.closest('a') || ev.target.closest('button') || ev.target.closest('.icon-btn')) return;
          // navigate to permalink (use location.assign to create history entry)
          location.assign(targetHref);
        });
      }
    });

  /* Inject icons into .car-meta spans using Lucide placeholders (data-lucide).
     This uses the included Lucide UMD bundle to render consistent SVG icons.
     If Lucide isn't available, fall back to a simple inline SVG minimal glyph. */
  (function injectCarMetaIcons(){
    const map = {
      reg: { name: 'hash' },
      mileage: { name: 'speedometer' },
      fuel: { name: 'droplet' },
      trans: { name: 'sliders' },
      year: { name: 'calendar' }
    };

    // Deterministic inline-SVG injection: insert ready-made SVGs (no external dependency)
    document.querySelectorAll('.car-meta span').forEach(span => {
      // already has an inline svg or fallback
      if(span.querySelector('svg') || span.querySelector('.lucide-fallback')) return;
      for(const key in map){
        if(span.classList.contains(key)){
          const name = map[key].name;
          const wrapper = document.createElement('div');
          wrapper.className = 'lucide-fallback';
          wrapper.setAttribute('aria-hidden','true');
          // use the inlineFallbacks map (guaranteed to exist below)
          wrapper.innerHTML = inlineFallbacks[name] || inlineFallbacks['hash'];
          span.insertBefore(wrapper, span.firstChild);
          break;
        }
      }
    });

    

    function applyInlineFallbacks(){
      try{
        document.querySelectorAll('[data-lucide]').forEach(i => {
          const name = i.getAttribute('data-lucide');
          const svg = inlineFallbacks[name] || inlineFallbacks['hash'];
          const wrapper = document.createElement('div');
          wrapper.className = 'lucide-fallback';
          wrapper.setAttribute('aria-hidden','true');
          wrapper.innerHTML = svg;
          i.parentNode && i.parentNode.replaceChild(wrapper, i);
        });
        console.debug('Applied inline SVG fallbacks for lucide placeholders');
      }catch(e){ console.debug('Failed to apply inline SVG fallbacks', e); }
    }

    // replace placeholders with Lucide-rendered SVGs when lucide is available
    (function renderLucide(){
      function doRender(){
        try{
          const lib = window.lucide || window.Lucide;
          if(!lib) return false;
          // prefer `replace` when available, else try `createIcons`
          if(typeof lib.replace === 'function'){
            try{ lib.replace({ 'stroke-width': 1.6, 'width': 20, 'height': 20 }); console.debug('Lucide: replace() called'); return true; }catch(e){ console.debug('Lucide.replace failed', e); }
          }
          if(typeof lib.createIcons === 'function'){
            try{ lib.createIcons({ 'stroke-width': 1.6, 'width': 20, 'height': 20 }); console.debug('Lucide: createIcons() called with options'); return true; }
            catch(e){ try{ lib.createIcons(); console.debug('Lucide: createIcons() called without options'); return true; }catch(e2){ console.debug('Lucide.createIcons failed', e2); } }
          }
        }catch(e){ console.debug('Lucide render error', e); }
        return false;
      }

      // If lucide is already present, render immediately
      if(doRender()) return;

      // Otherwise poll for lucide to load (covers async script loading order)
      let attempts = 0;
      const maxAttempts = 40; // ~6 seconds max
      const timer = setInterval(()=>{
        attempts++;
        if(doRender() || attempts >= maxAttempts){
          clearInterval(timer);
          // If we tried and lucide still not available, attempt to load the UMD bundle as a fallback
          if(!doRender()){
            console.debug('Lucide not found — injecting UMD fallback');
            try{
              // avoid injecting twice
              if(!document.querySelector('script[data-lucide-umd]')){
                const s = document.createElement('script');
                s.setAttribute('data-lucide-umd','1');
                s.src = 'https://cdn.jsdelivr.net/npm/lucide@0.260.0/dist/lucide.umd.js';
                s.async = true;
                s.onload = function(){
                  try{ doRender(); console.debug('Lucide UMD loaded and render attempted'); }catch(e){ console.debug('Lucide UMD load render failed', e); }
                };
                s.onerror = function(e){ console.debug('Lucide UMD failed to load', e); applyInlineFallbacks(); };
                document.head.appendChild(s);
                // If UMD doesn't render within a short window, apply inline fallbacks
                setTimeout(()=>{ if(!doRender()) applyInlineFallbacks(); }, 1200);
              } else {
                // script already present but render still failed — apply fallbacks
                setTimeout(()=>{ if(!doRender()) applyInlineFallbacks(); }, 800);
              }
            }catch(e){ console.debug('Failed to inject Lucide UMD', e); applyInlineFallbacks(); }
          }
        }
      }, 150);

      // Also try once on window load as a final attempt
      window.addEventListener('load', ()=>{ doRender(); });
    })();
  })();
  /* View toggle: grid / list view with persistence */
  (function setupViewToggle(){
    const root = document.documentElement;
    const viewToggle = document.querySelector('.view-toggle');
    if(!viewToggle) return;
    const [gridBtn, listBtn] = Array.from(viewToggle.querySelectorAll('.icon-btn'));

    function applyView(mode, save = true){
      if(mode === 'list'){
        root.classList.remove('grid-view');
        root.classList.add('list-view');
        if(gridBtn) gridBtn.setAttribute('aria-pressed','false');
        if(listBtn) listBtn.setAttribute('aria-pressed','true');
      } else {
        root.classList.remove('list-view');
        root.classList.add('grid-view');
        if(gridBtn) gridBtn.setAttribute('aria-pressed','true');
        if(listBtn) listBtn.setAttribute('aria-pressed','false');
      }
      if(save) try{ localStorage.setItem('inventoryView', mode); }catch(e){}
    }

    // wire buttons
    if(gridBtn) gridBtn.addEventListener('click', ()=> applyView('grid'));
    if(listBtn) listBtn.addEventListener('click', ()=> applyView('list'));

    // restore saved preference or default to grid
    try{
      const saved = localStorage.getItem('inventoryView');
      applyView(saved === 'list' ? 'list' : 'grid', false);
    }catch(e){ applyView('grid', false) }
  })();

  // Sticky inventory header: add/remove `stuck` class when header reaches top
  (function setupStickyInventoryHeader(){
    const invHeader = document.querySelector('.inventory-header');
    if(!invHeader) return;

    function check(){
      const rect = invHeader.getBoundingClientRect();
      if(rect.top <= 0) invHeader.classList.add('stuck');
      else invHeader.classList.remove('stuck');
    }

    // Use rAF for smoothness
    let ticking = false;
    function onScroll(){ if(!ticking){ requestAnimationFrame(()=>{ check(); ticking = false; }); ticking = true; } }

    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', () => requestAnimationFrame(check));
    // initial state
    requestAnimationFrame(check);
  })();
});
