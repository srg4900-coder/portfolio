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
  A group with book: true renders as the sketchbook (js/studio.js), one
  piece per page, in page order, beside the first group's pieces.
  Studio isn't in the main nav on purpose: it's linked from the footer and
  the contact popup. Copy rules: no em dashes; placeholders in [brackets].
  In the intro, **word** shows bold.
*/
window.STUDIO = {
  intro: '\u201Cjack of all trades, master of none, but often better than master of **one**\u201D',
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
    {
      name: 'Sketches',
      book: true,   // the sketchbook: each piece is a page, in this order
      items: [
        { src: 'assets/studio/sketches/sketch-01.webp', alt: 'Pencil studies of hands, including a skeletal hand' },
        { src: 'assets/studio/sketches/sketch-02.webp', alt: 'Flat pattern pieces sketched and numbered 3 to 6' },
        { src: 'assets/studio/sketches/sketch-03.webp', alt: 'Gesture studies of arms, legs and a foot' },
        { src: 'assets/studio/sketches/sketch-04.webp', alt: 'Figure studies: a bent leg and a muscular torso' },
        { src: 'assets/studio/sketches/sketch-05.webp', alt: 'Logo sketches: S marks and apples' },
        { src: 'assets/studio/sketches/sketch-06.webp', alt: 'Rows of S letterform explorations with notes' },
        { src: 'assets/studio/sketches/sketch-07.webp', alt: '\u201C3rd\u201D logo sketches on cups and a carrier' },
        { src: 'assets/studio/sketches/sketch-08.webp', alt: 'Lineups of fashion figures in pen' },
        { src: 'assets/studio/sketches/sketch-09.webp', alt: 'Fashion figures in a crop top, shorts and a tulle skirt' },
        { src: 'assets/studio/sketches/sketch-10.webp', alt: 'Life drawing: standing figures, a leg and a face' },
        { src: 'assets/studio/sketches/sketch-11.webp', alt: 'Loose fashion figures in draped clothing, and a face' },
        { src: 'assets/studio/sketches/sketch-12.webp', alt: 'Loose pencil scene of people gathered outdoors' },
        { src: 'assets/studio/sketches/sketch-13.webp', alt: 'Fashion figures in dresses and a sun hat' },
        { src: 'assets/studio/sketches/sketch-14.webp', alt: 'Figure studies: a man with a staff, a face, a tomato and a crouching figure' },
        { src: 'assets/studio/sketches/sketch-15.webp', alt: 'Graphite study of four figures in T-shirts and shorts' }
      ]
    },
    { name: 'Sewing', items: [] }
  ]
};
