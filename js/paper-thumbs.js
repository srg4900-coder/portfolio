/*
  HOMEPAGE PAPER THUMBNAILS
  -------------------------
  Builds the contact-sheet grid of thumbnail holders on every category
  paper (Art Direction, UI, Motion) from ONE layout definition, instead
  of the same three-box markup repeated per paper in index.html.

  Which project a paper belongs to comes from its own link
  (href="project.html?project=<slug>"), so there's nothing extra to keep
  in sync. If that project has real media in window.PROJECTS
  (js/projects-data.js), its thumbVideo (a short looping clip) or else
  its FIRST draggable cluster image fills the first holder, turned by
  that project's optional thumbRotate. If the browser blocks autoplay
  (iPhone Low Power Mode), the clip is swapped for that still image. Every other holder stays an empty
  placeholder until real thumbnails exist.

  The holders sit directly on the paper texture (the only thing layered
  on it). Their hover lift is CSS-only and gated on the paper being at
  the front — see .paper.is-front-ready in css/main.css and js/paper.js.
*/
(function () {
  // One entry per holder, in order; 'wide' spans the full row.
  var LAYOUT = ['', '', 'wide'];
  var projects = window.PROJECTS || {};

  // One <img> or looping muted <video>, rotated per thumbRotate.
  function makeMedia(src, rot) {
    var isVideo = /\.mp4$/i.test(src);
    var el = document.createElement(isVideo ? 'video' : 'img');
    el.className = 'paper-grid__img';
    el.src = src;
    if (isVideo) {
      // muted + playsInline are what browsers require to autoplay
      el.muted = true;
      el.loop = true;
      el.autoplay = true;
      el.playsInline = true;
      el.setAttribute('aria-hidden', 'true');
    } else {
      el.alt = '';
    }
    el.draggable = false; // no native image-drag hijacking the paper's own pointer handling
    if (rot) el.style.setProperty('--thumb-rotate', rot + 'deg');
    return el;
  }

  document.querySelectorAll('.paper--category').forEach(function (paper) {
    var grid = paper.querySelector('.paper-grid');
    if (!grid) return;

    var slug = new URL(paper.href, window.location.href).searchParams.get('project');
    var data = projects[slug] || {};
    var image = (data.clusterImages || [])[0];
    var thumb = data.thumbVideo || image;
    var rot = data.thumbRotate || 0;

    LAYOUT.forEach(function (size, i) {
      var box = document.createElement('div');
      box.className = 'paper-grid__box' + (size ? ' paper-grid__box--' + size : '');
      if (i === 0 && thumb) {
        box.classList.add('is-filled');
        // a quarter turn swaps the media's width/height (see css/main.css)
        if (Math.abs(rot) % 180 === 90) box.classList.add('is-quarter-turn');
        var media = makeMedia(thumb, rot);
        box.appendChild(media);

        // Autoplay blocked (e.g. iPhone Low Power Mode rejects play())?
        // Show the project's still image instead of a frozen first frame.
        if (media.tagName === 'VIDEO' && image) {
          var p = media.play();
          if (p && p.catch) {
            p.catch(function (err) {
              if (err && err.name === 'NotAllowedError') {
                box.replaceChild(makeMedia(image, rot), media);
              }
            });
          }
        }
      }
      grid.appendChild(box);
    });
  });
})();
