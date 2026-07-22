/* ==========================================================================
   N2XUS V3 — tilt.js : inclinaison 3D + lumière qui suit la souris
   ========================================================================== */
(function(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if(reduced || isTouch) return;

  function attachTilt(el, {max=8, scale=1.02, glow=true} = {}){
    let rect = null;
    el.addEventListener('mouseenter', ()=>{ rect = el.getBoundingClientRect(); });
    el.addEventListener('mousemove', e=>{
      if(!rect) rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -2 * max;
      const ry = (px - 0.5) * 2 * max;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
      if(glow){
        el.style.setProperty('--mx', (px*100)+'%');
        el.style.setProperty('--my', (py*100)+'%');
      }
    });
    el.addEventListener('mouseleave', ()=>{
      el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1)';
    });
  }

  document.querySelectorAll('.feature, .why-card, .review').forEach(el=>{
    el.classList.add('tilt-target');
    attachTilt(el, {max:7, scale:1.015});
  });

  document.querySelectorAll('.social-card').forEach(el=>{
    el.classList.add('tilt-target');
    attachTilt(el, {max:14, scale:1.04});
  });

  // Hero 3D : rotation pilotée par la position de la souris dans toute la zone hero
  const stage = document.querySelector('.hero-stage');
  const hero3d = document.querySelector('.hero-3d');
  if(stage && hero3d){
    stage.addEventListener('mousemove', e=>{
      const rect = stage.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      hero3d.style.transform = `rotateY(${px*40}deg) rotateX(${-py*30}deg)`;
      hero3d.style.animationPlayState = 'paused';
    });
    stage.addEventListener('mouseleave', ()=>{
      hero3d.style.transform = '';
      hero3d.style.animationPlayState = 'running';
    });
  }

  // Terminal (dashboard preview) : légère perspective suivant la souris
  const terminal = document.querySelector('.terminal');
  if(terminal){
    const dashStage = document.querySelector('.dash-stage');
    (dashStage||terminal).addEventListener('mousemove', e=>{
      const rect = (dashStage||terminal).getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      terminal.style.transform = `rotateY(${px*14 - 4}deg) rotateX(${-py*10 + 2}deg)`;
    });
    (dashStage||terminal).addEventListener('mouseleave', ()=>{
      terminal.style.transform = 'rotateY(-8deg) rotateX(4deg)';
    });
  }
})();
