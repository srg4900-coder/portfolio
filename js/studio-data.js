/*
  STUDIO DATA — supplemental work for studio.html (js/studio.js builds the page).

  Each group renders only once it has at least one piece, so empty groups
  never leave a stray heading. A piece:
    {
      src: 'assets/studio/paintings/name.jpg',
      alt: 'What the image shows',          // required, for screen readers
      title: 'Title',
      medium: 'Oil on canvas',
      year: 2025,
      award: ''                             // optional, e.g. 'Best in Show, ...'
    }
  When the first pieces are in, turn on the Studio link in js/nav.js
  (SHOW_STUDIO). Copy rules: no em dashes; placeholders in [brackets].
*/
window.STUDIO = {
  intro: '[One-line intro]',
  groups: [
    { name: 'Paintings', items: [] },
    { name: 'Sketches', items: [] },
    { name: 'Sewing', items: [] }
  ]
};
