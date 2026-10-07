/*
  DRAG & DROP (project page image-box cluster)
  ---------------------------------------------
  Upgrades any element with [data-draggable] to be freely repositionable
  via pointer events (works for mouse, touch, and pen in one code path) —
  but ONLY within its [data-drag-bounds] ancestor (the .project-cluster
  section). It never leaves that section, during the drag or after.

  RULE (enforced here, don't relax this): picking a paper up counts as
  clicking it. The instant a drag crosses the move threshold, it calls
  window.PaperInteraction.bringToFront() — the exact same "front of
  z-space" logic a plain click uses — so a box comes forward AS you start
  dragging it, not just once you release it. This has to stay a single
  shared code path (see js/paper.js's bringToFront) so click and drag
  z-ordering can never drift apart.

  RULE (enforced here, don't relax this): a drag ALWAYS ends cleanly,
  however it ends, and a box dropped anywhere always stays exactly where
  it's dropped — never still tracking the pointer afterward. Concretely:
    - move/end listeners live on WINDOW, not on the element, and are
      attached only while a gesture is actually in progress. Relying on
      element-level listeners + pointer capture alone meant that if
      capture ever silently failed, released off-element, or a stray
      coalesced pointermove arrived after the up/cancel, the element
      could keep "hearing" movement it shouldn't. Window-level listeners
      that are explicitly torn down the moment the gesture ends can't do
      that — there's nothing left attached to misfire.
    - a NEW pointerdown on an element that's already mid-gesture is
      ignored outright (a stray double pointerdown can never spin up a
      second, independent set of listeners on top of a live one).
    - pointerup AND pointercancel both run the exact same cleanup.
  Together this is what makes the interaction loop forever, click after
  click, drag after drag, in any order, without degrading.

  Each box starts out positioned by CSS (left/top as a % of the cluster,
  centered via transform — see css/project.css's "fanned stack" rules).
  The FIRST time a box is actually dragged (not just clicked), it's
  converted once from that percentage+transform system to plain pixel
  left/top with no transform, clamped inside the cluster's own bounds —
  position:absolute the whole time, never :fixed, so a dragged box
  scrolls naturally with the page/section instead of staying stuck to
  the viewport.
*/

(function () {
  var DRAG_THRESHOLD_PX = 4;

  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  function makeDraggable(el) {
    var bounds = el.closest('[data-drag-bounds]');
    if (!bounds) return;

    var gestureActive = false; // RULE: a stray second pointerdown mid-gesture is a no-op

    el.addEventListener('pointerdown', function (e) {
      // ignore right-click / multi-touch gestures, and ignore a pointerdown
      // that lands while this element is already mid-gesture
      if (e.button !== undefined && e.button !== 0) return;
      if (gestureActive) return;
      gestureActive = true;

      var pointerId = e.pointerId;
      var startX = e.clientX;
      var startY = e.clientY;
      var dragging = false;
      var grabOffsetX, grabOffsetY, elW, elH;
      var ended = false;

      try {
        el.setPointerCapture(pointerId);
      } catch (err) {
        // Capture can fail — the window-level listeners below work
        // correctly regardless, so this is a non-issue either way.
      }

      function onMove(e) {
        if (e.pointerId !== pointerId) return;

        var dx = e.clientX - startX;
        var dy = e.clientY - startY;

        if (!dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
          dragging = true;
          el.classList.add('is-dragging');

          // RULE: a drag counts as a click — bring it to front the
          // instant it actually starts moving, via the SAME counter a
          // plain click uses.
          if (window.PaperInteraction) window.PaperInteraction.bringToFront(el);

          // Freeze the box's CURRENT on-screen position into plain
          // cluster-relative pixel left/top, clearing whatever
          // centering/fan transform it had — this only happens once,
          // the first real drag, not on every pointerdown (a plain
          // click-to-front must never alter position/rotation).
          var rect = el.getBoundingClientRect();
          var boundsRect = bounds.getBoundingClientRect();
          elW = rect.width;
          elH = rect.height;
          grabOffsetX = e.clientX - rect.left;
          grabOffsetY = e.clientY - rect.top;

          el.style.position = 'absolute';
          el.style.left = (rect.left - boundsRect.left) + 'px';
          el.style.top = (rect.top - boundsRect.top) + 'px';
          el.style.margin = '0';
          el.style.transform = 'none';
        }

        if (dragging) {
          // Re-measured every move (not cached) so this stays correct
          // even if the page is scrolled mid-drag.
          var boundsRect2 = bounds.getBoundingClientRect();
          var left = e.clientX - grabOffsetX - boundsRect2.left;
          var top = e.clientY - grabOffsetY - boundsRect2.top;
          left = clamp(left, 0, Math.max(0, boundsRect2.width - elW));
          top = clamp(top, 0, Math.max(0, boundsRect2.height - elH));
          el.style.left = left + 'px';
          el.style.top = top + 'px';
        }
      }

      // Shared end-of-gesture cleanup — called on pointerup AND
      // pointercancel, so a drag always gets properly torn down however
      // the browser chooses to end it, and the box stays exactly where
      // it was dropped (never still tracking the pointer afterward,
      // since these listeners are fully removed right here).
      function onEnd(e) {
        if (e.pointerId !== pointerId) return;
        if (ended) return; // pointerup+pointercancel can both fire for one gesture
        ended = true;
        gestureActive = false;

        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onEnd);
        window.removeEventListener('pointercancel', onEnd);
        try {
          el.releasePointerCapture(pointerId);
        } catch (err) {
          // already released/gone — fine to ignore
        }

        if (dragging) {
          el.classList.remove('is-dragging');
          // Stay elevated permanently once moved at least once — within
          // the cluster's own stacking order, so a dropped box doesn't
          // fall back behind a sibling at its new spot. (bringToFront
          // already gave it the true frontmost z-index when the drag
          // started; this just keeps it from ever sinking below a
          // never-dragged sibling's base z-index after that.)
          el.classList.add('was-dragged');

          // Only a completed drag (pointerup) gets a natural trailing
          // click from the browser — a CANCELLED one (pointercancel)
          // generally never does. Arming the suppressor unconditionally
          // was a bug of its own: after a cancelled drag it would sit
          // armed with nothing left to consume it, then silently eat the
          // NEXT real click on this box. Only arm it when a trailing
          // click will actually follow.
          if (e.type === 'pointerup') {
            var suppress = function (ev) {
              ev.stopImmediatePropagation();
              ev.preventDefault();
              el.removeEventListener('click', suppress, true);
            };
            el.addEventListener('click', suppress, true);
            // Belt-and-suspenders: self-disarm shortly after even if no
            // click ever came, so this can never stay armed indefinitely.
            setTimeout(function () {
              el.removeEventListener('click', suppress, true);
            }, 400);
          }
        }
      }

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onEnd);
      window.addEventListener('pointercancel', onEnd);
    });
  }

  function refresh() {
    document.querySelectorAll('[data-draggable]').forEach(function (el) {
      if (el.dataset.dragBound) return;
      el.dataset.dragBound = 'true';
      makeDraggable(el);
    });
  }

  refresh();
  window.DragAndDrop = { refresh: refresh };
})();
