/* ==========================================================================
   N2XUS V3 — counters.js : compteurs animés déclenchés au scroll
   ========================================================================== */
(function(){
  const counters = document.querySelectorAll('.count[data-target]');
  if(!counters.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function format(n, suffix){
    return n.toLocaleString('fr-FR') + suffix;
  }

  function animate(el){
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    if(reduced){
      el.textContent = format(target, suffix);
      el.closest('.stat')?.classList.add('counted');
      return;
    }

    function tick(now){
      const p = Math.min((now-start)/duration, 1);
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = format(Math.floor(eased*target), suffix);
      if(p < 1) requestAnimationFrame(tick);
      else { el.textContent = format(target, suffix); el.closest('.stat')?.classList.add('counted'); }
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c=> io.observe(c));
})();
