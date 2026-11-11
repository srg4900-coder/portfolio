/*
  OPTICAL LEFT ALIGNMENT

  Every letter sits inside its own box with a little empty space on its
  left (the "side bearing"). At label size that space is a fraction of a
  pixel, but at headline size it grows to several: a big "M" or "S" starts
  visibly to the right of the small labels above and below it, even though
  their boxes all start on the same grid line.

  This measures, for each element below, how far the ink of its first
  letter sits from the box edge (in that element's own font and size) and
  pulls the element left by exactly that much. Result: the visible left
  edges of the counter, title, type label and hook line up on the grid line.

  Runs once the fonts are in, and again whenever the window resizes (the
  sizes are fluid). On the homepage it then asks the title animation to
  re-measure (a resize event), so the S and G still land on the logo.
*/
(function () {
  var SELECTORS = [
    // project pages
    '.cs-hero__count', '.cs-hero__name', '.cs-hero__subtitle', '.cs-hero__hook',
    '.cs-section__title', '.cs-group__title',
    // homepage
    '.hero__title > span', '.hero__role',
    // about + studio
    '.page__head .text-title', '.page__lede', '.page__name', '.page__kind'
  ].join(',');

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  if (!ctx || !('actualBoundingBoxLeft' in (ctx.measureText('x') || {}))) return;

  // the first visible character inside el, and the element that styles it
  function firstChar(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      var m = node.nodeValue.match(/\S/);
      if (m) return { ch: m[0], host: node.parentElement };
    }
    return null;
  }

  // px between the box's left edge and where the first letter's ink starts
  function inkInset(el) {
    var f = firstChar(el);
    if (!f) return 0;
    var cs = getComputedStyle(f.host);
    var ch = f.ch;
    if (cs.textTransform === 'uppercase') ch = ch.toUpperCase();
    else if (cs.textTransform === 'lowercase') ch = ch.toLowerCase();
    ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    // actualBoundingBoxLeft: how far the ink reaches LEFT of the pen
    // position; negative when the ink starts to the right of it
    return -ctx.measureText(ch).actualBoundingBoxLeft;
  }

  function apply() {
    var changed = false;
    Array.prototype.forEach.call(document.querySelectorAll(SELECTORS), function (el) {
      var shift = -inkInset(el);
      // only ever a small correction; anything bigger means a bad reading
      if (!isFinite(shift) || Math.abs(shift) > 24) shift = 0;
      var value = shift ? shift.toFixed(2) + 'px' : '';
      if (el.style.marginLeft !== value) {
        el.style.marginLeft = value;
        changed = true;
      }
    });
    return changed;
  }

  var pending = false;
  function run() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      // a real change moves the homepage title: let it re-measure
      if (apply() && document.querySelector('.hero__title')) window.dispatchEvent(new Event('resize'));
    });
  }

  run();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  window.addEventListener('load', run);
  window.addEventListener('resize', run);
})();
