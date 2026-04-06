(function(){
  'use strict';
  function initDescToggle(){
    const full = document.getElementById('vehicleFullDesc');
    if(!full) return;

    const setup = function(){
      const hasText = full.textContent && full.textContent.trim().length > 0;
      if(!hasText) return false;

      const ensureToggle = () => {
        // remove existing toggle if present
        const existing = document.getElementById('descToggle');
        if(existing) existing.remove();

        // only add toggle on narrow screens
        if(window.innerWidth <= 700){
          full.classList.add('clamped');
          full.classList.remove('expanded');
          const btn = document.createElement('button');
          btn.id = 'descToggle';
          btn.type = 'button';
          btn.className = 'vehicle-full-desc-toggle';
          btn.textContent = 'Read more';
          btn.addEventListener('click', function(){
            const expanded = full.classList.toggle('expanded');
            if(expanded){
              full.classList.remove('clamped');
              btn.textContent = 'Show less';
            } else {
              full.classList.add('clamped');
              btn.textContent = 'Read more';
            }
            // ensure toggle remains visible on content changes
          });
          full.insertAdjacentElement('afterend', btn);
        } else {
          full.classList.remove('clamped','expanded');
        }
      };

      ensureToggle();
      window.addEventListener('resize', ensureToggle);
      return true;
    };

    // If content is not present yet, observe for mutations
    if(!full.textContent || !full.textContent.trim()){
      const mo = new MutationObserver((mutations, obs) => {
        if(full.textContent && full.textContent.trim()){
          obs.disconnect();
          setTimeout(() => { setupDescOnce(); }, 0);
        }
      });
      mo.observe(full, {childList:true, subtree:true, characterData:true});

      // fallback after a short delay in case mutation doesn't fire
      const setupDescOnce = () => { setup(); };
      setTimeout(setupDescOnce, 800);
    } else {
      setup();
    }
  }

  // Run after DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initDescToggle);
  } else {
    initDescToggle();
  }
})();
