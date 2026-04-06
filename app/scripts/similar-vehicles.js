// Populate #similarGrid with vehicles from data/inventory.json
// Re-uses the `.car-card` markup and data-* attributes so CSS and existing inventory scripts/overlays work.
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    // slider elements
    const track = document.getElementById('similarTrack');
    const viewport = document.querySelector('.sim-viewport');
    const prevBtn = document.querySelector('.sim-prev');
    const nextBtn = document.querySelector('.sim-next');
    if(!track || !viewport) return;

      // no icon injection (cleaned up)

    // read current vehicle context exposed by renderVehicle
    const root = document.getElementById('vehicleRoot');
    const currentReg = root && root.dataset && root.dataset.reg ? (root.dataset.reg + '').toLowerCase() : '';
    const currentMake = root && root.dataset && root.dataset.make ? (root.dataset.make + '').toLowerCase() : '';
    const currentModel = root && root.dataset && root.dataset.model ? (root.dataset.model + '').toLowerCase() : '';

    function fmtPrice(p){ if(typeof p !== 'number') return p||''; return '£'+p.toLocaleString(); }

    if(!window.__inventoryPromise){
      window.__inventoryPromise = fetch('/api/inventory?per_page=1000', {cache: 'no-cache'}).then(function(res){ if(!res.ok) throw new Error('failed'); return res.json(); }).then(function(payload){ return Array.isArray(payload.items) ? payload.items : []; }).catch(function(err){ window.__inventoryPromise = null; throw err; });
    }
    window.__inventoryPromise.then(function(list){
      if(!Array.isArray(list)) return;

      // choose candidates: prefer exact make+model, otherwise same make, otherwise price proximity
      const candidates = list.filter(function(item){
        if(!item) return false;
        const reg = (item.reg||'').toLowerCase();
        if(currentReg && reg === currentReg) return false; // exclude current
        return true;
      });

      // scoring: higher score for make+model match, then make match, then price proximity
      function score(item){
        let s = 0;
        if(item.make && currentMake && (item.make+'').toLowerCase() === currentMake) s += 40;
        if(item.model && currentModel && (item.model+'').toLowerCase() === currentModel) s += 30;
        // price proximity (closer = more points)
        try{
          if(typeof item.price === 'number'){
            const curPriceEl = document.getElementById('vehiclePrice');
            let curPrice = 0;
            if(curPriceEl && curPriceEl.textContent){
              const txt = (curPriceEl.textContent || '').replace(/[^0-9]/g,''); curPrice = parseInt(txt||0,10) || 0;
            }
            if(curPrice && item.price){
              const diff = Math.abs(item.price - curPrice);
              const rel = diff / Math.max(1, curPrice);
              if(rel < 0.1) s += 20;
              else if(rel < 0.25) s += 10;
            }
          }
        }catch(e){}
        // small bonus for images
        if(item.images && item.images.length) s += 3;
        return s;
      }

      const scored = candidates.map(function(it){ return {it:it, s: score(it)}; }).sort(function(a,b){ return b.s - a.s; }).slice(0,6).map(x=>x.it);

      // render card elements into an array first
      if(scored.length === 0){ track.innerHTML = '<div class="muted">No similar vehicles found.</div>'; return; }
      const cards = scored.map(function(v){
        const card = document.createElement('article'); card.className = 'car-card';
        card.setAttribute('data-make', v.make || '');
        card.setAttribute('data-model', v.model || '');
        if(v.reg) card.setAttribute('data-reg', v.reg);
        if(v.price) card.setAttribute('data-price', String(v.price));
        if(v.mileage) card.setAttribute('data-mileage', String(v.mileage));
        if(v.trans) card.setAttribute('data-trans', v.trans);
        if(v.fuel) card.setAttribute('data-fuel', v.fuel);

        // media
        const media = document.createElement('div'); media.className = 'media';
        const img = document.createElement('img');
        img.alt = (v.make || '') + ' ' + (v.model || '');
        img.src = (Array.isArray(v.images) && v.images.length) ? v.images[0] : (v.image || '/images/placeholder-car.jpg');
        media.appendChild(img);

        // body
        const body = document.createElement('div'); body.className = 'card-body';
        const title = document.createElement('h3'); title.className = 'car-title'; title.textContent = ((v.year? (v.year + ' ') : '') + (v.make || '') + ' ' + (v.model || '')).trim();
        const meta = document.createElement('div'); meta.className = 'meta car-meta';
        const spReg = document.createElement('span'); spReg.className = 'reg chip'; spReg.innerHTML = '<div class="chip-body">' + (v.reg || '') + '</div>';
        const spMileage = document.createElement('span'); spMileage.className = 'mileage chip'; spMileage.innerHTML = '<div class="chip-body">' + (v.mileage ? (v.mileage + ' mi') : '') + '</div>';
        const spFuel = document.createElement('span'); spFuel.className = 'fuel chip'; spFuel.innerHTML = '<div class="chip-body">' + (v.fuel || '') + '</div>';
        const spTrans = document.createElement('span'); spTrans.className = 'trans chip'; spTrans.innerHTML = '<div class="chip-body">' + (v.trans || '') + '</div>';
        meta.appendChild(spReg); meta.appendChild(spMileage); meta.appendChild(spFuel); meta.appendChild(spTrans);

        const desc = document.createElement('p'); desc.className = 'short-desc'; desc.textContent = v.teaser || (v.description ? (String(v.description).replace(/<[^>]*>/g,'').slice(0,120)+'…') : '');

        const footer = document.createElement('div'); footer.className = 'card-footer';
        const price = document.createElement('div'); price.className = 'price'; price.textContent = v.price ? fmtPrice(v.price) : '';
        const actions = document.createElement('div'); actions.className = 'actions';
        const link = document.createElement('a'); link.className = 'details-link'; link.href = '#'+(v.reg || (v.make+'-'+v.model)); link.textContent = 'View';
        actions.appendChild(link);
        footer.appendChild(price); footer.appendChild(actions);

        body.appendChild(title); body.appendChild(meta); body.appendChild(desc); body.appendChild(footer);
        card.appendChild(media); card.appendChild(body);
        return card;
      });

      // group into slides of 3
      const perSlide = 3;
      const slides = [];
      for(let i=0;i<cards.length;i+=perSlide){
        const slide = document.createElement('div'); slide.className = 'sim-slide';
        const group = cards.slice(i, i+perSlide);
        group.forEach(c=> slide.appendChild(c));
        slides.push(slide);
      }

      // render slides into track
      track.innerHTML = '';
      slides.forEach(s => track.appendChild(s));

      // init slider behavior
      initSimilarSlider(track, viewport, prevBtn, nextBtn);

      // Add media overlays (share / save) and image count similar to the inventory page
      try{
        function addOverlays(){
          track.querySelectorAll('.car-card').forEach(function(card){
            var media = card.querySelector('.media'); if(!media) return;
            if(media.querySelector('.media-overlay')) return;
            try{
              var overlay = document.createElement('div'); overlay.className = 'media-overlay';
              var shareBtn = document.createElement('button'); shareBtn.type='button'; shareBtn.className='icon-btn share-btn'; shareBtn.title='Share';
              shareBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 3v13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 8l5-5 5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
              shareBtn.addEventListener('click', function(e){ e.stopPropagation(); try{ if(navigator.share){ navigator.share({ title: card.querySelector('.car-title') && card.querySelector('.car-title').textContent, text: '', url: location.href }); } else { window.prompt('Copy link to share', location.href); } }catch(err){ window.prompt('Copy link to share', location.href); } });

              var favBtn = document.createElement('button'); favBtn.type='button'; favBtn.className='icon-btn fav-btn'; favBtn.title='Save'; favBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
              favBtn.addEventListener('click', function(e){ e.stopPropagation(); favBtn.classList.toggle('saved'); });

              overlay.appendChild(shareBtn);
              overlay.appendChild(favBtn);

              var count = document.createElement('div'); count.className = 'img-count';
              var imgs = (card.getAttribute('data-images')||card.dataset.images||'0') || (card.querySelector('img') ? 1 : 0);
              count.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 7h-3.2l-1.6-2.4A1 1 0 0 0 15.6 4H8.4a1 1 0 0 0-.6.2L6.2 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="1.2" fill="none"/></svg><span>' + (imgs || 1) + '</span>';

              media.appendChild(overlay);
              media.appendChild(count);
            }catch(e){ /* ignore augmentation errors */ }
          });
        }
        addOverlays();
      }catch(e){/* ignore */}

    }).catch(function(){ track.innerHTML = '<div class="muted">Unable to load similar vehicles.</div>'; });
  });
})();

// Slider init helper (keeps scope local)
function initSimilarSlider(track, viewport, prevBtn, nextBtn){
  if(!track || !viewport) return;
  const slides = Array.from(track.querySelectorAll('.sim-slide'));
  if(slides.length === 0){ if(prevBtn) prevBtn.disabled = true; if(nextBtn) nextBtn.disabled = true; return; }
  let idx = 0;

  function update(){
    const w = viewport.clientWidth;
    slides.forEach(s => s.style.width = w + 'px');
    track.style.width = (w * slides.length) + 'px';
    track.style.transform = 'translateX(' + (-idx * w) + 'px)';
    if(prevBtn) prevBtn.disabled = idx === 0;
    if(nextBtn) nextBtn.disabled = idx === slides.length - 1;
  }

  function prev(){ if(idx > 0){ idx--; update(); }}
  function next(){ if(idx < slides.length - 1){ idx++; update(); }}

  if(prevBtn) prevBtn.addEventListener('click', prev);
  if(nextBtn) nextBtn.addEventListener('click', next);

  // keyboard
  viewport.tabIndex = 0;
  viewport.addEventListener('keydown', function(e){ if(e.key === 'ArrowLeft') prev(); if(e.key === 'ArrowRight') next(); });

  // swipe support (basic)
  let startX = null; let dx = 0;
  viewport.addEventListener('touchstart', function(e){ startX = e.touches[0].clientX; }, {passive:true});
  viewport.addEventListener('touchmove', function(e){ if(startX === null) return; dx = e.touches[0].clientX - startX; }, {passive:true});
  viewport.addEventListener('touchend', function(){ if(startX === null) return; if(Math.abs(dx) > 60){ if(dx < 0) next(); else prev(); } startX = null; dx = 0; });

  // responsive — recalc on resize
  window.addEventListener('resize', function(){ requestAnimationFrame(update); });
  // initial update
  requestAnimationFrame(update);
}
