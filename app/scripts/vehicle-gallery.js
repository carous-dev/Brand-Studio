// Simple futuristic carousel + lightbox for vehicle gallery
(function(){
  function init(){
    const gallery = document.getElementById('gallery');
    if(!gallery) return;
    const main = document.getElementById('mainImage');
    const thumbs = document.getElementById('thumbs');
    let items = Array.from(thumbs.querySelectorAll('img'));

    // If thumbnails not yet populated when this module runs, defer wiring until they exist.
    function refreshItems(){ items = Array.from(thumbs.querySelectorAll('img')); items.forEach((t, idx)=>{ t.dataset.index = idx; }); }

    // safe setter for main image
    function showIndex(i){ if(!items.length) return; i = (i + items.length) % items.length; const src = items[i].src; main.src = src; items.forEach(x=>x.classList.remove('active')); items[i].classList.add('active'); main.dataset.index = i; }

    // previous/next buttons
    const prev = gallery.querySelector('.gallery-prev');
    const next = gallery.querySelector('.gallery-next');
    prev && prev.addEventListener('click', function(){ refreshItems(); const idx = parseInt(main.dataset.index||0,10); showIndex(idx-1); });
    next && next.addEventListener('click', function(){ refreshItems(); const idx = parseInt(main.dataset.index||0,10); showIndex(idx+1); });

    // thumbnails click behavior
    thumbs.addEventListener('click', function(e){ const t = e.target.closest('img'); if(!t) return; refreshItems(); const idx = items.indexOf(t); showIndex(idx); });

    // keyboard left/right while main focused
    main.addEventListener('keydown', function(e){ if(e.key === 'ArrowLeft') prev && prev.click(); if(e.key === 'ArrowRight') next && next.click(); if(e.key === 'Enter') openLightbox(); });

    // lightbox
    const lb = document.createElement('div'); lb.id = 'vehicleLightbox'; lb.className = 'vehicle-lightbox'; lb.setAttribute('aria-hidden','true');
    lb.innerHTML = '<div class="lb-inner"><button class="lb-close" aria-label="Close">✕</button><button class="lb-nav lb-prev" aria-label="Previous">◂</button><img src="" alt="" /><button class="lb-nav lb-next" aria-label="Next">▸</button></div>';
    document.body.appendChild(lb);
    const lbImg = lb.querySelector('img');
    const lbClose = lb.querySelector('.lb-close');
    const lbPrev = lb.querySelector('.lb-prev');
    const lbNext = lb.querySelector('.lb-next');

    function openLightbox(){ refreshItems(); const idx = parseInt(main.dataset.index||0,10); lbImg.src = items[idx] ? items[idx].src : main.src; lbImg.alt = main.alt || ''; lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; lb.dataset.index = idx; lbClose.focus(); }
    function closeLightbox(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; main.focus(); }

    // wire open on main image click
    main.addEventListener('click', openLightbox);

    // nav inside lightbox
    lbPrev.addEventListener('click', function(){ let i = parseInt(lb.dataset.index||0,10); i = (i - 1 + items.length) % items.length; lb.dataset.index = i; lbImg.src = items[i].src; });
    lbNext.addEventListener('click', function(){ let i = parseInt(lb.dataset.index||0,10); i = (i + 1) % items.length; lb.dataset.index = i; lbImg.src = items[i].src; });
    lbClose.addEventListener('click', closeLightbox);

    lb.addEventListener('click', function(e){ if(e.target === lb) closeLightbox(); });

    // keyboard navigation for lightbox
    document.addEventListener('keydown', function(e){ if(lb.classList.contains('open')){
      if(e.key === 'Escape') closeLightbox();
      if(e.key === 'ArrowLeft') lbPrev.click();
      if(e.key === 'ArrowRight') lbNext.click();
    }});

    // observe thumbs: when thumbnails are inserted by page script, initialize
    const obs = new MutationObserver(function(){ refreshItems(); if(items.length && typeof main.dataset.index === 'undefined'){ showIndex(0); } });
    obs.observe(thumbs, {childList:true, subtree:false});

    // try initial setup
    refreshItems(); if(items.length){ showIndex(0); }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
