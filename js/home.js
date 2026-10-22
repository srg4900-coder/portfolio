/*
  HOMEPAGE — builds one printed sheet per HOME_ORDER entry, then drives
  the scatter -> grid motion from scroll.

  How the motion works: every sheet's real position is its CSS grid cell.
  At scroll 0 a transform pulls it out to a spot from SCATTER (fractions of
  the viewport, so it's resolution-independent), tilted and scaled down,
  loosely piled on the right of the light box. As the hero scrolls away
  (progress 0 -> 1) the transform eases to zero and each sheet settles
  into its cell, slightly staggered. Only transforms change per frame.
*/
(function () {
  var data = window.PROJECTS || {};
  var order = window.HOME_ORDER || Object.keys(data);
  var root = document.getElementById('sheets');
  var hero = document.getElementById('hero');
  if (!root) return;

  // ---------- build ----------
  order.forEach(function (slug, i) {
    var p = data[slug];
    if (!p) return;
    var home = p.home || {};
    var num = String(i + 1).padStart(2, '0');

    var sheet = document.createElement('article');
    sheet.className = 'sheet sheet--' + (home.size || 'm');
    sheet.style.setProperty('--i', i);
    sheet.style.setProperty('--ratio', home.ratio || 0.8);
    sheet.style.setProperty('--rest-rot', (i % 2 ? 0.6 : -0.5) + 'deg');
    if (home.position) sheet.style.setProperty('--pos', home.position);

    var media, isCard = false;
    if (home.video) {
      media = '<video src="' + home.video + '"' + (home.image ? ' poster="' + home.image + '"' : '') +
        ' muted loop playsinline preload="metadata" aria-hidden="true"></video>';
    } else if (home.image) {
      media = '<img src="' + home.image + '" alt="' + p.title + '" loading="' + (i < 3 ? 'eager' : 'lazy') + '" decoding="async">';
    } else {
      media = '<span>' + p.title + '</span>';
      isCard = true;
    }

    sheet.innerHTML =
      '<a class="sheet__link" href="project.html?project=' + slug + '" data-cursor-label="View">' +
        '<div class="sheet__paper' + (isCard ? ' sheet__paper--card' : '') + '">' + media + '</div>' +
        '<div class="sheet__caption">' +
          '<span class="text-label">' + num + ' &nbsp;' + p.title + '</span>' +
          '<span class="text-label">' + (p.role || '') + '</span>' +
        '</div>' +
      '</a>';
    root.appendChild(sheet);
  });

  var sheets = Array.prototype.slice.call(root.querySelectorAll('.sheet'));

  // videos only play while on screen
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { var pr = e.target.play(); if (pr) pr.catch(function () {}); }
        else e.target.pause();
      });
    }, { threshold: 0.15 });
    root.querySelectorAll('video').forEach(function (v) { io.observe(v); });
  }

  var nav = document.querySelector('.site-nav--fade-in');
  if (nav) requestAnimationFrame(function () { nav.classList.add('is-in'); });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ---------- scatter layout ----------
  // x, y: top-left as a fraction of the viewport; r: tilt (deg); s: scale vs. resting size
  var SCATTER_WIDE = [
    { x: 0.50, y: 0.20, r: -2.5, s: 0.42 },
    { x: 0.76, y: 0.24, r: 1.8,  s: 0.50 },
    { x: 0.58, y: 0.66, r: 4,    s: 0.42 },
    { x: 0.86, y: 0.62, r: -5,   s: 0.36 },
    { x: 0.68, y: 0.10, r: 3,    s: 0.30 },
    { x: 0.92, y: 0.04, r: -2,   s: 0.36 }
  ];
  var SCATTER_PHONE = [
    { x: 0.10, y: 0.56, r: -3,   s: 0.40 },
    { x: 0.48, y: 0.52, r: 2.5,  s: 0.44 },
    { x: 0.30, y: 0.72, r: 5,    s: 0.30 },
    { x: 0.66, y: 0.74, r: -4,   s: 0.30 },
    { x: 0.80, y: 0.46, r: 3,    s: 0.26 },
    { x: 0.02, y: 0.80, r: -2,   s: 0.26 }
  ];
  var phone = window.matchMedia('(max-width: 640px)');

  var cells = [];   // untransformed document positions, cached per layout
  var vw = 0, vh = 0, span = 1;

  function measure() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    span = Math.max(1, hero.offsetHeight * 0.85);
    var sx = window.scrollX, sy = window.scrollY;
    cells = sheets.map(function (el) {
      var prev = el.style.transform;
      el.style.transform = 'none';
      var r = el.getBoundingClientRect();
      el.style.transform = prev;
      return { x: r.left + sx, y: r.top + sy, w: r.width };
    });
  }

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  var ticking = false;
  function render() {
    ticking = false;
    var y = window.scrollY;
    var progress = clamp01(y / span);
    var list = phone.matches ? SCATTER_PHONE : SCATTER_WIDE;
    var n = sheets.length;

    sheets.forEach(function (el, i) {
      var c = cells[i];
      var s = list[i % list.length];
      // stagger: earlier sheets land first
      var stagger = 0.06;
      var t = ease(clamp01((progress - i * stagger) / Math.max(0.3, 1 - (n - 1) * stagger)));
      var k = 1 - t;
      if (k < 0.001) {
        el.style.transform = '';
        el.style.setProperty('--settle', 1);
        return;
      }
      // scatter target is viewport-fixed: sheets hold their pile while the hero text scrolls off
      var tx = (s.x * vw - c.x) * k;
      var ty = (s.y * vh + y - c.y) * k;
      var sc = s.s + (1 - s.s) * t;
      el.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) rotate(' + (s.r * k).toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
      el.style.setProperty('--settle', Math.max(0, t * 1.6 - 0.6).toFixed(2));
      el.style.zIndex = progress < 1 ? 30 + ((i * 7) % n) : '';
    });
  }

  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }

  function relayout() { measure(); render(); }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', relayout);
  phone.addEventListener('change', relayout);
  // images without fixed heights can shift the grid as they load; re-measure once everything is in
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  relayout();
})();
