/*
  PROJECT DATA — the single source of truth for every case study's media.
  Shared by BOTH pages, so an image path only ever lives here:
    - project.html (js/project.js) injects the video + draggable cluster
      images for ?project=<slug>
    - index.html (js/paper-thumbs.js) shows each project's homepage paper
      thumbnail = thumbVideo if set, else the FIRST clusterImages entry
  Add a slug here as each case study's real assets are ready; a slug
  with no entry just shows the plain template / empty thumbnail holders.
*/
window.PROJECTS = {
  'art-direction': {
    title: 'Grassroots Fall 26',
    year: 2026, // shown in the "SG PORTFOLIO SITE — YYYY" line at the top
    video: 'assets/video/jacket-love-story.mp4',
    // Homepage thumbnail: a silent 8s, 640x400 cut of the video above,
    // looped (a separate small file so the homepage never loads the 23MB
    // full video). Without thumbVideo, the first clusterImages entry is used.
    thumbVideo: 'assets/video/jacket-love-story-thumb.mp4',
    // Homepage thumbnail rotation (deg). The Art Direction paper rests
    // rotated -90deg, so +90 turns the image back upright on screen.
    thumbRotate: 90,
    // 6 images for the 6 Failures & Setbacks boxes — filled in document
    // order, left stack then right.
    clusterImages: [
      'assets/case-studies/art-direction/ad-01.jpg',
      'assets/case-studies/art-direction/ad-02.jpg',
      'assets/case-studies/art-direction/ad-03.jpg',
      'assets/case-studies/art-direction/ad-04.jpg',
      'assets/case-studies/art-direction/ad-05.jpg',
      'assets/case-studies/art-direction/ad-06.jpg'
    ],
    // Full-width closing still at the bottom of the page (Thought Process),
    // with a one-line detail that shows on hover (tap on phones).
    finalImage: 'assets/case-studies/art-direction/ad-07.jpg',
    finalCaption: 'Capturing the feeling \u2014 quiet moments make the campaign'
  },

  // ---------- Boy's Club (Art Direction) ----------
  // Lives in the Art Direction category: its homeThumb shows in the Art
  // Direction paper's tall right-hand box on the homepage (slot 2 — the
  // wide bottom holder, which reads as a tall right column once that
  // paper rests turned -90deg), cropped via `position` (object-position:
  // which part of the photo the tall box keeps — the dog and Sadie, plant
  // mostly out of frame). The project page's main image is a separate
  // still (bc-02, the titled campaign frame).
  'boys-club': {
    title: 'Boy\u2019s Club',
    category: 'art-direction',
    primaryImage: 'assets/case-studies/boys-club/bc-02.jpg',
    // The main image opens the live Boy's Club site: hovering it shows a
    // square "OPEN SITE" label (white fill, black text). Empty for now —
    // TODO(Sadie): paste the site's address here once it's set up.
    siteUrl: '',
    // 6 draggables (Failures & Setbacks), in document order. Cut-outs keep
    // their transparent backgrounds (no white box behind them).
    clusterImages: [
      'assets/case-studies/boys-club/bc-03.jpg',
      { src: 'assets/case-studies/boys-club/bc-04-cutout.webp', cutout: true },
      'assets/case-studies/boys-club/bc-05.jpg',
      { src: 'assets/case-studies/boys-club/bc-06-cutout.webp', cutout: true },
      { src: 'assets/case-studies/boys-club/bc-07-cutout.webp', cutout: true },
      'assets/case-studies/boys-club/bc-08.jpg'
    ],
    homeThumb: {
      image: 'assets/case-studies/boys-club/bc-01.jpg',
      slot: 2,
      position: '29% 50%'
    }
  }
};
