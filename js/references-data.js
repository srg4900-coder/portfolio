/*
  REFERENCES — the little papers on the homepage desk (js/home.js).
  Notes, sketches, images that say something about Sadie as a designer.
  At the top of the page they're scattered on the light box (one under the
  first print, one peeking in from the right, the rest off screen); on
  scroll they tuck in BEHIND the project prints, peeking out at the edges.

  Each reference:
    type      'image' or 'note'
    src, alt  (image) the file and what it shows
    text      (note) a short line; no em dashes; [brackets] = placeholder
    width     size as a share of the print it tucks behind (0.2 to 0.4)
    behind    which print it tucks behind: 0 = first project, 1 = second...
    at        [x, y] where it sits relative to that print, as a share of
              the print's width / height (negative or > 1 peeks outside)
    tilt      resting rotation in degrees
    start     [x, y] at the top of the page, as a share of the screen
              (x > 1 = waiting off screen right)

  TODO(Sadie): swap the [bracketed] notes for your own lines, and add or
  replace images (keep them small: ~800px on the long side).
*/
window.REFERENCES = [
  {
    type: 'image',
    src: 'assets/studio/paintings/master-work.jpg',
    alt: 'Pastel master study of a moonlit river city',
    width: 0.36, behind: 0, at: [-0.08, 0.66], tilt: -5,
    start: [0.40, 0.80]
  },
  {
    type: 'note',
    text: '[A line about how you work]',
    width: 0.26, behind: 1, at: [0.80, -0.10], tilt: 6,
    start: [0.95, 0.60]
  },
  {
    type: 'image',
    src: 'assets/case-studies/grassroots/gr-storyboard-scenic-outlook.jpg',
    alt: 'Blue-ink storyboard sketch: a couple by a car at a scenic outlook',
    width: 0.28, behind: 2, at: [0.80, 0.58], tilt: 4,
    start: [1.12, 0.30]
  },
  {
    type: 'note',
    text: '[Something you notice that others miss]',
    width: 0.24, behind: 3, at: [-0.12, 0.70], tilt: -6,
    start: [1.20, 0.72]
  },
  {
    type: 'image',
    src: 'assets/case-studies/grassroots/idea/gr-jacket-lining.jpg',
    alt: 'Gingham lining of the green Grassroots jacket',
    width: 0.22, behind: 0, at: [0.74, -0.14], tilt: 8,
    start: [1.30, 0.12]
  }
];
