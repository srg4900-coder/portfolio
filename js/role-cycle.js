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
  // ---------- "I'm a…" / "I'm an…" ----------
  // Roles starting with a vowel sound read "I'm AN…" ("I'm an Artist").
  // The "n" is one more .role-cycle__letter, so it slides with the exact
  // same up-and-out / up-from-below motion as the role words: out WITH
  // the outgoing word when the next role doesn't need it, in WITH the
  // incoming word when it does — while its slot smoothly opens/closes
  // (width), so "a" and "…" glide apart/together instead of jumping.
  // Built lazily on the first cycle: js/main.js re-splits the "I'm a…"
  // text into letter spans after this script runs, which would wipe out
  // anything inserted earlier.
  var nSlot = null, nLetter = null, nShown = false;
  function needsAn(role) { return /^[aeiou]/i.test(role); }
  function ensureN() {
    if (nSlot) return true;
    var imA = document.querySelector('.hero-decor__im-a');
    if (!imA) return false;
    var aLetter = Array.prototype.filter.call(imA.querySelectorAll('.letter'), function (el) {
      return el.textContent === 'a';
    })[0];
    if (!aLetter) return false;
    nSlot = document.createElement('span');
    nSlot.className = 'im-a__n';
    nSlot.setAttribute('aria-hidden', 'true');
    nLetter = document.createElement('span');
    nLetter.className = 'role-cycle__letter is-in-start';
    nLetter.textContent = 'n';
    nSlot.appendChild(nLetter);
    aLetter.parentNode.insertBefore(nSlot, aLetter.nextSibling);
    return true;
  }
  function showN(show) {
    if (show === nShown || !ensureN()) return;
    nShown = show;
    nSlot.setAttribute('aria-hidden', show ? 'false' : 'true'); // screen readers only hear "an" when it shows
    if (show) {
      var w = nLetter.getBoundingClientRect().width;
      nSlot.style.width = w > 0 ? w + 'px' : '0.55em'; // fallback ≈ one "n"
      nLetter.classList.remove('is-out');
      nLetter.classList.add('is-in-start');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { nLetter.classList.remove('is-in-start'); });
      });
    } else {
      nSlot.style.width = '0px';
      nLetter.classList.add('is-out');
    }
  }

  function cycle() {
    idx = (idx + 1) % ROLES.length;
    if (!needsAn(ROLES[idx])) showN(false); // "n" leaves together with the outgoing word

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
      if (needsAn(ROLES[idx])) showN(true); // "n" arrives together with the incoming word
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
