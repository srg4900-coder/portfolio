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
