/* ALRÍO — interacciones */
(function () {
  'use strict';

  /* Textos: salen del difuminado al entrar y al bajar */
  var textSel = [
    'h1', 'h2', 'h3', 'p',
    '.al-eyebrow', '.al-kicker', '.al-h2', '.al-h3', '.al-p',
    '.al-stat-n', '.al-stat-l', '.al-index-n', '.al-index-t',
    'figcaption', '.al-note',
    '.al-consent span', '.al-form .al-k',
    '.al-cta > *',
    '.al-by span', '.al-footer-legal span'
  ].join(',');
  var skipUnblur = function (el) {
    return el.closest('.al-hero') || el.closest('.al-nav') || el.closest('.al-drawer');
  };
  var markUnblur = function (root, startDelay) {
    var delay = startDelay || 0;
    root.querySelectorAll(textSel).forEach(function (el, i) {
      if (skipUnblur(el)) return;
      el.classList.add('al-unblur');
      el.style.transitionDelay = (delay + i * 0.12) + 's';
    });
  };
  var showUnblur = function (root) {
    root.querySelectorAll('.al-unblur').forEach(function (el) { el.classList.add('is-in'); });
  };

  document.querySelectorAll('[data-reveal]').forEach(function (el) { markUnblur(el, 0.08); });
  document.querySelectorAll(textSel).forEach(function (el) {
    if (el.closest('[data-reveal]') || skipUnblur(el)) return;
    el.classList.add('al-unblur');
  });

  var revealEls = [];
  document.querySelectorAll('[data-reveal]').forEach(function (el) { revealEls.push(el); });
  document.querySelectorAll('.al-unblur').forEach(function (el) {
    if (!el.closest('[data-reveal]')) revealEls.push(el);
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        showUnblur(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-in');
      showUnblur(el);
    });
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
      lbImg.alt = '';
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });
  if (lbImg) {
    lbImg.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
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
