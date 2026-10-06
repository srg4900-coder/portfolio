/*
  PROJECT PAGE — page-specific init.

  Reads ?project= and, for any slug with an entry in PROJECTS below,
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
  var PROJECTS = {
    'art-direction': {
      title: 'Grassroots Fall 26',
      video: 'assets/video/jacket-love-story.mp4',
      // 5 images for the 6 Failures & Setbacks boxes (one stays an empty
      // placeholder) — filled in document order, left stack then right.
      clusterImages: [
        'assets/case-studies/art-direction/ad-01.jpg',
        'assets/case-studies/art-direction/ad-02.jpg',
        'assets/case-studies/art-direction/ad-03.jpg',
        'assets/case-studies/art-direction/ad-04.jpg',
        'assets/case-studies/art-direction/ad-05.jpg'
      ]
    }
  };

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
    // muted is REQUIRED for any browser to autoplay at all (Chrome/Safari/
    // Firefox all block unmuted autoplay outright) — there's no way around
    // this from the page's side, so sound starts off and the mute button
    // (defaulting to an "unmute" state) is how a visitor turns it on.
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';

    var muteBtn = document.createElement('button');
    muteBtn.className = 'project-video__mute';
    muteBtn.setAttribute('data-cursor-solid', 'white');
    muteBtn.setAttribute('aria-label', 'Unmute video');
    muteBtn.textContent = 'UNMUTE';

    muteBtn.addEventListener('click', function (e) {
      e.stopPropagation(); // don't let this bubble into any click-to-front/drag handling
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? 'UNMUTE' : 'MUTE';
      muteBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
      // Belt-and-suspenders: a real click is a user gesture, so playing
      // with sound is always allowed here — but explicitly resuming
      // covers any browser that pauses on the muted-state change itself.
      video.play().catch(function () {});
    });

    box.appendChild(video);
    box.appendChild(muteBtn);

    // Play from 0s, instantly — autoplay normally handles this on its
    // own, but calling play() explicitly (ignoring the promise it
    // returns) covers browsers that need a nudge once the element has
    // just been inserted into the DOM.
    video.play().catch(function () {});
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
