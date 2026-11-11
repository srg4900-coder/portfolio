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
    scale: 1.2          (01 Idea papers) shown that much larger than the others
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
    hook: '[Hook, under 10 words]',        // wrap words in *asterisks* for italics
    role: 'Art Direction',                 // required
    disciplines: ['Branding', 'Print'],
    duration: '6 weeks',                   // a number + day/week/month/year (+ words: '3-day group sprint'), or 'Ongoing'
    status: 'Live',                        // Live / In Production / In Progress / Concept
    award: 'Gold ADDY',                    // short: gold tag on the homepage print + credits; \n starts a new line
    awardPlain: false,                     // optional: true = plain text in the credits (**word** bold), no tag anywhere
    awardStamp: 'assets/awards/x.png',     // optional: a stamp graphic instead of the gold tag (award text = its alt);
                                           //   white ink on transparent, it flips dark/light against what's under it
    released: 'Sep. 2026',
    client: 'Client name',                 // or { name, url, instagram }: the name links, with an Instagram icon
    course: 'Course, Professor',
    collaborators: ['Name, Role'],          // one person per entry: 'Name, Role' (role shows lighter)
    tools: ['Figma'],
    action: { label: 'View Live Site', url: 'https://...' }, // or video: 'path.mp4' to play it here
    hero: { src: '...', alt: '...' },      // add video: '...' for a moving hero; bw: true if it's already black and white
    home: { image: '...', video: '...' },  // optional preview thumbnail: homepage print + Next Project card (defaults to hero)
                                           //   tall: 3 = 3x as tall in the hero pile, cropped to the grid as it lands
    idea: { copy: '[40 to 60 words]', images: [ ... ] },          // 2 to 4 images
    friction: { problem: '', response: '', result: '', images: [] }, // optional, 1 to 2 images
    work: { images: [ ... ], outcome: '[Under 25 words]' }       // 6 to 12 images
    //   or work.groups: [{ title, kind, copy, links: [{ label, url }], ratio, images }]: one block per client
  }
*/
window.HOME_ORDER = [
  'grassroots',
  'mycourses',
  'multiply',
  'sol',
  'boys-club',
  'title-sequence',
  'gravity'
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
    client: {
      name: 'Grassroots',
      url: 'https://grassrootsedition.com/',
      instagram: 'https://www.instagram.com/grassroots_edition/'
    },
    collaborators: [
      'Grassroots',
      'Max Meyers, In-House CD',
      'Morgan Mundahl, DP',
      'Ilya Rustamov, Photographer',
      'Ryan Winter, Talent',
      'Kathleen Berry, Talent'
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
        // files: assets/case-studies/grassroots/idea/. scale: 1.2 = shown 20% larger than the rest
        { src: 'assets/case-studies/grassroots/idea/gr-pitch-moodboard.jpg', scale: 1.2, label: 'Pitch Deck', alt: 'Moodboard slide from the Grassroots pitch deck: vintage cars, couples and city scenes' },
        { src: 'assets/case-studies/grassroots/idea/gr-film-porsche-woods.jpg', label: 'On film: the drive', alt: 'Film photo: the talent smiling from the driver\u2019s seat of the Porsche on a wooded road' },
        { src: 'assets/case-studies/grassroots/idea/gr-stylesheet-her.jpg', scale: 1.2, label: 'Talent style sheet, her', alt: 'Wardrobe styling sheet for her: lace tank, light sweater, jeans, sunglasses, ending in his jacket' },
        { src: 'assets/case-studies/grassroots/idea/gr-jacket-lining.jpg', label: 'The jacket, lining', alt: 'Close-up of the green Grassroots jacket held open to show its brown gingham lining' },
        { src: 'assets/case-studies/grassroots/idea/gr-stylesheet-him.jpg', scale: 1.2, label: 'Talent style sheet, him', alt: 'Wardrobe styling sheet for him: suit and tie at the start, racing jacket and sunglasses at the end' },
        { src: 'assets/case-studies/grassroots/idea/gr-film-between-takes.jpg', label: 'On film: between takes', alt: 'Film photo between takes: a woman in sunglasses sitting in the open back of a silver SUV beside a yellow gear case' },
        { src: 'assets/case-studies/grassroots/idea/gr-storyboard-frames.jpg', contain: true, label: 'Storyboard frames', alt: 'Hand-drawn blue-ink storyboard grid for the Grassroots fall film' }
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
        { src: 'assets/case-studies/grassroots/gr-porsche-lawn.jpg', large: true, position: '50% 75%', alt: 'Vintage Porsche parked on a lawn in front of a house, driver door open' },
        { src: 'assets/case-studies/grassroots/gr-talent-studio.jpg', label: 'Wardrobe: Look 2', alt: 'Talent in a navy blazer, tie and sunglasses holding a Grassroots tote in the studio' },
        { src: 'assets/case-studies/grassroots/gr-sketchbook.jpg', alt: 'Close-up of hands sketching in a notebook' },
        { src: 'assets/case-studies/grassroots/gr-driver-seat.jpg', alt: 'Driver’s hands on the wheel of a vintage Porsche interior' },
        { src: 'assets/case-studies/grassroots/gr-fall26-poster.jpg', label: 'Fall 26 Drop', alt: 'Fall 26 social graphic: a man in a green jacket leaning on a pink Porsche' },
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
    award: '**CADalyst** Student Opportunity Fund',   // plain text in the credits; **word** = bold
    awardPlain: true,
    tools: ['Figma', 'Sony A6100', 'Lightroom', 'JavaScript, AI-assisted development', 'Sewing machine'],
    // TODO(Sadie): paste the site address into url; until then the button shows greyed out
    action: { label: 'View Site', url: '', hero: true },   // hero: true = the main image links there too (cursor reads View Site)
    hero: { src: 'assets/case-studies/boys-club/bc-02.jpg', bw: true, alt: 'Black and white editorial: the model on a leather sofa beside a white dog, Boy’s Club B mark overlaid' },
    idea: {
      copy: 'Sketched in a three hour train delay in Italy. The premise: a girl who wears the clothes taken from the men she holds close. The core image: rigid menswear worn for years until its lines loosen, cut and cloth intact, structure softened into her lines. Drop one blends 1920s athletic wear, vintage collegiate, and 60s rock and roll.',
      images: [
        { src: 'assets/case-studies/boys-club/bc-08.jpg', label: 'Editorial, drop one', alt: 'Black and white editorial: the model lying across a bed in an oversized white tee' },
        { label: 'Original sketch, Italy', alt: '' },
        { src: 'assets/case-studies/boys-club/bc-04-cutout.webp', cutout: true, label: 'Pennant flag', alt: 'Cream felt pennant with a navy B and navy border' },
        { src: 'assets/case-studies/boys-club/bc-03.jpg', label: 'Editorial, white sweater', alt: 'The model sitting on a wooden dresser in an oversized white sweater, tote at her feet' },
        { label: 'Reference: 1930s athletic wear', alt: '' },
        { src: 'assets/case-studies/boys-club/bc-06-cutout.webp', cutout: true, label: 'Drop 001 label', alt: 'Hand-stamped cloth label: B mark, boy’s club, drop 001' },
        { src: 'assets/case-studies/boys-club/bc-07-cutout.webp', cutout: true, label: 'Typewritten hang tag', alt: 'Typewritten tag: Boy’s Club, est 1989, NYC, young forever, flirt with me' },
        { label: 'Moodboard', alt: '' },
        { src: 'assets/case-studies/boys-club/bc-05.jpg', label: 'At the cutting table', alt: 'Red tee laid flat with a ruler, pencil and a sketchbook of B lettering' }
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
      // the photos now live in 01 Idea (the interactive papers)
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
    award: 'AAF ADDY Gold\nAward Winner',
    awardStamp: 'assets/awards/aaf-gold-addy-stamp.png?v=3',   // bump ?v= when the file is replaced
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
      // process, in order: first doodles, the cast and props, then the
      // storyboards (early scenes, later scenes), the moodboard, and the
      // finished cutouts where the easter eggs show. (The trolley frame
      // lives in 03 Work.)
      images: [
        { src: 'assets/case-studies/title-sequence/process/ts-sketch-1-concepts.webp', contain: true, label: 'First concept sketches', alt: 'Pencil doodles: early character ideas, a fish, a vintage car, flames, and eyes with a note to zoom in on an eye' },
        { src: 'assets/case-studies/title-sequence/process/ts-sketch-2-characters-props.webp', contain: true, label: 'Characters and props', alt: 'Pencil character sheet labeled Squalor, Violet, Klaus, Sunny, Olaf and Jacqueline, with a sugar bowl, a book and a spyglass' },
        { src: 'assets/case-studies/title-sequence/process/ts-sketch-3-storyboard-early-scenes.webp', contain: true, label: 'Storyboard: trolley, hedge maze, gold cage', alt: 'Pencil storyboard page: a trolley under cherry blossoms, a hedge maze shaped like a key, and a black snake in a gold cage' },
        { src: 'assets/case-studies/title-sequence/process/ts-sketch-4-storyboard-late-scenes.webp', contain: true, label: 'Storyboard: darts, opera, fire', alt: 'Pencil storyboard page: darts falling, a figure at the opera, the shadow of a fire with the sugar bowl, a car, and a final hallway' },
        { src: 'assets/case-studies/title-sequence/references/ts-graphical-inspiration.webp', contain: true, label: 'Graphical inspiration', alt: 'Moodboard of 1930s posters and illustration: a hedge maze, an ocean liner, Harper\u2019s Bazaar, art deco cars' },
        { src: 'assets/case-studies/title-sequence/process/ts-easter-eggs-revealed.webp', contain: true, label: 'Easter egg, revealed', alt: 'Finished cutout illustrations: darts, a gold statue holding a spyglass, a brass spyglass, a tall silhouette, a gilded birdcage with a snake, dark leaves, a Briny Beach trolley, and three children in silhouette' }
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

  // ---------- MyCourses Redesign (in progress) ----------
  // Facts from Sadie (Nov 2026). Still being built: [brackets] and grey
  // boxes are hers to fill in.
  'mycourses': {
    title: 'MyCourses Redesign',
    hook: '[Hook, under 10 words]',
    role: '[Role]',
    disciplines: ['[Disciplines]'],
    status: 'In Progress',
    course: 'UI and UX Strategy',
    // homepage only: in the hero pile the print is 3x as tall with the
    // image turned 90 degrees (the poster standing up); as it lands it
    // turns back and crops to the grid's shape, left-justified on the M.
    // TODO(Sadie): swap in a larger export (this one is 624 x 348)
    home: {
      tall: 3,
      rotate: 90,
      position: '0% 50%',
      image: 'assets/case-studies/mycourses/mycourses-home.jpg',
      alt: 'MyCourses poster: a dark shape like a stretched letter M with MYCOURSES at its end, beside the line The Implementation of the AI Agent'
    },
    tools: ['[Tools]'],
    // TODO(Sadie): the motion piece goes here: hero: { video: 'assets/video/...mp4', src: 'poster.webp', alt: '...' }
    hero: { label: '[Motion piece]', alt: '' },
    idea: {
      copy: 'A redesign of MyCourses, my school\u2019s page for reaching courses and submitting work, reimagined around an AI agent. [What the agent does and why, 40 to 60 words in all]',
      images: [
        { label: '[Research]', alt: '' },
        { label: '[Current MyCourses]', alt: '' },
        { label: '[Sketches or flows]', alt: '' }
      ]
    },
    friction: {
      problem: '[One line]',
      response: '[One line]',
      result: '[One line]',
      images: [
        { label: '[Before vs. after]', alt: '' }
      ]
    },
    work: {
      ratio: '16 / 10',
      images: [
        { label: '[Course access page]', alt: '', large: true },
        { label: '[Submission flow]', alt: '' },
        { label: '[AI agent]', alt: '' },
        { label: '[Screen 4]', alt: '' },
        { label: '[Screen 5]', alt: '' },
        { label: '[Screen 6]', alt: '' }
      ],
      outcome: '[Outcome line, under 25 words]'
    }
  },

  // ---------- Multiply: Design Team Intern ----------
  // Summer internship. Built differently from the other case studies: 03
  // Work is split into one block per brand (work.groups), each holding its
  // projects as cards with a click-through carousel. Facts from Sadie
  // (Nov 2026); [brackets] are hers to fill in.
  'multiply': {
    title: 'Multiply: Design Team Intern',
    hook: '[Hook, under 10 words]',
    role: 'Design Team Intern',
    disciplines: ['Campaign Concepting', 'AI Image Generation', 'Presentation Design', 'Motion Design'],
    client: { name: 'Multiply', url: 'https://www.multiply.us/' },
    home: { image: 'assets/case-studies/multiply/multiply-home.png', alt: 'The Multiply wordmark in white on near-black, with a yellow Fight Boring tag' },
    tools: ['Figma', 'Photoshop', 'Illustrator', 'After Effects', 'Claude', 'Envato Image + Video Generation'],
    hero: {
      src: 'assets/case-studies/multiply/multiply-home.png',
      alt: 'The Multiply wordmark in white on near-black, with a yellow Fight Boring tag'
    },
    idea: {
      copy: 'A summer on Multiply\u2019s design team, working across pitches, productions and social content for Grenade, Fresca Hard, Minute Maid Spiked and Hi-Chew. [What you learned or what tied the work together, 40 to 60 words in all]',
      images: [
        { src: 'assets/case-studies/multiply/grenade-batter-trio.webp', alt: 'Generated image for the Grenade pitch: a catcher, a batter in a tricorn hat and powdered wig, and a young man in shoulder armor eating a Grenade bar' },
        { src: 'assets/case-studies/multiply/fresca-posts-grid.webp', alt: 'Fresca Hard\u2019s Instagram grid from the golf shoot' },
        { src: 'assets/case-studies/multiply/hichew-blueberry-sm-03.webp', video: 'assets/video/hichew-blueberry-sm-03.mp4', alt: 'Hi-Chew blueberry motion post: candies and blueberries falling into a Hi-Chew bag' },
        { src: 'assets/case-studies/multiply/grenade-storyboard-sketch.jpg', alt: 'Pen storyboard sketches for the Grenade pitch: the batter trio eating bars, a dugout break with bars and tea, George crossing the Delaware as a football tackle, a team huddle' },
        { src: 'assets/case-studies/multiply/grenade-lettering-sketch.jpg', alt: 'Pencil sketches: blocky GRENADE lettering, a grenade, bar wrapper layouts and a Knicks T-shirt' },
        { src: 'assets/case-studies/multiply/mms-thumbnail-sketches.jpg', alt: 'Pencil thumbnails for the Minute Maid Spiked poster in a comic style: a can in a hoodie in a city, movie poster layouts, notes on blue and green reflected in a red can' }
      ]
    },
    friction: {
      problem: '[One line]',
      response: '[One line]',
      result: '[One line]',
      images: []
    },
    work: {
      outcome: '[Outcome line, under 25 words]',
      // one block per brand; each brand's projects sit side by side as
      // cards, each a click-through carousel (js/project.js carousel())
      groups: [
        {
          title: 'Grenade',
          projects: [
            {
              title: 'US launch pitch',
              kind: '4th of July creative brief',
              copy: 'A creative editorial concept I created for Multiply to pitch Grenade, the UK protein brand, for its big American launch. I used sketches and scenes created from scratch in Photoshop to rapidly iterate concepts in image generation software. The generated images were only ever a proof of concept: if the pitch was won, a human editorial team would bring it to life.\nThe concept: a cheeky take on US and British history for the Fourth of July, playing off the brand\u2019s tone guidelines.',
              links: [{ label: 'View the pitch deck', url: 'assets/decks/multiply-grenade-pitch.pdf' }],
              images: [
                { src: 'assets/case-studies/multiply/grenade-batter-trio.webp', alt: 'Generated image: a catcher, a batter in a tricorn hat and powdered wig, and a young man in shoulder armor eating a Grenade bar' },
                { src: 'assets/case-studies/multiply/grenade-flag.webp', alt: 'Generated image: athletes in tricorn hats, colonial jackets and baseball jerseys charge forward under a torn American flag, Grenade bars on the floor' },
                { src: 'assets/case-studies/multiply/grenade-bench.webp', alt: 'Generated image: three athletes rest on a wooden bench with a teacup and Grenade bars, armor set down at their feet' },
                { src: 'assets/case-studies/multiply/grenade-bar-hold.webp', alt: 'Generated image: a young man in a red colonial jacket and shoulder armor holds a Grenade bar' },
                { src: 'assets/case-studies/multiply/grenade-dumbbell.webp', alt: 'Generated image: a woman in a powdered wig and worn G cap curls a Grenade dumbbell' },
                { src: 'assets/case-studies/multiply/grenade-deck-cover.webp', contain: true, alt: 'Pitch deck cover: Creative Brief, made by Sadie for Grenade, Multiply 2026' }
              ]
            },
            {
              title: 'On the Hudson',
              kind: 'Instagram post, Grenade US',
              copy: 'A post for Grenade US\u2019s Instagram that I worked on concepting. [What the idea was and what you did, one line]',
              links: [{ label: 'View the post on Instagram', url: 'https://www.instagram.com/p/De9t2h0SHH7/' }],
              images: [
                { src: 'assets/case-studies/multiply/grenade-just-landed-flag.webp', alt: 'An orange Grenade Just Landed flag on a jet ski, spray flying, the Statue of Liberty and Manhattan behind' },
                { src: 'assets/case-studies/multiply/grenade-hudson-post.webp', alt: 'Instagram post: riders in orange on jet skis with Grenade flags race past the Manhattan skyline, captioned I saw you on the Hudson, eating a grenade protein bar, and you paid me no mind' }
              ]
            }
          ]
        },
        {
          title: 'Fresca Hard',
          projects: [
            {
              title: 'Q2 golf shoot',
              kind: 'On-set assistant',
              copy: 'I was an assistant on set for Fresca Hard\u2019s Q2 golf shoot in New York, [what you did on set, one line]. Before the shoot, I reworked the production bible in Claude so it worked for everyone involved, especially the Multiply team, to streamline communication on the day.',
              links: [{ label: 'View the content on Instagram', url: 'https://www.instagram.com/p/Dezam19kZFv/' }],
              images: [
                { src: 'assets/case-studies/multiply/fresca-posts-grid.webp', alt: 'Fresca Hard\u2019s Instagram grid from the shoot: cans on the green beside golf balls, cans scattered among tees, friends in golf whites sharing cans on the course and in a cart' },
                { src: 'assets/case-studies/multiply/fresca-bts-swing.jpg', label: 'Behind the scenes', alt: 'My behind-the-scenes shot from set: a Fresca Hard can in the long grass, a golfer mid-swing behind it' },
                { src: 'assets/case-studies/multiply/fresca-ad-frame.webp', alt: 'Frame from the Fresca Hard spot: friends hand round cans beside a golf cart under the Fresca Hard logo' },
                { src: 'assets/case-studies/multiply/fresca-on-ice.webp', alt: 'A hand pulls a Fresca Hard can from a bucket of ice' }
              ]
            },
            {
              title: 'Served Hard',
              kind: 'US Open activation, New York',
              copy: 'My concept for Fresca Hard\u2019s US Open promotion, mocked up for Multiply: SERVED HARD spelled out in tennis balls on a street-side wall. Then the wall as it went up in New York this summer.',
              images: [
                { src: 'assets/case-studies/multiply/fresca-served-hard-concept.webp', contain: true, label: 'My concept mock-up', alt: 'Concept mock-up: a long blue wall reading SERVED HARD in tennis balls beside a tennis player and the Fresca Hard logo, a lawn with deck chairs in front and a crowd on the sidewalk' },
                { src: 'assets/case-studies/multiply/fresca-served-hard-wall.jpg', label: 'The wall in New York', alt: 'Instagram story of the built wall in New York: SERVED HARD in tennis balls on a blue wall over turf, the D left unfinished, captioned Where\u2019s the D??' }
              ]
            }
          ]
        },
        {
          title: 'Minute Maid Spiked',
          projects: [
            {
              title: 'Social content',
              kind: 'Content capture, on camera',
              copy: 'Real content I captured for Minute Maid Spiked\u2019s Instagram, including a video I\u2019m in.',
              links: [{ label: 'View the post on Instagram', url: 'https://www.instagram.com/p/DaLkXTxCeYV/' }],
              images: [
                { src: 'assets/case-studies/multiply/mms-picnic.jpg', alt: 'Instagram video still: Sadie sits on a picnic blanket in a park holding up a can of Minute Maid Spiked in each hand' },
                { src: 'assets/case-studies/multiply/mms-pink-lemonade.jpg', position: '50% 85%', alt: 'Instagram video still: a cup of water and a cup of pink lemonade either side of a Minute Maid Spiked Vodka Pink Lemonade can, captioned The sound of water vs the sound of my Minute Maid Spiked Vodka Pink Lemonade' }
              ]
            },
            {
              title: 'Poster',
              copy: '[What you did on this poster: one line]',
              images: [
                { src: 'assets/case-studies/multiply/mms-poster.webp', contain: true, alt: 'Minute Maid Spiked poster: a lime margarita bottle and three cans, the Bold One, the Lead and the Wildcard, in a ruined city street' }
              ]
            }
          ]
        },
        {
          title: 'Hi-Chew',
          kind: 'Multiply is their agency of record',
          projects: [
            {
              title: 'Posts on @hichewusa',
              kind: 'Instagram, 110k followers',
              copy: 'Posts I concepted for Hi-Chew\u2019s US Instagram, 110k followers strong, from a sidewalk chalk bag to a summer camp packing list. My blueberry motion piece was picked for the account too.',
              links: [{ label: 'View a post on Instagram', url: 'https://www.instagram.com/p/DaTSAp3DSTz/' }],
              images: [
                { src: 'assets/case-studies/multiply/hichew-blueberry-sm-03.webp', video: 'assets/video/hichew-blueberry-sm-03.mp4', alt: 'Hi-Chew blueberry motion post' },
                { src: 'assets/case-studies/multiply/hichew-chalk.jpg', alt: 'Instagram post: a giant Hi-Chew bag drawn in rainbow sidewalk chalk beside a chalk Hi-Chew logo' },
                { src: 'assets/case-studies/multiply/hichew-summer-camp.jpg', position: '50% 0%', alt: 'Instagram post: a summer camp nostalgic pack, cut-out camera, whistle, lounge chair, boombox, cooler and summer fit around three Hi-Chew bags over a cabin photo' },
                { src: 'assets/case-studies/multiply/hichew-dessert-mix.jpg', alt: 'Instagram post: a Hi-Chew Dessert Mix bag and loose candies on an orange striped beach towel, the shadow of a drink across them' }
              ]
            },
            {
              title: 'Motion explorations',
              kind: 'After Effects and Photoshop',
              copy: 'More short-form pieces I made for the account in After Effects and Photoshop.',
              images: [
                { src: 'assets/case-studies/multiply/hichew-reel-01.webp', video: 'assets/video/hichew-reel-01.mp4', alt: 'Hi-Chew social reel' },
                { src: 'assets/case-studies/multiply/hichew-creamsicle-2.webp', video: 'assets/video/hichew-creamsicle-2.mp4', alt: 'Hi-Chew creamsicle social post' }
              ]
            }
          ]
        }
      ]
    }
  },

  // ---------- Sol (in progress) ----------
  // Spec brand + product project, several iterations in; final version in
  // progress. Facts from Sadie (Nov 2026).
  'sol': {
    title: 'Sol',
    hook: 'Stay sun faded',
    role: '[Role]',
    disciplines: ['Branding', 'Product Design', 'Packaging', 'Advertising', 'AI Image Generation'],
    status: 'In Progress',
    tools: ['Sketching', 'ComfyUI', 'Figma Weave', 'Photoshop', 'Claude'],
    // cursor: what the cursor reads over the hero (no link): the project is
    // still in progress. TODO(Sadie): swap in a finished hero image
    hero: {
      src: 'assets/case-studies/sol/sol-bottle-sketches.webp',
      position: '50% 42%',
      cursor: 'Work In Progress',
      alt: 'Pen sketches of Sol bottles: a corked bottle with a brown tint, the sun symbol and SOL on a clean white label, frosted glass versions and a tall bottle with SOL down its side'
    },
    idea: {
      copy: 'Sol is a THC beverage brand I\u2019ve been building for over three years. It started with my own choice to ditch alcohol while still wanting the community it brings, one of the few left today. The name means sun, so everything follows it: the alchemical symbol for sol in the logo, cyanotype graphics across the brand, and the tagline \u201cStay sun faded.\u201d',
      images: [
        { src: 'assets/case-studies/sol/sol-mindmap.webp', alt: 'Pencil mind map around clean relaxation: surf cowboy, south western, vintage soda cans, natural fibers and plants, sun, waves and stars' },
        { src: 'assets/case-studies/sol/sol-logo-sketches.webp', alt: 'Pen sketches of the SOL wordmark with a line over the O, sun symbols, a circle with a dot and a half sun over a towel labeled sunfaded' },
        { src: 'assets/case-studies/sol/sol-figure-studies.webp', alt: 'Pencil figure studies of sunbathers in swimwear standing under a sketched sun' }
      ]
    },
    friction: {
      problem: 'Ask people to swap a drink for something new, without asking them to give up the ritual.',
      response: 'Products that slot into how people already take the edge off the week: keep-cold flasks, single-use glass mini bottles for small doses and full cocktail sets.',
      result: '[One line]',
      images: [
        { label: '[Iteration vs. final]', alt: '' }
      ]
    },
    work: {
      images: [
        { src: 'assets/case-studies/sol/sol-iteration-04.webp', large: true, label: 'Iteration 01, generated', alt: 'Generated iteration: a frosted blue bottle with a wooden cork, coral seal and a cream label, a nautilus shell over S\u014dl, Blood Orange and Yuzu, 10mg THC, BOTTLED SLOWLY embossed in the glass' },
        { src: 'assets/case-studies/sol/sol-iteration-01.webp', label: 'Iteration 02, generated', alt: 'Generated iteration: a clear blue bottle lying in beach sand, a white label reading S\u014dl, Coastal THC Drink, 5mg THC, the sun symbol embossed in the glass' },
        { src: 'assets/case-studies/sol/sol-iteration-02.webp', label: 'Iteration 03, generated', alt: 'Generated iteration: an amber THC soda bottle on a sandstone ledge, the sun symbol embossed above a cream label reading S\u014dl THC Soda, Retro Adventure' },
        { src: 'assets/case-studies/sol/sol-iteration-03.webp', label: 'Iteration 04, generated', alt: 'Generated iteration: a pale soda bottle pushed into white sand beside a blue striped towel, a large hand-drawn sun symbol on the glass and a S\u014dl THC Soda label' },
        { src: 'assets/case-studies/sol/sol-iteration-05.webp', label: 'Iteration 05, generated', alt: 'Generated iteration: a close-up of the frosted bottle\u2019s neck, BOTTLED SLOWLY embossed in the glass, the sun mark, a blue nautilus and S\u014dl on a textured label' },
        { src: 'assets/case-studies/sol/sol-iteration-06.webp', label: 'Iteration 06, generated', alt: 'Generated iteration: the frosted bottle with a cyanotype nautilus print on its label beside the sun mark, S\u014dl and 10mg THC' },
        { src: 'assets/case-studies/sol/sol-ad-sketches.webp', position: '50% 0%', label: 'Ad sketches', alt: 'Pencil ad layouts: a cyanotype photo grid captioned Effects of getting some sun, and a pulp poster reading Sunkissed Madness, coming soon to a dispo near you' },
        { label: '[Merch: sun faded tees]', alt: '' },
        { label: '[Poster]', alt: '' }
      ],
      // the bottles are generated iterations, a few of many so far: each one
      // is labeled so, and the outcome says it
      ratio: '1 / 1',
      outcome: 'A mock product line and lifestyle brand, with guerrilla-style advertising in progress, centered on relaxing, community and soaking up the sun. The bottles below are a few of many generated iterations so far.'
    }
  },

  // ---------- Gravity ----------
  // Facts from Sadie (Nov 2026). [Brackets] still need her words; grey
  // boxes (no src) are images still to come.
  'gravity': {
    title: 'Gravity',
    hook: 'How do you *feel* gravity? Comfort or Discomfort?',
    role: 'Immersive Interaction Designer',
    disciplines: ['Interaction Design', 'Immersive Experience Design', 'Creative Coding', 'UX/UI'],
    duration: '3-day group sprint',
    status: 'Concept Completed',
    course: 'New Media Creative Collision 2026',
    tools: ['TouchDesigner', 'Claude Code', 'WebGL', 'Figma', 'Webcam', '70 in. display'],
    // TODO(Sadie): the site isn't hosted yet; add url: 'https://...' when
    // it is (until then the button shows greyed out)
    action: { label: 'View Site' },
    hero: {
      video: 'assets/video/gravity.mp4',
      src: 'assets/case-studies/gravity/gravity-arms-open.webp',
      alt: 'A dancer\u2019s outline traced in glowing white particles, arms open, with bubbles drifting around them on a dark ground'
    },
    idea: {
      copy: 'Creative Collision brings together New Media Design students of every year for a 3 day sprint on a new prompt. This year\u2019s prompt: Gravity. Our idea came from one question: how can we make people feel gravity through visual and audio interaction, at a large scale? The motion started as my preliminary work in TouchDesigner, which I converted into code with Claude Code.',
      images: [
        { src: 'assets/case-studies/gravity/gravity-whiteboard.webp', contain: true, label: 'Whiteboard plan', alt: 'Whiteboard sketches: a figure scattering particles labeled Interactive, three small frames moving from comfort to discomfort and back, and a task list: storyboards for video, sound files, build interaction (Sadie), weird experiments for the video' },
        { src: 'assets/case-studies/gravity/gravity-touchdesigner.webp', contain: true, label: 'TouchDesigner mock-up', alt: 'TouchDesigner network: a webcam feed flipped, turned greyscale and leveled, compared against a background, thresholded into a black and white silhouette, then blurred into a soft presence map, with the blur settings open' },
        { label: '[Process image 3]', alt: '' }
      ]
    },
    friction: {
      problem: 'Three days, a team of every skill level with me leading as a senior, and inspiration pulling in many directions, so a direction was hard to pin down fast.',
      response: '[How you got the team moving: one line]',
      result: '[What it led to: one line]',
      images: [
        { label: '[Problem and solution image]', alt: '' }
      ]
    },
    work: {
      ratio: '16 / 9',
      images: [
        { src: 'assets/case-studies/gravity/gravity-in-use.webp', video: 'assets/video/gravity-in-use.mp4', large: true, label: 'In use on the 70 in. display', alt: 'A person raises and sweeps their arms in front of a 70 inch display while Gravity traces their body in particles on screen' },
        { src: 'assets/case-studies/gravity/gravity-controls.webp', label: 'Body mode and controls', alt: 'Gravity in body mode: a figure drawn in white particles and soft blobs on a dark ground, beside a settings panel for camera, mode, framing, ground, particles, trail, gravity, gusts, ink, motion sensitivity and timing' },
        { src: 'assets/case-studies/gravity/gravity-light-ground.webp', label: 'Light ground', alt: 'Two dancers rendered as dark particle silhouettes, bubbles scattering off them, on a pale ground' },
        { src: 'assets/case-studies/gravity/gravity-dark-ground.webp', label: 'Dark ground', alt: 'A figure built from soft white blobs drifting apart on a dark ground' },
        { label: '[Work image 5]', alt: '' },
        { label: '[Work image 6]', alt: '' }
      ],
      outcome: 'We completed the interaction and showed it at the showcase hosted by alum Greg Herman. The optimized site ran as we\u2019d hoped and immersed each person in a world of their own, with settings like color and sound to make it theirs.'
    }
  },

  // ---------- ARCHIVED: Special Olympics New York: Site Redesign ----------
  // Off the homepage and out of the order (Nov 2026), so it's a draft: still
  // at project.html?project=special-olympics. To bring it back, add its slug
  // to HOME_ORDER.
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
