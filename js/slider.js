/* ==========================================================================
   N2XUS V3 — slider.js : carousel du Dashboard Preview
   ========================================================================== */
(function(){
  const track = document.querySelector('.dash-slides');
  if(!track) return;
  const slides = Array.from(track.querySelectorAll('img'));
  const dotsWrap = document.querySelector('.slider-dots');
  const prevBtn = document.querySelector('[data-slide="prev"]');
  const nextBtn = document.querySelector('[data-slide="next"]');
  let idx = 0;
  let timer = null;

  slides.forEach((_,i)=>{
    if(!dotsWrap) return;
    const d = document.createElement('span');
    if(i===0) d.classList.add('active');
    d.addEventListener('click', ()=> go(i));
    dotsWrap.appendChild(d);
  });
  const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

  function render(){
    slides.forEach((s,i)=> s.classList.toggle('active', i===idx));
    dots.forEach((d,i)=> d.classList.toggle('active', i===idx));
  }

  function go(i){
    idx = (i + slides.length) % slides.length;
    render();
    restart();
  }

  function next(){ go(idx+1); }
  function prev(){ go(idx-1); }

  function restart(){
    clearInterval(timer);
    timer = setInterval(next, 4500);
  }

  if(prevBtn) prevBtn.addEventListener('click', prev);
  if(nextBtn) nextBtn.addEventListener('click', next);

  if(slides.length){
    render();
    restart();
  }
})();
