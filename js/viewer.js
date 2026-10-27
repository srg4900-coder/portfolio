/*
  IMAGE VIEWER (lightbox) — shared by case studies and Studio.

  Any element with [data-viewer] opens it on click (delegated, so items
  built later just work). The element carries what to show:
    data-src     image (or the poster, for a video)
    data-video   optional mp4, played with controls
    data-alt     alt text
    data-label   caption shown under the image
  Items inside the same [data-viewer-group] are one set: the arrows step
  through that set and loop at the ends.

  Keyboard: Esc closes, Left/Right step, Tab stays inside the viewer, and
  focus goes back to the image that opened it. Touch: swipe left/right
  to step. Named "viewer" because .lightbox is already the homepage frame.
*/
(function () {
  var items = [], index = 0, opener = null;

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  var root = el('div', 'viewer');
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Image viewer');
  root.hidden = true;

  var closeBtn = el('button', 'viewer__close', 'Close ✕');
  var prevBtn = el('button', 'viewer__step viewer__step--prev');
  var nextBtn = el('button', 'viewer__step viewer__step--next');
  prevBtn.innerHTML = '<span aria-hidden="true">←</span>';
  nextBtn.innerHTML = '<span aria-hidden="true">→</span>';
  prevBtn.setAttribute('aria-label', 'Previous image');
  nextBtn.setAttribute('aria-label', 'Next image');
  [closeBtn, prevBtn, nextBtn].forEach(function (b) {
    b.type = 'button';
    b.setAttribute('data-cursor-solid', 'white');
  });

  var stage = el('div', 'viewer__stage');
  var caption = el('p', 'viewer__caption text-label');
  var label = el('span', 'viewer__label');
  var count = el('span', 'viewer__count');
  caption.appendChild(label);
  caption.appendChild(count);
  caption.setAttribute('aria-live', 'polite');

  root.appendChild(closeBtn);
  root.appendChild(prevBtn);
  root.appendChild(stage);
  root.appendChild(nextBtn);
  root.appendChild(caption);
  document.body.appendChild(root);

  function show(i) {
    index = (i + items.length) % items.length;
    var item = items[index];
    stage.innerHTML = '';
    var media;
    if (item.getAttribute('data-video')) {
      media = document.createElement('video');
      media.src = item.getAttribute('data-video');
      media.poster = item.getAttribute('data-src') || '';
      media.controls = true;
      media.autoplay = true;
      media.loop = true;
      media.playsInline = true;
      media.setAttribute('aria-label', item.getAttribute('data-alt') || '');
    } else {
      media = document.createElement('img');
      media.src = item.getAttribute('data-src');
      media.alt = item.getAttribute('data-alt') || '';
    }
    media.className = 'viewer__media';
    stage.appendChild(media);
    label.textContent = item.getAttribute('data-label') || '';
    count.textContent = items.length > 1 ? (index + 1) + ' / ' + items.length : '';
    var many = items.length > 1;
    prevBtn.hidden = !many;
    nextBtn.hidden = !many;
  }

  function open(trigger) {
    var group = trigger.closest('[data-viewer-group]');
    items = group ? Array.prototype.slice.call(group.querySelectorAll('[data-viewer]')) : [trigger];
    opener = trigger;
    show(items.indexOf(trigger));
    root.hidden = false;
    document.documentElement.classList.add('is-viewer-open');
    requestAnimationFrame(function () { root.classList.add('is-open'); });
    closeBtn.focus();
  }

  function close() {
    if (root.hidden) return;
    root.classList.remove('is-open');
    root.hidden = true;
    stage.innerHTML = ''; // stops any video
    document.documentElement.classList.remove('is-viewer-open');
    if (opener) opener.focus();
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-viewer]');
    if (trigger) { e.preventDefault(); open(trigger); }
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(index - 1); });
  nextBtn.addEventListener('click', function () { show(index + 1); });
  // a click on the dark backdrop (not the image or a control) closes
  root.addEventListener('click', function (e) {
    if (e.target === root || e.target === stage) close();
  });

  document.addEventListener('keydown', function (e) {
    if (root.hidden) return;
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
    else if (e.key === 'ArrowLeft' && items.length > 1) show(index - 1);
    else if (e.key === 'ArrowRight' && items.length > 1) show(index + 1);
    else if (e.key === 'Tab') {
      // keep focus inside the viewer
      var focusable = Array.prototype.filter.call(
        root.querySelectorAll('button, video'),
        function (n) { return !n.hidden; }
      );
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, true);

  // swipe left/right on touch screens
  var startX = null, startY = null;
  stage.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { startX = null; return; }
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (startX === null || items.length < 2) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
