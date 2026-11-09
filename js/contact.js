/*
  CONTACT MODAL
  -------------
  Any element with [data-open-contact] opens the modal; the modal closes
  on its own close button, a backdrop click, or Escape.

  The modal's CONTENT is built here from the constants below, so both
  pages share one copy of the text (index.html / project.html only hold
  an empty <div class="contact-modal">). Text lines are written out
  explicitly, line by line, per the site TEXT RULE (css/components.css):
  ~50 characters max, no widows.
*/
(function () {
  var CONTACT_EMAIL = 'hi@sadiegold.co';
  // TODO(Sadie): drop the PDF at this path (or change it) — the button
  // downloads whatever file lives here.
  var RESUME_URL = '/assets/resume/Sadie-Gold-Resume.pdf'; // absolute: works from any page depth (incl. 404.html)
  // Profile addresses; an empty one shows greyed out and inert (same
  // dead-link rule as the resume).
  var INSTAGRAM_URL = 'https://www.instagram.com/sadiegold.co/';
  var LINKEDIN_URL = 'https://www.linkedin.com/in/sadie-goldberg-653534205';

  // Each string = one line. The location isn't in the popup any more, but
  // the About page still shows it (about.html reads SITE_COPY.location).
  var LOCATION = ['NYC', 'Available Worldwide, Full-time, Summer 2027'];
  var META_LINES = [
    'Product & Brand Designer. Creative Problem Solver.'
  ];
  // One paragraph per line (text-wrap: balance evens any that wrap). The
  // popup ends the last line with a "studio →" link (STUDIO below);
  // popup only: the About page has its own first-person blurb (about.html).
  var BIO_LINES = [
    'I always start with a feeling.',
    'I\u2019m looking for an intense team that iterates fast, sweats the details, and builds together.',
    'I think in systems, and mine are built around people. I design interfaces, products, and brands by asking where users hesitate, lean in, or leave, and why. I prototype until they feel it, not just see it.',
    'I show my process because that\u2019s where the real thinking happens. I make things with artistry, motion, and code, and I lean on philosophy and psychology to understand the people I\u2019m designing for.'
  ];
  var STUDIO = { lead: 'Check out my ', label: 'studio', url: '/studio.html' };

  // shared with the About page (about.html), so the bio has one copy
  // Every email link on the site opens a Gmail compose window in a new
  // tab, prefilled, on every device (never the default mail app). On a
  // phone with the Gmail app, the browser may hand it to the app.
  function mailLink(a, subject) {
    var su = subject ? encodeURIComponent(subject) : '';
    a.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONTACT_EMAIL) + (su ? '&su=' + su : '');
    a.target = '_blank';
    a.rel = 'noopener';
    return a;
  }

  window.SITE_COPY = { email: CONTACT_EMAIL, resume: RESUME_URL, location: LOCATION, meta: META_LINES, bio: BIO_LINES };
  // the Instagram / LinkedIn icon links (built below) for other pages too: about.html
  window.SITE_COPY.mailLink = mailLink;   // about.html
  window.SITE_COPY.social = function (name) {
    return name === 'linkedin'
      ? social('linkedin', 'LinkedIn (opens in a new tab)', LINKEDIN_URL)
      : social('instagram', 'Instagram (opens in a new tab)', INSTAGRAM_URL);
  };

  var modal = document.querySelector('.contact-modal');
  if (!modal) return;

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }
  function lines(cls, list) {
    var p = el('p', cls);
    list.forEach(function (line) { p.appendChild(el('span', 'contact-modal__line', line)); });
    return p;
  }

  var paper = el('div', 'contact-modal__paper');
  var closeBtn = el('button', 'contact-modal__close', 'Close \u2715');
  closeBtn.type = 'button';
  var content = el('div', 'contact-modal__content');

  var emailLink = el('a', 'contact-modal__email', CONTACT_EMAIL);
  mailLink(emailLink, 'Hi Sadie');

  var resume = el('a', 'contact-modal__resume', 'Resume');
  resume.href = RESUME_URL;
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    // Phones/tablets: open the PDF in a new tab (the browser's own PDF
    // viewer, where it can be read, shared or saved) instead of a download.
    resume.target = '_blank';
    resume.rel = 'noopener';
  } else {
    resume.setAttribute('download', 'Sadie-Gold-Resume.pdf'); // desktop: download, with this file name
  }

  // Dead-link rule: if the PDF isn't actually there yet, the button is
  // greyed out and inert (.is-unavailable) instead of downloading a 404.
  // BUG FIX: on Cloudflare Pages a missing file can answer 200 with the
  // homepage HTML instead of a 404, so "ok" alone isn't proof the PDF
  // exists — the response must actually BE a PDF.
  fetch(RESUME_URL, { method: 'HEAD' }).then(function (r) {
    var type = r.headers.get('content-type') || '';
    if (!r.ok || type.indexOf('pdf') === -1) throw new Error('missing');
  }).catch(function () {
    resume.classList.add('is-unavailable');
    resume.setAttribute('aria-disabled', 'true');
    resume.setAttribute('tabindex', '-1');
    resume.removeAttribute('href');
  });

  // Resume + social icons: one row, evenly spaced, equal weight. The icons
  // are bare glyphs (no outline), with a small lift-and-tilt on hover.
  var ICONS = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle class="dot" cx="17.3" cy="6.7" r="1.1"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 10.5v6M7.5 7.4v.1M11.2 16.5v-6M11.2 13.2c0-1.6 1-2.8 2.5-2.8s2.4 1 2.4 2.7v3.4"/></svg>'
  };
  function social(name, label, url) {
    var a = el('a', 'contact-modal__social');
    a.innerHTML = ICONS[name];
    a.setAttribute('aria-label', label);
    a.setAttribute('data-cursor-solid', 'white');
    if (url) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.classList.add('is-unavailable');
      a.setAttribute('aria-disabled', 'true');
    }
    return a;
  }
  var actions = el('div', 'contact-modal__actions');
  actions.appendChild(resume);
  actions.appendChild(social('instagram', 'Instagram (opens in a new tab)', INSTAGRAM_URL));
  actions.appendChild(social('linkedin', 'LinkedIn (opens in a new tab)', LINKEDIN_URL));

  content.appendChild(emailLink);
  content.appendChild(lines('contact-modal__meta', META_LINES));
  var bio = lines('contact-modal__bio', BIO_LINES);
  // last line: "... her art. Check out her studio →" (the link darkens and
  // its arrow nudges right on hover, css/components.css)
  var studio = el('a', 'contact-modal__studio');
  studio.href = STUDIO.url;
  studio.appendChild(el('span', '', STUDIO.label));
  studio.appendChild(el('span', 'contact-modal__arrow', '\u2192'));
  studio.lastChild.setAttribute('aria-hidden', 'true');
  var last = bio.lastChild;
  last.appendChild(document.createTextNode(' ' + STUDIO.lead));
  last.appendChild(studio);
  content.appendChild(bio);
  content.appendChild(actions);
  paper.appendChild(closeBtn);
  paper.appendChild(content);
  modal.appendChild(paper);

  // Closed = inert: nothing inside can be tabbed to or read out while it's
  // invisible. Open = focus moves in; close = focus goes back to the
  // button that opened it.
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Contact');
  modal.inert = true;
  var opener = null;
  // keyboard open -> focus Close; mouse / touch -> focus the dialog, so no
  // focus ring shows around Close
  var viaKeyboard = false;
  document.addEventListener('keydown', function () { viaKeyboard = true; }, true);
  document.addEventListener('pointerdown', function () { viaKeyboard = false; }, true);
  modal.tabIndex = -1;

  function open(trigger) {
    opener = trigger || null;
    modal.inert = false;
    modal.classList.add('is-open');
    document.documentElement.classList.add('is-contact-open'); // page can't scroll behind it
    if (viaKeyboard) closeBtn.focus();
    else modal.focus({ preventScroll: true });
  }
  function close() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.inert = true;
    document.documentElement.classList.remove('is-contact-open');
    if (opener) opener.focus();
  }

  // delegated, so Contact buttons built later (nav.js, project.js) work too
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-open-contact]');
    if (!trigger) return;
    e.preventDefault();
    open(trigger);
  });

  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  // Phones and tablets: pull the sheet down to put it away, like an iOS
  // sheet. From the top of the popup (not mid-scroll) the paper follows
  // the finger; let go past a quarter of the screen, or with a quick
  // flick, and it slides off the bottom and closes. Otherwise it springs
  // back. The grabber bar up top shows it can be pulled.
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
    var grabber = el('span', 'contact-modal__grabber');
    grabber.setAttribute('aria-hidden', 'true');
    paper.insertBefore(grabber, paper.firstChild);

    var SHEET = 'transform 380ms cubic-bezier(0.32, 0.72, 0, 1)';   // iOS sheet curve
    var startY = 0, lastY = 0, lastT = 0, speed = 0, pulling = false, tracking = false;
    var settle = function (y, done) {
      paper.style.transition = SHEET;
      paper.style.transform = 'translateY(' + y + ')';
      var end = function (e) {
        if (e && e.target !== paper) return;
        paper.removeEventListener('transitionend', end);
        clearTimeout(t);
        if (done) done();
      };
      var t = setTimeout(end, 450);
      paper.addEventListener('transitionend', end);
    };
    paper.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1 || paper.scrollTop > 0) { tracking = false; return; }
      tracking = true; pulling = false;
      startY = lastY = e.touches[0].clientY;
      lastT = e.timeStamp; speed = 0;
    }, { passive: true });
    paper.addEventListener('touchmove', function (e) {
      if (!tracking) return;
      var y = e.touches[0].clientY, dy = y - startY;
      if (!pulling) {
        if (dy < 6) { if (dy < -6) tracking = false; return; }   // scrolling up the popup instead
        pulling = true;
        paper.style.transition = 'none';
      }
      e.preventDefault();   // the paper moves, not the page
      speed = (y - lastY) / Math.max(1, e.timeStamp - lastT);
      lastY = y; lastT = e.timeStamp;
      paper.style.transform = 'translateY(' + Math.max(0, dy) + 'px)';
    }, { passive: false });
    var release = function () {
      if (!pulling) { tracking = false; return; }
      tracking = pulling = false;
      var dy = lastY - startY;
      if (dy > window.innerHeight * 0.25 || speed > 0.5) {
        settle('100%', function () {
          close();
          // back in place, unseen, for next time (after the fade)
          setTimeout(function () {
            paper.style.transition = 'none';
            paper.style.transform = '';
            paper.offsetWidth;
            paper.style.transition = '';
          }, 400);
        });
      } else {
        settle('0px', function () { paper.style.transition = ''; paper.style.transform = ''; });
      }
    };
    paper.addEventListener('touchend', release);
    paper.addEventListener('touchcancel', release);
  }
})();
