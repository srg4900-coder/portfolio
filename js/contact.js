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

  // Each inner array = one paragraph; each string = one line.
  var META_LINES = [
    'Based in NYC. Available Worldwide',
    'Brand Designer. Creative Problem Solver. Very Hirable ;)'
  ];
  // Four even lines (~67 chars — Sadie's call to flow better than the
  // 50-char rule), rebalanced with no widows after adding the last sentence.
  var BIO_LINES = [
    'Sadie is an adventurer and artist. She\u2019s been curious since birth',
    'and never stops learning. She loves to sail, snowboard, surf, dance,',
    'and sing badly in her car. She loves a challenging problem or puzzle',
    'and won\u2019t stop until it\u2019s solved. She likes to think holistically.'
  ];

  // shared with the About page (about.html), so the bio has one copy
  window.SITE_COPY = { email: CONTACT_EMAIL, resume: RESUME_URL, meta: META_LINES, bio: BIO_LINES };

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
  emailLink.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONTACT_EMAIL);
  emailLink.target = '_blank';
  emailLink.rel = 'noopener';

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
  content.appendChild(lines('contact-modal__bio', BIO_LINES));
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
})();
