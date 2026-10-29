/*
  STUDIO — builds studio.html from js/studio-data.js: the intro line, then
  one labeled group per non-empty group, each a grid of pieces captioned
  with title, medium and year (plus an award note when there is one).
  Every piece opens in the shared viewer (js/viewer.js); each group is
  its own set for the arrow keys.
*/
(function () {
  var data = window.STUDIO || {};
  var root = document.getElementById('studio');
  if (!root) return;

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  if (data.intro) document.querySelector('.page__lede').textContent = data.intro;

  var groups = (data.groups || []).filter(function (g) {
    return g.items && g.items.some(function (i) { return i && i.src; });
  });

  if (!groups.length) {
    root.appendChild(el('p', 'studio__empty', 'New pieces coming soon.'));
    return;
  }

  groups.forEach(function (group) {
    var id = 'studio-' + group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    var sec = el('section', 'studio__group');
    sec.setAttribute('aria-labelledby', id);
    var h = el('h2', 'studio__title', group.name);
    h.id = id;
    sec.appendChild(h);

    var grid = el('div', 'studio__grid');
    grid.setAttribute('data-viewer-group', '');
    group.items.forEach(function (item) {
      if (!item || !item.src) return;
      var details = [item.medium, item.year].filter(Boolean).join(', ');
      var label = [item.title, details].filter(Boolean).join(' · ');

      var fig = el('figure', 'cs-fig');
      var open = el('button', 'cs-fig__open');
      open.type = 'button';
      open.setAttribute('data-viewer', '');
      open.setAttribute('data-src', item.src);
      open.setAttribute('data-alt', item.alt || '');
      open.setAttribute('data-label', label);
      open.setAttribute('aria-label', 'View larger: ' + (item.alt || item.title || 'image'));
      var img = el('img', 'cs-fig__media');
      img.src = item.src;
      img.alt = item.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      open.appendChild(img);
      var icon = el('span', 'cs-fig__icon', 'View');
      icon.setAttribute('aria-hidden', 'true');
      open.appendChild(icon);
      fig.appendChild(open);

      var cap = el('figcaption', 'studio__caption');
      if (item.title) cap.appendChild(el('span', 'studio__name', item.title));
      if (details) cap.appendChild(el('span', 'studio__details', details));
      if (item.award) cap.appendChild(el('span', 'studio__award', item.award));
      fig.appendChild(cap);
      grid.appendChild(fig);
    });
    sec.appendChild(grid);
    root.appendChild(sec);
  });
})();
