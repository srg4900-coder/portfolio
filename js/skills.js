/*
  SKILLS ROW — About page (data: js/skills-data.js; styles: css/pages.css).

  One even row of app icons, drawn in the same line style as the
  Instagram / LinkedIn icons.

  Computers: hover, focus, or click one and its icon fades as the app's
  name rises in letter by letter (the same swap as "Say hi"), centred
  on the icon; the icons the name covers fade out, and nothing moves.
  Every icon keeps its own hover spot, faded or not. Mouse: back when the
  pointer leaves. Click: back after 2 seconds.

  Phones: each icon has its name printed small beneath it (css/pages.css),
  so tapping does nothing.

  Group order follows the company link (?for=, js/order.js) when one is
  open, else SKILL_GROUPS order.
*/
(function () {
  var host = document.querySelector('[data-skills]');
  var GROUPS = window.SKILL_GROUPS || [];
  if (!host || !GROUPS.length) return;

  // 24 x 24, drawn with a 1.5 line (css/pages.css). Lettered tiles are a
  // rounded square with the app's short name inside.
  var TILE = '<rect x="3" y="3" width="18" height="18" rx="4"/>';
  var tile = function (letters) {
    return TILE + '<text x="12" y="15.4" text-anchor="middle">' + letters + '</text>';
  };
  var ICONS = {
    figma: '<path d="M8.6 2.8H12v6.1H8.6a3.05 3.05 0 0 1 0-6.1zM12 2.8h3.4a3.05 3.05 0 0 1 0 6.1H12zM8.6 8.9H12V15H8.6a3.05 3.05 0 0 1 0-6.1z"/><circle cx="15.4" cy="11.95" r="3.05"/><path d="M8.6 15H12v3.05A3.05 3.05 0 1 1 8.6 15z"/>',
    ai: tile('Ai'),
    ps: tile('Ps'),
    id: tile('Id'),
    ae: tile('Ae'),
    pr: tile('Pr'),
    lr: tile('Lr'),
    firefly: tile('Ff'),
    fusion: tile('F'),
    td: tile('TD'),
    webgl: tile('GL'),
    js: tile('JS'),
    c4d: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18M7.6 7.4a6.5 6.5 0 0 0 9 9"/>',
    arduino: '<path d="M12 12c-1.7-2.3-3-3.4-4.8-3.4a3.4 3.4 0 0 0 0 6.8c1.8 0 3.1-1.1 4.8-3.4s3-3.4 4.8-3.4a3.4 3.4 0 0 1 0 6.8c-1.8 0-3.1-1.1-4.8-3.4z"/><path d="M5.6 12h3.2M15.2 12h3.2M16.8 10.4v3.2"/>',
    mediapipe: '<path d="M12 20.5 7 13l-1.5-6M12 20.5V5M12 20.5 16 13l1.5-5M7 13h9"/><circle class="dot" cx="5.5" cy="7" r="1.3"/><circle class="dot" cx="12" cy="4.5" r="1.3"/><circle class="dot" cx="17.5" cy="7.5" r="1.3"/><circle class="dot" cx="12" cy="20.5" r="1.3"/>',
    comfy: '<rect x="3" y="4.5" width="7.5" height="6" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="6" rx="1.5"/><path d="M10.5 7.5c4.5 0 -1.5 9 3 9"/>',
    framer: '<path d="M6.5 3h11v6h-5.5zM6.5 9H12l5.5 6h-11zM6.5 15H12v6z"/>',
    weave:'<path d="M3 8c3 0 3 8 6 8s3-8 6-8 3 8 6 8M3 16c3 0 3-8 6-8s3 8 6 8 3-8 6-8"/>',
    claude: '<path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21M5.6 5.6l3.9 3.9M14.5 14.5l3.9 3.9M5.6 18.4l3.9-3.9M14.5 9.5l3.9-3.9"/>',
    midjourney: '<path d="M11 3.5v13.5M11 4.5c3.2 3 5.2 7 5.2 12.5H11M9.2 7C7.4 9.6 6.4 12.8 6.4 17h2.8M4 19.5h16"/>',
    banana: '<path d="M6.2 5.2C5.4 12.4 10.2 18 18.6 18c.8 0 1.3-.7.9-1.3C13 16.4 8.6 11.8 8.2 5.2z"/><path d="M6.2 5.2 6.6 3.6"/>'
  };

  var mouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var phone = window.matchMedia('(max-width: 760px)');   // phones: labels instead of the swap
  var list = document.createElement('ul');
  list.className = 'skills';
  host.appendChild(list);

  function ordered(order) {
    var byId = {};
    GROUPS.forEach(function (g) { byId[g.id] = g; });
    var seen = {};
    var out = [];
    (order || []).concat(GROUPS.map(function (g) { return g.id; })).forEach(function (id) {
      if (byId[id] && !seen[id]) { seen[id] = true; out.push(byId[id]); }
    });
    return out;
  }

  function render(order) {
    list.innerHTML = '';
    ordered(order).forEach(function (group) {
      group.items.forEach(function (item) {
        if (item.hide || !ICONS[item.icon]) return;
        list.appendChild(skill(item));
      });
    });
    requestAnimationFrame(measure);
  }

  function skill(item) {
    var li = document.createElement('li');
    li.className = 'skill';
    var btn = li.appendChild(document.createElement('button'));
    btn.type = 'button';
    btn.className = 'skill__btn';
    btn.setAttribute('aria-label', item.name);
    var icon = btn.appendChild(document.createElement('span'));
    icon.className = 'skill__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<svg viewBox="0 0 24 24">' + ICONS[item.icon] + '</svg>';
    var name = btn.appendChild(document.createElement('span'));
    name.className = 'skill__name is-below';
    name.setAttribute('aria-hidden', 'true');
    item.name.split('').forEach(function (ch, k) {
      var c = name.appendChild(document.createElement('span'));
      c.textContent = ch;
      c.style.setProperty('--i', k);
    });
    // phones only: the name in small print under the icon (css/pages.css)
    var label = li.appendChild(document.createElement('span'));
    label.className = 'skill__label';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = item.name;
    return li;
  }

  // each name's width, for centring it (after the font is in)
  function measure() {
    list.querySelectorAll('.skill__name').forEach(function (n) { n._w = n.scrollWidth; });
  }

  // ---------- show / hide ----------
  var active = null, timer = null;

  function show(li) {
    if (phone.matches) return;   // phones: every icon is labelled already, no swap
    if (active === li) return;
    if (active) hide(active);
    active = li;
    var name = li.querySelector('.skill__name');
    var icon = li.querySelector('.skill__icon');
    // letters rise in from below, left to right; the icon fades
    name.classList.add('is-still', 'is-below');
    name.classList.remove('is-above');
    name.getBoundingClientRect();
    name.classList.remove('is-still', 'is-below');
    icon.classList.add('is-out');
    li.classList.add('is-active');
    fadeAround(li, name);
  }

  function hide(li) {
    var name = li.querySelector('.skill__name');
    name.classList.add('is-above');
    li.querySelector('.skill__icon').classList.remove('is-out');
    li.classList.remove('is-active');
    if (active === li) {
      active = null;
      list.querySelectorAll('.skill').forEach(function (s) { s.classList.remove('is-faded'); });
    }
  }

  // The name sits centred on its own icon; the icons it covers on that
  // line fade out while it shows. Nothing moves.
  function fadeAround(li, name) {
    var PAD = 6;
    var btn = li.querySelector('.skill__btn');
    var w = name._w || name.scrollWidth;
    var textLeft = btn.offsetLeft + btn.offsetWidth / 2 - w / 2;
    name.style.left = (textLeft - btn.offsetLeft) + 'px';
    Array.prototype.forEach.call(list.children, function (s) {
      var b = s.querySelector('.skill__btn');
      var hit = s !== li && s.offsetTop === li.offsetTop &&
        b.offsetLeft < textLeft + w + PAD && b.offsetLeft + b.offsetWidth > textLeft - PAD;
      s.classList.toggle('is-faded', hit);
    });
  }

  list.addEventListener('click', function (e) {
    var li = e.target.closest('.skill');
    if (!li) return;
    show(li);
    clearTimeout(timer);
    timer = setTimeout(function () { if (active === li) hide(li); }, 2000);
  });
  if (mouse) {
    list.addEventListener('mouseover', function (e) {
      var li = e.target.closest('.skill');
      if (li) { clearTimeout(timer); show(li); }
    });
    list.addEventListener('mouseleave', function () {
      clearTimeout(timer);
      if (active) hide(active);
    });
  }
  list.addEventListener('focusin', function (e) {
    var li = e.target.closest('.skill');
    if (li && e.target.matches(':focus-visible')) show(li);
  });
  list.addEventListener('focusout', function (e) {
    if (!list.contains(e.relatedTarget) && active) hide(active);
  });
  window.addEventListener('resize', function () { if (active) hide(active); measure(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  // the company link's order, when there is one (else the default)
  render(null);
  var po = window.PortfolioOrder;
  if (po && po.key && po.skills) {
    po.skills.then(function (order) {
      if (order && order.length && !active) render(order);
    });
  }
})();
