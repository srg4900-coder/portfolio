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

  // Every thumbnail a paper shows, by holder slot. The paper's own project
  // (its link) fills slot 0; other projects in the SAME category
  // (category: '<paper slug>' in projects-data.js) add their homeThumb at
  // its slot — e.g. Boy's Club in Art Direction's tall right-hand box.
  // Each filled holder opens ITS project (data-href, see index.html).
  function thumbsFor(slug) {
    var list = [];
    var own = projects[slug] || {};
    var ownImage = (own.clusterImages || [])[0];
    if (own.thumbVideo || ownImage) {
      list.push({ slot: 0, src: own.thumbVideo || ownImage, still: ownImage, slug: slug });
    }
    Object.keys(projects).forEach(function (key) {
      var proj = projects[key];
      if (key === slug || proj.category !== slug || !proj.homeThumb) return;
      list.push({
        slot: proj.homeThumb.slot,
        src: proj.homeThumb.image,
        position: proj.homeThumb.position,
        slug: key
      });
    });
    return list;
  }

  document.querySelectorAll('.paper--category').forEach(function (paper) {
    var grid = paper.querySelector('.paper-grid');
    if (!grid) return;

    var slug = new URL(paper.href, window.location.href).searchParams.get('project');
    // rotation belongs to the PAPER (how it rests), so every thumb on it shares it
    var rot = (projects[slug] || {}).thumbRotate || 0;
    var thumbs = thumbsFor(slug);

    LAYOUT.forEach(function (size, i) {
      var box = document.createElement('div');
      box.className = 'paper-grid__box' + (size ? ' paper-grid__box--' + size : '');
      var thumb = thumbs.filter(function (t) { return t.slot === i; })[0];
      if (thumb) {
        box.classList.add('is-filled');
        box.setAttribute('data-href', 'project.html?project=' + thumb.slug);
        // a quarter turn swaps the media's width/height (see css/main.css)
        if (Math.abs(rot) % 180 === 90) box.classList.add('is-quarter-turn');
        var media = makeMedia(thumb.src, rot);
        // crop framing for this holder (object-fit: cover, so this picks
        // which part of the photo shows) — one image file, no separate crop
        if (thumb.position) media.style.objectPosition = thumb.position;
        box.appendChild(media);

        // Autoplay blocked (e.g. iPhone Low Power Mode rejects play())?
        // Show the project's still image instead of a frozen first frame.
        if (media.tagName === 'VIDEO' && thumb.still) {
          var p = media.play();
          if (p && p.catch) {
            p.catch(function (err) {
              if (err && err.name === 'NotAllowedError') {
                box.replaceChild(makeMedia(thumb.still, rot), media);
              }
            });
          }
        }
      }
      grid.appendChild(box);
    });
  });
})();
