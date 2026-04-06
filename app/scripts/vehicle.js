// Vehicle page renderer: loads inventory and populates #vehicleRoot with details
(function(){
  'use strict';

  function slugify(v){
    if(!v) return '';
    // prefer subTitle as the identifying token (falls back to reg)
    const ident = v.subTitle || v.reg || '';
    const t = [v.year, v.make, v.model, ident].filter(Boolean).join(' ');
    return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }
  function fmtPrice(p){ if(typeof p !== 'number') return p||''; return '£' + p.toLocaleString(); }
  function fmtMileage(m){ if(!m && m !== 0) return ''; try{ return (typeof m === 'number' ? m.toLocaleString() : m) + ' mi'; }catch(e){ return m; } }

  function getQuery(){ try{ const params = new URLSearchParams(location.search); const obj = {}; for(const [k,v] of params.entries()) obj[k]=v; return obj; }catch(e){ return {}; } }

  function renderVehicle(v){
    if(!v) return;
    try{ document.title = (v.year ? v.year + ' ' : '') + (v.make||'') + ' ' + (v.model||'') + ' — Fairfield Cars Ltd'; }catch(e){}
    const title = document.getElementById('vehicleTitle'); if(title) title.textContent = ((v.year||'') + ' ' + (v.make||'') + ' ' + (v.model||'')).trim();
    const priceEl = document.getElementById('vehiclePrice'); if(priceEl) priceEl.textContent = v.price ? '£' + v.price : '';
    const bc = document.getElementById('breadcrumbCurrent'); if(bc) bc.textContent = ((v.year||'') + ' ' + (v.make||'') + ' ' + (v.model||'')).trim();
    const derEl = document.getElementById('vehicleDerivative'); if(derEl) derEl.textContent = v.derivative || v.trim || '';
    function cleanSubtitle(s){
      if(!s) return '';
      // remove trailing mileage like "• 138,000 miles" or "• 98,000 miles"
      return s.replace(/\s*•\s*[0-9,]+\s*miles?$/i, '').trim();
    }
    const subEl = document.getElementById('vehicleSubTitle'); if(subEl) subEl.textContent = cleanSubtitle(v.subTitle) || (v.reg || '');
    const descEl = document.getElementById('vehicleDesc'); if(descEl){ const txt = v.description || ''; descEl.textContent = txt.length > 220 ? txt.slice(0,220).trim() + '…' : txt; }
    const fullDescEl = document.getElementById('vehicleFullDesc'); if(fullDescEl) fullDescEl.innerHTML = v.description || '';

    // specs chips with icons + accessible hover/focus tooltips
    const chipsRoot = document.getElementById('specsChips');
    // Tooltip helper: single shared tooltip element
    function ensureChipTooltip(){
      let el = document.getElementById('chipTooltip');
      if(el) return el;
      el = document.createElement('div'); el.id = 'chipTooltip'; el.className = 'chip-tooltip'; el.setAttribute('role','tooltip'); el.style.position='fixed'; el.style.pointerEvents='none'; document.body.appendChild(el); return el;
    }

    function showChipTooltip(target, html){
      const tip = ensureChipTooltip();
      tip.innerHTML = html || '';
      tip.style.opacity = '1'; tip.style.visibility = 'visible';
      const r = target.getBoundingClientRect();
      // place above chip, with small offset; constrain inside viewport
      const top = Math.max(8, r.top - 8 - tip.offsetHeight);
      const left = Math.min(window.innerWidth - tip.offsetWidth - 8, Math.max(8, r.left + (r.width/2) - (tip.offsetWidth/2)));
      tip.style.top = (top) + 'px'; tip.style.left = (left) + 'px';
    }

    function hideChipTooltip(){ const tip = document.getElementById('chipTooltip'); if(!tip) return; tip.style.opacity='0'; tip.style.visibility='hidden'; }

    if(chipsRoot){ chipsRoot.innerHTML = '';
      const iconMap = {
        'Year': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 2v4M8 2v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'Owners': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'Body': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="7" width="20" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="7" cy="18" r="1.8" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="18" r="1.8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
        'Engine': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M19 8v8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
        'Mileage': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 12l4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
        'Transmission': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 3v18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 3v18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M18 3v18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
        'Fuel': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="3" width="12" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15 7h4v8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
        'Doors': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="4" y="3" width="12" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="12" r="0.9" fill="currentColor"/></svg>',
        'Colour': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2a8 8 0 1 0 8 8A8 8 0 0 0 12 2z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
      };
      const specs = [
        {k:'Year', v: v.year},
        {k:'Owners', v: v.owners},
        {k:'Body', v: v.bodyType},
        {k:'Engine', v: v.engineCapacity},
        {k:'Mileage', v: v.mileage ? fmtMileage(v.mileage) : ''},
        {k:'Transmission', v: v.trans || ''},
        {k:'Fuel', v: v.fuel || ''},
        {k:'Doors', v: v.doors || ''},
        {k:'Colour', v: v.color || ''}
      ];
      specs.forEach(function(s){
        if(!s.v && s.v !== 0) return;
        const sp = document.createElement('span'); sp.className='chip'; sp.setAttribute('role','listitem'); sp.tabIndex = 0;
        const iconWrap = document.createElement('span'); iconWrap.className = 'chip-icon';
        const svg = iconMap[s.k] || '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
        iconWrap.innerHTML = svg;
        const body = document.createElement('div'); body.className = 'chip-body';
        const strong = document.createElement('strong'); strong.textContent = s.k;
        const val = document.createElement('span'); val.className='chip-value'; val.textContent = s.v;
        body.appendChild(strong); body.appendChild(val);
        sp.appendChild(iconWrap); sp.appendChild(body);

        // prepare tooltip content with slightly more detail
        function chipDetail(){
          const key = s.k;
          switch(key){
            case 'Year': return 'Registration year: ' + (v.year || 'Not specified');
            case 'Owners': return 'Number of previous owners: ' + (v.owners != null ? v.owners : 'Not specified');
            case 'Body': return 'Body type: ' + (v.bodyType || 'Not specified');
            case 'Engine': return 'Engine: ' + ((v.engineCapacity || '') + (v.engineCapacityLitres ? (' — ' + (Math.round(v.engineCapacityLitres*10)/10) + 'L') : '')) || 'Not specified';
            case 'Mileage': return 'Odometer reading: ' + (v.mileage ? fmtMileage(v.mileage) : 'Not specified');
            case 'Transmission': return 'Transmission: ' + (v.trans || 'Not specified');
            case 'Fuel': return 'Fuel type: ' + (v.fuel || 'Not specified');
            case 'Doors': return 'Number of doors: ' + (v.doors != null ? v.doors : 'Not specified');
            case 'Colour': return 'Exterior colour: ' + (v.color || 'Not specified');
            default: return s.k + ': ' + s.v;
          }
        }

        // show tooltip on hover/focus
        let ttTimeout = null;
        sp.addEventListener('mouseenter', function(e){ clearTimeout(ttTimeout); showChipTooltip(sp, chipDetail()); });
        sp.addEventListener('mouseleave', function(){ ttTimeout = setTimeout(hideChipTooltip, 120); });
        sp.addEventListener('focus', function(){ clearTimeout(ttTimeout); showChipTooltip(sp, chipDetail()); });
        sp.addEventListener('blur', function(){ ttTimeout = setTimeout(hideChipTooltip, 80); });

        chipsRoot.appendChild(sp);
      });
    }

    // gallery
    const main = document.getElementById('mainImage'); const thumbs = document.getElementById('thumbs'); if(thumbs) thumbs.innerHTML = '';
    let imgs = (v.images && v.images.length) ? v.images : (v.gallery && v.gallery.length ? v.gallery : (v.image ? [v.image] : []));
    if(Array.isArray(imgs) && imgs.length === 1){ const base = imgs[0]; const count = Math.floor(Math.random()*4)+2; imgs = []; for(let i=0;i<count;i++){ const sep = base.indexOf('?') === -1 ? '?' : '&'; imgs.push(base + sep + 'v=' + i); } }
    (imgs.length ? imgs : ['/images/placeholder-car.jpg']).forEach(function(src, idx){ const t = document.createElement('img'); t.src = src; t.alt = (v.make||'') + ' ' + (v.model||''); t.setAttribute('role','listitem'); t.addEventListener('click', function(){ if(main) main.src = src; thumbs.querySelectorAll('img').forEach(x=>x.classList.remove('active')); t.classList.add('active'); }); if(thumbs) thumbs.appendChild(t); if(idx===0 && main){ main.src = src; t.classList.add('active'); } });

    // CTAs
    const reqEl = document.getElementById('requestInfo'); if(reqEl) reqEl.addEventListener('click', function(){ window.location.href = 'mailto:info@fairfieldcars.co.uk?subject=Request info about ' + encodeURIComponent((document.getElementById('vehicleTitle')||{}).textContent || 'vehicle'); });
    const bookEl = document.getElementById('bookTest'); if(bookEl) bookEl.addEventListener('click', function(){ window.location.href = '#carModal'; });

    // render feature cards (full cards) into the top-of-specs container
    try{
      const topRoot = document.getElementById('featureCardsTop');
      if(topRoot){
        topRoot.innerHTML = '';
        if(Array.isArray(v.features) && v.features.length){
          v.features.forEach(function(f){
            const art = document.createElement('article'); art.className = 'feature-card';
            const icon = document.createElement('span'); icon.className = 'f-icon'; icon.textContent = '•';
            const body = document.createElement('div'); body.className = 'f-body';
            const strong = document.createElement('strong'); strong.textContent = f || '';
            const p = document.createElement('p'); p.textContent = '';
            body.appendChild(strong); body.appendChild(p);
            art.appendChild(icon); art.appendChild(body);
            topRoot.appendChild(art);
          });
        } else {
          topRoot.innerHTML = '<p class="muted">No features listed for this vehicle.</p>';
        }
      }
    }catch(e){/* ignore */}

    // Render specs into the Specs section (replace previous static content)
    try{
      const specRoot = document.getElementById('featureCategories'); if(specRoot){ specRoot.innerHTML = ''; if(Array.isArray(v.specs) && v.specs.length){ v.specs.forEach(function(cat){ const details = document.createElement('details'); details.className = 'feature-category'; const summary = document.createElement('summary'); const items = Array.isArray(cat.items) ? cat.items : []; summary.textContent = (cat.category || 'Specs') + (items.length ? ' ('+items.length+')' : ''); details.appendChild(summary); const cards = document.createElement('div'); cards.className = 'feature-cards'; if(items.length){ items.forEach(function(it){ const art = document.createElement('article'); art.className = 'feature-card'; const title = document.createElement('div'); title.className = 'f-body'; const strong = document.createElement('strong'); strong.textContent = it.name || it.label || it.key || ''; const p = document.createElement('p'); p.textContent = it.value || it.display || ''; title.appendChild(strong); title.appendChild(p); art.appendChild(title); cards.appendChild(art); }); } else {
            const empty = document.createElement('div'); empty.className='feature-cards empty'; empty.textContent = 'No items'; cards.appendChild(empty);
          }
          details.appendChild(cards);
          specRoot.appendChild(details);
        }); } else {
          specRoot.innerHTML = '<p>No specs available for this vehicle.</p>';
        } }
    }catch(e){ console.warn('specs render failed', e); }
  }

  // load inventory and render
  (function(){
    const q = getQuery(); const target = q.car || q.slug || q.reg || '';
    if(target){
      // If a specific vehicle token is present (reg/slug), request the canonical vehicle record from the API.
      // This avoids downloading the full inventory for lookups.
      const isReg = /^[0-9]+$/.test(target);
      const param = isReg ? 'reg=' + encodeURIComponent(target) : 'slug=' + encodeURIComponent(target);
      fetch('/api/vehicle?' + param, { cache: 'no-cache' })
        .then(function(res){ if(!res.ok) throw new Error('vehicle fetch failed'); return res.json(); })
        .then(function(payload){ const v = payload && payload.vehicle ? payload.vehicle : null; if(!v) throw new Error('vehicle not found'); renderVehicle(v); })
        .catch(function(err){ console.warn('vehicle renderer failed', err); renderVehicle({ year:'', make:'Unavailable', model:'', price:'', description:'Vehicle details not available.' }); });
    } else {
      // No specific target — fall back to loading a single page of inventory (not the entire list)
      if(!window.__inventoryPromise){
        window.__inventoryPromise = fetch('/api/inventory?page=1&per_page=12', {cache:'no-cache'})
          .then(function(res){ if(!res.ok) throw new Error('inventory fetch failed'); return res.json(); })
          .then(function(payload){ return Array.isArray(payload && payload.items) ? payload.items : []; })
          .catch(function(err){ window.__inventoryPromise = null; throw err; });
      }
      window.__inventoryPromise.then(function(list){ if(!Array.isArray(list)) return; renderVehicle(list[0] || null); }).catch(function(err){ console.warn('vehicle renderer failed', err); renderVehicle({ year:'', make:'Unavailable', model:'', price:'', description:'Vehicle details not available.' }); });
    }
  })();

})();
