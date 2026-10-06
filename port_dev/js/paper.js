/*
  PAPER INTERACTION: hover-drift + click-to-front
  ------------------------------------------------
  Works on any element with class="paper" containing a ".paper__inner"
  child (see components.css for why it's split that way). Two behaviors:

  1. HOVER DRIFT — while the cursor moves inside a paper, the paper's
     inner surface drifts a few px AWAY from the cursor (a repulsion,
     not an attraction), signalling "this is a physical, clickable
     object" without fully committing to it yet.

     A paper with data-hover-mode="random" (the project page's draggable
     cluster) gets a DIFFERENT hover behavior instead: once per hover-in,
     pick a random small drift (~12px) in a random direction plus a
     random slight rotation, rather than a continuous cursor-repulsion —
     reads like nudging a loose stack of real paper, not a UI affordance.

  2. CLICK TO FRONT — clicking a paper adds .is-active (promoted to
     --z-paper-active via CSS) and removes it from every other paper on
     the page, so there's only ever one "active/front" paper at a time.
     Pages decide what .is-active ADDITIONALLY means for them (e.g. the
     homepage also uses it to swap each paper's hover-cursor-label for
     "open project" once it's frontmost) by listening for the
     'paper:activate' custom event this module dispatches, rather than
     editing this file.

  Call window.PaperInteraction.refresh() after adding new .paper elements
  to the DOM dynamically.
*/

(function () {
  var DRIFT_MAX_PX = 10;
  var bound = new WeakSet();
  // Starts above every static z-index tier in the CSS (z-dragging is the
  // highest, at 800) so the very first click already wins against
  // anything else on the page; every click after that just counts up.
  var nextZ = 900;

  // Shared by both a plain click AND the start of a real drag (see
  // js/drag.js — RULE: picking a paper up to move it counts as "clicking"
  // it, so it comes to front the instant the drag begins, not just on a
  // plain click). One counter, one code path, so z-ordering always
  // reflects true recency across clicks and drags alike, forever.
  function bringToFront(paper) {
    document.querySelectorAll('.paper.is-active').forEach(function (p) {
      if (p !== paper) p.classList.remove('is-active');
    });
    var wasActive = paper.classList.contains('is-active');
    paper.classList.add('is-active');
    paper.style.zIndex = String(++nextZ);
    paper.dispatchEvent(new CustomEvent('paper:activate', { bubbles: true, detail: { wasActive: wasActive } }));
  }

  function bindOne(paper) {
    if (bound.has(paper)) return;
    bound.add(paper);

    var inner = paper.querySelector('.paper__inner');
    if (!inner) return;

    if (paper.getAttribute('data-hover-mode') === 'random') {
      var RANDOM_DRIFT_PX = 12;
      var RANDOM_ROTATE_DEG = 8;

      paper.addEventListener('mouseenter', function () {
        var angle = Math.random() * Math.PI * 2;
        var dx = Math.cos(angle) * RANDOM_DRIFT_PX;
        var dy = Math.sin(angle) * RANDOM_DRIFT_PX;
        var rot = (Math.random() * 2 - 1) * RANDOM_ROTATE_DEG;
        inner.style.setProperty('--drift-x', dx.toFixed(1) + 'px');
        inner.style.setProperty('--drift-y', dy.toFixed(1) + 'px');
        inner.style.setProperty('--drift-rot', rot.toFixed(1) + 'deg');
      });

      paper.addEventListener('mouseleave', function () {
        inner.style.setProperty('--drift-x', '0px');
        inner.style.setProperty('--drift-y', '0px');
        inner.style.setProperty('--drift-rot', '0deg');
      });
    } else {
      paper.addEventListener('mousemove', function (e) {
        var rect = paper.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = cx - e.clientX;
        var dy = cy - e.clientY;
        var dist = Math.hypot(dx, dy) || 1;
        var nx = dx / dist;
        var ny = dy / dist;
        inner.style.setProperty('--drift-x', (nx * DRIFT_MAX_PX).toFixed(1) + 'px');
        inner.style.setProperty('--drift-y', (ny * DRIFT_MAX_PX).toFixed(1) + 'px');
      }, { passive: true });

      // RULE (homepage papers only): hovering any part of a paper that's
      // actually exposed — the browser only ever fires mouseenter on
      // whichever element is topmost at that point, so this only fires
      // for a visible sliver, never a part hidden under another paper —
      // smoothly lifts it to the very front of z-space, not just a
      // drift. This is what makes a mostly-covered paper (About peeking
      // out from behind the two big ones, say) become fully clickable
      // from a hover anywhere on its exposed edge, not only usable right
      // on that sliver. Deliberately separate from click's bringToFront
      // (no .is-active, no 'paper:activate' event) — but the z-order it
      // sets is KEPT on mouseleave, not reverted: hovering papers 1,2,3,4
      // in that order leaves them stacked 1 (bottom) -> 4 (top), so the
      // stack always reflects hover/click recency via the shared nextZ
      // counter. (These inline z-indexes only compete INSIDE
      // .papers-stage's own stacking context, so 900+ never climbs above
      // the title or nav.) Never touches rotation, only translate
      // (drift) + z-index + a subtle scale/shadow lift, so this
      // interaction can never spin a paper.
      paper.addEventListener('mouseenter', function () {
        paper.style.zIndex = String(++nextZ);
        paper.classList.add('is-hover-front');
      });

      paper.addEventListener('mouseleave', function () {
        inner.style.setProperty('--drift-x', '0px');
        inner.style.setProperty('--drift-y', '0px');
        paper.classList.remove('is-hover-front');
      });
    }

    // Click-to-front applies regardless of hover mode — the random-hover
    // branch above must NOT early-return past this.
    paper.addEventListener('click', function () {
      bringToFront(paper);
    });
  }

  function refresh() {
    document.querySelectorAll('.paper').forEach(bindOne);
  }

  refresh();
  window.PaperInteraction = { refresh: refresh, bringToFront: bringToFront };
})();
