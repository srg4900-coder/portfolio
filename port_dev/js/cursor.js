/*
  CUSTOM CURSOR
  -------------
  Desktop-only (pointer:fine). Hides the real cursor and replaces it with
  a small dot that expands into a filled label rectangle whenever the
  pointer is over an element carrying `data-cursor-label`.

  USAGE (from any page):
    <div class="paper" data-cursor-label="Art Direction"
         data-cursor-fill="#557EAA" data-cursor-text="#FCFCFC">

  data-cursor-fill / data-cursor-text are optional per-element overrides;
  if omitted the label uses the CSS defaults in components.css.

  A separate, independent attribute — data-cursor-solid="white" — forces
  the dot to plain un-blended white (no label, no expansion) while over
  that element, for cases like the nav's "Mind Cloud"/"Contact" where the
  text itself recolors on hover and the dot's usual difference-blend
  would otherwise react to that in an unintended way.

  Hit-testing is CONTINUOUS (re-run every animation frame via
  elementFromPoint at the label's own rendered position) rather than tied
  to mouseenter/mouseleave + a scroll listener. Content on this page
  moves under a stationary cursor for more reasons than just scrolling
  (the scroll-scrubbed paper rise/rotate in js/main.js, drag-and-drop on
  the project page, anything added later) — enter/leave pairs only fire
  for the one reason (the mouse itself moving), so any of those other
  cases left the label stuck on stale content. Polling every frame is
  cheap and makes the label correct unconditionally, so there's no
  per-element binding step (and no window.CursorLabel.refresh()) needed
  anymore — new [data-cursor-label] elements just work the moment they
  exist in the DOM.
*/

(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.body.classList.add('custom-cursor-active');

  var label = document.createElement('div');
  label.className = 'cursor-label';
  label.setAttribute('aria-hidden', 'true');
  document.body.appendChild(label);

  var targetX = window.innerWidth / 2;
  var targetY = window.innerHeight / 2;
  var curX = targetX;
  var curY = targetY;
  var hasMoved = false;
  var lastFrame = performance.now();
  var FOLLOW_TAU_MS = 100; // 140 / 1.4 — 1.4x faster tracking (smaller tau = tighter, faster follow)

  // HAND GESTURE CURSORS: over any [data-cursor-gesture="<name>"]
  // element, the dot hides and an animated hand (frames + timing in
  // js/gestures.js) becomes the cursor. The NEAREST such element wins, so
  // a gesture on a button beats the one on the modal around it.
  //   wave       (whole open contact modal) — loops while the mouse
  //              moves; when it stops, finishes the wave it's in and
  //              rests on the last frame (never freezes mid-wave)
  //   thumbs-up  (the modal's Resume button) — plays once, holds
  var GESTURES = window.HandGestures.GESTURES;
  var REDUCE_MOTION = window.HandGestures.REDUCE_MOTION; // hand shows its final frame, doesn't animate
  var GESTURE_IDLE_MS = 250; // looping gestures: no movement this long = finish up and rest

  var hands = window.HandGestures.build('cursor-gesture');
  var gestureEl = hands.el;
  document.body.appendChild(gestureEl);

  var gestureName = null, gesture = null;
  var lastMoveT = 0;
  var frame = 0, frameT = 0;

  function showFrame(i) {
    frame = i;
    hands.show(gestureName, frame);
  }

  function setGesture(name) {
    if (name && !GESTURES[name]) name = null;
    if (name === gestureName) return;
    gestureName = name;
    gesture = name ? GESTURES[name] : null;
    gestureEl.classList.toggle('is-active', !!gesture);
    label.classList.toggle('is-gesture-mode', !!gesture);
    if (!gesture) { hands.show(null); return; }
    var last = gesture.frames.length - 1;
    // looping gestures start at rest; one-shots start at the top
    frameT = performance.now();
    showFrame(gesture.loop || REDUCE_MOTION ? last : 0);
  }

  // Called every animation frame from loop() below.
  function stepGesture(now) {
    if (!gesture || REDUCE_MOTION) return;
    var last = gesture.frames.length - 1;
    if (now - frameT < gesture.frameMs) return;
    if (gesture.loop) {
      var moving = now - lastMoveT < GESTURE_IDLE_MS;
      if (!moving && frame === last) return; // resting
      frameT = now;
      showFrame((frame + 1) % gesture.frames.length);
    } else if (frame < last) {
      frameT = now;
      showFrame(frame + 1);
    }
  }

  window.addEventListener('mousemove', function (e) {
    targetX = e.clientX;
    targetY = e.clientY;
    lastMoveT = performance.now();
    if (!hasMoved) { curX = targetX; curY = targetY; hasMoved = true; }
    label.classList.add('is-visible');
  }, { passive: true });

  // BUG FIX: `mouseleave` never fires on window itself — it has to be
  // the document element. Leaving the browser window now also fully
  // resets the label instead of leaving it expanded at the edge.
  document.documentElement.addEventListener('mouseleave', function () {
    label.classList.remove('is-visible');
    currentTarget = null;
    collapse();
  });

  var currentTarget = null;
  var currentSolidTarget = null;

  function expandFor(el) {
    var text = el.getAttribute('data-cursor-label');
    if (!text) return;
    label.textContent = text;
    label.style.backgroundColor = el.getAttribute('data-cursor-fill') || '';
    label.style.color = el.getAttribute('data-cursor-text') || '';
    label.classList.add('is-expanded');
  }

  // BUG FIX: collapse() used to only remove .is-expanded and leave the
  // old label text in the element — the resting 10px dot has no room
  // for it, so "ART DIRECTION"/"MOTION"/etc. kept rendering beside the
  // dot everywhere after leaving a paper. The text MUST be cleared here
  // (and .cursor-label also clips overflow in components.css as a
  // second guard), so the resting cursor is only ever the plain dot.
  function collapse() {
    label.textContent = '';
    label.classList.remove('is-expanded');
    label.style.backgroundColor = '';
    label.style.color = '';
  }

  function loop(now) {
    var dt = now - lastFrame;
    lastFrame = now;
    var ease = 1 - Math.exp(-dt / FOLLOW_TAU_MS);
    curX += (targetX - curX) * ease;
    curY += (targetY - curY) * ease;
    label.style.left = curX + 'px';
    label.style.top = curY + 'px';
    gestureEl.style.left = curX + 'px';
    gestureEl.style.top = curY + 'px';

    if (hasMoved) {
      // Hit-test at the REAL pointer position, not the eased/lagging dot
      // position — otherwise the label lingers on a paper for a beat
      // after the mouse has actually left it.
      var hit = document.elementFromPoint(targetX, targetY);

      var target = hit ? hit.closest('[data-cursor-label]') : null;
      if (target !== currentTarget) {
        currentTarget = target;
        if (target) { expandFor(target); } else { collapse(); }
      }

      var gestureTarget = hit ? hit.closest('[data-cursor-gesture]') : null;
      setGesture(gestureTarget ? gestureTarget.getAttribute('data-cursor-gesture') : null);
      stepGesture(now);

      var solidTarget = hit ? hit.closest('[data-cursor-solid]') : null;
      if (solidTarget !== currentSolidTarget) {
        currentSolidTarget = solidTarget;
        label.classList.toggle('is-solid-white', !!solidTarget && solidTarget.getAttribute('data-cursor-solid') === 'white');
      }
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
