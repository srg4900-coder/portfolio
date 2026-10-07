/*
  SWIPE BACK TO HOME (project page only)
  --------------------------------------
  Swipe right — two fingers on a trackpad, or one finger on a touch
  screen — and the whole project page follows the gesture off to the
  right, revealing the landing page (at its top) behind it under a 30%
  dark layer that fades out as the page slides away. Release past
  COMMIT_FRACTION of the screen width (or with a quick flick) and the
  page finishes sliding off, then the landing page loads with NO intro
  animation, so it looks exactly like what was behind. Release short of
  that and the page springs back.

  (Three-finger swipes can't be used: macOS keeps them for itself and
  never sends them to web pages.)

  HOW THE "BEHIND" LANDING PAGE EXISTS: once this page has finished
  loading, a hidden <iframe> of index.html#behind is created underneath
  it ('#behind' tells index.html to skip its intro — see the inline
  script in index.html's <head>). It's a real copy of the landing page,
  so it's always up to date, and loading it early warms the browser
  cache so the real navigation at the end is near-instant.

  LAYERING: the iframe + shade are children of <html> (not <body>) at
  negative z-index, i.e. under <body>. While dragging, <body> gets a
  transform — which also makes it the containing block for its
  position:fixed children (the nav, the contact modal), so those are
  temporarily pinned at their current on-screen spot (pinFixed) to
  slide along with the page instead of jumping to the document top.
  The custom cursor dot is moved out to <html> so it keeps following the
  pointer instead of sliding away with the page.
*/
(function () {
  var COMMIT_FRACTION = 0.33;   // release past this share of the width = go home
  var FLICK_PX_PER_MS = 0.6;    // ...or (touch only) released moving right at least this fast
  var SHADE_MAX = 0.3;          // dark layer opacity at the start of the swipe
  var SETTLE_MS = 280;          // slide-off / spring-back duration
  var WHEEL_IDLE_MS = 140;      // trackpad gesture counts as released after this long with no events
  var EDGE_PX = 24;             // touches starting this close to the left edge are left to iOS's own back swipe
  var SKIP_INTRO_KEY = 'sg-skip-intro';

  var html = document.documentElement;
  var body = document.body;
  var behind = null, shade = null;
  var x = 0, active = false, settling = false;
  var pinned = [];
  var lastMoveT = 0, velocity = 0;

  // Stop the browser's own two-finger back-swipe from fighting this one.
  html.style.overscrollBehaviorX = 'none';
  body.style.overscrollBehaviorX = 'none';

  var cursorLabel = document.querySelector('.cursor-label');
  if (cursorLabel) html.appendChild(cursorLabel);

  function layer(tag, z) {
    var el = document.createElement(tag);
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;' +
      'pointer-events:none;visibility:hidden;z-index:' + z + ';';
    html.appendChild(el);
    return el;
  }

  function buildBehind() {
    if (behind) return;
    behind = layer('iframe', -2);
    behind.tabIndex = -1;
    behind.src = 'index.html#behind';
    shade = layer('div', -1);
    shade.style.background = '#000';
  }
  if (document.readyState === 'complete') buildBehind();
  else window.addEventListener('load', buildBehind);

  function pinFixed() {
    pinned = [];
    body.querySelectorAll('*').forEach(function (el) {
      var cs = getComputedStyle(el);
      if (cs.position !== 'fixed' || cs.visibility === 'hidden' || cs.opacity === '0') return;
      var r = el.getBoundingClientRect();
      pinned.push([el, el.getAttribute('style')]);
      el.style.top = (r.top + window.scrollY) + 'px';
      el.style.left = r.left + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.width = r.width + 'px';
      el.style.height = r.height + 'px';
    });
  }

  function unpinFixed() {
    pinned.forEach(function (p) {
      if (p[1] === null) p[0].removeAttribute('style'); else p[0].setAttribute('style', p[1]);
    });
    pinned = [];
  }

  function begin() {
    buildBehind();
    active = true;
    x = 0; velocity = 0; lastMoveT = performance.now();
    pinFixed();
    behind.style.visibility = 'visible';
    shade.style.visibility = 'visible';
    body.style.transition = 'none';
    shade.style.transition = 'none';
    render();
  }

  function render() {
    var w = window.innerWidth;
    body.style.transform = 'translateX(' + x + 'px)';
    shade.style.opacity = String(SHADE_MAX * (1 - Math.min(x / w, 1)));
  }

  function move(dx) {
    var now = performance.now();
    var dt = Math.max(now - lastMoveT, 1);
    velocity = velocity * 0.6 + (dx / dt) * 0.4; // smoothed — single events are noisy
    lastMoveT = now;
    x = Math.max(0, x + dx);
    render();
  }

  // allowFlick: touch only. A trackpad gesture is only "released" after
  // WHEEL_IDLE_MS of silence, and its momentum events already carry a
  // real flick's distance past COMMIT_FRACTION on their own.
  function release(allowFlick) {
    if (!active) return;
    active = false;
    settling = true;
    var w = window.innerWidth;
    var go = x > w * COMMIT_FRACTION || (allowFlick && velocity > FLICK_PX_PER_MS);
    var ease = SETTLE_MS + 'ms cubic-bezier(0.22, 1, 0.36, 1)';
    body.style.transition = 'transform ' + ease;
    shade.style.transition = 'opacity ' + ease;
    x = go ? w : 0;
    render();
    setTimeout(function () {
      if (go) {
        try { sessionStorage.setItem(SKIP_INTRO_KEY, '1'); } catch (e) {}
        window.location.href = 'index.html';
        return; // the page is leaving — nothing to reset
      }
      body.style.transition = '';
      body.style.transform = '';
      shade.style.transition = '';
      behind.style.visibility = 'hidden';
      shade.style.visibility = 'hidden';
      unpinFixed();
      settling = false;
    }, SETTLE_MS);
  }

  // ---------- trackpad: two-finger horizontal swipe (wheel deltaX) ----------
  var wheelTimer = null;
  window.addEventListener('wheel', function (e) {
    if (settling) { e.preventDefault(); return; }
    var horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (!active) {
      // only START on a clearly horizontal, rightward swipe (deltaX < 0)
      if (!horizontal || e.deltaX >= -1) return;
      begin();
    }
    e.preventDefault();
    move(-e.deltaX);
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () { release(false); }, WHEEL_IDLE_MS);
  }, { passive: false });

  // ---------- touch: one-finger swipe right ----------
  var touchStart = null;
  window.addEventListener('touchstart', function (e) {
    if (settling || e.touches.length !== 1) { touchStart = null; return; }
    var t = e.touches[0];
    // leave the left edge to iOS, and the draggable image boxes to drag.js
    if (t.clientX < EDGE_PX || e.target.closest('[data-draggable], button, video')) { touchStart = null; return; }
    touchStart = { x: t.clientX, y: t.clientY, decided: false };
  }, { passive: true });

  window.addEventListener('touchmove', function (e) {
    if (!touchStart) return;
    var t = e.touches[0];
    var dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
    if (!touchStart.decided) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      touchStart.decided = true;
      if (dx <= 0 || Math.abs(dx) < Math.abs(dy)) { touchStart = null; return; } // vertical scroll or leftward: not ours
      begin();
    }
    e.preventDefault();
    move(t.clientX - touchStart.x - x);
  }, { passive: false });

  function touchEnd() {
    if (touchStart && active) release(true);
    touchStart = null;
  }
  window.addEventListener('touchend', touchEnd);
  window.addEventListener('touchcancel', touchEnd);
})();
