/*
  PROJECT PAGE — page-specific init.

  Reads ?project= and, for any slug with an entry in PROJECTS
  (js/projects-data.js — shared with the homepage thumbnails),
  injects that project's media into the page (right now: a video into
  the first [data-project-media="primary"] box). Title/subtitle/body copy
  are left as the placeholder text for every slug, including the ones
  with real media — that copy is Sadie's to write, not something to
  invent here. Add a new slug's entry to PROJECTS as each case study's
  real assets are ready; a slug with no entry just shows the plain
  template, same as before.

  cursor.js / paper.js / drag.js all auto-init on their own (they run at
  script-load time and query the DOM directly), so nothing else needs to
  happen here for the hover-label, click-to-front, or drag behavior.
*/

(function () {
  var PROJECTS = window.PROJECTS || {}; // js/projects-data.js

  var params = new URLSearchParams(window.location.search);
  var slug = params.get('project');
  if (!slug) return;

  document.body.setAttribute('data-project', slug);

  var data = PROJECTS[slug];
  if (!data) return;

  if (data.year) {
    var yearEl = document.querySelector('.project-year');
    if (yearEl) yearEl.textContent = data.year;
  }

  if (data.title) {
    var titleEl = document.querySelector('.project-title');
    if (titleEl) titleEl.textContent = data.title;
  }

  if (data.video) {
    var box = document.querySelector('[data-project-media="primary"]');
    if (!box) return;

    box.classList.add('project-image--video');
    box.innerHTML = '';

    var video = document.createElement('video');
    video.className = 'project-video';
    video.src = data.video;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';

    var muteBtn = document.createElement('button');
    muteBtn.className = 'project-video__mute';
    muteBtn.setAttribute('data-cursor-solid', 'white');

    // SOUND ON BY DEFAULT, with the button showing. Button states (CSS in
    // css/project.css):
    //   .is-sound-on   playing with sound — button visible, says MUTE
    //   (none)         muted by the visitor — button fades away; hovering
    //                  the video (mouse) or tapping it (touch) brings it
    //                  back, saying UNMUTE
    //   .is-awaiting-sound  see below — button visible, says UNMUTE
    //
    // Browsers only allow autoplay WITH sound after the visitor has
    // interacted with the page (Safari/iPhone essentially never on a fresh
    // load; Chrome sometimes for sites you visit often). So: try playing
    // with sound; if the browser refuses, play muted instead and switch
    // the sound on at the visitor's very first tap/click/keypress anywhere.
    function setMuted(muted) {
      video.muted = muted;
      box.classList.toggle('is-sound-on', !muted);
      box.classList.remove('is-awaiting-sound');
      muteBtn.textContent = muted ? 'UNMUTE' : 'MUTE';
      muteBtn.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
    }

    muteBtn.addEventListener('click', function (e) {
      e.stopPropagation(); // don't let this bubble into any click-to-front/drag handling
      removeGestureListeners();
      setMuted(!video.muted);
      // a real click is a user gesture, so playing with sound is allowed
      // here — resuming explicitly covers browsers that pause on the change
      video.play().catch(function () {});
    });

    // Touch screens have no hover: a tap on the video shows the button
    // for a few seconds instead.
    var PEEK_MS = 3000, peekTimer = null;
    box.addEventListener('touchstart', function () {
      box.classList.add('is-peek');
      clearTimeout(peekTimer);
      peekTimer = setTimeout(function () { box.classList.remove('is-peek'); }, PEEK_MS);
    }, { passive: true });

    // Which events count as a "real" interaction differs by device (a
    // touch only counts on lift, a mouse on press), so listen for all of
    // them and simply TRY: if the browser still refuses, go back to muted
    // and keep waiting for the next one.
    var GESTURES = ['pointerdown', 'pointerup', 'touchend', 'keydown'];
    function unmuteOnFirstGesture(e) {
      if (e.target === muteBtn) return; // the button handles itself
      video.muted = false;
      video.play().then(function () {
        removeGestureListeners();
        setMuted(false);
      }).catch(function () {
        video.muted = true;
        video.play().catch(function () {});
      });
    }
    function removeGestureListeners() {
      GESTURES.forEach(function (t) {
        document.removeEventListener(t, unmuteOnFirstGesture, true);
      });
    }

    setMuted(false);
    box.appendChild(video);
    box.appendChild(muteBtn);

    // Play from 0s, instantly, WITH sound if the browser allows it.
    video.play().catch(function () {
      // Sound refused: play muted now, turn sound on at the first gesture.
      setMuted(true);
      box.classList.add('is-awaiting-sound');
      GESTURES.forEach(function (t) {
        document.addEventListener(t, unmuteOnFirstGesture, true);
      });
      video.play().catch(function () {});
    });
  }

  // Full-width closing image: fills the original wide 16:9 box, cropped
  // to fit (.project-image--filled / .project-image__img in project.css).
  if (data.finalImage) {
    var finalBox = document.querySelector('[data-project-media="final"]');
    if (finalBox) {
      var finalImg = document.createElement('img');
      finalImg.className = 'project-image__img';
      finalImg.src = data.finalImage;
      finalImg.alt = '';
      finalImg.loading = 'lazy';
      finalBox.classList.add('project-image--filled');
      finalBox.insertBefore(finalImg, finalBox.firstChild);
      // Stills keep their hover caption (tap to show on touch, js/touch.js):
      // a quick one-line detail from finalCaption.
      var cap = finalBox.querySelector('.project-image__caption');
      if (cap && data.finalCaption) cap.textContent = data.finalCaption;
    }
  }

  if (data.clusterImages && data.clusterImages.length) {
    var inners = document.querySelectorAll('.cluster-box .paper__inner');
    data.clusterImages.forEach(function (src, i) {
      var inner = inners[i];
      if (!inner) return;
      var img = document.createElement('img');
      img.className = 'cluster-box__img';
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      // BUG FIX: browsers give <img> elements their own native "drag the
      // image out" gesture, which hijacks the pointerdown/move sequence
      // drag.js relies on — this is exactly why dragging broke only on
      // THIS project page (the only one with real <img> content so far;
      // the others are still empty placeholder divs with nothing to hijack
      // the gesture). draggable=false disables that native behavior.
      img.draggable = false;
      inner.appendChild(img);
    });
  }
})();

/*
  PAGE LOAD-IN (every project page, with or without media)
  The top of the page eases in like the homepage: the eyebrow, subtitle,
  first section and first image/video box glide up via .load-rise
  (staggered --load-delay in project.html, CSS-only), and the title
  reveals letter by letter with the homepage title's exact timing
  (js/main.js TITLE_STAGGER_MS / TITLE_LETTER_DURATION_MS: 30ms / 220ms).
  Runs after the block above, so a project's real title is already in.
*/
(function () {
  var title = document.querySelector('.project-title.letter-reveal');
  if (!title) return;
  var STAGGER_MS = 30, DURATION_MS = 220, START_DELAY_MS = 120;
  var text = title.textContent;
  title.textContent = '';
  title.setAttribute('aria-label', text);
  title.style.setProperty('--letter-duration', DURATION_MS + 'ms');
  // Letters are grouped per WORD (nowrap) with real spaces between words,
  // so a long title only ever wraps between words — never mid-word, which
  // loose per-letter inline-blocks would allow on a narrow phone.
  var i = 0;
  text.split(' ').forEach(function (word, w) {
    if (w > 0) title.appendChild(document.createTextNode(' '));
    var wordEl = document.createElement('span');
    wordEl.style.display = 'inline-block';
    wordEl.style.whiteSpace = 'nowrap';
    wordEl.setAttribute('aria-hidden', 'true');
    word.split('').forEach(function (ch) {
      var span = document.createElement('span');
      span.className = 'letter';
      span.textContent = ch;
      span.style.transitionDelay = (START_DELAY_MS + i * STAGGER_MS) + 'ms';
      wordEl.appendChild(span);
      i++;
    });
    i++; // the space between words counts as one beat in the stagger
    title.appendChild(wordEl);
  });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { title.classList.add('is-in'); });
  });
})();

