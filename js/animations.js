/* ==========================================================================
   N2XUS V3 — animations.js : reveal au scroll, texte lettre par lettre,
   menu hamburger, FAQ accordéon, nav au scroll
   ========================================================================== */
(function(){
  /* ---- Nav : fond au scroll ---- */
  const nav = document.querySelector('.nav');
  if(nav){
    const onScroll = ()=> nav.classList.toggle('scrolled', window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  /* ---- Menu hamburger ---- */
  const burger = document.querySelector('.burger');
  const links = document.querySelector('.nav-links');
  if(burger && links){
    burger.addEventListener('click', ()=>{
      burger.classList.toggle('open');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=>{
      burger.classList.remove('open'); links.classList.remove('open');
    }));
  }

  /* ---- Texte lettre par lettre (.letters) ---- */
  document.querySelectorAll('.letters').forEach(el=>{
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split('').map(ch=>
      `<span>${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');
    el.querySelectorAll('span').forEach((s,i)=> s.style.transitionDelay = (i*22)+'ms');
  });

  /* ---- Reveal au scroll (fade / zoom / slide) ---- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-zoom, .reveal-left, .reveal-right, .letters');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el=> io.observe(el));

  /* ---- FAQ accordéon ---- */
  document.querySelectorAll('.faq-item').forEach(item=>{
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if(!q || !a) return;
    q.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other=>{
        if(other !== item){
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight+'px' : null;
    });
  });
})();
