/*
  PAPER INTERACTION: hover nudge + click-to-front (case study 01 Idea)
  --------------------------------------------------------------------
  Works on any element with class="paper" containing a ".paper__inner"
  child (components.css explains the split: .paper owns WHERE a sheet
  sits, .paper__inner owns how it reacts). Restored from the earlier
  project-page cluster, trimmed to what the Idea papers use:

  1. HOVER NUDGE: once per hover-in, a small random drift (~12px) in a
     random direction plus a slight random rotation, like nudging a loose
     stack of real paper. Settles back on mouseleave.

  2. CLICK TO FRONT: clicking a paper adds .is-active and raises it above
     every other paper, so there's only ever one front paper. Dispatches
     'paper:activate' (detail: { wasActive, source }) so the page decides
     what else a click means (js/project.js: a click on the paper that was
     ALREADY in front opens it in the viewer).

  bringToFront is the ONE place z-order changes. js/drag.js calls it the
  instant a drag starts (picking a paper up counts as clicking it), with
  source 'drag', so click and drag stacking can never drift apart. The
  inline z-indexes only compete inside .cs-papers (isolation: isolate in
  css/project.css), so they never climb above the nav.

  window.PaperInteraction.refresh() binds papers added later;
  setFront(paper) marks a paper as the front one without an event.
*/
(function () {
  var RANDOM_DRIFT_PX = 12;
  var RANDOM_ROTATE_DEG = 6;
  var bound = new WeakSet();
  var nextZ = 100;
  var topPaper = null;

  function raise(paper) {
    if (topPaper === paper) return;
    paper.style.zIndex = String(++nextZ);
    topPaper = paper;
  }

  function setFront(paper) {
    document.querySelectorAll('.paper.is-active').forEach(function (p) {
      if (p !== paper) p.classList.remove('is-active');
    });
    paper.classList.add('is-active');
    raise(paper);
  }

  function bringToFront(paper, source) {
    var wasActive = paper.classList.contains('is-active');
    setFront(paper);
    paper.dispatchEvent(new CustomEvent('paper:activate', {
      bubbles: true,
      detail: { wasActive: wasActive, source: source || 'click' }
    }));
  }

  function bindOne(paper) {
    if (bound.has(paper)) return;
    bound.add(paper);
    var inner = paper.querySelector('.paper__inner');
    if (!inner) return;

    paper.addEventListener('mouseenter', function () {
      if (paper.classList.contains('is-dragging')) return;
      var angle = Math.random() * Math.PI * 2;
      inner.style.setProperty('--drift-x', (Math.cos(angle) * RANDOM_DRIFT_PX).toFixed(1) + 'px');
      inner.style.setProperty('--drift-y', (Math.sin(angle) * RANDOM_DRIFT_PX).toFixed(1) + 'px');
      inner.style.setProperty('--drift-rot', ((Math.random() * 2 - 1) * RANDOM_ROTATE_DEG).toFixed(1) + 'deg');
    });
    paper.addEventListener('mouseleave', function () {
      inner.style.setProperty('--drift-x', '0px');
      inner.style.setProperty('--drift-y', '0px');
      inner.style.setProperty('--drift-rot', '0deg');
    });

    paper.addEventListener('click', function () { bringToFront(paper, 'click'); });
  }

  function refresh() {
    document.querySelectorAll('.paper').forEach(bindOne);
  }

  refresh();
  window.PaperInteraction = { refresh: refresh, bringToFront: bringToFront, setFront: setFront };
})();
