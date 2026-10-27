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
    var onReveal = function (entries, observer) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        showUnblur(e.target);
        observer.unobserve(e.target);
      });
    };
    var io = new IntersectionObserver(onReveal, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    var ioTall = new IntersectionObserver(onReveal, { threshold: 0.04, rootMargin: '0px 0px 0px 0px' });
    revealEls.forEach(function (el) {
      if (el.classList.contains('al-team')) ioTall.observe(el);
      else io.observe(el);
    });
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

  /* Nav sólida al pasar la portada + hide on scroll */
  var nav = document.getElementById('al-nav');
  var peek = document.getElementById('al-nav-peek');
  var lastY = window.scrollY;
  var scrollingTo = false;
  var peekPinned = false;
  var syncPeek = function () {
    var show = nav && nav.classList.contains('is-hidden') && !(drawer && drawer.classList.contains('is-open'));
    if (peek) peek.classList.toggle('is-on', !!show);
  };
  var onScroll = function () {
    if (!nav) return;
    var y = window.scrollY;
    nav.classList.toggle('is-solid', y > window.innerHeight * 0.78 || peekPinned);
    var menuOpen = drawer && drawer.classList.contains('is-open');
    if (peekPinned && y > lastY + 10) peekPinned = false;
    if (menuOpen || peekPinned || y < 32) {
      nav.classList.remove('is-hidden');
    } else {
      nav.classList.add('is-hidden');
      if (langBox) langBox.classList.remove('is-open');
    }
    lastY = y;
    syncPeek();
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
    if (nav) {
      nav.classList.toggle('is-menu', open);
      if (open) nav.classList.remove('is-hidden');
    }
    document.body.style.overflow = open ? 'hidden' : '';
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open && langBox) langBox.classList.remove('is-open');
    syncPeek();
  };
  var ignoreBurger = false;
  if (peek) peek.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    ignoreBurger = true;
    peekPinned = true;
    if (nav) {
      nav.classList.remove('is-hidden');
      nav.classList.add('is-solid');
    }
    if (peek) {
      peek.classList.remove('is-on');
      peek.style.pointerEvents = 'none';
    }
    window.setTimeout(function () {
      ignoreBurger = false;
      if (peek) peek.style.pointerEvents = '';
      syncPeek();
    }, 400);
  });
  if (burger) burger.addEventListener('click', function (e) {
    if (ignoreBurger) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setDrawer(!drawer.classList.contains('is-open'));
  });
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false); });

  function scrollTopForHashTarget(target) {
    if (!target) return 0;
    var y0 = window.pageYOffset;
    var navOffset = 88;
    if (target.id === 'asesores' && window.matchMedia('(min-width: 681px)').matches) {
      var sectionTop = target.getBoundingClientRect().top + y0;
      var topAlign = sectionTop - navOffset;
      var team = target.querySelector('.al-team');
      var head = target.querySelector('.al-cover-head');
      if (!team) return Math.max(0, topAlign);
      var teamBottom = team.getBoundingClientRect().top + y0 + team.offsetHeight;
      var vh = window.innerHeight;
      var bottomPad = 56;
      var bottomAlign = teamBottom - vh + bottomPad;
      var headH = head ? head.offsetHeight : 0;
      var blockH = headH + 14 + team.offsetHeight;
      if (blockH > vh - navOffset - bottomPad) {
        return Math.max(0, Math.max(topAlign, bottomAlign));
      }
      return Math.max(0, topAlign);
    }
    var offset = target.id === 'asesores' ? navOffset : 0;
    return Math.max(0, target.getBoundingClientRect().top + y0 - offset);
  }

  function scrollToHash(href, afterDrawer) {
    if (!href || href.charAt(0) !== '#') return;
    var target = document.getElementById(href.slice(1));
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var go = function () {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (!target) return;
      scrollingTo = true;
      window.scrollTo({ top: scrollTopForHashTarget(target), behavior: reduce ? 'auto' : 'smooth' });
      try { history.pushState(null, '', href); } catch (err) {}
      window.setTimeout(function () {
        scrollingTo = false;
        lastY = window.scrollY;
        if (nav && lastY > 32) nav.classList.add('is-hidden');
        syncPeek();
      }, reduce ? 50 : 900);
    };
    window.setTimeout(go, afterDrawer && !reduce ? 420 : 0);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#asesores"]');
    if (!a || a.closest('.al-drawer')) return;
    e.preventDefault();
    scrollToHash('#asesores', false);
  });

  if (drawer) drawer.querySelectorAll('nav a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '#') {
        setDrawer(false);
        return;
      }
      e.preventDefault();
      setDrawer(false);
      scrollToHash(href, true);
    });
  });

  /* Nota legal en imágenes (3 variantes) */
  var legalCopy = {
    building: {
      es: 'Estas imágenes pueden contener decoración y elementos de apreciación estética que son interpretación del artífice y no comprometen a la sociedad promotora. El proyecto podrá ser modificado por exigencia de las autoridades competentes o por exigencias técnicas o del mercado. Las especificaciones serán las que se establezcan en los contratos de vinculación al proyecto inmobiliario. Agosto 2026',
      en: 'These images may include decoration and aesthetic elements that are the artist’s interpretation and do not bind the developer. The project may be modified by request of the competent authorities or for technical or market reasons. Specifications shall be those set out in the project affiliation contracts. August 2026'
    },
    interior: {
      es: 'Estas imágenes pueden contener decoración y elementos de apreciación estética que son interpretación del artífice y no comprometen a la sociedad promotora. El proyecto podrá ser modificado por exigencia de las autoridades competentes o por exigencias técnicas o del mercado. Las especificaciones serán las que se establezcan en los contratos de vinculación al proyecto inmobiliario. Octubre 2026',
      en: 'These images may include decoration and aesthetic elements that are the artist’s interpretation and do not bind the developer. The project may be modified by request of the competent authorities or for technical or market reasons. Specifications shall be those set out in the project affiliation contracts. October 2026'
    },
    entorno: {
      es: 'Las imágenes publicadas, planos, renders y demás piezas publicitarias son simples representaciones gráficas de diseño no contractuales. Las fachadas, elementos comunes y restantes espacios son orientativas y/o podrán ser objeto de verificación. Pueden variar en su percepción y construcción final, están sujetos a modificación y/o cambios sin previo aviso o consulta, los mismos no constituyen oferta por parte del Promotor y/o Constructor.',
      en: 'The published images, floor plans, renders and other advertising materials are simple non-contractual design graphic representations. The facades, common elements and remaining spaces are indicative and/or subject to verification. They may vary in perception and final construction, are subject to modification and/or changes without prior notice or consultation, and do not constitute an offer by the Developer and/or Builder.'
    }
  };
  var legalKindFor = function (box) {
    var tagged = box.getAttribute('data-legal');
    if (tagged && legalCopy[tagged]) return tagged;
    if (box.closest('#entorno')) return 'entorno';
    if (box.closest('.al-cover-apart')) return 'interior';
    if (box.closest('#amenidades')) return 'entorno';
    if (box.closest('.al-arch-carousel')) return 'entorno';
    if (box.classList.contains('al-hero') || box.closest('.al-hero')) return 'building';
    if (box.classList.contains('ubic__visor') || box.closest('.ubic__visor')) return 'building';
    if (box.closest('.al-bleed')) return 'entorno';
    return 'building';
  };
  var writeLegalNote = function (noteEl, kind) {
    var copy = legalCopy[kind];
    noteEl.dataset.es = copy.es;
    noteEl.setAttribute('data-en', copy.en);
    var lang = document.body.getAttribute('data-lang') || 'es';
    noteEl.textContent = lang === 'en' ? copy.en : copy.es;
  };
  var skipOverlayLegal = function (el) {
    if (!el) return false;
    if (el.closest('#entorno')) return true;
    if (el.closest('.al-arch-carousel') && el.getAttribute('data-legal') !== 'building') return true;
    return false;
  };
  var syncLbLegal = function (sourceEl) {
    var lbRoot = document.getElementById('al-lb');
    if (!lbRoot || !sourceEl) return;
    var lbNote = lbRoot.querySelector('.al-lb-box .al-legal-note');
    if (!lbNote) return;
    if (skipOverlayLegal(sourceEl)) {
      lbNote.hidden = true;
      return;
    }
    lbNote.hidden = false;
    writeLegalNote(lbNote, legalKindFor(sourceEl));
  };

  /* Lightbox de galería */
  var lb = document.getElementById('al-lb');
  var lbImg = document.getElementById('al-lb-img');
  document.querySelectorAll('[data-lb]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!lb || !lbImg) return;
      lbImg.src = btn.getAttribute('data-lb');
      lbImg.alt = '';
      syncLbLegal(btn);
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

  /* Carrusel coverflow (amenidades y apartamentos comparten lógica; apart = tighter + overlays) */
  document.querySelectorAll('[data-coverflow]').forEach(function (root) {
    var apart = root.classList.contains('al-cover-apart');
    var stage = root.querySelector('.al-cover-stage');
    if (apart && stage) {
      stage.querySelectorAll('.al-cover-card--mirror').forEach(function (el) { el.remove(); });
      var ordered = Array.prototype.slice.call(stage.querySelectorAll('.al-cover-card'));
      ordered.sort(function (a, b) {
        return parseInt(a.getAttribute('data-apt-seq') || '0', 10) - parseInt(b.getAttribute('data-apt-seq') || '0', 10);
      });
      ordered.forEach(function (card) {
        card.style.removeProperty('transition');
        stage.appendChild(card);
      });
    }
    var cards = Array.prototype.slice.call(root.querySelectorAll('.al-cover-card:not(.al-cover-card--mirror)'));
    if (!cards.length) return;
    var apartWrap = apart ? root.closest('.al-recorridos-apart') : null;
    var indicator = apartWrap ? apartWrap.querySelector('.al-cover-apt-indicator') : null;
    var aptPicks = apartWrap ? apartWrap.querySelectorAll('.al-cover-apt-pick') : [];
    var photosPerApt = 4;
    var selectedApt = 1;
    var i = 0;
    var prevI = 0;
    var forceBaseSplash = false;
    var aptIntroPlayed = { 1: false, 2: false };
    var timer = null;
    var cardApt = function (card) {
      var seq = parseInt(card.getAttribute('data-apt-seq') || '0', 10);
      return Math.floor(seq / photosPerApt) + 1;
    };
    var activeCards = function () {
      if (!apart) return cards;
      return cards.filter(function (c) { return cardApt(c) === selectedApt; });
    };
    var syncAptPickUi = function () {
      aptPicks.forEach(function (btn) {
        var on = parseInt(btn.getAttribute('data-apt-pick') || '1', 10) === selectedApt;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      if (apart) {
        root.setAttribute('aria-label', 'Recorrido Apartamento ' + selectedApt);
      }
    };
    var syncIndicator = function () {
      if (!indicator) return;
      indicator.textContent = 'Apto ' + selectedApt + ' · Foto ' + (i + 1) + ' de ' + photosPerApt;
      indicator.setAttribute('data-en', 'Apt ' + selectedApt + ' · Photo ' + (i + 1) + ' of ' + photosPerApt);
    };
    var layout = function () {
      var active = activeCards();
      var n = apart ? active.length : cards.length;
      var step = apart ? 44 : 52;
      var scale1 = apart ? 0.86 : 0.82;
      var rot = apart ? 13 : 16;
      if (apart) syncIndicator();
      var splashThisLayout = forceBaseSplash;
      forceBaseSplash = false;
      cards.forEach(function (card) {
        if (apart && cardApt(card) !== selectedApt) {
          card.style.setProperty('--o', '0');
          card.style.setProperty('--x', '0%');
          card.style.setProperty('--z', '0');
          card.classList.remove('is-on');
          return;
        }
        var idx = apart ? active.indexOf(card) : cards.indexOf(card);
        if (idx < 0) return;
        var d = idx - i;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        var abs = Math.abs(d);
        card.style.setProperty('--x', (d * step) + '%');
        card.style.setProperty('--s', abs === 0 ? '1' : abs === 1 ? String(scale1) : '.68');
        card.style.setProperty('--ry', (d * -rot) + 'deg');
        card.style.setProperty('--o', abs > 2 ? '0' : abs === 2 ? '.55' : '1');
        card.style.setProperty('--b', abs === 0 ? '1' : abs === 1 ? '.78' : '.62');
        card.style.setProperty('--z', String(8 - abs));
        card.style.setProperty('--z3', abs === 0 ? '48px' : abs === 1 ? '0px' : '-70px');
        card.classList.toggle('is-on', d === 0);
        var splash = card.querySelector('.al-cover-apt-splash');
        if (!splash) return;
        splash.classList.remove('is-fading', 'is-done');
        if (d !== 0) return;
        var playSplash = false;
        if (apart && idx === 0) {
          if (splashThisLayout) playSplash = true;
          else if (prevI !== i && i === 0) playSplash = true;
          else if (!aptIntroPlayed[selectedApt]) {
            playSplash = true;
            aptIntroPlayed[selectedApt] = true;
          }
        }
        if (playSplash) {
          void splash.offsetWidth;
          splash.classList.add('is-fading');
        } else {
          splash.classList.add('is-done');
        }
      });
    };
    if (apart) {
      root.querySelectorAll('.al-cover-apt-splash').forEach(function (splash) {
        splash.addEventListener('animationend', function () {
          if (splash.classList.contains('is-fading')) {
            splash.classList.remove('is-fading');
            splash.classList.add('is-done');
          }
        });
      });
    }
    var slideCount = function () {
      return apart ? activeCards().length : cards.length;
    };
    var go = function (dir) {
      prevI = i;
      var n = slideCount();
      i = (i + dir + n) % n;
      layout();
    };
    var aptSwitchTimer = null;
    var applyAptSelection = function (apt) {
      selectedApt = apt;
      forceBaseSplash = true;
      prevI = i;
      i = 0;
      syncAptPickUi();
      layout();
    };
    var setSelectedApt = function (apt, whenDone) {
      apt = parseInt(apt, 10);
      if (apt !== 1 && apt !== 2) return;
      if (selectedApt === apt) return;
      var done = function () { if (whenDone) whenDone(); };
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var stage = root.querySelector('.al-cover-stage');
      if (!apart || !stage || reduce) {
        applyAptSelection(apt);
        done();
        return;
      }
      stop();
      if (aptSwitchTimer) {
        clearTimeout(aptSwitchTimer);
        aptSwitchTimer = null;
      }
      root.classList.remove('is-apt-switch-in', 'is-apt-switch-in-active');
      root.classList.add('is-apt-switch-out');
      aptSwitchTimer = setTimeout(function () {
        aptSwitchTimer = null;
        root.classList.remove('is-apt-switch-out');
        applyAptSelection(apt);
        root.classList.add('is-apt-switch-in');
        void stage.offsetWidth;
        root.classList.add('is-apt-switch-in-active');
        aptSwitchTimer = setTimeout(function () {
          aptSwitchTimer = null;
          root.classList.remove('is-apt-switch-in', 'is-apt-switch-in-active');
          done();
        }, 1150);
      }, 560);
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
    aptPicks.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setSelectedApt(btn.getAttribute('data-apt-pick'), start);
      });
    });
    if (apart) syncAptPickUi();
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    if (apart) {
      root.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); start(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); start(); }
      });
    }

    var sx = 0;
    var dx = 0;
    var tracking = false;
    var suppressClick = false;
    root.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.al-cover-nav') || e.target.closest('.al-cover-apt-pick')) return;
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

  /* Carrusel de Arquitectura */
  document.querySelectorAll('[data-arch-slide]').forEach(function (root) {
    var cards = Array.prototype.slice.call(root.querySelectorAll('figure'));
    if (!cards.length) return;
    var i = 0;
    var timer = null;
    var suppressClick = false;
    var show = function () {
      cards.forEach(function (card, idx) {
        card.classList.toggle('is-on', idx === i);
      });
    };
    var go = function (dir) {
      i = (i + dir + cards.length) % cards.length;
      show();
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var start = function () {
      stop();
      timer = setInterval(function () { go(1); }, 4500);
    };
    var prev = root.querySelector('.al-cover-prev');
    var next = root.querySelector('.al-cover-next');
    if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); go(-1); start(); });
    if (next) next.addEventListener('click', function (e) { e.stopPropagation(); go(1); start(); });
    var startX = 0;
    root.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.al-cover-nav')) return;
      startX = e.clientX;
    });
    root.addEventListener('pointerup', function (e) {
      if (e.target.closest('.al-cover-nav')) return;
      var dx = e.clientX - startX;
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
    show();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) start();
  });

  var legalRoots = '.al-hero, .ubic__visor, .al-cover-card, .al-gal [data-lb], .al-bleed, .al-arch-carousel figure';
  var legalTargets = document.querySelectorAll(legalRoots);
  legalTargets.forEach(function (box) {
    if (box.hasAttribute('data-no-legal') || box.closest('#planos') || box.closest('#entorno')) return;
    if (box.closest('.al-arch-carousel') && box.getAttribute('data-legal') !== 'building') return;
    if (box.closest(legalRoots) !== box && !box.matches('.al-cover-card, .al-arch-carousel figure, .al-gal [data-lb]')) return;
    if (box.querySelector(':scope > .al-legal-note')) return;
    var note = document.createElement('span');
    note.className = 'al-legal-note';
    writeLegalNote(note, legalKindFor(box));
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
    document.querySelectorAll('[data-en]:not(.al-legal-note)').forEach(function (el) {
      if (el.dataset.es === undefined) el.dataset.es = el.textContent;
      var next = lang === 'en' ? el.dataset.en : el.dataset.es;
      if (next && el.textContent !== next) el.textContent = next;
    });
    document.querySelectorAll('.al-legal-note[data-en]').forEach(function (el) {
      var next = lang === 'en' ? el.getAttribute('data-en') : el.dataset.es;
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
