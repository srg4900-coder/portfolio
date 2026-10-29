/*
  TOUCH STAND-INS (phones/tablets only)
  -------------------------------------
  Touch screens have no cursor and no hover, so the mouse-driven fun
  (cursor labels, hover lifts) never happens there.
  Each block below is a tap-based stand-in for one of those. Runs only
  when the primary input is touch; does nothing on mouse/trackpad.

    1. LABEL FLASH      tap a paper -> its cursor label pops up above the
                        finger for a moment (homepage)
    2. THUMBNAIL LIFT   a paper's thumbnail holders lift once, staggered,
                        when a tap brings it to the front (homepage)
    3. SCROLL DRIFT     papers drift slightly as they scroll through the
                        screen (homepage; no motion permission — see 3)

  Tap feedback for links/buttons (and the always-long About arrow) is
  CSS-only: see html.is-touch rules in components.css / main.css.
*/
(function () {
  if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  var root = document.documentElement;
  root.classList.add('is-touch');

  // ---------- 1. LABEL FLASH ----------
  var LABEL_MS = 900;
  var flash = document.createElement('div');
  flash.className = 'touch-label';
  flash.setAttribute('aria-hidden', 'true');
  document.body.appendChild(flash);
  var flashTimer = null;

  // BUG FIX: these used to fire on finger-DOWN. iPhone Safari watches
  // for anything becoming visible during a tap and, if it sees that,
  // treats the tap as a "hover" and withholds the click — so showing the
  // label on finger-down cost the visitor
  // extra taps before links/buttons responded. They now run on `click`,
  // i.e. only after the tap has already gone through.
  document.addEventListener('click', function (e) {
    var target = e.target.closest('[data-cursor-label]');
    // viewer images open straight into the viewer, no label needed
    if (!target || target.hasAttribute('data-viewer') || target.classList.contains('paper')) return;
    flash.textContent = target.getAttribute('data-cursor-label');
    flash.style.backgroundColor = target.getAttribute('data-cursor-fill') || '';
    flash.style.color = target.getAttribute('data-cursor-text') || '';
    flash.style.left = e.clientX + 'px';
    flash.style.top = e.clientY + 'px';
    flash.classList.add('is-shown');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { flash.classList.remove('is-shown'); }, LABEL_MS);
  }, true);

  // ---------- 2. THUMBNAIL LIFT ----------
  // paper.js dispatches 'paper:activate' when a tap brings a paper to front.
  var LIFT_MS = 900; // matches the thumb-lift animation + stagger in main.css
  document.addEventListener('paper:activate', function (e) {
    var paper = e.target;
    if (e.detail && e.detail.wasActive) return; // already in front
    if (!paper.querySelector('.paper-grid__box')) return;
    paper.classList.remove('is-lift-once');
    void paper.offsetWidth; // restart the animation if tapped again quickly
    paper.classList.add('is-lift-once');
    setTimeout(function () { paper.classList.remove('is-lift-once'); }, LIFT_MS);
  });

  // ---------- 3. SCROLL DRIFT ----------
  // Stand-in for the mouse "drift" on the homepage papers. (Was a
  // phone-TILT effect, removed: iOS only allows reading the phone's motion
  // after a permission prompt, which Sadie ruled out.) Instead each paper
  // drifts a few px as it moves through the screen while scrolling — a
  // gentle parallax, alternating directions so neighbours don't move in
  // lockstep. Pure scroll position: no permissions, no sensors.
  var driftPapers = document.querySelectorAll('.papers-stage .paper');
  if (driftPapers.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var DRIFT_MAX_PX = 8;
    var driftQueued = false;
    function applyDrift() {
      driftQueued = false;
      var vh = window.innerHeight;
      driftPapers.forEach(function (paper, i) {
        var r = paper.getBoundingClientRect();
        // -1 (above center) .. 1 (below center) of the screen
        var off = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
        var inner = paper.querySelector('.paper__inner');
        inner.style.setProperty('--drift-x', ((i % 2 ? 1 : -1) * off * DRIFT_MAX_PX * 0.6).toFixed(1) + 'px');
        inner.style.setProperty('--drift-y', (off * DRIFT_MAX_PX).toFixed(1) + 'px');
      });
    }
    window.addEventListener('scroll', function () {
      if (!driftQueued) { driftQueued = true; requestAnimationFrame(applyDrift); }
    }, { passive: true });
  }
})();
