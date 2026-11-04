/*
  SITE NAV — builds the header on every page from one list, so a link
  only ever changes here. Each page holds just:
    <header class="site-nav"><a class="logo-button" href="index.html">SG</a></header>
  (the logo works without JS). Must load BEFORE contact.js is used, which
  is fine either way: contact.js listens for [data-open-contact] clicks
  on the whole document.

  The current page's link gets aria-current="page" (underlined in
  components.css). Project pages count as Work.
  When a company link is open (?for=, js/order.js), the links carry it.
*/
(function () {
  // Studio is deliberately NOT here: it's found from the footer and the
  // contact popup, so it never competes with the work.
  // Contact isn't either: About covers it up top, and the Contact popup is
  // one click away in every page's footer and on About.
  var LINKS = [
    { label: 'Work', href: 'index.html#work', page: 'work' },
    { label: 'About', href: 'about.html', page: 'about' }
  ];

  // iPhone Safari draws the page on under the status bar and the bottom
  // toolbar. Two solid bands (css/components.css) hang off the top and
  // bottom of the screen, nudged 1px onto it: Safari colours its bars from
  // a solid fixed strip it finds touching the screen edge, so it shows
  // paper there instead of whatever is scrolling past
  ['top', 'bottom'].forEach(function (side) {
    var band = document.createElement('div');
    band.className = 'edge-band edge-band--' + side;
    band.setAttribute('aria-hidden', 'true');
    document.body.appendChild(band);
  });

  var header = document.querySelector('.site-nav');
  if (!header) return;

  var body = document.body;
  var current =
    body.classList.contains('project-page') || body.classList.contains('home') ? 'work' :
    body.getAttribute('data-page') || '';

  // logo: the "SG" mark on every page and screen size
  var logo = header.querySelector('.logo-button');
  if (logo) {
    logo.setAttribute('aria-label', 'Sadie Gold, home');
    logo.innerHTML = '<span aria-hidden="true">SG</span>';
  }

  var nav = document.createElement('nav');
  nav.className = 'nav-right';
  nav.setAttribute('aria-label', 'Main');

  LINKS.forEach(function (link) {
    var item;
    if (link.contact) {
      item = document.createElement('button');
      item.type = 'button';
      item.setAttribute('data-open-contact', '');
    } else {
      item = document.createElement('a');
      item.href = link.href;
      // the homepage itself shows Work, but it's a place on the page, not
      // a separate page, so it doesn't claim aria-current there
      if (link.page === current && !body.classList.contains('home')) item.setAttribute('aria-current', 'page');
    }
    item.textContent = link.label;
    item.setAttribute('data-cursor-solid', 'white');
    nav.appendChild(item);
  });

  header.appendChild(nav);

  // PAGE TURN (About only). Clicking About lays a new page down over this
  // one: the sheet flips in from the top-right corner, a fold line sweeping
  // diagonally to the bottom-left, its shaded back passing over first and
  // then its front landing flat behind the fold, until the screen is the
  // About page's paper. Leaving About by Work or the SG logo plays it in
  // reverse: the About page lifts off from the bottom-left and folds away
  // into the top-right corner, uncovering the homepage's surface. Every
  // other link (on About, in the footer...) just navigates. Drawn on a
  // canvas (exact fold geometry each frame), slow but steady (eased in and
  // out). The destination is prefetched on hover so it's ready when the
  // turn ends. Plain navigation for modified clicks and reduced motion.
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TURN_MS = 1150;
  var PAPER = '#FDF9F5';      // --color-paper: the About page's background
  var LIGHTBOX = '#F7F5F4';   // --lightbox-surface: the homepage's

  // the part of polygon pts on the c side of the fold: (p - c).d <= t
  function clip(pts, c, d, t) {
    var out = [];
    var side = function (p) { return (p[0] - c[0]) * d[0] + (p[1] - c[1]) * d[1] - t; };
    pts.forEach(function (p, i) {
      var q = pts[(i + 1) % pts.length], sp = side(p), sq = side(q);
      if (sp <= 0) out.push(p);
      if ((sp <= 0) !== (sq <= 0)) {
        var k = sp / (sp - sq);
        out.push([p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]);
      }
    });
    return out;
  }
  function path(ctx, pts) {
    ctx.beginPath();
    pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
    ctx.closePath();
  }
  function easeTurn(x) { return -(Math.cos(Math.PI * x) - 1) / 2; }   // sine in-out

  // lay: true = a new sheet of About paper is laid down over this page;
  // false = this page (About) lifts off, uncovering the color `under`.
  // Either way the sheet is on the top-right side of the fold.
  function turnTo(href, lay, under) {
    var W = window.innerWidth, H = window.innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    var canvas = document.createElement('canvas');
    canvas.className = 'page-turn';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // the fold runs between the top-right corner and c, the bottom-left
    var c = [0, H];
    var len = Math.hypot(1, 0.85), d = [1 / len, -0.85 / len];   // from c toward the top-right
    var D = W * d[0] - H * d[1];                     // c to the top-right corner, along d
    var back = [-d[0], -d[1]];
    var screen = [[0, 0], [W, 0], [W, H], [0, H]];
    var t0 = performance.now(), gone = false;
    var go = function () { if (!gone) { gone = true; window.location.href = href; } };

    (function frame(now) {
      var x = Math.min(1, (now - t0) / TURN_MS);
      var p = lay ? easeTurn(x) : 1 - easeTurn(x);   // 1 = sheet flat over the whole screen
      var u = D * (1.02 - 1.04 * p);                 // fold's distance from c
      var f = [c[0] + d[0] * u, c[1] + d[1] * u];    // a point on the fold
      ctx.clearRect(0, 0, W, H);
      var flat = clip(screen, c, back, -u);          // the sheet, lying flat (top-right side)
      var open = clip(screen, c, d, u);              // not covered by the sheet (bottom-left side)
      if (lay) {
        if (flat.length > 2) { path(ctx, flat); ctx.fillStyle = PAPER; ctx.fill(); }
      } else if (open.length > 2) {
        // About lifting away: what it uncovers is the homepage's surface;
        // the flat part is the real About page, left showing through
        path(ctx, open); ctx.fillStyle = under; ctx.fill();
      }
      // the part of the sheet that's turning: the open side mirrored across
      // the fold, lying on the flat sheet (its back, shaded)
      if (open.length > 2 && flat.length > 2 && u > 0) {
        var flap = open.map(function (q) {
          var k = 2 * ((q[0] - c[0]) * d[0] + (q[1] - c[1]) * d[1] - u);
          return [q[0] - k * d[0], q[1] - k * d[1]];
        });
        ctx.save();
        path(ctx, flat);
        ctx.clip();                                  // the flap only ever lies on the sheet
        ctx.shadowColor = 'rgba(29, 27, 24, 0.22)';
        ctx.shadowBlur = 28;
        ctx.shadowOffsetX = d[0] * 10;
        ctx.shadowOffsetY = d[1] * 10;
        path(ctx, flap);
        ctx.fillStyle = '#EFE9E2';
        ctx.fill();
        ctx.shadowColor = 'transparent';
        // bright along the fold, falling off toward the flap's edge
        var e2 = [f[0] + d[0] * u, f[1] + d[1] * u];
        var fg = ctx.createLinearGradient(f[0], f[1], e2[0], e2[1]);
        fg.addColorStop(0, '#FBF8F4');
        fg.addColorStop(0.35, '#F2ECE5');
        fg.addColorStop(1, '#E2DBD2');
        path(ctx, flap);
        ctx.fillStyle = fg;
        ctx.fill();
        ctx.restore();
        // the fold's own soft shadow on what's underneath
        var g = ctx.createLinearGradient(f[0], f[1], f[0] - d[0] * 60, f[1] - d[1] * 60);
        g.addColorStop(0, 'rgba(29, 27, 24, 0.12)');
        g.addColorStop(1, 'rgba(29, 27, 24, 0)');
        path(ctx, open);
        ctx.fillStyle = g;
        ctx.fill();
      }
      if (x < 1) requestAnimationFrame(frame);
      else go();
    })(t0);
    setTimeout(go, TURN_MS + 600);                   // in case frames are held back
  }

  // wire a link: prefetch on hover, turn on a plain click
  function turnOn(link, lay, under) {
    if (!link || reduced) return;
    var prefetched = false;
    var prefetch = function () {
      if (prefetched) return;
      prefetched = true;
      var l = document.createElement('link');
      l.rel = 'prefetch';
      l.href = link.href.split('#')[0];
      document.head.appendChild(l);
    };
    ['pointerenter', 'focus', 'touchstart'].forEach(function (ev) {
      link.addEventListener(ev, prefetch, { passive: true });
    });
    link.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      turnTo(link.href, lay, under);   // read now: js/order.js may have added ?for=
    });
  }

  if (current === 'about') {
    // leaving About for the homepage: the page lifts off
    turnOn(nav.querySelector('a[href^="index.html"]'), false, LIGHTBOX);
    turnOn(logo, false, LIGHTBOX);
  } else {
    turnOn(nav.querySelector('a[href="about.html"]'), true, PAPER);
  }

  // coming Back to a page after a turn: clear the finished canvas
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) document.querySelectorAll('.page-turn').forEach(function (w) { w.remove(); });
  });

  // GRID OVERLAY: Shift+G shows the 8 columns of the page grid (margins +
  // gutters from css/tokens.css), to check that things line up. Press again
  // to hide. Ignored while typing in a field.
  var overlay = null;
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'G' || !e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if (overlay) { overlay.remove(); overlay = null; return; }
    overlay = document.createElement('div');
    overlay.className = 'grid-overlay grid';
    overlay.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 8; i++) overlay.appendChild(document.createElement('span'));
    document.body.appendChild(overlay);
  });
})();
