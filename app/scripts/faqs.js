// Lightweight accessible FAQ accordion + search filter
(function(){
  function qs(selector, ctx){ return (ctx||document).querySelector(selector); }
  function qsa(selector, ctx){ return Array.from((ctx||document).querySelectorAll(selector)); }

  function togglePanel(button, panel){
    var expanded = button.getAttribute('aria-expanded') === 'true';
    if(expanded){
      button.setAttribute('aria-expanded','false');
      panel.hidden = true;
    } else {
      button.setAttribute('aria-expanded','true');
      panel.hidden = false;
    }
  }

  function initAccordion(root){
    if(!root) return;
    var items = qsa('.faq-item', root);
    items.forEach(function(item){
      var btn = qs('.faq-toggle', item);
      var panelId = btn && btn.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : qs('.faq-panel', item);
      if(!btn || !panel) return;

      // ensure initial hidden state matches aria
      if(btn.getAttribute('aria-expanded') !== 'true') panel.hidden = true;

      btn.addEventListener('click', function(e){ e.preventDefault(); togglePanel(btn,panel); });

      btn.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); togglePanel(btn,panel); }
      });
    });
  }


  document.addEventListener('DOMContentLoaded', function(){
    var root = document.querySelector('.faq-accordion');
    initAccordion(root);
  });
})();
