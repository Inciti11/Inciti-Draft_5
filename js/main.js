/* ALRÍO — interacciones */
(function () {
  'use strict';

  /* Textos: salen del difuminado al entrar y al bajar */
  var textSel = [
    'h1', 'h2', 'h3', 'p',
    '.al-eyebrow', '.al-kicker', '.al-h2', '.al-h3', '.al-p',
    '.al-stat-n', '.al-stat-l', '.al-index-n', '.al-index-t', '.al-index-d',
    'figcaption', '.al-note',
    '.al-consent span', '.al-form .al-k',
    '.al-advisor-role', '.al-advisor-meta',
    '.al-cta > *',
    '.al-by span', '.al-footer-legal span'
  ].join(',');
  var skipUnblur = function (el) {
    return el.closest('.al-hero') || el.closest('.al-nav') || el.closest('.al-drawer') || el.classList.contains('al-legal-note');
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

  /* Scrollbar horizontal (arrastre 1:1, sin flechas) */
  document.querySelectorAll('.al-hscroll').forEach(function (scroller) {
    var line = document.createElement('div');
    line.className = 'al-scroll-line';
    var thumb = document.createElement('span');
    line.appendChild(thumb);
    scroller.insertAdjacentElement('afterend', line);

    var dragging = false;
    var grabOffset = 0;

    var metrics = function () {
      var view = scroller.clientWidth;
      var total = Math.max(scroller.scrollWidth, 1);
      var max = Math.max(total - view, 0);
      var track = line.clientWidth;
      var tw = Math.min(track, Math.max(track * (view / total), 48));
      return { view: view, total: total, max: max, track: track, tw: tw };
    };

    var thumbLeft = function () {
      var m = metrics();
      return m.max ? (scroller.scrollLeft / m.max) * (m.track - m.tw) : 0;
    };

    var sync = function () {
      if (dragging) return;
      var m = metrics();
      thumb.style.width = m.tw + 'px';
      thumb.style.left = thumbLeft() + 'px';
    };

    var applyLeft = function (left) {
      var m = metrics();
      var maxL = Math.max(m.track - m.tw, 0);
      left = Math.min(Math.max(left, 0), maxL);
      thumb.style.width = m.tw + 'px';
      thumb.style.left = left + 'px';
      scroller.scrollLeft = maxL ? (left / maxL) * m.max : 0;
    };

    scroller.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    line.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var m = metrics();
      var x = e.clientX - line.getBoundingClientRect().left;
      var tl = thumbLeft();
      dragging = true;
      line.classList.add('is-grabbing');
      scroller.style.scrollSnapType = 'none';
      line.setPointerCapture(e.pointerId);
      if (x < tl || x > tl + m.tw) {
        grabOffset = m.tw / 2;
        applyLeft(x - grabOffset);
      } else {
        grabOffset = x - tl;
      }
    });
    line.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      applyLeft(e.clientX - line.getBoundingClientRect().left - grabOffset);
    });
    var endDrag = function () {
      if (!dragging) return;
      dragging = false;
      line.classList.remove('is-grabbing');
      scroller.style.scrollSnapType = '';
    };
    line.addEventListener('pointerup', endDrag);
    line.addEventListener('pointercancel', endDrag);
    line.addEventListener('wheel', function (e) {
      scroller.scrollLeft += e.deltaY + e.deltaX;
      e.preventDefault();
    }, { passive: false });

    sync();
  });

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
    if (open && langBox) langBox.classList.remove('is-open');
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

  /* Carrusel coverflow */
  document.querySelectorAll('[data-coverflow]').forEach(function (root) {
    var cards = Array.prototype.slice.call(root.querySelectorAll('.al-cover-card'));
    if (!cards.length) return;
    var i = 0;
    var timer = null;
    var layout = function () {
      var n = cards.length;
      cards.forEach(function (card, idx) {
        var d = idx - i;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        var abs = Math.abs(d);
        card.style.setProperty('--x', (d * 52) + '%');
        card.style.setProperty('--s', abs === 0 ? '1' : abs === 1 ? '.82' : '.68');
        card.style.setProperty('--ry', (d * -16) + 'deg');
        card.style.setProperty('--o', abs > 2 ? '0' : abs === 2 ? '.55' : '1');
        card.style.setProperty('--b', abs === 0 ? '1' : abs === 1 ? '.78' : '.62');
        card.style.setProperty('--z', String(8 - abs));
        card.style.setProperty('--z3', abs === 0 ? '48px' : abs === 1 ? '0px' : '-70px');
        card.classList.toggle('is-on', d === 0);
      });
    };
    var go = function (dir) {
      i = (i + dir + cards.length) % cards.length;
      layout();
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var start = function () {
      stop();
      timer = setInterval(function () { go(1); }, 4500);
    };
    var prev = root.querySelector('.al-cover-prev');
    var next = root.querySelector('.al-cover-next');
    if (prev) prev.addEventListener('click', function () { go(-1); start(); });
    if (next) next.addEventListener('click', function () { go(1); start(); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    var sx = 0;
    var dx = 0;
    var tracking = false;
    var suppressClick = false;
    root.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.al-cover-nav')) return;
      tracking = true;
      sx = e.clientX;
      dx = 0;
    });
    root.addEventListener('pointermove', function (e) {
      if (!tracking) return;
      dx = e.clientX - sx;
    });
    root.addEventListener('pointerup', function () {
      if (!tracking) return;
      tracking = false;
      if (Math.abs(dx) > 46) {
        suppressClick = true;
        go(dx < 0 ? 1 : -1);
        start();
      }
    });
    root.addEventListener('click', function (e) {
      if (!suppressClick) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      suppressClick = false;
    }, true);

    layout();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) start();
  });

  /* Nota legal en imágenes */
  var legalEs = 'Estas imágenes pueden contener decoración y elementos de apreciación estética que son interpretación del artífice y no comprometen a la sociedad promotora. El proyecto podrá ser modificado por exigencia de las autoridades competentes o por exigencias técnicas o del mercado. Las especificaciones serán las que se establezcan en los contratos de vinculación al proyecto inmobiliario.';
  var legalEn = 'These images may include decoration and aesthetic elements that are the artist’s interpretation and do not bind the developer. The project may be modified by request of the competent authorities or for technical or market reasons. Specifications shall be those set out in the project affiliation contracts.';
  var legalTargets = document.querySelectorAll('.al-hero, .al-mapwrap, .al-cover-card, .al-gal [data-lb], .al-bleed');
  legalTargets.forEach(function (box) {
    if (box.hasAttribute('data-no-legal')) return;
    if (box.querySelector(':scope > .al-legal-note')) return;
    var note = document.createElement('span');
    note.className = 'al-legal-note';
    note.setAttribute('data-en', legalEn);
    note.textContent = legalEs;
    box.appendChild(note);
  });

  /* WhatsApp: mensaje que aparece cada cierto tiempo */
  var waMsg = document.getElementById('al-wa-msg');
  if (waMsg) {
    var showWa = function () {
      waMsg.classList.add('is-on');
      setTimeout(function () { waMsg.classList.remove('is-on'); }, 3600);
    };
    setTimeout(showWa, 1600);
    setInterval(showWa, 9000);
  }

  /* Conmutador ES / EN */
  var pills = document.querySelectorAll('.al-pill[data-lang]');
  var langBox = document.getElementById('al-lang');
  var langBtn = document.getElementById('al-lang-btn');
  var setLangOpen = function (open) {
    if (!langBox || !langBtn) return;
    langBox.classList.toggle('is-open', open);
    langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  if (langBtn) {
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setLangOpen(!langBox.classList.contains('is-open'));
    });
    document.addEventListener('click', function (e) {
      if (langBox && !langBox.contains(e.target)) setLangOpen(false);
    });
  }
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
    setLangOpen(false);
  };
  pills.forEach(function (p) {
    p.addEventListener('click', function () { apply(p.getAttribute('data-lang')); });
  });
  var stored = null;
  try { stored = localStorage.getItem('alrio-lang'); } catch (err) {}
  apply(stored || document.body.getAttribute('data-lang') || 'es');
})();
