/*
  HAND GESTURES — shared frame data + builder
  -------------------------------------------
  Sadie's Figma "Animated Hands Gestures" frames (assets/cursor/), used
  two ways from this one definition:
    - js/cursor.js  (mouse/trackpad): the hand IS the cursor over any
      [data-cursor-gesture="<name>"] element
    - js/touch.js   (phones/tablets): no cursor exists, so the same hands
      play once at a fixed spot instead (contact popup, Resume tap)

    loop: true   repeats while active, rests on the LAST frame
    loop: false  plays once and holds the last frame

  HandGestures.build(className) makes one element holding every frame of
  every gesture, stacked and preloaded (only .is-current shows — see
  .cursor-gesture / .touch-gesture in components.css), so swapping frames
  never flickers.
*/
(function () {
  var GESTURES = {
    'wave': {
      frames: ['assets/cursor/wave-1.svg', 'assets/cursor/wave-2.svg',
               'assets/cursor/wave-3.svg', 'assets/cursor/wave-4.svg'],
      frameMs: 110,
      loop: true
    },
    'thumbs-up': {
      frames: ['assets/cursor/thumbs-up-1.svg', 'assets/cursor/thumbs-up-2.svg'],
      frameMs: 140,
      loop: false
    }
  };

  // Pages outside the site root (mindcloud/) can set window.HAND_GESTURE_BASE.
  var base = window.HAND_GESTURE_BASE || '';

  function build(className) {
    var root = document.createElement('div');
    root.className = className;
    root.setAttribute('aria-hidden', 'true');
    var sets = {};
    Object.keys(GESTURES).forEach(function (name) {
      sets[name] = GESTURES[name].frames.map(function (src) {
        var img = document.createElement('img');
        img.src = base + src;
        img.alt = '';
        img.className = className + '__frame';
        root.appendChild(img);
        return img;
      });
    });
    var current = null;
    return {
      el: root,
      sets: sets,
      // show frame i of gesture `name` (null hides everything)
      show: function (name, i) {
        if (current) current.classList.remove('is-current');
        current = name ? sets[name][i] : null;
        if (current) current.classList.add('is-current');
      }
    };
  }

  window.HandGestures = {
    GESTURES: GESTURES,
    build: build,
    REDUCE_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };
})();
