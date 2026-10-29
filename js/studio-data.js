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
  Studio isn't in the main nav on purpose: it's linked from About, under
  the homepage prints and in the footer. Copy rules: no em dashes;
  placeholders in [brackets].
*/
window.STUDIO = {
  intro: '[One-line intro]',
  groups: [
    {
      name: 'Paintings',
      items: [
        {
          src: 'assets/studio/paintings/master-work.jpg',
          alt: 'Color pastel master study: a moonlit river with a domed city and a stone bridge under stormy blue clouds, a lit boat in the foreground',
          title: 'Master study after Camille Roqueplan (1831)',
          medium: 'Color pastel',
          year: 2023,
          award: 'Selected for the RIT Studio Showcase'
        }
      ]
    },
    { name: 'Sketches', items: [] },
    { name: 'Sewing', items: [] }
  ]
};
