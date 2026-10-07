/*
  TOUCH STAND-INS (phones/tablets only)
  -------------------------------------
  Touch screens have no cursor and no hover, so the mouse-driven fun
  (cursor labels, hand-gesture cursors, hover lifts) never happens there.
  Each block below is a tap-based stand-in for one of those. Runs only
  when the primary input is touch; does nothing on mouse/trackpad.

    1. LABEL FLASH      tap a paper -> its cursor label pops up above the
                        finger for a moment (homepage)
    2. THUMBNAIL LIFT   a paper's thumbnail holders lift once, staggered,
                        when a tap brings it to the front (homepage)
    3. GENTLE TILT      papers drift slightly as the phone tilts (homepage;
                        iOS asks permission once, on the first paper tap)
    4. CAPTION ON TAP   tap a project image to show its caption (project)
    5. DRAG HINT        "drag" pill over the draggable cluster, fading at
                        the first direct touch inside it (project)
    6. CONTACT HANDS    popup opens -> the wave plays in its corner; tapping
                        Resume -> the thumbs-up plays beside it

  Tap feedback for links/buttons (and the always-long About arrow) is
  CSS-only: see html.is-touch rules in components.css / main.css.
*/
(function () {
  if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  var root = document.documentElement;
  root.classList.add('is-touch');

  function isTouch(e) { return e.pointerType === 'touch' || e.pointerType === 'pen'; }

  // ---------- 1. LABEL FLASH ----------
  var LABEL_MS = 900;
  var flash = document.createElement('div');
  flash.className = 'touch-label';
  flash.setAttribute('aria-hidden', 'true');
  document.body.appendChild(flash);
  var flashTimer = null;

  document.addEventListener('pointerdown', function (e) {
    if (!isTouch(e)) return;
    var target = e.target.closest('[data-cursor-label]');
    // draggables get the drag hint (5) instead of a label
    if (!target || target.closest('[data-draggable]')) return;
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

  // ---------- 3. GENTLE TILT ----------
  var tiltPapers = document.querySelectorAll('.papers-stage .paper__inner');
  if (tiltPapers.length && !window.HandGestures.REDUCE_MOTION) {
    var TILT_MAX_PX = 8;
    var tiltStarted = false;
    var tiltX = 0, tiltY = 0;

    function onOrientation(e) {
      if (e.gamma === null) return;
      // gamma: left/right tilt; beta: front/back (~45deg = how a phone is held)
      tiltX = Math.max(-1, Math.min(1, e.gamma / 30)) * TILT_MAX_PX;
      tiltY = Math.max(-1, Math.min(1, (e.beta - 45) / 30)) * TILT_MAX_PX;
    }

    function applyTilt() {
      tiltPapers.forEach(function (inner) {
        inner.style.setProperty('--drift-x', tiltX.toFixed(1) + 'px');
        inner.style.setProperty('--drift-y', tiltY.toFixed(1) + 'px');
      });
      requestAnimationFrame(applyTilt);
    }

    function startTilt() {
      if (tiltStarted) return;
      tiltStarted = true;
      window.addEventListener('deviceorientation', onOrientation);
      requestAnimationFrame(applyTilt);
    }

    var DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      // iOS: must be asked from a tap — do it on the first paper tap
      document.addEventListener('click', function askOnce(e) {
        if (!e.target.closest('.papers-stage .paper')) return;
        document.removeEventListener('click', askOnce, true);
        DOE.requestPermission().then(function (state) {
          if (state === 'granted') startTilt();
        }).catch(function () {});
      }, true);
    } else if (DOE) {
      startTilt(); // Android: no permission needed
    }
  }

  // ---------- 4. CAPTION ON TAP ----------
  document.addEventListener('click', function (e) {
    var img = e.target.closest('.project-image');
    document.querySelectorAll('.project-image.is-caption-shown').forEach(function (el) {
      if (el !== img) el.classList.remove('is-caption-shown');
    });
    if (img && img.querySelector('.project-image__caption')) img.classList.toggle('is-caption-shown');
  });

  // ---------- 5. DRAG HINT ----------
  var cluster = document.querySelector('.project-cluster');
  if (cluster) {
    var hint = document.createElement('div');
    hint.className = 'drag-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = 'Drag to move';
    cluster.appendChild(hint);
    // only a direct touch inside the section counts — scrolling past doesn't
    cluster.addEventListener('pointerdown', function hide() {
      hint.classList.add('is-gone');
      cluster.removeEventListener('pointerdown', hide);
    });
  }

  // ---------- 6. CONTACT HANDS ----------
  var modal = document.querySelector('.contact-modal');
  var G = window.HandGestures;
  if (modal && G) {
    // Plays `name` through `loops` times (one-shots: once), ending on its
    // last frame. Returns a cancel function.
    function play(stack, name, loops) {
      var cfg = G.GESTURES[name];
      var last = cfg.frames.length - 1;
      var total = G.REDUCE_MOTION ? 0 : (cfg.loop ? loops * cfg.frames.length : cfg.frames.length - 1);
      var step = 0, timer = null;
      stack.show(name, G.REDUCE_MOTION ? last : 0);
      (function next() {
        if (step >= total) { stack.show(name, last); return; }
        timer = setTimeout(function () {
          step++;
          stack.show(name, cfg.loop ? step % cfg.frames.length : Math.min(step, last));
          next();
        }, cfg.frameMs);
      })();
      return function () { clearTimeout(timer); };
    }

    var waveHand = G.build('touch-gesture');
    waveHand.el.classList.add('touch-gesture--corner');
    var thumbHand = G.build('touch-gesture');
    thumbHand.el.classList.add('touch-gesture--resume');
    var stopWave = null, stopThumb = null, thumbTimer = null;

    // the modal's contents are built by contact.js, which runs first
    var paper = modal.querySelector('.contact-modal__paper');
    if (paper) {
      paper.appendChild(waveHand.el);
      paper.appendChild(thumbHand.el);
    }

    new MutationObserver(function () {
      var open = modal.classList.contains('is-open');
      if (stopWave) stopWave();
      waveHand.el.classList.toggle('is-shown', open);
      if (open) stopWave = play(waveHand, 'wave', 2);
      else thumbHand.el.classList.remove('is-shown');
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });

    var resume = modal.querySelector('.contact-modal__resume');
    if (resume) {
      resume.addEventListener('pointerdown', function (e) {
        if (!isTouch(e)) return;
        thumbHand.el.style.left = (resume.offsetLeft + resume.offsetWidth + 8) + 'px';
        thumbHand.el.style.top = (resume.offsetTop + resume.offsetHeight / 2) + 'px';
        if (stopThumb) stopThumb();
        clearTimeout(thumbTimer);
        thumbHand.el.classList.add('is-shown');
        stopThumb = play(thumbHand, 'thumbs-up', 1);
        thumbTimer = setTimeout(function () { thumbHand.el.classList.remove('is-shown'); }, 1600);
      });
    }
  }
})();
