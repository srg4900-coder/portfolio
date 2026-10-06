/*
  FOOTER "QUESTIONS?" BOUNCE
  --------------------------
  Classic DVD-logo-style bounce: "Questions?" drifts in a straight line
  inside .project-footer and reverses direction whenever it hits a wall.
  The WALLS are literally this section's own top/bottom borders and its
  left/right padding edges — not arbitrary numbers — so the bounce always
  stays exactly inside the bounded strip the two lines describe, at any
  breakpoint, without needing separate tuning per screen size.

  Stays a real link to the contact modal the whole time (data-open-contact
  is on the element itself, untouched by any of this) — only its
  position is animated, via transform (not left/top), so this never
  fights with layout or causes reflow on every frame.
*/

(function () {
  var el = document.querySelector('.project-footer__questions');
  var container = document.querySelector('.project-footer');
  if (!el || !container) return;

  // Respect the user's OS-level motion preference — leave it at its
  // static starting spot (left edge, vertically centered) instead of
  // animating forever.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.style.transform = 'translate(0, -50%)';
    el.style.top = '50%';
    return;
  }

  var SPEED_PX_PER_S = 70; // same for both axes, just aimed at a diagonal

  var x = 0;
  var y = 0;
  var vx = SPEED_PX_PER_S;
  var vy = SPEED_PX_PER_S * 0.72; // not a perfect 45° — reads less mechanical
  var initialized = false;
  var lastFrame = null;

  function getMaxXY() {
    var containerRect = container.getBoundingClientRect();
    var elRect = el.getBoundingClientRect();
    // elRect already reflects the current transform, so subtract that
    // back out to get the element's true untransformed size.
    return {
      maxX: Math.max(0, containerRect.width - elRect.width),
      maxY: Math.max(0, containerRect.height - elRect.height)
    };
  }

  function clampIntoBounds() {
    var m = getMaxXY();
    x = Math.min(x, m.maxX);
    y = Math.min(y, m.maxY);
  }

  function frame(now) {
    if (lastFrame === null) lastFrame = now;
    // Clamp dt so a dropped/backgrounded frame can't make the bounce
    // leap across the whole section in one jump when it resumes.
    var dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;

    var m = getMaxXY();

    if (!initialized) {
      // Start near the left wall, vertically centered — "Questions?"
      // used to sit on the right before the swap; this is its new
      // starting corner before it wanders off.
      x = 0;
      y = m.maxY / 2;
      initialized = true;
    }

    x += vx * dt;
    y += vy * dt;

    if (x <= 0) { x = 0; vx = Math.abs(vx); }
    else if (x >= m.maxX) { x = m.maxX; vx = -Math.abs(vx); }

    if (y <= 0) { y = 0; vy = Math.abs(vy); }
    else if (y >= m.maxY) { y = m.maxY; vy = -Math.abs(vy); }

    el.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
  window.addEventListener('resize', clampIntoBounds);
})();
