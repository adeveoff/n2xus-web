/* ==========================================================================
   N2XUS V3 — Curseur personnalisé (point + anneau + trail)
   ========================================================================== */
(function(){
  if(window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  const dot = document.createElement('div'); dot.className = 'n2x-cursor';
  const ring = document.createElement('div'); ring.className = 'n2x-ring';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  const TRAIL_LEN = 10;
  const trail = Array.from({length:TRAIL_LEN}, ()=>{
    const t = document.createElement('div');
    t.className = 'n2x-trail';
    document.body.appendChild(t);
    return { el:t, x:0, y:0 };
  });

  let mx = innerWidth/2, my = innerHeight/2;
  let rx = mx, ry = my; // position retardée pour l'anneau (effet d'inertie)
  const history = Array.from({length:TRAIL_LEN}, ()=>({x:mx,y:my}));

  window.addEventListener('mousemove', e=>{
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  });

  window.addEventListener('mousedown', ()=> ring.classList.add('click'));
  window.addEventListener('mouseup', ()=> ring.classList.remove('click'));

  const hoverSelector = 'a, button, .btn, .feature, .why-card, .review, .social-card, .faq-q, .slider-nav button, .terminal, [data-cursor-hover]';
  document.addEventListener('mouseover', e=>{
    if(e.target.closest && e.target.closest(hoverSelector)){
      dot.classList.add('hover'); ring.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', e=>{
    if(e.target.closest && e.target.closest(hoverSelector)){
      dot.classList.remove('hover'); ring.classList.remove('hover');
    }
  });

  function raf(){
    // anneau : inertie légère (glow attiré)
    rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;

    // trail : particules laissées pendant le mouvement
    history.pop();
    history.unshift({x:mx,y:my});
    trail.forEach((p,i)=>{
      const h = history[i] || history[history.length-1];
      p.el.style.transform = `translate(${h.x}px, ${h.y}px)`;
      p.el.style.opacity = (1 - i/TRAIL_LEN) * 0.45;
      const scale = 1 - i/TRAIL_LEN*0.7;
      p.el.style.width = p.el.style.height = (4*scale)+'px';
    });

    requestAnimationFrame(raf);
  }
  raf();
})();
