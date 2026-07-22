/* ==========================================================================
   N2XUS V3 — Background Engine
   3 couches de canvas : loin (lent) / milieu (particules+filaments) / proche (curseur)
   ========================================================================== */
(function(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const far = document.getElementById('bg-far');
  const mid = document.getElementById('bg-mid');
  const near = document.getElementById('bg-near');
  if(!far || !mid || !near) return;

  const ctxFar = far.getContext('2d');
  const ctxMid = mid.getContext('2d');
  const ctxNear = near.getContext('2d');

  let W = innerWidth, H = innerHeight, DPR = Math.min(devicePixelRatio || 1, 2);

  function resize(){
    W = innerWidth; H = innerHeight;
    [far, mid, near].forEach(c=>{
      c.width = W * DPR; c.height = H * DPR;
      c.style.width = W+'px'; c.style.height = H+'px';
    });
    ctxFar.setTransform(DPR,0,0,DPR,0,0);
    ctxMid.setTransform(DPR,0,0,DPR,0,0);
    ctxNear.setTransform(DPR,0,0,DPR,0,0);
  }
  window.addEventListener('resize', resize);
  resize();

  const mouse = { x: W/2, y: H/2, active:false };
  window.addEventListener('mousemove', e=>{ mouse.x=e.clientX; mouse.y=e.clientY; mouse.active=true; });
  window.addEventListener('mouseleave', ()=>{ mouse.active=false; });
  window.addEventListener('touchmove', e=>{
    if(e.touches[0]){ mouse.x=e.touches[0].clientX; mouse.y=e.touches[0].clientY; mouse.active=true; }
  }, {passive:true});

  const GOLD = [216,178,76];

  /* ---- Couche lointaine : halos lents qui respirent ---- */
  const halos = Array.from({length:5}, (_,i)=>({
    x: Math.random()*W, y: Math.random()*H,
    r: 120 + Math.random()*180,
    vx: (Math.random()-.5)*0.06, vy:(Math.random()-.5)*0.06,
    phase: Math.random()*Math.PI*2
  }));

  /* ---- Couche milieu : particules connectées + filaments dorés ---- */
  const COUNT = Math.min(90, Math.floor((W*H)/16000));
  const particles = Array.from({length:COUNT}, ()=>({
    x: Math.random()*W, y: Math.random()*H,
    vx: (Math.random()-.5)*0.35, vy:(Math.random()-.5)*0.35,
    r: 1 + Math.random()*1.6
  }));
  const filaments = Array.from({length:6}, ()=>({
    pts: Array.from({length:5},()=>({x:Math.random()*W, y:Math.random()*H})),
    t: Math.random()*100
  }));

  /* ---- Couche proche : particules attirées / repoussées par le curseur ---- */
  const nearParticles = Array.from({length:36}, ()=>({
    x: Math.random()*W, y: Math.random()*H,
    vx:0, vy:0, life: Math.random()
  }));

  let t = 0;

  function drawFar(){
    ctxFar.clearRect(0,0,W,H);
    halos.forEach(h=>{
      h.x += h.vx; h.y += h.vy;
      if(h.x < -h.r) h.x = W+h.r; if(h.x > W+h.r) h.x = -h.r;
      if(h.y < -h.r) h.y = H+h.r; if(h.y > H+h.r) h.y = -h.r;
      const breathe = 0.5 + 0.5*Math.sin(t*0.006 + h.phase);
      const grd = ctxFar.createRadialGradient(h.x,h.y,0,h.x,h.y,h.r);
      grd.addColorStop(0, `rgba(${GOLD.join(',')},${0.05+0.05*breathe})`);
      grd.addColorStop(1, 'rgba(216,178,76,0)');
      ctxFar.fillStyle = grd;
      ctxFar.beginPath();
      ctxFar.arc(h.x,h.y,h.r,0,Math.PI*2);
      ctxFar.fill();
    });
  }

  function drawMid(){
    ctxMid.clearRect(0,0,W,H);

    // filaments dorés en mouvement (courbes fluides)
    filaments.forEach(f=>{
      f.t += 0.0025;
      ctxMid.beginPath();
      f.pts.forEach((p,i)=>{
        const ox = Math.sin(f.t*2 + i)* (30+i*6);
        const oy = Math.cos(f.t*2.4 + i)* (24+i*5);
        const x = p.x + ox, y = p.y + oy;
        if(i===0) ctxMid.moveTo(x,y); else ctxMid.lineTo(x,y);
      });
      ctxMid.strokeStyle = 'rgba(216,178,76,0.10)';
      ctxMid.lineWidth = 1;
      ctxMid.stroke();
    });

    // particules + connexions
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
    });
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a=particles[i], b=particles[j];
        const dx=a.x-b.x, dy=a.y-b.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if(d < 130){
          ctxMid.strokeStyle = `rgba(216,178,76,${0.14*(1-d/130)})`;
          ctxMid.lineWidth = 0.6;
          ctxMid.beginPath();
          ctxMid.moveTo(a.x,a.y); ctxMid.lineTo(b.x,b.y);
          ctxMid.stroke();
        }
      }
      ctxMid.beginPath();
      ctxMid.fillStyle = 'rgba(243,217,138,0.55)';
      ctxMid.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctxMid.fill();
    }
  }

  function drawNear(){
    ctxNear.clearRect(0,0,W,H);
    if(!mouse.active) return;

    nearParticles.forEach(p=>{
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.sqrt(dx*dx+dy*dy) || 1;
      const force = Math.min(1200/(dist*dist), 0.06);
      p.vx += dx*force*0.02 - p.vx*0.03;
      p.vy += dy*force*0.02 - p.vy*0.03;
      p.x += p.vx; p.y += p.vy;

      ctxNear.beginPath();
      ctxNear.fillStyle = `rgba(216,178,76,${0.5})`;
      ctxNear.arc(p.x,p.y,1.4,0,Math.PI*2);
      ctxNear.fill();
    });

    // glow autour du curseur
    const grd = ctxNear.createRadialGradient(mouse.x,mouse.y,0,mouse.x,mouse.y,140);
    grd.addColorStop(0,'rgba(216,178,76,0.16)');
    grd.addColorStop(1,'rgba(216,178,76,0)');
    ctxNear.fillStyle = grd;
    ctxNear.beginPath();
    ctxNear.arc(mouse.x,mouse.y,140,0,Math.PI*2);
    ctxNear.fill();
  }

  function loop(){
    t++;
    drawFar();
    drawMid();
    drawNear();
    requestAnimationFrame(loop);
  }

  if(reduced){
    drawFar(); drawMid();
  } else {
    loop();
  }
})();
