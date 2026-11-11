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
      // home.tall: in the hero pile the print is that many times taller
      // (a full poster); as it lands it crops back to the grid's shape
      // (render() below). Its grid cell never changes.
      if (home.tall > 1) sheet.setAttribute('data-tall', home.tall);
      // home.rotate: the image is turned that many degrees in the hero pile
      // and turns back to 0 as it lands (stretch() below)
      if (home.rotate) sheet.setAttribute('data-rotate', home.rotate);

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
          (p.awardStamp
            ? '<img class="sheet__award sheet__award--stamp award-stamp" src="' + p.awardStamp + '" alt="' + (p.award || 'Award').replace(/\n/g, ' ').replace(/"/g, '&quot;') + '" draggable="false">'
            : p.award && !p.awardPlain ? '<span class="sheet__award award-tag text-label">' + p.award.replace(/</g, '&lt;') + '</span>' : '') +
          // three columns: number | title (wraps within its own column) | role (right)
          '<div class="sheet__caption">' +
            '<span class="sheet__num text-label">' + num + '</span>' +
            '<span class="sheet__title text-label">' + p.title.split(': ')[0].replace(/</g, '&lt;') + '</span>' +
            '<span class="sheet__role text-label">' + (p.role || '') + '</span>' +
          '</div>' +
        '</a>';
      root.appendChild(sheet);
    });

    var sheets = Array.prototype.slice.call(root.querySelectorAll('.sheet'));

    // ---------- references (js/references-data.js) ----------
    // Little cards scattered on the light box at the top of the page. They
    // drift with the prints and fade out quickly as the page heads to the
    // work, so the grid below stays clean. Each one links to MindCloud,
    // with a quiet "References" label on hover (css/home.css).
    // An image reference with no src shows as a plain grey card.
    var REFS = (window.REFERENCES || []).filter(function (r) { return r && (r.type === 'image' || r.text); });
    var refs = REFS.map(function (r) {
      var el = document.createElement('a');
      el.href = '/mindcloud/';
      el.className = 'ref ref--' + (r.type === 'note' ? 'note' : 'image');
      el.setAttribute('aria-label', 'References, opens MindCloud');
      el.style.setProperty('--tilt', (r.tilt || 0) + 'deg');
      if (r.type === 'note') {
        el.appendChild(document.createElement('p')).textContent = r.text;
      } else if (r.src) {
        var img = el.appendChild(document.createElement('img'));
        img.src = r.src;
        img.alt = r.alt || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.draggable = false;
      } else {
        el.classList.add('ref--blank');
        el.style.setProperty('--ratio', r.ratio || '4 / 5');
      }
      el.appendChild(document.createElement('span')).className = 'ref__label';
      el.lastChild.textContent = 'References';
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
    // Arriving from a Work link lands on the settled grid: the scatter
    // motion below reads scrollY, so jumping past the hero means every
    // sheet is already in its cell. onJump lets the smoothing skip its
    // catch-up glide. Clicking Work while still up in the hero instead
    // glides down exactly like the first scroll does (glideDown, set by
    // the snap section below; it says false when it doesn't apply).
    var onJump = function () {};
    var glideDown = function () { return false; };
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
      if (!glideDown()) jumpToWork();
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // no scatter, so the references would only crowd the grid
      refs.forEach(function (el) { el.style.display = 'none'; });
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

    // ---------- TITLE -> SG ----------
    // The logo (top-left, "SG") starts hidden. As the page scrolls, the "S"
    // of Sadie and the "G" of Gold glide up into it and shrink to its size,
    // while the other letters, and the role line under them, are blown off
    // the light table like paper cut-outs: a gust from the first print
    // pushes them out in a fan away from it, spinning, all the way off
    // screen (nearest letters go first). Scrolling back brings them home.
    // The title is pinned (position: fixed) for the whole trip, so only
    // this animation moves it. (Before, it rode the page's scroll while JS
    // pulled it back toward the logo; the two ran on different clocks and
    // jittered against each other.) A spacer keeps its place in the hero.
    // Same smoothed scroll value and slow-quick-slow ease as the prints.
    var title = hero.querySelector('.hero__title');
    var role = hero.querySelector('.hero__role');
    var logo = document.querySelector('.logo-button');
    var caps = [], letters = [], morph = [];
    var spacer = document.createElement('div');
    spacer.setAttribute('aria-hidden', 'true');
    title.parentNode.insertBefore(spacer, title);
    title.setAttribute('aria-label', title.textContent);
    hero.querySelectorAll('.hero__word').forEach(function (w) {
      var text = w.textContent;
      w.textContent = '';
      w.setAttribute('aria-hidden', 'true');
      text.split('').forEach(function (ch, k) {
        var l = w.appendChild(document.createElement('span'));
        l.className = k ? 'hero__letter' : 'hero__letter hero__cap';
        l.textContent = ch;
        (k ? letters : caps).push(l);
      });
    });
    // the role line: one cut-out per character (spaces stay plain text so
    // the line wraps and spaces as before)
    if (role) {
      var roleText = role.textContent;
      role.setAttribute('aria-label', roleText);
      role.textContent = '';
      roleText.split('').forEach(function (ch) {
        if (ch === ' ') { role.appendChild(document.createTextNode(' ')); return; }
        var l = role.appendChild(document.createElement('span'));
        l.className = 'hero__letter hero__bit';
        l.setAttribute('aria-hidden', 'true');
        l.textContent = ch;
        letters.push(l);
      });
    }
    var blow = [];   // per letter: where it flies, how it spins, when it goes

    // where each letter of the logo's "SG" sits on screen
    function logoTargets() {
      var node = logo.firstChild;
      while (node && node.nodeType !== 3) node = node.firstChild;
      return [0, 1].map(function (k) {
        var range = document.createRange();
        range.setStart(node, k);
        range.setEnd(node, k + 1);
        var b = range.getBoundingClientRect();
        return { left: b.left, top: b.top, h: b.height };
      });
    }

    function measureMorph() {
      if (!logo || !caps.length) return;
      // back in the flow to read where the title sits at the top of the page
      spacer.style.height = '0px';
      title.removeAttribute('style');
      var r = title.getBoundingClientRect();
      var top = r.top + window.scrollY;
      spacer.style.height = r.height + 'px';
      title.style.cssText = 'position:fixed;margin:0;top:' + top + 'px;left:' + r.left + 'px;width:' + r.width + 'px';
      var targets = logoTargets();
      var ratio = parseFloat(getComputedStyle(logo).fontSize) / parseFloat(getComputedStyle(title).fontSize);
      morph = caps.map(function (c, i) {
        // offsets, not the on-screen box: they ignore the lines' rise-in
        // animation, so measuring mid-animation can't throw the target off.
        // Summed up to the title (each animated line counts as a parent).
        var x = r.left, y = top, h = c.offsetHeight;
        for (var n = c; n && n !== title; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
        var t = targets[i] || targets[0];
        return { dx: t.left - x, dy: t.top + t.h / 2 - (y + h * ratio / 2), s: ratio };
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
      measureBlow();
    }

    // the gust starts at the first print's lower-left, where it sits in the
    // pile; each letter flies straight away from that point (give or take a
    // few degrees) far enough to clear the screen
    function measureBlow() {
      var s0 = (phone.matches ? SCATTER_PHONE : SCATTER_WIDE)[0];
      var pw = (cells[0] ? cells[0].w : vw * 0.4) * s0.s;
      var gx = s0.x * vw + pw * 0.1, gy = s0.y * vh + pw * 0.75 * 0.75;
      var roleT = role ? role.style.transform : '';
      if (role) role.style.transform = 'none';
      var sy = window.scrollY;
      var pts = letters.map(function (l) {
        var prev = l.style.transform;
        l.style.transform = 'none';
        var b = l.getBoundingClientRect();
        l.style.transform = prev;
        // the title is pinned to the screen; the role line rides the page
        var y = b.top + b.height / 2 + (l.classList.contains('hero__bit') ? sy : 0);
        return { x: b.left + b.width / 2, y: y };
      });
      if (role) role.style.transform = roleT;
      var far = Math.hypot(vw, vh) * 1.15;
      var dists = pts.map(function (q) { return Math.hypot(q.x - gx, q.y - gy); });
      var near = Math.min.apply(null, dists), span2 = Math.max(1, Math.max.apply(null, dists) - near);
      blow = pts.map(function (q, j) {
        var rnd = function (n) { var v = Math.sin((j + 1) * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };
        var a = Math.atan2(q.y - gy, q.x - gx) + (rnd(1) - 0.5) * 0.5;   // about +-14 degrees
        var d = far * (0.9 + rnd(2) * 0.3);
        return {
          x: Math.cos(a) * d,
          y: Math.sin(a) * d,
          spin: (rnd(3) < 0.5 ? -1 : 1) * (140 + rnd(4) * 260),
          at: (dists[j] - near) / span2 * 0.08 + rnd(5) * 0.02   // nearest go a beat first, but they leave as a group
        };
      });
    }
    // quick, then slow, with a softer start (a fifth of a slow-in-slow-out)
    function easeOut(t) { return 0.8 * (1 - Math.pow(1 - t, 3)) + 0.2 * ease(t); }

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

      // the role line floats up a little faster than the page (its letters
      // blow away with the title's, below)
      if (role) role.style.transform = 'translate3d(0,' + (-y * 0.45).toFixed(1) + 'px,0)';

      // title -> SG, over the first part of the scroll
      var raw = clamp01(y / (span * 0.55));
      var e = ease(raw);
      morph.forEach(function (m, i) {
        var sc = 1 + (m.s - 1) * e;
        caps[i].style.transform = 'translate3d(' + (m.dx * e).toFixed(2) + 'px,' + (m.dy * e).toFixed(2) + 'px,0) scale(' + sc.toFixed(4) + ')';
        caps[i].style.opacity = clamp01((1 - e) / 0.1).toFixed(3);
      });
      // the other letters blow off the table: a quick push that slows as
      // they sail off screen, turning as they go, lifted slightly (scale)
      letters.forEach(function (l, j) {
        var b = blow[j];
        if (!b) return;
        var t = 1 - easeOut(1 - clamp01((raw - b.at) / 0.67));   // mirrored: slow push then away on the way down, quick return that settles softly on the way up
        if (t <= 0) { if (l.style.transform) l.style.transform = ''; l.style.visibility = ''; return; }
        var lift = 1 + 0.12 * Math.min(1, t * 4);
        l.style.transform = 'translate3d(' + (b.x * t).toFixed(1) + 'px,' + (b.y * t).toFixed(1) + 'px,0) rotate(' + (b.spin * t).toFixed(1) + 'deg) scale(' + lift.toFixed(3) + ')';
        l.style.visibility = t >= 1 ? 'hidden' : '';
      });
      title.style.visibility = e >= 1 ? 'hidden' : '';
      if (logo && morph.length) {
        var shown = clamp01((e - 0.9) / 0.1);   // the real SG takes over as the letters land
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
          stretch(el, c, 0);
          return;
        }
        // stagger: earlier sheets land first
        var stagger = 0.06;
        var t = ease(clamp01((progress - i * stagger) / Math.max(0.3, 1 - (n - 1) * stagger)));
        var k = 1 - t;
        stretch(el, c, k);
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

      // references: same path as the prints, a beat behind, fading out
      // early so they're gone by the time the grid settles
      refs.forEach(function (el, i) {
        var c = refCells[i], r = REFS[i];
        if (!c || el.style.display === 'none') return;
        var fade = 1 - clamp01(progress / 0.3);
        el.style.opacity = fade.toFixed(3);
        el.style.visibility = fade > 0 ? '' : 'hidden';
        el.style.pointerEvents = fade > 0.6 ? 'auto' : 'none';
        if (!fade) return;
        var t = ease(clamp01((progress - 0.05 - i * 0.04) / 0.75));
        var k = 1 - t;
        var tilt = (r.tilt || 0) + 'deg';
        var st = r.start || [1.1, 0.5];
        var tx = (st[0] * vw - c.x) * (st[0] > 0.98 ? slideLate(t) : k);
        var ty = (st[1] * vh + window.scrollY - c.y) * k;
        el.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) rotate(' + tilt + ')';
      });
    }

    // a tall print (data-tall): its paper grows downward by (tall - 1)
    // times its grid height, scaled by k (1 = scattered, 0 = landed). A
    // matching negative margin keeps the grid exactly where it was; the
    // caption under it is hidden until it lands (--settle).
    function stretch(el, c, k) {
      var tall = parseFloat(el.getAttribute('data-tall'));
      if (!tall) return;
      var paper = el.firstChild && el.firstChild.firstChild;
      if (!paper) return;
      var rot = parseFloat(el.getAttribute('data-rotate')) || 0;
      var img = rot && paper.querySelector('img');
      if (k < 0.001) {
        if (paper.style.height) {
          paper.style.height = ''; paper.style.marginBottom = ''; paper.style.aspectRatio = '';
          if (img) img.removeAttribute('style');
        }
        return;
      }
      paper.style.aspectRatio = 'auto';           // the height sets the shape, not the width
      var base = c.w * 3 / 4;                      // the grid's 4 / 3 print
      var extra = base * (tall - 1) * k;
      paper.style.height = (base + extra).toFixed(1) + 'px';
      paper.style.marginBottom = (-extra).toFixed(1) + 'px';
      if (img) turn(img, c.w, base + extra, rot * k, k);
    }

    // data-rotate: the image's own box swaps from the paper's shape (k = 0)
    // to the paper turned sideways (k = 1), turns by deg, and scales just
    // enough that no paper shows at the corners mid-turn. Its crop slides
    // from the print's --pos (landed) to the middle (in the pile).
    function turn(img, W, H, deg, k) {
      var bw = W + (H - W) * k, bh = H + (W - H) * k;
      var a = deg * Math.PI / 180, cs = Math.abs(Math.cos(a)), sn = Math.abs(Math.sin(a));
      var sc = Math.max(1, (W * cs + H * sn) / bw, (W * sn + H * cs) / bh);
      var pos = (getComputedStyle(img).getPropertyValue('--pos') || '50% 50%').trim().split(/\s+/);
      var px = parseFloat(pos[0]) || 0, py = parseFloat(pos[1]);
      if (isNaN(py)) py = 50;
      img.style.cssText =
        'position:absolute;max-width:none;' +
        'width:' + bw.toFixed(1) + 'px;height:' + bh.toFixed(1) + 'px;' +
        'left:' + ((W - bw) / 2).toFixed(1) + 'px;top:' + ((H - bh) / 2).toFixed(1) + 'px;' +
        'transform:rotate(' + deg.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ');' +
        'object-position:' + (px + (50 - px) * k).toFixed(1) + '% ' + (py + (50 - py) * k).toFixed(1) + '%';
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

    // ---------- snap: hero <-> work ----------
    // From anywhere in the hero, the first scroll down glides the page to the
    // top of the work, and a scroll up glides back to the title. One wheel
    // flick, trackpad swipe, touch drag or key press is enough. A sideways
    // swipe (trackpad or touch) counts as "show me the work" too, since the
    // page doesn't scroll sideways. The rest of that gesture (trackpad
    // momentum) is swallowed so it can't run on past the snap.
    // Below the top of the work the page scrolls normally.
    var SNAP_MS = 1100;
    var snapping = false, holdGesture = false, lastWheel = 0, touch = null;

    function workTop() {
      var margin = parseFloat(getComputedStyle(root).scrollMarginTop) || 0;
      var top = Math.round(root.getBoundingClientRect().top + window.scrollY - margin);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      return Math.min(max, Math.max(top, Math.ceil(span)));   // never short of the settled grid
    }
    function inHero() { return window.scrollY < workTop() - 2; }

    // the way down lands with a gentle bounce: it sails a touch past the top
    // of the work (about 2% of the trip) and settles back. The way up can't
    // overshoot the top of the page, so it just eases in.
    function settle(t) {
      var c1 = 0.7, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    function glideTo(to) {
      var from = window.scrollY, dist = to - from;
      if (Math.abs(dist) < 2) return;
      var curve = dist > 0 ? settle : ease;
      snapping = true;
      var t0 = performance.now();
      (function step(now) {
        var t = clamp01((now - t0) / SNAP_MS);
        window.scrollTo(0, from + dist * curve(t));
        if (t < 1) requestAnimationFrame(step);
        else { snapping = false; holdGesture = true; }
      })(t0);
    }
    function snap(down) {
      if (snapping) return true;
      if (!inHero()) return false;
      if (!down && window.scrollY < 2) return false;
      glideTo(down ? workTop() : 0);
      return true;
    }
    glideDown = function () { return snap(true); };   // the nav's Work link (above)

    window.addEventListener('wheel', function (e) {
      var now = performance.now();
      var sameGesture = now - lastWheel < 160;
      lastWheel = now;
      if (snapping || (holdGesture && sameGesture)) { e.preventDefault(); return; }
      holdGesture = false;
      if (e.ctrlKey) return;                                    // ctrlKey = pinch zoom
      var ax = Math.abs(e.deltaX), ay = Math.abs(e.deltaY);
      if (ax < 1 && ay < 1) return;
      var down = ax > ay ? true : e.deltaY > 0;                 // sideways = down to the work
      if (snap(down)) e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchstart', function (e) {
      touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (snapping) { e.preventDefault(); return; }
      if (!touch) return;
      var dx = touch.x - e.touches[0].clientX, dy = touch.y - e.touches[0].clientY;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 8) return;
      touch = null;
      var down = Math.abs(dx) > Math.abs(dy) ? true : dy > 0;   // sideways = down to the work
      if (snap(down)) e.preventDefault();
    }, { passive: false });

    window.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      var down = e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey);
      var up = e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey);
      if ((down || up) && snap(down)) e.preventDefault();
    });

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
