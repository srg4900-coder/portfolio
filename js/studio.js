/*
  STUDIO — builds studio.html from js/studio-data.js: the intro line, then
  one unheaded grid per non-empty group, its pieces captioned
  with title, medium and year (plus an award note when there is one).
  Every piece opens in the shared viewer (js/viewer.js); each group is
  its own set for the arrow keys.

  A group marked book: true becomes the SKETCHBOOK instead, set beside the
  first group's pieces (next to the painting). Closed, it's a small black
  book whose cover eases open a little on hover. A click opens it: the book
  grows to a two-page spread (the page below shifts to make room) and the
  cover swings over to the left. Click the right page to turn forward,
  the left page to turn back; one more click past either end closes it
  (front cover = left end). It also closes once the mouse has been off it
  for 2 seconds (on touch, a tap outside it). Keyboard: Enter opens,
  arrow keys turn, Escape closes. Styles: .sketchbook in css/pages.css.
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

  // intro: plain text, with **word** shown bold
  if (data.intro) {
    var lede = document.querySelector('.page__lede');
    data.intro.split(/\*\*(.+?)\*\*/).forEach(function (part, i) {
      if (part) lede.appendChild(i % 2 ? el('strong', '', part) : document.createTextNode(part));
    });
  }

  var groups = (data.groups || []).filter(function (g) {
    return g.items && g.items.some(function (i) { return i && i.src; });
  });
  var books = groups.filter(function (g) { return g.book; });
  groups = groups.filter(function (g) { return !g.book; });

  if (!groups.length && !books.length) {
    root.appendChild(el('p', 'studio__empty', 'New pieces coming soon.'));
    return;
  }

  groups.forEach(function (group) {
    // no group headings: the Studio is one run of work to click through
    var sec = el('section', 'studio__group');
    sec.setAttribute('aria-label', group.name);

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
      img.loading = grid.children.length < 3 ? 'eager' : 'lazy';
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

  // the sketchbook sits in the first group's grid, beside its pieces
  books.forEach(function (group) {
    var grid = root.querySelector('.studio__grid');
    if (!grid) {
      var sec = el('section', 'studio__group');
      sec.setAttribute('aria-label', group.name);
      grid = sec.appendChild(el('div', 'studio__grid'));
      root.appendChild(sec);
    }
    grid.appendChild(sketchbook(group));
  });

  // ---------- entrance ----------
  // every piece rises in after the header, a beat apart (css/pages.css
  // .chunk--piece). The page holds (studio.html's .is-loading) until the
  // font and the first row's images are in, at most ~0.9s, so nothing
  // jumps when an image lands
  var pieces = Array.prototype.slice.call(root.querySelectorAll('.studio__grid > *'));
  pieces.forEach(function (p, k) {
    p.classList.add('chunk', 'chunk--piece');
    p.style.setProperty('--chunk', 3 + k * 1.6);
  });
  var waits = [document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()];
  pieces.slice(0, 3).forEach(function (p) {
    var img = p.querySelector('img[src]');
    if (img && img.decode) waits.push(img.decode().catch(function () {}));
  });
  Promise.race([
    Promise.all(waits),
    new Promise(function (r) { setTimeout(r, 900); })
  ]).then(function () {
    requestAnimationFrame(function () { document.documentElement.classList.remove('is-loading'); });
  });

  // ---------- SKETCHBOOK ----------
  function sketchbook(group) {
    var pages = group.items.filter(function (i) { return i && i.src; });
    var hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var TURN_MS = reduced ? 0 : 900, OPEN_MS = reduced ? 0 : 850, IDLE_MS = 2000;

    var cell = el('div', 'studio__book');
    var book = cell.appendChild(el('div', 'sketchbook'));
    book.tabIndex = 0;
    book.setAttribute('role', 'group');
    book.setAttribute('aria-label', 'Sketchbook, ' + pages.length + ' pages. Enter opens it; arrow keys turn pages; Escape closes.');
    book.setAttribute('data-cursor-label', 'Open');
    book.appendChild(el('div', 'sketchbook__left'));
    var right = book.appendChild(el('div', 'sketchbook__right'));

    var cap = cell.appendChild(el('p', 'studio__caption'));
    cap.appendChild(el('span', 'studio__name', group.name === 'Sketches' ? 'Sketchbook' : group.name));
    var hint = cap.appendChild(el('span', 'studio__details', pages.length + ' pages, click to open'));

    // pages load the first time someone shows interest, not with the page
    var imgs = [];
    var loaded = false;
    function load() {
      if (loaded) return;
      loaded = true;
      imgs.forEach(function (img) { img.src = img.getAttribute('data-src'); });
    }
    function page(item, side) {
      var f = el('div', 'sketchbook__face sketchbook__page sketchbook__page--' + side);
      if (item) {
        var img = f.appendChild(el('img'));
        img.setAttribute('data-src', item.src);
        img.alt = item.alt || '';
        img.decoding = 'async';
        img.draggable = false;
        imgs.push(img);
      }
      return f;
    }
    var leaves = [];
    function leaf(front, back, cls) {
      var l = right.appendChild(el('div', 'sketchbook__leaf' + (cls ? ' ' + cls : '')));
      l.appendChild(front);
      back.classList.add('sketchbook__face--back');
      l.appendChild(back);
      leaves.push(l);
      return l;
    }
    // front cover (black, titled), the pages two to a leaf, the back cover
    var front = el('div', 'sketchbook__face sketchbook__cover');
    front.appendChild(el('span', 'sketchbook__title', 'Sketchbook'));
    front.appendChild(el('span', 'sketchbook__band'));
    leaf(front, el('div', 'sketchbook__face sketchbook__endpaper'), 'sketchbook__leaf--cover');
    for (var i = 0; i < pages.length; i += 2) leaf(page(pages[i], 'right'), page(pages[i + 1], 'left'));
    var backOut = el('div', 'sketchbook__face sketchbook__cover');
    backOut.appendChild(el('span', 'sketchbook__band'));
    leaf(el('div', 'sketchbook__face sketchbook__endpaper'), backOut);

    var flipped = 0;          // leaves turned over to the left (the cover counts)
    var state = 'closed';     // closed | opening | open | closing
    var idle = null;

    // a turned leaf stacks above the ones turned before it; an unturned
    // one above the ones after it; a turning one above everything
    function stack() {
      leaves.forEach(function (l, k) {
        if (!l.classList.contains('is-turning')) l.style.zIndex = k < flipped ? k + 1 : leaves.length * 2 - k;
      });
    }
    function turnLeaf(l, over, fast) {
      l.classList.add('is-turning');
      l.classList.toggle('is-fast', !!fast);
      l.style.zIndex = leaves.length * 3;
      l.classList.toggle('is-flipped', over);
      clearTimeout(l._done);
      l._done = setTimeout(function () {
        l.classList.remove('is-turning', 'is-fast');
        stack();
      }, fast ? TURN_MS / 2 : TURN_MS);
    }

    // sizes: the open spread uses the room its cell has (two pages), the
    // closed book a small cover
    function size() {
      var w = cell.clientWidth;
      if (!w) return;                 // not on the page yet
      book.style.setProperty('--pw-open', Math.floor(Math.min(400, w / 2)) + 'px');
      book.style.setProperty('--pw-closed', Math.floor(Math.min(170, w / 2.2)) + 'px');
    }

    function open() {
      if (state !== 'closed') return;
      load();
      size();
      state = 'opening';
      book.removeAttribute('data-cursor-label');
      book.classList.add('is-open');
      hint.textContent = 'Click a page to turn it';
      setTimeout(function () { flipped = 1; turnLeaf(leaves[0], true); }, reduced ? 0 : 120);
      setTimeout(function () { state = 'open'; }, OPEN_MS);
    }
    function finishClose() {
      book.classList.remove('is-open', 'is-closing-back');
      book.setAttribute('data-cursor-label', 'Open');
      hint.textContent = pages.length + ' pages, click to open';
      state = 'closed';
    }
    // close back toward the front cover: the turned pages riffle back
    // quickly, then the cover swings shut as the book shrinks
    function closeFront() {
      if (state !== 'open') return;
      state = 'closing';
      clearTimeout(idle);
      var k = flipped - 1, step = reduced ? 0 : 70;
      var riffle = function () {
        if (k >= 1) { flipped = k; turnLeaf(leaves[k], false, true); k--; setTimeout(riffle, step); return; }
        flipped = 0;
        turnLeaf(leaves[0], false);
        book.classList.remove('is-open');
        setTimeout(finishClose, OPEN_MS);
      };
      riffle();
    }
    // past the last page: the back cover swings over and the book shrinks
    // shut on that side, then quietly resets to the front cover
    function closeBack() {
      if (state !== 'open') return;
      state = 'closing';
      clearTimeout(idle);
      flipped = leaves.length;
      turnLeaf(leaves[leaves.length - 1], true);
      setTimeout(function () { book.classList.add('is-closing-back'); }, reduced ? 0 : TURN_MS * 0.55);
      setTimeout(function () {
        book.classList.add('no-anim');
        leaves.forEach(function (l) { l.classList.remove('is-flipped', 'is-turning', 'is-fast'); });
        flipped = 0;
        stack();
        finishClose();
        book.getBoundingClientRect();
        book.classList.remove('no-anim');
      }, reduced ? 0 : TURN_MS * 0.55 + OPEN_MS);
    }
    function turn(dir) {
      if (state !== 'open') return;
      if (dir > 0) {
        if (flipped >= leaves.length - 1) return closeBack();
        turnLeaf(leaves[flipped], true);
        flipped++;
      } else {
        if (flipped <= 1) return closeFront();
        flipped--;
        turnLeaf(leaves[flipped], false);
      }
    }

    stack();
    requestAnimationFrame(size);      // once the cell is in the grid
    window.addEventListener('resize', function () { if (state === 'closed') size(); });

    ['pointerenter', 'focus'].forEach(function (ev) { book.addEventListener(ev, load); });
    book.addEventListener('click', function (e) {
      if (state === 'closed') return open();
      // left of the spine turns back, right of it turns forward
      turn(e.clientX < right.getBoundingClientRect().left ? -1 : 1);
    });
    book.addEventListener('keydown', function (e) {
      if (state === 'closed' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
      else if (e.key === 'Escape') closeFront();
    });
    if (hover) {
      book.addEventListener('mouseleave', function () {
        clearTimeout(idle);
        idle = setTimeout(closeFront, IDLE_MS);
      });
      book.addEventListener('mouseenter', function () { clearTimeout(idle); });
    } else {
      document.addEventListener('click', function (e) {
        if (!book.contains(e.target)) closeFront();
      });
    }
    return cell;
  }
})();
