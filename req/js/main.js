/* main.js — nav, theme, clock, magnetic, tilt, decode, reveals,
 * marquee, node band, stack ↔ yaml cross-highlight, copy.
 * No build step, no dependencies. */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) {
    return Array.prototype.slice.call((c || document).querySelectorAll(s));
  };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── Anchor scrolling ────────────────────────────────────
   * Native only. A JS smooth-scroll library on top of CSS
   * scroll-behavior double-animates every wheel tick and makes
   * the page feel like it is resisting you. */
  function scrollToEl(el) {
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  $$('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    a.addEventListener('click', function (e) {
      var el = $(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      scrollToEl(el);
    });
  });

  /* ── Header + scroll progress ────────────────────────────── */
  var header = $('#siteHeader');
  var nav = $('#nav');

  /* scrollHeight is a layout-forcing read, so it is cached and
   * refreshed on resize instead of measured on every scroll event.
   * Work is coalesced into one rAF per frame. */
  var maxScroll = 0;
  var ticking = false;

  function measure() {
    maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  }

  function render() {
    ticking = false;
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (nav) nav.style.setProperty('--scroll', maxScroll > 0 ? (y / maxScroll).toFixed(4) : 0);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); onScroll(); }, { passive: true });
  measure();
  render();

  /* ── Mobile menu ─────────────────────────────────────────── */
  var toggle = $('#navToggle');

  function closeMenu() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ── Scroll spy ──────────────────────────────────────────── */
  var links = $$('#navLinks a').filter(function (a) {
    return (a.getAttribute('href') || '').charAt(0) === '#';
  });
  var sections = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = '#' + en.target.id;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ── Theme toggle ────────────────────────────────────────── */
  var themeBtn = $('#themeToggle');
  var themeAnimT = null;

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.classList.add('theme-anim');
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { }
      themeBtn.setAttribute('aria-label',
        next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      clearTimeout(themeAnimT);
      themeAnimT = setTimeout(function () {
        document.documentElement.classList.remove('theme-anim');
      }, 420);
    });
  }

  /* ── Live clock (IST) ────────────────────────────────────── */
  var clocks = $$('[data-clock]');
  if (clocks.length) {
    var tick = function () {
      var t = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      clocks.forEach(function (c) { c.textContent = t; });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ── Pointer spotlight on cards ──────────────────────────
   * Colour only, no movement, so it runs under reduced motion too —
   * that preference means less animation, not no hover feedback. */
  if (fine) {
    $$('.principle, .stack-card, .decision, .crow, .impact, .edu, .copyline, .gate, .posture, .release, .impact-stat, .posture__item')
      .forEach(function (el) {
        el.classList.add('spot');
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          el.style.setProperty('--px', (e.clientX - r.left) + 'px');
          el.style.setProperty('--py', (e.clientY - r.top) + 'px');
        });
      });
  }

  /* ── Magnetic buttons + card tilt (motion — gated) ───────── */
  if (fine && !reduce) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        el.style.setProperty('--mx', (dx * 5).toFixed(2) + 'px');
        el.style.setProperty('--my', (dy * 4).toFixed(2) + 'px');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });

    var idcard = $('#idcard');
    if (idcard) {
      idcard.addEventListener('pointermove', function (e) {
        var r = idcard.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        idcard.style.setProperty('--ry', (dx * 6).toFixed(2) + 'deg');
        idcard.style.setProperty('--rx', (-dy * 6).toFixed(2) + 'deg');
      });
      idcard.addEventListener('pointerleave', function () {
        idcard.style.setProperty('--ry', '0deg');
        idcard.style.setProperty('--rx', '0deg');
      });
    }
  }

  /* ── Text decode (scramble → settle, left to right) ─────── */
  var GLYPHS = '#$%&*+-<>[]{}/\\|=_01';

  function decode(el, duration) {
    var target = el.getAttribute('data-decode') || el.textContent;
    var n = target.length;
    /* seed from the first frame's own timestamp — mixing performance.now()
     * with the rAF clock can leave the animation never reaching p = 1 */
    var t0 = null;

    function frame(now) {
      if (t0 === null) t0 = now;
      var p = Math.min((now - t0) / duration, 1);
      var settled = Math.floor(p * n * 1.12);
      var out = '';
      for (var i = 0; i < n; i++) {
        if (i < settled) out += target[i];
        else if (target[i] === ' ') out += ' ';
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target;
    }
    requestAnimationFrame(frame);
  }

  function runDecodes() {
    if (reduce) {
      $$('[data-decode]').forEach(function (el) {
        el.textContent = el.getAttribute('data-decode');
      });
      return;
    }
    $$('[data-decode]').forEach(function (el, i) {
      setTimeout(function () { decode(el, 800 + i * 140); }, i * 120);
    });
  }

  document.addEventListener('preloader:done', function () {
    runDecodes();
    /* hover the title to re-run it */
    if (fine && !reduce) {
      $$('.hero__title [data-decode]').forEach(function (el) {
        var busy = false;
        el.parentElement.addEventListener('pointerenter', function () {
          if (busy) return;
          busy = true;
          decode(el, 620);
          setTimeout(function () { busy = false; }, 700);
        });
      });
    }
  });

  /* Safety net: body.is-loading locks scrolling, so it must come off
   * even if the preloader script never finished. */
  setTimeout(function () {
    document.body.classList.remove('is-loading');
    var hero = $('#hero');
    if (hero && !hero.classList.contains('is-in')) {
      hero.classList.add('is-in');
      runDecodes();
    }
  }, 5600);

  /* ── Marquee: duplicate the track for a seamless loop ───── */
  var track = $('#marqueeTrack');
  if (track && !reduce) {
    var items = Array.prototype.slice.call(track.children);
    items.forEach(function (c) { track.appendChild(c.cloneNode(true)); });
  }

  /* ── Reveals + stagger ──────────────────────────────────
   * The offset lives on .rv-off, which this removes. Adding an
   * "arrived" class instead would leave a transform declaration on
   * the element that outranks the hover transforms. */
  var reveals = $$('[data-reveal], [data-stagger]');

  $$('[data-stagger]').forEach(function (g) {
    Array.prototype.slice.call(g.children).forEach(function (c, i) {
      c.style.setProperty('--i', i);
    });
  });

  function showAll() { reveals.forEach(function (el) { el.classList.remove('rv-off'); }); }

  if (reveals.length && !reduce && 'IntersectionObserver' in window) {
    reveals.forEach(function (el) { el.classList.add('rv-off'); });

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.remove('rv-off');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });

    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(showAll, 4000);
  }

  /* ── Stack: card ↔ yaml cross-highlight ─────────────────── */
  var spec = $('#spec');
  var cards = $$('.stack-card');

  if (spec && cards.length) {
    var lineByKey = {};
    $$('.ln[data-key]', spec).forEach(function (ln) {
      lineByKey[ln.getAttribute('data-key')] = ln;
    });

    var cardByKey = {};
    cards.forEach(function (card) {
      var keys = (card.getAttribute('data-keys') || '').split(',').map(function (k) {
        return k.trim();
      }).filter(Boolean);

      keys.forEach(function (k) { cardByKey[k] = card; });

      card.addEventListener('pointerenter', function () {
        keys.forEach(function (k) { if (lineByKey[k]) lineByKey[k].classList.add('is-hot'); });
      });
      card.addEventListener('pointerleave', function () {
        $$('.ln.is-hot', spec).forEach(function (l) { l.classList.remove('is-hot'); });
      });
    });

    Object.keys(lineByKey).forEach(function (k) {
      var ln = lineByKey[k];
      ln.addEventListener('pointerenter', function () {
        ln.classList.add('is-hot');
        if (cardByKey[k]) cardByKey[k].classList.add('is-hot');
      });
      ln.addEventListener('pointerleave', function () {
        ln.classList.remove('is-hot');
        cards.forEach(function (c) { c.classList.remove('is-hot'); });
      });
    });
  }

  /* ── Copy email ─────────────────────────────────────────── */
  var copyBtn = $('#copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var value = copyBtn.getAttribute('data-copy') || '';
      var done = function () {
        copyBtn.classList.add('is-copied');
        setTimeout(function () { copyBtn.classList.remove('is-copied'); }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, function () { });
        return;
      }
      var ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { }
      document.body.removeChild(ta);
    });
  }
})();
