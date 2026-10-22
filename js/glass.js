/*
  GLASS LAYER — real refraction on the light-box edges (Chromium only:
  it's the one engine that runs SVG filters inside backdrop-filter;
  Safari/Firefox keep the static look from css/components.css).

  Each of the four .lightbox edges gets its own SVG filter:
    1. feImage loads a displacement map: a 1px-wide gradient stretched
       along the edge. Its value says how far inward to sample the content
       behind the glass. Strongest at the outer lip and falling off fast
       (a curved bevel), so the paper surface is pulled out over the dark
       stroke at the lip and the stroke itself is squeezed into a band
       just inside it — the Figma Glass edge.
    2. Three feDisplacementMaps, one per color channel, with slightly
       different strengths = dispersion (warm/cool fringes on the band).
    3. A light blur = frost.
  Maps are rebuilt on resize because the frame width is fluid.
*/
(function () {
  var box = document.querySelector('.lightbox');
  if (!box) return;
  var ua = navigator.userAgent;
  // Chromium on desktop/Android (iOS browsers are all WebKit underneath)
  var chromium = /Chrome\/\d+/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  if (!chromium) return;

  // tuned from the Figma Glass settings
  var REFRACTION = 1.5;    // how far (x frame width) the lip pulls content outward
  var REACH = 1.0;         // how far in (x frame width) the bevel curve reaches
  var DISPERSION = [1, 1.025, 1.05]; // R, G, B strength multipliers
  var FROST = 1.6;         // blur, px

  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  document.body.appendChild(svg);

  // gradient strip: index 0 = outer lip. `axis` picks the channel (R = x, G = y),
  // `sign` the direction of "inward" for that edge.
  function mapURL(len, frame, axis, sign, vertical) {
    var c = document.createElement('canvas');
    c.width = vertical ? 1 : len;
    c.height = vertical ? len : 1;
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(c.width, c.height);
    var reach = frame * REACH;
    for (var d = 0; d < len; d++) {
      var t = d < reach ? 1 - d / reach : 0;
      var f = t * t;                          // 0..1, curved falloff
      var v = Math.round(128 + sign * 127 * f);
      // pixel order along the strip: outer lip first for top/left, last for bottom/right
      var idx = (sign > 0 ? d : len - 1 - d) * 4;
      img.data[idx]     = axis === 'x' ? v : 128;
      img.data[idx + 1] = axis === 'y' ? v : 128;
      img.data[idx + 2] = 128;
      img.data[idx + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }

  function channel(i) {
    // keep one channel of a displaced copy
    var m = ['1 0 0 0 0', '0 1 0 0 0', '0 0 1 0 0'];
    var rows = [0, 1, 2].map(function (r) { return r === i ? m[i] : '0 0 0 0 0'; });
    return rows.join(' ') + ' 0 0 0 1 0';
  }

  function filter(id, url, w, h, scale, axis) {
    var parts = DISPERSION.map(function (k, i) {
      return '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + (scale * k).toFixed(1) +
        '" xChannelSelector="' + (axis === 'x' ? 'R' : 'B') + '" yChannelSelector="' + (axis === 'y' ? 'G' : 'B') + '" result="d' + i + '"/>' +
        '<feColorMatrix in="d' + i + '" type="matrix" values="' + channel(i) + '" result="c' + i + '"/>';
    }).join('');
    return '<filter id="' + id + '" x="0" y="0" width="' + w + '" height="' + h + '" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">' +
      '<feImage href="' + url + '" x="0" y="0" width="' + w + '" height="' + h + '" preserveAspectRatio="none" result="map"/>' +
      parts +
      '<feComposite in="c0" in2="c1" operator="arithmetic" k2="1" k3="1" result="rg"/>' +
      '<feComposite in="rg" in2="c2" operator="arithmetic" k2="1" k3="1" result="rgb"/>' +
      '<feGaussianBlur in="rgb" stdDeviation="' + FROST + '"/>' +
      '</filter>';
  }

  function build() {
    var frame = parseFloat(getComputedStyle(box).borderTopWidth) || 20;
    var edge = box.querySelector('i').getBoundingClientRect().height; // top strip thickness
    var W = window.innerWidth, H = window.innerHeight;
    var side = Math.max(1, H - edge * 2);
    // feDisplacementMap: offset = scale * (value/255 - 0.5), so full value (255) moves scale/2
    var scale = frame * REFRACTION * 2;
    svg.innerHTML = '<defs>' +
      filter('glass-t', mapURL(edge, frame, 'y',  1, true),  W, edge, scale, 'y') +
      filter('glass-b', mapURL(edge, frame, 'y', -1, true),  W, edge, scale, 'y') +
      filter('glass-l', mapURL(edge, frame, 'x',  1, false), edge, side, scale, 'x') +
      filter('glass-r', mapURL(edge, frame, 'x', -1, false), edge, side, scale, 'x') +
      '</defs>';
    box.classList.add('is-refracting');
  }

  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(build, 150);
  });
  build();
})();
