/* Box 47 — script.js */

// ── Ano footer ──
const yearEl = document.getElementById('year');
if (yearEl && (!yearEl.textContent || yearEl.textContent.startsWith('{{'))) {
  yearEl.textContent = new Date().getFullYear();
}

// ── Scroll canvas — cover mode §4.2 ──
(function () {
  const canvas = document.getElementById('scroll-canvas');
  const section = document.getElementById('scroll-anim');
  if (!canvas || !section) return;

  const ctx = canvas.getContext('2d');
  const pin = section.querySelector('.scroll-anim-pin');

  const FRAME_PATH   = 'https://8ispuxmgjxgu2r5q.public.blob.vercel-storage.com/templates/fitness-002/frames/';
  const FRAME_COUNT  = 151;
  const FRAME_PREFIX = 'frame_';
  const FRAME_PAD    = 4;
  const FRAME_EXT    = '.webp';

  const images = [];
  let loaded = 0;

  function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const cw = pin.clientWidth;
    const ch = pin.clientHeight;
    canvas.width  = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width  = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function render(progress) {
    const idx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(progress * FRAME_COUNT)));
    const img = images[idx];
    if (!img || !img.complete || !img.naturalWidth) return;
    const cw = pin.clientWidth;
    const ch = pin.clientHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih); /* COVER */
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.src = `${FRAME_PATH}${FRAME_PREFIX}${String(i).padStart(FRAME_PAD, '0')}${FRAME_EXT}`;
    img.onload = () => { loaded++; if (loaded === 1) { setupCanvas(); render(0); } };
    images.push(img);
  }

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) { render(0); return; }
    render(Math.min(1, Math.max(0, -rect.top / scrollable)));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { setupCanvas(); onScroll(); });
})();

// ── IntersectionObservers ──
if ('IntersectionObserver' in window) {
  // Fade up
  const fadeObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); fadeObs.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));

  // Text reveal
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal-wrapper').forEach(el => revealObs.observe(el));

  // Stagger cards
  const stagObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.stagger || 0, 10) * 130;
        setTimeout(() => e.target.classList.add('visible'), delay);
        stagObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.stagger-card').forEach(el => stagObs.observe(el));

} else {
  document.querySelectorAll('.fade-up, .stagger-card, .reveal-wrapper').forEach(el => el.classList.add('visible'));
}

// ── Fade-up failsafe (viewport on load) ──
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.fade-up:not(.visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }, 100);
});

// ── Fallback immagini ──
window.__imgFallback = function (img, label) {
  const w = document.createElement('div');
  w.className = 'img-svg-fallback';
  w.setAttribute('role', 'img');
  w.setAttribute('aria-label', label);
  const gid = 'g' + Date.now() + Math.random().toString(36).substr(2, 4);
  w.innerHTML =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">` +
    `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="currentColor" stop-opacity="0.12"/>` +
    `<stop offset="100%" stop-color="currentColor" stop-opacity="0.04"/>` +
    `</linearGradient></defs>` +
    `<rect width="800" height="600" fill="url(#${gid})"/>` +
    `<text x="400" y="320" text-anchor="middle" font-family="sans-serif" font-size="22" fill="currentColor" opacity="0.4">${label}</text>` +
    `</svg>`;
  img.replaceWith(w);
};
