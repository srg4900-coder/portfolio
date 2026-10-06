/*
  HOMEPAGE ORCHESTRATION
  ----------------------
  Three independent things happen here:
    1. The one-time LOAD SEQUENCE (everything below, up to the scroll
       section) — a fixed timeline run once on page load/reload:
         t=0ms     nav + the big background logo mark start fading in
                   (0 -> their set resting opacity, ~500ms); "Sadie Gold"
                   and the "I'm a.../[role]" row start their letter
                   reveals at the same moment.
         t=2400ms  "Sadie Gold" finishes revealing (budgeted to last
                   exactly this long, however many letters it has).
         t=3000ms  "Portfolio" starts revealing (600ms after Sadie Gold
                   finishes), same letter-by-letter manner.
         portfolio finish + 400ms   the eyebrow line fades in (0 -> 90%).
         (role text's own reveal finishes much faster than the title's,
         since it reuses the role-cycle module's own fast per-letter
         timing — see js/role-cycle.js, which pauses 2.4s after ITS
         reveal finishes before the role-cycling loop starts.)
       Background color + paper texture need no entry here — they're
       just always-visible CSS, nothing animates them in.
    2. A scroll-scrubbed intro sequence (title rises + sticks; papers rise
       + rotate into rest, staggered in two waves) — driven by setting
       CSS custom properties per frame, same technique used elsewhere in
       this project (see the archived index.html for precedent). Nothing
       here is a fixed-duration animation; it's all a direct function of
       scroll position, so scrolling back up reverses it for free.

  TUNING: every phase below is a [start, end] pair in "0 to 1 of the
  .hero-track's scrollable range." Nudge these to re-time the sequence
  without touching the math.
*/

(function () {
  // ---------- current date, MM.DD.YYYY ----------
  var dateEl = document.getElementById('currentDate');
  if (dateEl) {
    var now = new Date();
    var dd = String(now.getDate()).padStart(2, '0');
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    dateEl.textContent = mm + '.' + dd + '.' + now.getFullYear();
  }

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  // progress through [start, end] as its own 0..1, clamped outside the range
  function phase(p, start, end) {
    return clamp01((p - start) / (end - start));
  }

  // ---------- nav + big logo mark + title + eyebrow: all fade/reveal together at t=0 ----------
  // Sadie Gold, Portfolio, and the eyebrow above them all run on the SAME
  // ~500ms timeline as the nav's own fade-in — fast, synced, one beat,
  // not a slow multi-second staggered reveal.

  var navEl = document.querySelector('.site-nav');
  var bgLogoEl = document.querySelector('.hero-bg-logo');
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      if (navEl) navEl.classList.add('is-in');
      if (bgLogoEl) bgLogoEl.classList.add('is-in');
    });
  });

  // ---------- title: "Sadie Gold" then "Portfolio", near-simultaneous fast reveal ----------
  // Two separate lines (not one continuous stagger across both) so line 2
  // can start its own letter-by-letter sweep a beat after line 1's,
  // rather than reading as one unbroken run of letters.

  var titleEl = document.querySelector('.hero-title');
  var eyebrowEl = document.querySelector('.hero-title-wrap__eyebrow');

  // Builds one line as a row of letter spans inside a .letter-reveal
  // wrapper (see css/main.css) — returns the wrapper plus how long its
  // own reveal transition takes to fully finish, so the caller can time
  // what happens next off of it.
  function buildRevealLine(text, stagger, duration) {
    var wrap = document.createElement('span');
    wrap.className = 'hero-title__line letter-reveal';
    wrap.style.setProperty('--letter-duration', duration + 'ms');
    var i = 0;
    text.split('').forEach(function (ch) {
      var span = document.createElement('span');
      span.className = 'letter';
      // A regular space as the ENTIRE text content of its own isolated
      // inline-block span collapses away in most browsers (no visible
      // gap) — use a real non-breaking space instead so the word spacing
      // survives being split into one element per character.
      span.textContent = (ch === ' ') ? ' ' : ch;
      span.style.transitionDelay = (i * stagger) + 'ms';
      wrap.appendChild(span);
      i++;
    });
    var revealDuration = (text.length - 1) * stagger + duration;
    return { el: wrap, duration: revealDuration };
  }

  if (titleEl) {
    // Fast + synced to the nav's own ~500ms fade (was 220ms stagger /
    // 400ms duration / 600ms gap — a slow multi-second staggered reveal;
    // this is roughly a quarter of that, all landing inside one beat).
    var TITLE_STAGGER_MS = 30;
    var TITLE_LETTER_DURATION_MS = 220;
    var LINE2_START_OFFSET_MS = 80; // a beat after line 1 starts, not after it finishes — reads as "together"

    titleEl.textContent = '';
    var line1 = buildRevealLine('Sadie Gold', TITLE_STAGGER_MS, TITLE_LETTER_DURATION_MS);
    var line2 = buildRevealLine('Portfolio', TITLE_STAGGER_MS, TITLE_LETTER_DURATION_MS);
    titleEl.appendChild(line1.el);
    titleEl.appendChild(document.createElement('br'));
    titleEl.appendChild(line2.el);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { line1.el.classList.add('is-in'); });
    });
    setTimeout(function () { line2.el.classList.add('is-in'); }, LINE2_START_OFFSET_MS);

    // Starts at the same t=0 as the nav, not after the title finishes —
    // the whole header block reveals as one synced beat now.
    if (eyebrowEl) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { eyebrowEl.classList.add('is-in'); });
      });
    }
  }

  // ---------- "I'm a...": same letter-reveal style, starts at the same t=0 as the title ----------
  // (the role text next to it reveals itself the same way, on its own
  // timing — see js/role-cycle.js.)

  var imAEl = document.querySelector('.hero-decor__im-a');
  if (imAEl) {
    var IM_A_STAGGER_MS = 22;
    var imAText = imAEl.textContent;
    imAEl.textContent = '';
    var j = 0;
    imAText.split('').forEach(function (ch) {
      var letterSpan = document.createElement('span');
      letterSpan.className = 'letter';
      letterSpan.textContent = (ch === ' ') ? ' ' : ch;
      letterSpan.style.transitionDelay = (j * IM_A_STAGGER_MS) + 'ms';
      imAEl.appendChild(letterSpan);
      j++;
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { imAEl.classList.add('is-in'); });
    });
  }

  // ---------- scroll-scrubbed intro sequence ----------

  var track = document.querySelector('.hero-track');
  var titleWrap = document.querySelector('.hero-title-wrap');
  var heroDecor = document.querySelector('.hero-decor');
  var papersAB = document.querySelectorAll('#paperArtDirection, #paperUI');
  var papersCD = document.querySelectorAll('#paperMotion, #paperAbout');

  if (track) {
    // p is no longer scroll-scrubbed — a single scroll gesture plays the
    // whole sequence over SNAP_DURATION_MS (see SCROLL SNAP below), so p
    // is linear in TIME and these phases map directly to milliseconds.
    var SNAP_DURATION_MS = 1600;
    var CD_DELAY_MS = 200;          // small papers start this long after the big ones
    var CD_START = CD_DELAY_MS / SNAP_DURATION_MS;
    var PHASE_TITLE = [0.00, 0.50]; // title slides up and sticks
    var PHASE_DECOR = [0.00, 0.25]; // header role line fades + rises off early, ahead of everything else
    var PHASE_AB = [0.00, 1 - CD_START]; // papers 1 & 2 rise + rotate to rest
    var PHASE_CD = [CD_START, 1.00];     // papers 3 & 4 — same length, 200ms behind
    var DECOR_TRAVEL_PX = 48;

    // Positions the "I'm a.../[role]" row a fixed gutter below the nav's
    // OWN live bottom edge, rather than a guessed fixed px value — so
    // there's always real breathing room under the nav's bottom border no
    // matter how the nav's own height changes later (padding, font-size,
    // border tweaks, etc. all used to silently close this gap).
    var DECOR_GAP_BELOW_NAV_PX = 32;
    function positionHeroDecor() {
      var navRect = document.querySelector('.site-nav').getBoundingClientRect();
      heroDecor.style.top = (navRect.bottom + DECOR_GAP_BELOW_NAV_PX) + 'px';
    }
    positionHeroDecor();
    window.addEventListener('resize', positionHeroDecor);

    var TITLE_TRAVEL_PX = 0; // computed from current title position on first run

    function measureTitleTravel() {
      // distance from the title's resting (CSS) bottom offset up to a
      // fixed position just under the nav — computed from live layout so
      // it's correct at any viewport height, not a guessed pixel value.
      var navHeight = document.querySelector('.site-nav').offsetHeight;
      var rect = titleWrap.getBoundingClientRect();
      var targetTop = navHeight + 24;
      TITLE_TRAVEL_PX = rect.top - targetTop;
    }
    measureTitleTravel();
    window.addEventListener('resize', measureTitleTravel);

    // Raw scroll position target — what "p" would be with no smoothing.
    function computeTargetP() {
      var vh = window.innerHeight;
      var max = track.offsetHeight - vh;
      return max > 0 ? clamp01(window.scrollY / max) : 0;
    }

    // Applies the whole intro sequence at a given (already-smoothed)
    // progress value — pure function of p, no scroll math in here.
    function applyAtProgress(p) {
      var titleP = phase(p, PHASE_TITLE[0], PHASE_TITLE[1]);
      titleWrap.style.setProperty('--title-y', (-titleP * TITLE_TRAVEL_PX) + 'px');

      if (heroDecor) {
        var decorP = phase(p, PHASE_DECOR[0], PHASE_DECOR[1]);
        heroDecor.style.setProperty('--decor-fade', 1 - decorP);
        heroDecor.style.setProperty('--decor-y', (-decorP * DECOR_TRAVEL_PX) + 'px');
      }

      setUpRotateDrop(papersAB, p, PHASE_AB);
      setRiseAndRotate(papersCD, p, PHASE_CD);
    }

    // Splits one [start, end] phase into two SEQUENTIAL sub-phases: the
    // paper fully finishes rising (first 60% of the phase) before it
    // starts rotating into its resting angle (last 55%, slight overlap
    // for a smoother handoff rather than a visible seam).
    function setRiseAndRotate(papers, p, range) {
      var overall = phase(p, range[0], range[1]);
      var riseSub = phase(overall, 0, 0.6);
      var rotateSub = phase(overall, 0.45, 1);
      papers.forEach(function (el) {
        el.style.setProperty('--rise-y', 1 - riseSub);
        el.style.setProperty('--rotate-mix', rotateSub);
      });
    }

    // THREE sequential sub-phases for the two big hero papers (Art
    // Direction, UI): rise up PAST their resting spot, rotate a full 90°
    // while held near that overshoot point, THEN pull down into the real
    // resting position — "up, then rotate, then pull down," not the
    // simpler two-stage rise-then-rotate the other two papers use.
    // BUG FIX: 100vh ("exactly one viewport height below center") sounds
    // like "fully offscreen," but it isn't — the paper's OWN rotated
    // bounding box extends outward from its center too, and at these
    // sizes that half-height can exceed the slack 100vh leaves, letting
    // a sliver of the paper peek above the bottom edge even at scroll
    // position 0 (confirmed: ~24px of it was visible pre-scroll at a
    // common viewport size). 130vh leaves enough clearance for that
    // half-height across realistic viewport widths.
    var HERO_START_VH = 130;   // fully below the viewport at phase start
    var HERO_OVERSHOOT_VH = 10; // how far PAST the resting spot it rises before dropping back down
    function setUpRotateDrop(papers, p, range) {
      var overall = phase(p, range[0], range[1]);
      var riseSub = phase(overall, 0, 0.35);
      var rotateSub = phase(overall, 0.30, 0.70);
      var dropSub = phase(overall, 0.65, 1.0);

      papers.forEach(function (el) {
        var startDeg = parseFloat(el.getAttribute('data-start-deg') || '0');
        var restDeg = parseFloat(el.getAttribute('data-rest-deg') || '90');
        var rotateDeg = startDeg * (1 - rotateSub) + restDeg * rotateSub;

        // riseSub: HERO_START_VH -> -HERO_OVERSHOOT_VH (rises up PAST rest)
        var afterRise = HERO_START_VH + (-HERO_OVERSHOOT_VH - HERO_START_VH) * riseSub;
        // dropSub: -HERO_OVERSHOOT_VH -> 0 (pulls back down into the real resting spot)
        var yVh = afterRise + HERO_OVERSHOOT_VH * dropSub;

        el.style.setProperty('--paper-y-vh', yVh);
        el.style.setProperty('--paper-rotate', rotateDeg + 'deg');
      });
    }

    // SMOOTHING: this used to set everything directly from the raw
    // scroll position on every scroll event (one-to-one, no easing) —
    // functional, but it meant the paper rise/rotate/drop and the title
    // stick snapped exactly to the mouse wheel's own stepping, which can
    // read as mechanical/jittery rather than smooth, especially on a
    // notchy wheel. Instead, scroll only ever updates a TARGET progress
    // value; a continuous rAF loop eases the applied progress toward
    // that target every frame (same exponential-ease technique as the
    // custom cursor's follow and the role-cycle text), so the whole
    // sequence always arrives with a smooth, decelerating catch-up
    // motion that matches the rest of the page's motion language —
    // never an instant snap, whichever direction the target just moved.
    var SCROLL_EASE_TAU_MS = 160;
    var targetP = computeTargetP() > 0.5 ? 1 : 0;
    var smoothedP = targetP;
    var lastFrame = performance.now();

    // ---------- SCROLL SNAP: one scroll gesture = the whole sequence ----------
    // The intro used to scrub across .hero-track's full 260vh, so it took
    // many wheel notches to reach the papers. Now ANY downward scroll
    // from the top (wheel, trackpad, touch swipe, arrow/page/space keys,
    // even a scrollbar drag) snaps straight to the papers section and
    // plays the sequence by itself, time-based, from targetP 0 -> 1.
    // Scrolling UP from the papers section (while at/above the end of the
    // track) snaps back to the top and plays it in reverse.
    //
    // The window scroll position itself JUMPS instantly (to the track's
    // end or to 0) — invisible, because .hero-stage is position:sticky
    // for the whole track, so it never visibly moves; only the animation
    // carries the motion. Input is swallowed for the length of the
    // animation (+ a little extra for trackpad momentum) so one flick
    // can't overshoot past the papers into the footer.
    var snapState = targetP === 1 ? 'papers' : 'top';
    var tweenFrom = targetP, tweenTo = targetP, tweenStart = 0;
    var lockUntil = 0;
    var MOMENTUM_LOCK_MS = 400;

    function trackEndY() {
      return Math.max(0, track.offsetTop + track.offsetHeight - window.innerHeight);
    }

    function snapTo(state) {
      if (state === snapState) return;
      snapState = state;
      var now = performance.now();
      tweenFrom = targetP;
      tweenTo = state === 'papers' ? 1 : 0;
      tweenStart = now;
      lockUntil = now + SNAP_DURATION_MS * Math.abs(tweenTo - tweenFrom) + MOMENTUM_LOCK_MS;
      window.scrollTo(0, state === 'papers' ? trackEndY() : 0);
    }

    function isLocked() { return performance.now() < lockUntil; }

    // dir: +1 = user is trying to go down, -1 = up. Returns true if the
    // gesture was consumed by a snap (or by the lock) and should be blocked.
    function handleIntent(dir) {
      if (isLocked()) return true;
      if (dir > 0 && snapState === 'top') { snapTo('papers'); return true; }
      if (dir < 0 && snapState === 'papers' && window.scrollY <= trackEndY() + 1) {
        snapTo('top'); return true;
      }
      return false;
    }

    window.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) < 1) return;
      if (handleIntent(e.deltaY > 0 ? 1 : -1)) e.preventDefault();
    }, { passive: false });

    var touchStartY = null;
    window.addEventListener('touchstart', function (e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (touchStartY === null) return;
      var dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dy) < 8 && !isLocked()) return;
      if (handleIntent(dy > 0 ? 1 : -1)) { e.preventDefault(); touchStartY = null; }
    }, { passive: false });

    var DOWN_KEYS = { ArrowDown: 1, PageDown: 1, ' ': 1, End: 1 };
    var UP_KEYS = { ArrowUp: 1, PageUp: 1, Home: 1 };
    window.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      var dir = DOWN_KEYS[e.key] ? 1 : UP_KEYS[e.key] ? -1 : 0;
      if (dir && handleIntent(dir)) e.preventDefault();
    });

    // Fallback for anything the listeners above don't catch (scrollbar
    // drag, find-in-page, etc.): landing mid-track snaps by direction.
    window.addEventListener('scroll', function () {
      if (isLocked()) return;
      var y = window.scrollY, end = trackEndY();
      if (snapState === 'top' && y > 2) snapTo('papers');
      else if (snapState === 'papers' && y < end - 2) snapTo('top');
    }, { passive: true });

    function loop(now) {
      var dt = now - lastFrame;
      lastFrame = now;
      // Time-linear tween (so CD_DELAY_MS stays a true 200ms); the
      // exponential ease below still softens the start/end of it.
      var span = Math.abs(tweenTo - tweenFrom) * SNAP_DURATION_MS;
      var t = span > 0 ? clamp01((now - tweenStart) / span) : 1;
      targetP = tweenFrom + (tweenTo - tweenFrom) * t;
      var ease = 1 - Math.exp(-dt / SCROLL_EASE_TAU_MS);
      smoothedP += (targetP - smoothedP) * ease;
      // Snap the last tiny fraction instead of chasing it forever —
      // asymptotic easing never truly reaches 0, which would otherwise
      // leave paper-rotate/etc. perpetually a hair off their exact rest
      // values even once scrolling has long since stopped.
      if (Math.abs(targetP - smoothedP) < 0.0005) smoothedP = targetP;
      applyAtProgress(smoothedP);
      requestAnimationFrame(loop);
    }

    applyAtProgress(smoothedP);
    requestAnimationFrame(loop);
  }
})();
