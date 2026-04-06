(function(){
  // Use base colors from CSS custom properties and randomize neon blob positions/sizes/colors
  function rand(min, max){ return Math.random() * (max - min) + min; }

  function parseRGBString(s){
    // s may be like "185,146,74" or " 185, 146, 74"
    if(!s) return null;
    const parts = s.split(',').map(p=>parseInt(p.trim(),10)).filter(n=>!isNaN(n));
    if(parts.length<3) return null;
    return parts.slice(0,3);
  }

  function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  function rgbaFromRGB(rgbArr, a){ return 'rgba('+rgbArr.join(',')+','+a+')'; }

  function applyRandomize(){
    const container = document.querySelector('.neon-bg');
    if(!container) return;
    const blobs = Array.from(container.querySelectorAll('.neon'));
    if(!blobs.length) return;

    // Get base colors from CSS variables
    const accentRGB = parseRGBString(cssVar('--accent-rgb')) || null;
    const accent2RGB = parseRGBString(cssVar('--accent-2-rgb')) || null;

    const palette = [];
    if(accentRGB) palette.push(accentRGB);
    if(accent2RGB) palette.push(accent2RGB);
    // fallback: try hex --accent and --accent-2 then convert
    if(palette.length === 0){
      const ahex = cssVar('--accent');
      const a2hex = cssVar('--accent-2');
      function hexToRgb(hex){ if(!hex) return null; hex = hex.replace('#','').trim(); if(hex.length===3) hex = hex.split('').map(h=>h+h).join(''); const r = parseInt(hex.substring(0,2),16); const g = parseInt(hex.substring(2,4),16); const b = parseInt(hex.substring(4,6),16); if(isNaN(r)) return null; return [r,g,b]; }
      const a1 = hexToRgb(ahex); const a22 = hexToRgb(a2hex);
      if(a1) palette.push(a1); if(a22) palette.push(a22);
    }

    blobs.forEach(function(b){
      // random size
      const minSize = 80, maxSize = 520;
      const size = Math.floor(rand(minSize, maxSize));
      b.style.width = size + 'px'; b.style.height = size + 'px';

      // random position (allow part-offscreen) using percentages
      const left = rand(-15, 85);
      const top = rand(-20, 85);
      b.style.left = left + '%'; b.style.top = top + '%';
      b.style.right = 'auto'; b.style.bottom = 'auto';

      // random blur and opacity (slightly stronger: less blur, a little brighter)
      const blur = Math.floor(rand(28, 64));
      const opacity = rand(0.28, 0.72).toFixed(2);
      b.style.filter = 'blur('+blur+'px)';
      b.style.opacity = opacity;

      // random animation duration and delay
      const dur = Math.floor(rand(7, 16));
      const delay = Math.floor(rand(0, 6));
      b.style.animationDuration = dur + 's';
      b.style.animationDelay = delay + 's';

      // color: randomly pick from palette and set radial gradient
      if(palette.length){
        const pick = palette[Math.floor(rand(0, palette.length))];
        // slightly stronger inner and mid alphas to increase visibility a little
        const inner = rgbaFromRGB(pick, rand(0.6, 0.9).toFixed(2));
        const mid = rgbaFromRGB(pick, rand(0.08, 0.22).toFixed(2));
        const gradient = 'radial-gradient(circle at 50% 50%, '+inner+' 0%, '+mid+' 35%, transparent 65%)';
        b.style.background = gradient;
        b.style.mixBlendMode = 'screen';
      }

      // subtle transform origin random
      b.style.transformOrigin = (rand(20,80)).toFixed(0)+'% '+(rand(20,80)).toFixed(0)+'%';
    });
  }

  function init(){
    applyRandomize();
    // re-randomize on resize but debounce
    let t; window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(applyRandomize, 220); });
    // also re-run after a short delay to handle slow load
    setTimeout(applyRandomize, 600);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
