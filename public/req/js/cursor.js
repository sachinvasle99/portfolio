/* cursor.js — signal cursor
 * 1:1 dot + trailing ring + action label from data-cursor.
 * Fine pointers only; skipped for touch and narrow viewports. */
(function () {
  'use strict';

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Reduced motion keeps the cursor but drops the trailing smoothing below,
   * so hover feedback still exists for people who asked for less animation. */
  if (!fine || window.innerWidth < 901) return;

  var root = document.createElement('div');
  root.className = 'cursor';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML =
    '<div class="cursor__ring"></div>' +
    '<div class="cursor__dot"></div>' +
    '<div class="cursor__label"></div>';
  document.body.appendChild(root);
  document.body.classList.add('has-cursor');

  var dot = root.querySelector('.cursor__dot');
  var ring = root.querySelector('.cursor__ring');
  var label = root.querySelector('.cursor__label');

  var tx = innerWidth / 2, ty = innerHeight / 2;
  var rx = tx, ry = ty;
  var idleTimer = null;
  var visible = false;
  var current = null;

  function setLabel(text) {
    if (!text) {
      root.classList.remove('has-label');
      label.textContent = '';
      return;
    }
    label.textContent = text;
    root.classList.add('has-label');
  }

  function move(e) {
    tx = e.clientX; ty = e.clientY;
    if (!visible) {
      rx = tx; ry = ty;
      visible = true;
      root.classList.add('is-visible');
    }
    /* the dot pins to the real pointer so clicking still feels native */
    dot.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) translate(-50%,-50%)';
    root.classList.remove('is-idle', 'is-out');
    if (!reduce) {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { root.classList.add('is-idle'); }, 2200);
    }
  }

  function frame() {
    /* snap instead of lerp when the visitor prefers reduced motion */
    var k = reduce ? 1 : 0.3;
    rx += (tx - rx) * k;
    ry += (ty - ry) * k;
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
    label.style.transform = 'translate3d(' + (rx + 18) + 'px,' + (ry + 20) + 'px,0)';
    requestAnimationFrame(frame);
  }

  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerdown', function () { root.classList.add('is-down'); });
  document.addEventListener('pointerup', function () { root.classList.remove('is-down'); });
  document.addEventListener('pointerleave', function () { root.classList.add('is-out'); });
  document.addEventListener('pointerenter', function () { root.classList.remove('is-out'); });

  document.addEventListener('pointerover', function (e) {
    var t = e.target.closest
      ? e.target.closest('a, button, [data-cursor], .marquee__item, .t-cluster')
      : null;

    if (!t) {
      current = null;
      root.classList.remove('is-hover');
      setLabel('');
      return;
    }
    current = t;
    root.classList.add('is-hover');
    setLabel(t.getAttribute('data-cursor'));
  }, { passive: true });

  document.addEventListener('pointerout', function (e) {
    if (!current) return;
    if (e.relatedTarget && current.contains && current.contains(e.relatedTarget)) return;
    current = null;
    root.classList.remove('is-hover');
    setLabel('');
  }, { passive: true });

  frame();
})();
