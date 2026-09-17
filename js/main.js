/* ALRÍO — interacciones */
(function () {
  'use strict';

  /* Reveal al hacer scroll */
  var targets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Nav sólida al pasar la portada */
  var nav = document.getElementById('al-nav');
  var onScroll = function () {
    if (!nav) return;
    nav.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.78);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menú móvil */
  var burger = document.getElementById('al-burger');
  var drawer = document.getElementById('al-drawer');
  var closeBtn = document.getElementById('al-drawer-close');
  var setDrawer = function (open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    if (burger) {
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Menú');
    }
    if (nav) nav.classList.toggle('is-menu', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  if (burger) burger.addEventListener('click', function () { setDrawer(!drawer.classList.contains('is-open')); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false); });
  if (drawer) drawer.querySelectorAll('nav a').forEach(function (a) {
    a.addEventListener('click', function () { setDrawer(false); });
  });

  /* Lightbox de galería */
  var lb = document.getElementById('al-lb');
  var lbImg = document.getElementById('al-lb-img');
  document.querySelectorAll('[data-lb]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!lb || !lbImg) return;
      lbImg.src = btn.getAttribute('data-lb');
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });
  var closeLb = function () {
    if (!lb) return;
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lbImg) lbImg.removeAttribute('src');
  };
  if (lb) lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLb(); setDrawer(false); }
  });

  /* Conmutador ES / EN */
  var pills = document.querySelectorAll('.al-pill[data-lang]');
  var apply = function (lang) {
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.dataset.es === undefined) el.dataset.es = el.textContent;
      var next = lang === 'en' ? el.dataset.en : el.dataset.es;
      if (next && el.textContent !== next) el.textContent = next;
    });
    document.documentElement.lang = lang === 'en' ? 'en' : 'es';
    document.body.setAttribute('data-lang', lang);
    pills.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-lang') === lang); });
    try { localStorage.setItem('alrio-lang', lang); } catch (err) {}
  };
  pills.forEach(function (p) {
    p.addEventListener('click', function () { apply(p.getAttribute('data-lang')); });
  });
  var stored = null;
  try { stored = localStorage.getItem('alrio-lang'); } catch (err) {}
  apply(stored || document.body.getAttribute('data-lang') || 'es');
})();
