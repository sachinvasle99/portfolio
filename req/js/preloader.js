/* preloader.js — cluster bootstrap sequence
 * Stepped stages + progress ticker + clip-path curtain reveal.
 * Respects prefers-reduced-motion. Reveals the hero on completion. */
(function () {
  'use strict';

  var pre = document.getElementById('preloader');
  var body = document.body;
  var hero = document.getElementById('hero');

  if (!pre) {
    body.classList.remove('is-loading');
    if (hero) hero.classList.add('is-in');
    return;
  }

  var fill = pre.querySelector('.pipeline__fill');
  var pctEl = pre.querySelector('.boot__pct .n');
  var statusEl = pre.querySelector('.boot__status');
  var stages = Array.prototype.slice.call(pre.querySelectorAll('.stage'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var plan = [
    { el: stages[0], on: 2, done: 24, msg: 'provisioning control-plane and worker nodes' },
    { el: stages[1], on: 26, done: 54, msg: 'checking etcd health and quorum' },
    { el: stages[2], on: 56, done: 84, msg: 'reconciling manifests through gitops' },
    { el: stages[3], on: 86, done: 99, msg: 'verifying node and workload readiness' }
  ];

  function setStatus(txt, ok) {
    if (!statusEl) return;
    statusEl.innerHTML = ok
      ? '<span class="ok">✓ ' + txt + '</span>'
      : '<span class="text-muted">›</span> ' + txt + '<span class="text-muted">…</span>';
  }

  function apply(p) {
    if (fill) fill.style.width = p + '%';
    if (pctEl) pctEl.textContent = String(Math.round(p));
    plan.forEach(function (s) {
      if (!s.el) return;
      if (p >= s.done) {
        if (!s.el.classList.contains('is-done')) {
          s.el.classList.remove('is-active');
          s.el.classList.add('is-done');
        }
      } else if (p >= s.on) {
        if (!s.el.classList.contains('is-active') && !s.el.classList.contains('is-done')) {
          s.el.classList.add('is-active');
          setStatus(s.msg, false);
        }
      }
    });
  }

  function reveal() {
    setStatus('estate converged · 6/6 clusters ready', true);
    if (pctEl) pctEl.textContent = '100';
    setTimeout(function () {
      pre.classList.add('is-done');
      body.classList.remove('is-loading');
      if (hero) hero.classList.add('is-in');
      document.dispatchEvent(new CustomEvent('preloader:done'));
      setTimeout(function () {
        if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
      }, 1000);
    }, reduce ? 120 : 460);
  }

  if (reduce) {
    stages.forEach(function (s) { s.classList.add('is-done'); });
    apply(100);
    reveal();
    return;
  }

  var DURATION = 2000, start = null, done = false;
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function frame(now) {
    if (start === null) start = now;
    var t = Math.min((now - start) / DURATION, 1);
    apply(easeInOut(t) * 100);
    if (t < 1) requestAnimationFrame(frame);
    else if (!done) { done = true; reveal(); }
  }

  setTimeout(function () { requestAnimationFrame(frame); }, 240);

  /* Safety: never trap the visitor if something stalls. */
  setTimeout(function () {
    if (!done) { done = true; apply(100); reveal(); }
  }, 5000);
})();
