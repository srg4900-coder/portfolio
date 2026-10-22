/*
  PROJECT DATA — the single source of truth for every project.
  Shared by both pages, so a path or title only ever lives here:
    - index.html (js/home.js) lays out one printed "sheet" per entry in
      HOME_ORDER, using each project's `home` block
    - project.html (js/project.js) builds the case study for ?project=<slug>

  HOME SHEET FIELDS (all optional except title):
    title       sheet caption + project page title
    role        small mono line under the caption (e.g. 'Art Direction')
    home.image  cover image (jpg/webp, ~1600px on the long side max)
    home.video  short silent loop instead of an image (mp4, <2MB)
    home.ratio  sheet proportion, width / height (default 4 / 5)
    home.size   'l' | 'm' | 's' — sheet width within its column (default 'm')
    home.position  object-position crop, e.g. '30% 50%'
  A project with no image/video prints as a plain title card.
*/
window.HOME_ORDER = [
  'art-direction',
  'boys-club',
  'project-03',
  'project-04',
  'project-05',
  'project-06'
];

window.PROJECTS = {
  'art-direction': {
    title: 'Grassroots Fall 26',
    role: 'Art Direction',
    home: { video: 'assets/video/jacket-love-story-thumb.mp4', image: 'assets/case-studies/art-direction/ad-07.jpg', ratio: 4 / 5, size: 'l' },
    year: 2026, // shown in the "SG PORTFOLIO SITE — YYYY" line at the top
    video: 'assets/video/jacket-love-story.mp4',
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
  'boys-club': {
    title: 'Boy\u2019s Club',
    role: 'Brand Identity',
    home: { image: 'assets/case-studies/boys-club/bc-02.jpg', ratio: 16 / 10, size: 'm' },
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
    ]
  },

  // ---------- placeholders — TODO(Sadie): replace with real projects ----------
  'project-03': { title: 'Project Three', role: 'Category', home: { ratio: 3 / 2, size: 's' } },
  'project-04': { title: 'Project Four', role: 'Category', home: { ratio: 4 / 5, size: 'm' } },
  'project-05': { title: 'Project Five', role: 'Category', home: { ratio: 1, size: 'm' } },
  'project-06': { title: 'Project Six', role: 'Category', home: { ratio: 3 / 4, size: 'l' } }
};
