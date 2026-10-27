/*
  PROJECT DATA — the single source of truth for every project.
  Shared by both pages, so a path or title only ever lives here:
    - index.html (js/home.js) prints one sheet per HOME_ORDER entry
    - project.html (js/project.js) builds the case study for ?project=<slug>

  ADDING A PROJECT: copy the TEMPLATE below into PROJECTS under a new slug,
  fill in the fields, then add the slug to HOME_ORDER. Order in HOME_ORDER
  drives the homepage, the "02 / 06" counter and the Next Project link.
  A project that's in PROJECTS but NOT in HOME_ORDER is a draft: it isn't
  linked anywhere (open project.html?project=<slug> to preview it).

  Every empty field or section simply doesn't render, so leave out what a
  project doesn't have. Copy rules: no em dashes; placeholders in [brackets].

  IMAGES: every image is { src, alt, label }.
    src    path to the file (jpg/webp, ~1600px on the long side max)
    alt    what the image shows, for screen readers (required)
    label  short visible caption, 2 to 6 words (shown under the image
           and in the lightbox)
  Optional extras on any image:
    video: 'path.mp4'   play a muted loop instead (src is then the poster)
    cutout: true        transparent PNG/WebP: shown whole on a plain print
    large: true         (03 Work only) spans wider in the grid
    position: '30% 50%' which part of the image the crop keeps

  TEMPLATE
  'my-project': {
    title: 'Project Name',
    hook: '[Hook, under 10 words]',
    role: 'Art Direction',                 // required
    disciplines: ['Branding', 'Print'],    // optional, string or list
    duration: '6 weeks',                   // optional, e.g. 'Ongoing'
    status: 'Live',                        // optional: Live / In Production / In Progress / Concept
    collaborators: [],                     // optional
    tools: [],                             // optional
    action: { label: 'View Live Site', url: 'https://...' }, // optional button
    hero: { src: '...', alt: '...' },      // add video: '...' for a moving hero
    home: { image: '...', video: '...' },  // optional homepage cover override (defaults to hero)
    idea: {
      copy: '[Idea, 40 to 60 words]',
      images: [ { src, alt, label }, ... ] // 2 to 4
    },
    friction: {                            // optional; skipped when status is In Progress
      problem: '[One line]',
      response: '[One line]',
      result: '[One line]',
      images: [ ... ]                      // 1 to 2
    },
    work: {
      images: [ ... ],                     // 6 to 12, flag a few large: true
      outcome: '[Outcome line, under 25 words]'
    }
  }
*/
window.HOME_ORDER = [
  'art-direction',
  'boys-club'
];

window.PROJECTS = {
  // ---------- Grassroots Fall 26 ----------
  // TODO(Sadie): the images were sorted into Idea / Work by file order only;
  // move them to where they belong and write the copy, labels and alt text.
  'art-direction': {
    title: 'Grassroots Fall 26',
    hook: '[Hook]',
    role: 'Art Direction',
    status: '', // Live / In Production / In Progress / Concept
    home: { video: 'assets/video/jacket-love-story-thumb.mp4', image: 'assets/case-studies/art-direction/ad-07.jpg' },
    hero: {
      video: 'assets/video/jacket-love-story.mp4',
      src: 'assets/case-studies/art-direction/ad-07.jpg',
      alt: '[Alt text]'
    },
    idea: {
      copy: '[Idea copy, 40 to 60 words]',
      images: [
        { src: 'assets/case-studies/art-direction/ad-01.jpg', alt: '[Alt text]', label: '[Label]' },
        { src: 'assets/case-studies/art-direction/ad-02.jpg', alt: '[Alt text]', label: '[Label]' }
      ]
    },
    work: {
      images: [
        { src: 'assets/case-studies/art-direction/ad-07.jpg', alt: '[Alt text]', label: '[Label]', large: true },
        { src: 'assets/case-studies/art-direction/ad-03.jpg', alt: '[Alt text]', label: '[Label]' },
        { src: 'assets/case-studies/art-direction/ad-04.jpg', alt: '[Alt text]', label: '[Label]' },
        { src: 'assets/case-studies/art-direction/ad-05.jpg', alt: '[Alt text]', label: '[Label]' },
        { src: 'assets/case-studies/art-direction/ad-06.jpg', alt: '[Alt text]', label: '[Label]' }
      ],
      outcome: '[Outcome line]'
    }
  },

  // ---------- Boy's Club ----------
  // TODO(Sadie): same as above, sorted by file order only.
  'boys-club': {
    title: 'Boy’s Club',
    hook: '[Hook]',
    role: 'Brand Identity',
    status: '', // Live / In Production / In Progress / Concept
    // TODO(Sadie): paste the site's address once it's live; the button
    // only shows when url is filled in.
    action: { label: 'View Live Site', url: '' },
    hero: { src: 'assets/case-studies/boys-club/bc-02.jpg', alt: '[Alt text]' },
    idea: {
      copy: '[Idea copy, 40 to 60 words]',
      images: [
        { src: 'assets/case-studies/boys-club/bc-03.jpg', alt: '[Alt text]', label: '[Label]' },
        { src: 'assets/case-studies/boys-club/bc-05.jpg', alt: '[Alt text]', label: '[Label]' }
      ]
    },
    work: {
      images: [
        { src: 'assets/case-studies/boys-club/bc-01.jpg', alt: '[Alt text]', label: '[Label]', large: true },
        { src: 'assets/case-studies/boys-club/bc-04-cutout.webp', alt: '[Alt text]', label: '[Label]', cutout: true },
        { src: 'assets/case-studies/boys-club/bc-06-cutout.webp', alt: '[Alt text]', label: '[Label]', cutout: true },
        { src: 'assets/case-studies/boys-club/bc-07-cutout.webp', alt: '[Alt text]', label: '[Label]', cutout: true },
        { src: 'assets/case-studies/boys-club/bc-08.jpg', alt: '[Alt text]', label: '[Label]' }
      ],
      outcome: '[Outcome line]'
    }
  },

  // ---------- drafts: not in HOME_ORDER, so not linked anywhere ----------
  // TODO(Sadie): fill these in (see TEMPLATE above) and add each to HOME_ORDER.
  'project-03': { title: 'Project Three', hook: '[Hook]', role: '[Role]' },
  'project-04': { title: 'Project Four', hook: '[Hook]', role: '[Role]' },
  'project-05': { title: 'Project Five', hook: '[Hook]', role: '[Role]' },
  'project-06': { title: 'Project Six', hook: '[Hook]', role: '[Role]' }
};
