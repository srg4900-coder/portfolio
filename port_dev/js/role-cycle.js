/*
  CYCLING ROLE TEXT (homepage header, next to "I'm a...")
  ---------------------------------------------------------
  Part of the page's load sequence (see js/main.js for the rest of it):
  the FIRST word ("Creative Problem Solver") reveals in letter-by-letter
  at page load, at the same time "Sadie Gold" does. Once that initial
  reveal finishes, there's a 2.4s pause before the real loop starts —
  this isn't the normal "slide up+out, slide up+in" cycle transition,
  it's a one-time load-in. After that, loops through ROLES every
  CYCLE_INTERVAL_MS: the current word's letters slide up + out, left to
  right (staggered); once that's fully clear, the next word's letters
  slide up + in from below, same left-to-right stagger. Add/reorder roles
  freely in the array below.
*/

(function () {
  var ROLES = ['Creative Problem Solver', 'Brand Designer', 'Artist', 'Storyteller'];

  var container = document.getElementById('roleCycle');
  if (!container) return;

  var LETTER_STAGGER_MS = 22;
  var LETTER_DURATION_MS = 220;
  var CYCLE_INTERVAL_MS = 2600;
  var PAUSE_BEFORE_LOOP_MS = 2400; // per spec: pause this long after the initial reveal before looping starts

  var clip = document.createElement('span');
  clip.className = 'role-cycle__clip';
  container.appendChild(clip);

  var idx = 0;
  var currentWordEl;

  function buildWord(text, startClass) {
    var word = document.createElement('span');
    word.className = 'role-cycle__word';
    text.split('').forEach(function (ch, i) {
      var span = document.createElement('span');
      span.className = 'role-cycle__letter' + (startClass ? ' ' + startClass : '');
      span.textContent = ch === ' ' ? ' ' : ch;
      span.style.transitionDelay = (i * LETTER_STAGGER_MS) + 'ms';
      word.appendChild(span);
    });
    return word;
  }

  // Initial reveal uses the same "slide up from below, fade in" look as
  // every incoming cycle word — it's just the very first one, starting
  // at page load instead of after an outgoing word clears.
  currentWordEl = buildWord(ROLES[idx], 'is-in-start');
  clip.appendChild(currentWordEl);

  var initialLetters = currentWordEl.querySelectorAll('.role-cycle__letter');
  var initialRevealDuration = (initialLetters.length - 1) * LETTER_STAGGER_MS + LETTER_DURATION_MS;

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      initialLetters.forEach(function (el) { el.classList.remove('is-in-start'); });
    });
  });

  // BUG FIX: this used to be driven by setInterval(cycle, 2600), with each
  // cycle() independently scheduling its own setTimeout to swap the word.
  // setInterval doesn't wait for a previous tick's async work to finish —
  // if the tab was ever backgrounded/throttled and the browser fired a
  // backlog of missed ticks back-to-back on resume, multiple cycle() runs
  // could overlap, each capturing the same stale currentWordEl and each
  // appending its own new "incoming" word that no later cycle ever knew
  // to clean up — leaving old words stuck, concatenated with no space
  // (exactly the "StorytellerBrand Designer..." stuck-text bug). A
  // self-scheduling setTimeout loop makes that impossible: the NEXT cycle
  // is only ever scheduled after the current one's DOM swap is fully
  // done, so there can never be more than one word mid-transition.
  function cycle() {
    idx = (idx + 1) % ROLES.length;

    var outgoing = currentWordEl;
    var outLetters = outgoing.querySelectorAll('.role-cycle__letter');
    outLetters.forEach(function (el) { el.classList.add('is-out'); });

    var outDuration = (outLetters.length - 1) * LETTER_STAGGER_MS + LETTER_DURATION_MS;

    setTimeout(function () {
      // Defensive cleanup: remove the outgoing word plus any other stray
      // .role-cycle__word left over in the clip, so a single missed edge
      // case can never compound into permanently-stuck text.
      Array.prototype.forEach.call(clip.querySelectorAll('.role-cycle__word'), function (el) {
        el.remove();
      });

      var incoming = buildWord(ROLES[idx], 'is-in-start');
      clip.appendChild(incoming);
      currentWordEl = incoming;
      // double rAF: let the is-in-start (no-transition) state actually
      // paint first, then remove it so the slide-in transition has a
      // starting frame to animate FROM rather than skipping straight to rest.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          incoming.querySelectorAll('.role-cycle__letter').forEach(function (el) {
            el.classList.remove('is-in-start');
          });
        });
      });

      setTimeout(cycle, CYCLE_INTERVAL_MS);
    }, outDuration);
  }

  // First loop cycle fires only after the initial reveal finishes AND
  // the spec'd 2.4s pause — not just after CYCLE_INTERVAL_MS from script
  // load, since the initial reveal isn't itself a cycle.
  setTimeout(cycle, initialRevealDuration + PAUSE_BEFORE_LOOP_MS);
})();
