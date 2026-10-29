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
          // award tag pinned to the print's corner (css/home.css), read as part of the link
          (p.award ? '<span class="sheet__award award-tag text-label">' + p.award.replace(/</g, '&lt;') + '</span>' : '') +
          '<div class="sheet__caption">' +
            '<span class="text-label">' + num + ' &nbsp;' + p.title.split(': ')[0].replace(/</g, '&lt;') + '</span>' +
            '<span class="text-label">' + (p.role || '') + '</span>' +
          '</div>' +
        '</a>';
      root.appendChild(sheet);
    });

    var sheets = Array.prototype.slice.call(root.querySelectorAll('.sheet'));

    // ---------- references (js/references-data.js) ----------
    // Little papers that end up tucked behind the prints. placeRefs puts each
    // one at its resting spot relative to the print it belongs behind.
    var REFS = (window.REFERENCES || []).filter(function (r) { return r && (r.src || r.text); });
    var refs = REFS.map(function (r) {
      var el = document.createElement('div');
      el.className = 'ref ref--' + (r.type === 'note' ? 'note' : 'image');
      el.style.setProperty('--tilt', (r.tilt || 0) + 'deg');
      if (r.type === 'note') {
        el.appendChild(document.createElement('p')).textContent = r.text;
      } else {
        var img = el.appendChild(document.createElement('img'));
        img.src = r.src;
        img.alt = r.alt || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.draggable = false;
      }
      root.appendChild(el);
      return el;
    });

    function placeRefs() {
      var sx = window.scrollX, sy = window.scrollY;
      var rr = root.getBoundingClientRect();
      var rx = rr.left + sx, ry = rr.top + sy;
      refs.forEach(function (el, i) {
        var r = REFS[i];
        var host = sheets[r.behind || 0];
        if (!host) { el.style.display = 'none'; return; }
        var prev = host.style.transform;
        host.style.transform = 'none';
        var b = host.getBoundingClientRect();
        host.style.transform = prev;
        var at = r.at || [0, 0];
        el.style.width = Math.round(b.width * (r.width || 0.25)) + 'px';
        el.style.left = Math.round(b.left + sx - rx + at[0] * b.width) + 'px';
        el.style.top = Math.round(b.top + sy - ry + at[1] * b.height) + 'px';
      });
    }

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
      placeRefs();
      window.addEventListener('resize', placeRefs);
      window.addEventListener('load', placeRefs);
      if (location.hash === '#work') jumpToWork();
      return;
    }

    // ---------- scatter layout ----------
    // x, y: top-left as a fraction of the viewport; r: tilt (deg); s: scale vs. resting size.
    // Only the first 4 prints scatter: the first two large on the light box,
    // the next two waiting just off screen right (x > 1). Any print after the
    // 4th simply sits in the grid. Off-screen prints first drop down along
    // the right edge and only slide into their column at the end, so nothing
    // sweeps across the page.
    var SCATTER_WIDE = [
      { x: 0.38, y: 0.17, r: -2.5, s: 0.93 },
      { x: 0.72, y: 0.30, r: 1.8,  s: 0.84 },
      { x: 1.04, y: 0.14, r: 3,    s: 0.60 },
      { x: 1.08, y: 0.56, r: -3,   s: 0.60 }
    ];
    var SCATTER_PHONE = [
      { x: 0.06, y: 0.50, r: -3,   s: 0.62 },
      { x: 0.52, y: 0.60, r: 2.5,  s: 0.66 },
      { x: 1.04, y: 0.40, r: 4,    s: 0.50 },
      { x: 1.08, y: 0.70, r: -3,   s: 0.50 }
    ];
    var phone = window.matchMedia('(max-width: 640px)');

    var cells = [];   // untransformed document positions, cached per layout
    var refCells = [];
    var vw = 0, vh = 0, span = 1;

    // ---------- TITLE -> LOGO ----------
    // The logo (top-left) starts hidden. As the page scrolls, each word of
    // the big title travels to its own word in the logo ("Sadie Gold", or
    // the "S" / "G" of "SG" on phones), shrinking to the logo's size; in the
    // last stretch the title fades and the real logo fades in, so it becomes
    // the working home link. Scrolling back reverses it. Same smoothed
    // scroll value and ease as the prints, so it moves with the page.
    var words = Array.prototype.slice.call(hero.querySelectorAll('.hero__word'));
    var role = hero.querySelector('.hero__role');
    var logo = document.querySelector('.logo-button');
    var morph = [];

    function logoTargets() {
      var name = logo.querySelector('.logo-button__name');
      var showName = name && getComputedStyle(name).display !== 'none';
      var node = (showName ? name : logo.querySelector('span')).firstChild;
      var parts = showName ? [[0, 5], [6, 10]] : [[0, 1], [1, 2]];
      return parts.map(function (p) {
        var range = document.createRange();
        range.setStart(node, p[0]);
        range.setEnd(node, Math.min(p[1], node.length));
        var b = range.getBoundingClientRect();
        return { left: b.left, top: b.top, h: b.height };
      });
    }

    function measureMorph() {
      if (!logo || !words.length) return;
      var sy = window.scrollY;
      var targets = logoTargets();
      var ratio = parseFloat(getComputedStyle(logo).fontSize) / parseFloat(getComputedStyle(words[0]).fontSize);
      morph = words.map(function (w, i) {
        var prev = w.style.transform;
        w.style.transform = 'none';
        var r = w.getBoundingClientRect();
        w.style.transform = prev;
        var t = targets[i] || targets[0];
        return {
          left: r.left,
          top: r.top + sy,                                // where it sits at scroll 0
          s: ratio,
          tl: t.left,
          tt: t.top + t.h / 2 - (r.height * ratio) / 2   // centred on the logo word
        };
      });
    }

    function measure() {
      measureMorph();
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
      placeRefs();
      refCells = refs.map(function (el) {
        var prev = el.style.transform;
        el.style.transform = 'none';
        var r = el.getBoundingClientRect();
        el.style.transform = prev;
        return { x: r.left + sx, y: r.top + sy };
      });
    }

    // horizontal travel for things waiting off screen right: held until
    // they've dropped most of the way down, then a short slide in
    function slideLate(t) { return 1 - ease(clamp01((t - 0.4) / 0.6)); }

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

      // the role line floats up faster than the page and fades, clearing the stage
      if (role) {
        role.style.transform = 'translate3d(0,' + (-y * 0.45).toFixed(1) + 'px,0)';
        role.style.opacity = Math.max(0, 1 - progress * 3.5).toFixed(3); // gone before it reaches the logo
      }

      // title -> logo, over the first part of the scroll
      var e = ease(clamp01(y / (span * 0.55)));
      morph.forEach(function (m, i) {
        var vx = m.left + (m.tl - m.left) * e;
        var vy = m.top + (m.tt - m.top) * e;             // wanted on-screen position
        var tx = vx - m.left;
        var ty = vy - (m.top - window.scrollY);          // minus where the page has carried it
        var sc = 1 + (m.s - 1) * e;
        words[i].style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')';
        words[i].style.opacity = clamp01((1 - e) / 0.12).toFixed(3);
      });
      if (logo && morph.length) {
        var shown = clamp01((e - 0.88) / 0.12);
        logo.style.opacity = shown.toFixed(3);
        logo.style.pointerEvents = shown > 0.5 ? '' : 'none';
      }

      var list = phone.matches ? SCATTER_PHONE : SCATTER_WIDE;
      var n = sheets.length;

      sheets.forEach(function (el, i) {
        var c = cells[i];
        var s = list[i];
        if (!s) {                      // 5th print onward: just sits in the grid
          el.style.transform = '';
          el.style.setProperty('--settle', 1);
          return;
        }
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
        var tx = (s.x * vw - c.x) * (s.x > 0.98 ? slideLate(t) : k);
        // window.scrollY (not the smoothed y) keeps the target pinned to the real viewport
        var ty = (s.y * vh + window.scrollY - c.y) * k;
        var sc = s.s + (1 - s.s) * t;
        el.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) rotate(' + (s.r * k).toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        el.style.setProperty('--settle', Math.max(0, t * 1.6 - 0.6).toFixed(2));
        el.style.zIndex = progress < 1 ? 30 + ((i * 7) % n) : '';
      });

      // references: same path as the prints, a beat behind, ending tucked
      // under them at their resting tilt
      refs.forEach(function (el, i) {
        var c = refCells[i], r = REFS[i];
        if (!c || el.style.display === 'none') return;
        var t = ease(clamp01((progress - 0.05 - i * 0.04) / 0.75));
        var k = 1 - t;
        var tilt = (r.tilt || 0) + 'deg';
        if (k < 0.001) { el.style.transform = 'rotate(' + tilt + ')'; return; }
        var st = r.start || [1.1, 0.5];
        var tx = (st[0] * vw - c.x) * (st[0] > 0.98 ? slideLate(t) : k);
        var ty = (st[1] * vh + window.scrollY - c.y) * k;
        el.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) rotate(' + tilt + ')';
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
