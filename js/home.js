/*
  HOMEPAGE — builds one printed sheet per HOME_ORDER entry, then drives
  the scatter -> grid motion from scroll. The order comes from
  js/order.js: the default HOME_ORDER, or a company link's (?for=).

  How the motion works: every sheet's real position is its CSS grid cell.
  At scroll 0 a transform pulls it out to a spot from SCATTER (fractions of
  the viewport, so it's resolution-independent), tilted and scaled down,
  loosely piled on the right of the light box. As the hero scrolls away
  (progress 0 -> 1) the transform eases to zero and each sheet settles
  into its cell, slightly staggered. Only transforms change per frame.
*/
(function () {
  var data = window.PROJECTS || {};
  var Order = window.PortfolioOrder || { ready: Promise.resolve(window.HOME_ORDER || Object.keys(data)), link: function (u) { return u; } };
  var root = document.getElementById('work');
  var hero = document.getElementById('hero');
  if (!root) return;

  Order.ready.then(build);

  function build(order) {
    // ---------- build ----------
    order.forEach(function (slug, i) {
      var p = data[slug];
      if (!p) return;
      // cover: the project's own homepage override, else its case-study hero
      var cover = p.hero || {};
      var home = p.home || {};
      var image = home.image || cover.src;
      var video = home.video;
      var num = String(i + 1).padStart(2, '0');

      var sheet = document.createElement('article');
      sheet.className = 'sheet';
      sheet.style.setProperty('--i', i);
      sheet.style.setProperty('--rest-rot', (i % 2 ? 0.6 : -0.5) + 'deg');
      if (home.position) sheet.style.setProperty('--pos', home.position);

      var media, isCard = false;
      if (video) {
        media = '<video src="' + video + '"' + (image ? ' poster="' + image + '"' : '') +
          ' muted loop playsinline preload="metadata" aria-hidden="true"></video>';
      } else if (image) {
        media = '<img src="' + image + '" alt="' + (home.alt || cover.alt || '').replace(/"/g, '&quot;') + '" loading="' + (i < 3 ? 'eager' : 'lazy') + '" decoding="async">';
      } else {
        media = '<span>' + p.title.replace(/</g, '&lt;') + '</span>';
        isCard = true;
      }

      sheet.innerHTML =
        '<a class="sheet__link" href="' + Order.link('project.html?project=' + slug) + '" data-cursor-label="View">' +
          '<div class="sheet__paper' + (isCard ? ' sheet__paper--card' : '') + '">' + media + '</div>' +
          '<div class="sheet__caption">' +
            '<span class="text-label">' + num + ' &nbsp;' + p.title.split(': ')[0].replace(/</g, '&lt;') + '</span>' +
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

    // ---------- Work links (#work) ----------
    // Arriving from a Work link, or clicking Work while here, lands on the
    // settled grid: the scatter motion below reads scrollY, so jumping past
    // the hero means every sheet is already in its cell. onJump lets the
    // smoothing skip its catch-up glide.
    var onJump = function () {};
    function jumpToWork() {
      root.scrollIntoView({ block: 'start', behavior: 'instant' });
      onJump();
    }
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href*="#work"]');
      var here = function (path) { return path.replace(/index\.html$/, ''); };
      if (!link || here(link.pathname) !== here(location.pathname)) return;
      e.preventDefault();
      history.replaceState(null, '', location.search + '#work');
      jumpToWork();
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (location.hash === '#work') jumpToWork();
      return;
    }

    // ---------- scatter layout ----------
    // x, y: top-left as a fraction of the viewport; r: tilt (deg); s: scale vs. resting size
    var SCATTER_WIDE = [
      { x: 0.47, y: 0.20, r: -2.5, s: 0.62 },
      { x: 0.72, y: 0.26, r: 1.8,  s: 0.56 },
      { x: 0.55, y: 0.62, r: 3.5,  s: 0.42 },
      { x: 0.84, y: 0.64, r: -4,   s: 0.40 },
      { x: 0.66, y: 0.08, r: 2.5,  s: 0.36 },
      { x: 0.90, y: 0.06, r: -2,   s: 0.40 }
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

    // Smoothing: the motion chases the scroll position instead of snapping
    // to it, so wheel steps and trackpad flicks read as one continuous glide.
    var SMOOTH = 0.14;   // 0..1 per frame; lower = floatier
    var current = 0, running = false;

    function render() {
      var target = window.scrollY;
      current += (target - current) * SMOOTH;
      if (Math.abs(target - current) < 0.5) current = target;
      var y = current;
      var progress = clamp01(y / span);

      // hero floats up faster than the page and fades, clearing the stage for the prints
      hero.style.transform = 'translate3d(0,' + (-y * 0.45).toFixed(1) + 'px,0)';
      hero.style.opacity = Math.max(0, 1 - progress * 1.5).toFixed(3);

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
        // window.scrollY (not the smoothed y) keeps the target pinned to the real viewport
        var ty = (s.y * vh + window.scrollY - c.y) * k;
        var sc = s.s + (1 - s.s) * t;
        el.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) rotate(' + (s.r * k).toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        el.style.setProperty('--settle', Math.max(0, t * 1.6 - 0.6).toFixed(2));
        el.style.zIndex = progress < 1 ? 30 + ((i * 7) % n) : '';
      });
    }

    function loop() {
      render();
      if (current !== window.scrollY) requestAnimationFrame(loop);
      else running = false;
    }
    function request() {
      if (!running) { running = true; requestAnimationFrame(loop); }
    }

    function relayout() { measure(); request(); }

    onJump = function () { current = window.scrollY; relayout(); };

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', relayout);
    phone.addEventListener('change', relayout);
    // images without fixed heights can shift the grid as they load; re-measure once everything is in
    window.addEventListener('load', relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    relayout();
    if (location.hash === '#work') jumpToWork();
  }
})();
