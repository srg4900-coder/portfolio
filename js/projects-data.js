/*
  PROJECT DATA — the single source of truth for every project.
  Shared by every page, so a path or title only ever lives here:
    - index.html (js/home.js) prints one sheet per project, in order
    - project.html (js/project.js) builds the case study for ?project=<slug>

  ORDER: HOME_ORDER is the default order (homepage, "02 / 04" counter,
  Next Project). A company link (?for=<name>, made in /admin/) can show a
  different order; see js/order.js. A project in PROJECTS but in no order
  is a draft: not linked anywhere (preview it at project.html?project=<slug>).

  ADDING A PROJECT: copy the TEMPLATE below into PROJECTS under a new slug,
  fill in the fields, then add the slug to HOME_ORDER. Every empty field or
  section simply doesn't render. Copy rules: no em dashes; placeholders in
  [brackets] (they show on the page so nothing unfinished goes unnoticed).

  IMAGES: every image is { src, alt, label }.
    src    path to the file (jpg/webp, ~1600px on the long side max).
           Leave it out and the image shows as a grey "missing" box with
           its label, so you can see what still needs an asset.
    alt    what the image shows, for screen readers (required)
    label  short visible caption, 2 to 6 words
  Optional extras on any image:
    video: 'path.mp4'   play a muted loop instead (src is then the poster)
    cutout: true        transparent PNG/WebP: shown whole on a plain print
    contain: true       show the whole image, uncropped (slides, sheets)
    large: true         (03 Work only) spans wider in the grid
  01 Idea images become loose papers you can shuffle and drag: any number,
  any shape, shown whole (no crop), no caption on the page (label still
  shows in the viewer). Transparent PNG/WebP cut-outs sit straight on the
  page with a soft shadow.
  Optional on friction / work: ratio: '16 / 10' sets the tile shape for
  that section (default: portrait 4 / 5 in Work), e.g. for film frames or
  slides, so they aren't cropped.
    position: '30% 50%' which part of the image the crop keeps
    note: 'path.jpg'    a small image pinned on top like a post-it
                        (e.g. a storyboard sketch on its final frame)

  TEMPLATE
  'my-project': {
    title: 'Project Name: Subtitle',       // text after ': ' sits smaller under the title
    hook: '[Hook, under 10 words]',
    role: 'Art Direction',                 // required
    disciplines: ['Branding', 'Print'],
    duration: '6 weeks',                   // a number + day/week/month/year, or 'Ongoing'
    status: 'Live',                        // Live / In Production / In Progress / Concept
    award: 'Gold ADDY',                    // 2-3 words: gold tag on the homepage print + hero; full story goes in the copy
    released: 'Sep. 2026',
    client: 'Client name',
    course: 'Course, Professor',
    collaborators: ['Name, Role'],          // one person per entry: 'Name, Role' (role shows lighter)
    tools: ['Figma'],
    action: { label: 'View Live Site', url: 'https://...' }, // or video: 'path.mp4' to play it here
    hero: { src: '...', alt: '...' },      // add video: '...' for a moving hero; bw: true if it's already black and white
    home: { image: '...', video: '...' },  // optional preview thumbnail: homepage print + Next Project card (defaults to hero)
    idea: { copy: '[40 to 60 words]', images: [ ... ] },          // 2 to 4 images
    friction: { problem: '', response: '', result: '', images: [] }, // optional, 1 to 2 images
    work: { images: [ ... ], outcome: '[Under 25 words]' }       // 6 to 12 images
  }
*/
window.HOME_ORDER = [
  'grassroots',
  'boys-club',
  'title-sequence',
  'special-olympics'
];

// Old links that should still land on the right project.
window.PROJECT_ALIASES = {
  'art-direction': 'grassroots'
};

window.PROJECTS = {
  // ---------- Grassroots: Fall Drop ----------
  'grassroots': {
    title: 'Grassroots: Fall Drop',
    hook: 'Feel the love, live fast',
    role: 'Creative Co-Director & Advisor',
    disciplines: ['Creative Direction', 'Styling', 'Storyboarding', 'Photography', 'Talent Direction'],
    duration: '2 weeks',
    status: 'Live',
    released: 'Sep. 2026',
    client: 'Grassroots',
    collaborators: [
      'Grassroots, In-House CD',
      'Max Meyers, DP',
      'Morgan Mundahl, Photographer',
      'Ilya Rustamov, Talent',
      'Ryan Winter',      // TODO(Sadie): add their roles, e.g. 'Ryan Winter, Talent'
      'Kathleen Berry'
    ],
    // no action button: the full film already plays as the hero
    home: { video: 'assets/video/grassroots-fall-film-thumb.mp4', image: 'assets/case-studies/grassroots/gr-driver-seat.jpg' },
    hero: {
      video: 'assets/video/grassroots-fall-film.mp4',
      src: 'assets/case-studies/grassroots/gr-driver-seat.jpg',
      alt: 'Still from the Grassroots fall film: a driver’s hands on the wheel of a vintage Porsche'
    },
    idea: {
      copy: 'After seeing Boy’s Club, the in-house CD at Grassroots, a luxury car club out of NYC, hired me freelance as creative director on the film for their fall merch drop. I pitched a direction plus one alternate, then built storyboards, style sheets, and a timed shot list. The winning pitch: young love in the city, the thrill of speed, tension, and falling for someone new.',
      images: [
        { src: 'assets/case-studies/grassroots/gr-pitch-moodboard.jpg', contain: true, label: 'Pitch Deck', alt: 'Moodboard slide from the Grassroots pitch deck: vintage cars, couples and city scenes' },
        { src: 'assets/case-studies/grassroots/gr-stylesheet-her.jpg', contain: true, label: 'Talent style sheet, her', alt: 'Wardrobe styling sheet for her: lace tank, light sweater, jeans, sunglasses, ending in his jacket' },
        { src: 'assets/case-studies/grassroots/gr-stylesheet-him.jpg', contain: true, label: 'Talent style sheet, him', alt: 'Wardrobe styling sheet for him: suit and tie at the start, racing jacket and sunglasses at the end' },
        { src: 'assets/case-studies/grassroots/gr-storyboard-frames.jpg', contain: true, label: 'Storyboard frames', alt: 'Hand-drawn blue-ink storyboard grid for the Grassroots fall film' }
      ]
    },
    friction: {
      problem: 'A single day and three locations, no time left for our sunset shot.',
      response: 'Shot sunset in reverse at sunrise with the CD and DP, reworked shots live for space, timing, and what looked best. Held wardrobe and talent continuity throughout.',
      ratio: '16 / 10',
      result: 'Rollers, road, drone, city, and studio stills, true to the original moodboard and the CD’s brief. Short film and social media content for the drop after editing by the Grassroots team.',
      images: [
        {
          // the matching storyboard sketch is stored as gr-storyboard-scenic-outlook.jpg
          src: 'assets/case-studies/grassroots/gr-final-jacket-barn.jpg',
          label: 'Final frame',
          alt: 'Final frame: he drapes the jacket over her shoulders against the Porsche in front of a white barn'
        },
        // more behind-the-scenes shots are in grassroots/bts/
        {
          src: 'assets/case-studies/grassroots/bts/gr-bts-barn-monitor.jpg',
          position: '50% 62%',
          label: 'Behind the scenes, location 1',
          alt: 'Behind the scenes at the barn: the crew beside the camera rig, its monitor showing the Porsche and both talent framed for the shot'
        }
      ]
    },
    work: {
      images: [
        { src: 'assets/case-studies/grassroots/gr-porsche-lawn.jpg', large: true, position: '50% 75%', label: 'Road, golden hour', alt: 'Vintage Porsche parked on a lawn in front of a house, driver door open' },
        { src: 'assets/case-studies/grassroots/gr-talent-studio.jpg', label: 'Studio still, him', alt: 'Talent in a navy blazer, tie and sunglasses holding a Grassroots tote in the studio' },
        { src: 'assets/case-studies/grassroots/gr-sketchbook.jpg', label: 'Detail, sketchbook', alt: 'Close-up of hands sketching in a notebook' },
        { src: 'assets/case-studies/grassroots/gr-driver-seat.jpg', label: 'Rollers, in the car', alt: 'Driver’s hands on the wheel of a vintage Porsche interior' },
        { src: 'assets/case-studies/grassroots/gr-fall26-poster.jpg', label: 'Social, Fall 26', alt: 'Fall 26 social graphic: a man in a green jacket leaning on a pink Porsche' },
        { src: 'assets/case-studies/grassroots/gr-lookbook-spread.jpg', label: 'Drop lookbook spread', alt: 'Lookbook spread with the jacket, the tote and both talent posed with the car' }
      ],
      outcome: 'Sep. 18th, 2026 drop: 10k views, sold out jacket, event reach of ~200 car enthusiasts.'
    }
  },

  // ---------- Boy's Club ----------
  'boys-club': {
    title: 'Boy’s Club',
    hook: 'Held close. His before it was hers.',
    role: 'Founder & Designer',
    disciplines: ['Brand & Creative Direction', 'Clothing Design, Alteration & Construction', 'Styling', 'Editorial Photography', 'Web & E-commerce Development'],
    duration: 'Ongoing',
    status: 'In Progress',
    tools: ['Figma', 'Sony A6100', 'Lightroom', 'JavaScript, AI-assisted development', 'Sewing machine'],
    // TODO(Sadie): add { label: 'Shop the Drop', url: '...' } once the storefront is live
    hero: { src: 'assets/case-studies/boys-club/bc-02.jpg', bw: true, alt: 'Black and white editorial: the model on a leather sofa beside a white dog, Boy’s Club B mark overlaid' },
    idea: {
      copy: 'Sketched in a three hour train delay in Italy. The premise: a girl who wears the clothes taken from the men she holds close. The core image: rigid menswear worn for years until its lines loosen, cut and cloth intact, structure softened into her lines. Drop one blends 1920s athletic wear, vintage collegiate, and 60s rock and roll.',
      images: [
        { label: 'Original sketch, Italy', alt: '' },
        { label: 'Reference: 1930s athletic wear', alt: '' },
        { label: 'Moodboard', alt: '' }
      ]
    },
    friction: {
      problem: 'I planned a campaign film and a manufactured line. I had one location, one model, no manufacturer, and my own budget.',
      response: 'Cut the film, shot editorial and product photography instead, sourced and altered nine pieces, and remade some pieces from sourced material to fit the collection.',
      result: 'A full brand from what I could find. Getting it made beats waiting for perfection; every drop will build on the last.',
      // the shorts as a pair: the only rebuilt garment, so the clearest proof of design over styling
      images: [
        { label: 'Shorts: source material', alt: '' },
        { label: 'Shorts: rebuilt, finished', alt: '' }
      ]
    },
    work: {
      images: [
        { src: 'assets/case-studies/boys-club/bc-08.jpg', large: true, label: 'Editorial, drop one', alt: 'Black and white editorial: the model lying across a bed in an oversized white tee' },
        { src: 'assets/case-studies/boys-club/bc-04-cutout.webp', cutout: true, label: 'Pennant flag', alt: 'Cream felt pennant with a navy B and navy border' },
        { src: 'assets/case-studies/boys-club/bc-03.jpg', label: 'Editorial, white sweater', alt: 'The model sitting on a wooden dresser in an oversized white sweater, tote at her feet' },
        { src: 'assets/case-studies/boys-club/bc-06-cutout.webp', cutout: true, label: 'Drop 001 label', alt: 'Hand-stamped cloth label: B mark, boy’s club, drop 001' },
        { src: 'assets/case-studies/boys-club/bc-07-cutout.webp', cutout: true, label: 'Typewritten hang tag', alt: 'Typewritten tag: Boy’s Club, est 1989, NYC, young forever, flirt with me' },
        { src: 'assets/case-studies/boys-club/bc-05.jpg', label: 'At the cutting table', alt: 'Red tee laid flat with a ruler, pencil and a sketchbook of B lettering' }
      ],
      outcome: 'Ten pieces, one model, 180 selects. Storefront launching November. Next: a 36-unit domestic production run, pending funding.'
    }
  },

  // ---------- A Series of Unfortunate Events: Title Sequence ----------
  // Images: frames/ (final style frames), process/ (process book pages),
  // references/ (inspiration boards).
  'title-sequence': {
    title: 'A Series of Unfortunate Events: Title Sequence',
    hook: 'A clue in every frame',
    role: 'Motion Designer & Illustrator',
    disciplines: ['Motion Design', 'Illustration', 'Hand Animation'],
    duration: '5 weeks',
    award: 'Gold ADDY',
    course: 'Motion Design, Prof. Austin Shaw',
    collaborators: ['Lana Del Rey, Music'],
    tools: ['Procreate', 'After Effects', 'Hand-drawn sketch'],
    action: { label: 'Watch the Sequence', url: 'https://www.youtube.com/watch?v=Fl9wpFEMiEA' },
    // preview thumbnail everywhere (homepage print + Next Project card)
    home: { image: 'assets/case-studies/title-sequence/frames/ts-08-title-card.webp' },
    hero: {
      video: 'assets/video/title-sequence.mp4',
      src: 'assets/case-studies/title-sequence/frames/ts-03-birdcage.webp',
      alt: 'Illustrated title sequence frame: a gilded birdcage in a jungle hallway with a checkered floor'
    },
    idea: {
      copy: 'Opening credits for Netflix\u2019s A Series of Unfortunate Events. I wanted viewers to feel the show\u2019s themes while only hinting at the plot. Storybook paper cutouts nod to its roots as a children\u2019s novel and give it an eerie, academic edge. Every vignette hides metaphors and easter eggs that only surface after a few rewatches.',
      images: [
        { src: 'assets/case-studies/title-sequence/process/ts-sketches-storyboards.jpg', contain: true, label: 'Early sketch', alt: 'Process book page of pencil character sketches and storyboards' },
        { src: 'assets/case-studies/title-sequence/references/ts-graphical-inspiration.webp', contain: true, label: 'Graphical inspiration', alt: 'Moodboard of 1930s posters and illustration: a hedge maze, an ocean liner, Harper\u2019s Bazaar, art deco cars' },
        { src: 'assets/case-studies/title-sequence/frames/ts-01-trolley.jpg', label: 'Paper cutout style frame', alt: 'Paper cutout style frame: a trolley on tracks between torn pink cliffs' },
        { label: 'Easter egg, revealed', alt: '' }
      ]
    },
    friction: {
      problem: 'Every scene hand drawn and hand animated, and the hidden references lost anyone who hadn\u2019t seen the show.',
      response: 'Learned new After Effects techniques, sharpened my Procreate illustration, and reworked through constant critique from professor and peers.',
      result: 'Vignettes that read clearly to newcomers and still reward fans, tied together in theme and timing.',
      ratio: '16 / 10',
      images: [
        { label: 'Critique round 1 vs. final', alt: '' },
        { src: 'assets/case-studies/title-sequence/process/ts-illustrations.jpg', contain: true, label: 'Procreate illustration in progress', alt: 'Cutout illustrations: a birdcage, a trolley, plants, darts and silhouetted characters' }
      ]
    },
    work: {
      ratio: '16 / 10',
      images: [
        { src: 'assets/case-studies/title-sequence/frames/ts-08-title-card.webp', large: true, label: 'Title card', alt: 'Title card: Lemony Snicket\u2019s A Series of Unfortunate Events over dark eye-pattern wallpaper' },
        { src: 'assets/case-studies/title-sequence/frames/ts-01-trolley.jpg', label: 'Vignette 1, the trolley', alt: 'A trolley on tracks between torn pink cliffs' },
        { src: 'assets/case-studies/title-sequence/frames/ts-02-hallway.webp', label: 'Vignette 2, the hallway', alt: 'Three child silhouettes huddled in an eye-patterned hallway beneath a looming shadow' },
        { src: 'assets/case-studies/title-sequence/frames/ts-03-birdcage.webp', label: 'Vignette 3, the birdcage', alt: 'An open gilded birdcage with a snake curled inside, among jungle leaves on a checkered floor' },
        { src: 'assets/case-studies/title-sequence/frames/ts-04-ship.webp', label: 'Vignette 4, the ship', alt: 'A tiny figure falling down the black hull of the S.S. Peru into dark waves' },
        { src: 'assets/case-studies/title-sequence/frames/ts-05-hedge-maze.jpg', label: 'Vignette 5, the hedge maze', alt: 'Silhouettes running through a green hedge maze shaped like a key' },
        { src: 'assets/case-studies/title-sequence/frames/ts-06-curtain.webp', label: 'Vignette 6, the curtain', alt: 'A shadowed figure parting a red curtain onto a tea set on a small table' },
        { src: 'assets/case-studies/title-sequence/frames/ts-07-darts.webp', label: 'Vignette 7, the darts', alt: 'Red and cream feathered darts and a brass spyglass falling against a dark background' },
        { src: 'assets/case-studies/title-sequence/process/ts-social-assets.jpg', contain: true, label: 'Social assets', alt: 'Instagram post and story mockups using the birdcage and ship frames' }
      ],
      outcome: 'Gold ADDY Award, 2026, entered by Prof. Austin Shaw. Featured in his new edition textbook and on RIT institutional billboards.'
    }
  },

  // ---------- Special Olympics New York: Site Redesign ----------
  // TODO(Sadie): not in the copy doc yet. Facts below come from the pitch
  // deck (Fall 2025, Graphical User Interface); everything in [brackets]
  // needs your words.
  'special-olympics': {
    title: 'Special Olympics New York: Site Redesign',
    hook: '[Hook]',
    role: '[Role]',
    disciplines: ['[Disciplines]'],
    duration: '',                          // TODO(Sadie): e.g. '12 weeks'
    status: 'Concept',
    course: 'Graphical User Interface',
    tools: ['[Tools]'],
    action: { label: 'Watch the Prototype', video: 'assets/video/special-olympics-prototype.mp4' },
    hero: { src: 'assets/case-studies/special-olympics/so-homepage-screen.jpg', alt: 'Redesigned Special Olympics New York homepage: a Supporting Champions panel over a snowy mountain town' },
    idea: {
      copy: '[Idea copy, 40 to 60 words]',
      images: [
        { src: 'assets/case-studies/special-olympics/so-design-goals.jpg', contain: true, label: 'Design goals', alt: 'Four design goals with icons: simple, sporty, professional, accessible' },
        { src: 'assets/case-studies/special-olympics/so-wireframes.jpg', contain: true, label: 'Wireframes', alt: 'Four mobile wireframes from grey blocks to the red and navy final' },
        { src: 'assets/case-studies/special-olympics/so-new-direction.jpg', contain: true, label: 'A whole new direction', alt: 'Color palette, Albert Sans type specimen and a seasonal mountain photo' }
      ]
    },
    friction: {
      problem: '[One line]',
      response: '[One line]',
      result: '[One line]',
      images: [
        { src: 'assets/case-studies/special-olympics/so-homepage-comparison.jpg', contain: true, label: 'Original vs. redesign', alt: 'The original Special Olympics NY homepage beside the redesigned homepage' }
      ]
    },
    work: {
      ratio: '16 / 9',
      images: [
        { src: 'assets/case-studies/special-olympics/so-homepage-redesign.jpg', contain: true, large: true, label: 'Homepage redesign', alt: 'Redesigned homepage with a Supporting Champions panel over a mountain photo' },
        { src: 'assets/case-studies/special-olympics/so-card-design.jpg', contain: true, label: 'Homepage card design', alt: 'Four homepage cards: Supporting Champions, Discover Sports, Give Back, Events' },
        { src: 'assets/case-studies/special-olympics/so-navigation-flow.jpg', contain: true, label: 'Navigation and flow', alt: 'Chat box, menu and search screens showing the navigation flow' },
        { src: 'assets/case-studies/special-olympics/so-style-sheet.jpg', contain: true, label: 'Style sheet', alt: 'Style sheet: colors, typography, button, shape and icon treatments' },
        { src: 'assets/case-studies/special-olympics/so-homepage-screen.jpg', video: 'assets/video/special-olympics-prototype.mp4', label: 'Prototype walkthrough', alt: 'Screen recording of the clickable prototype' }
      ],
      outcome: '[Outcome line]'
    }
  }
};
