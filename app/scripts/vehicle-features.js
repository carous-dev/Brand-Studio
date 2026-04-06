// Sync details/summary ARIA-expanded state and provide a small enhancement
(function(){
  function init(){
    const cats = document.querySelectorAll('.feature-category');
    if(!cats || cats.length === 0) return;
    cats.forEach(function(d){
      const s = d.querySelector('summary');
      if(!s) return;
      // Make the summary explicitly act like a button for assistive tech
      s.setAttribute('role','button');
      s.setAttribute('tabindex', '0');
      // initialise aria-expanded from the details open state
      s.setAttribute('aria-expanded', d.hasAttribute('open') ? 'true' : 'false');

      // when the details toggles, update aria-expanded
      d.addEventListener('toggle', function(){
        s.setAttribute('aria-expanded', d.hasAttribute('open') ? 'true' : 'false');
      });

      // allow Space/Enter key to toggle (some browsers already do this, but ensure consistent behaviour)
      s.addEventListener('keydown', function(e){
        if(e.key === ' ' || e.key === 'Enter'){
          e.preventDefault();
          // toggle the details open state
          d.open = !d.open;
          // dispatch toggle event is automatic in modern browsers
          s.setAttribute('aria-expanded', d.hasAttribute('open') ? 'true' : 'false');
        }
      });
    });
  }

  // init on DOMContentLoaded and also try again after short delay in case content injected
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  setTimeout(init, 600); // redundancy for dynamically-inserted content
})();
