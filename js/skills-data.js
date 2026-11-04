/*
  SKILLS — the About page's Skills row (rendered by js/skills.js).

  Grouped here only to keep the list tidy and to let a company link show
  some groups first: on the page they read as one even row of icons.
  `icon` names a drawing in js/skills.js (ICONS). `hide: true` keeps an
  entry in the list without showing it.

  Group order: SKILL_GROUPS order by default. A company link (?for=, made
  at /admin/) can save its own group order; groups it leaves out follow
  in the default order. SKILL_PRESETS are the starting orders offered in
  /admin/ by the kind of place being applied to.
*/
window.SKILL_GROUPS = [
  {
    id: 'design',
    label: 'Design',
    items: [
      { name: 'Figma', icon: 'figma' },
      { name: 'Illustrator', icon: 'ai' },
      { name: 'Photoshop', icon: 'ps' },
      { name: 'InDesign', icon: 'id' },
      { name: 'Lightroom', icon: 'lr' }
    ]
  },
  {
    id: 'motion',
    label: 'Motion & 3D',
    items: [
      { name: 'After Effects', icon: 'ae' },
      { name: 'Premiere Pro', icon: 'pr' },
      { name: 'Cinema 4D', icon: 'c4d' },
      { name: 'Fusion 360', icon: 'fusion' }
    ]
  },
  {
    id: 'interactive',
    label: 'Interactive & Code',
    items: [
      { name: 'TouchDesigner', icon: 'td' },
      { name: 'MediaPipe', icon: 'mediapipe' },
      { name: 'WebGL', icon: 'webgl' },
      { name: 'JavaScript', icon: 'js' },
      { name: 'Claude Code', icon: 'claude' },
      { name: 'Arduino', icon: 'arduino' },
      { name: 'Framer', icon: 'framer' }
    ]
  },
  {
    id: 'ai',
    label: 'AI Production',
    items: [
      { name: 'Nano Banana Pro', icon: 'banana' },
      { name: 'Midjourney', icon: 'midjourney' },
      { name: 'Figma Weave', icon: 'weave' },
      { name: 'ComfyUI', icon: 'comfy' }
    ]
  }
];

window.SKILL_PRESETS = [
  { label: 'Tech / product', order: ['design', 'interactive', 'ai', 'motion'] },
  { label: 'Fashion / brands', order: ['design', 'motion', 'ai', 'interactive'] },
  { label: 'Marketing / design agencies', order: ['design', 'motion', 'ai', 'interactive'] },
  { label: 'Motion studios', order: ['motion', 'design', 'interactive', 'ai'] },
  { label: 'Experiential / installation', order: ['interactive', 'motion', 'design', 'ai'] }
];
