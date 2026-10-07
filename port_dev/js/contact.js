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
  var RESUME_URL = 'assets/resume/Sadie-Gold-Resume.pdf';

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

  modal.setAttribute('data-cursor-gesture', 'wave'); // hand cursors (js/cursor.js)

  var paper = el('div', 'contact-modal__paper');
  var closeBtn = el('button', 'contact-modal__close', 'Close \u2715');
  var content = el('div', 'contact-modal__content');

  var emailLink = el('a', 'contact-modal__email', CONTACT_EMAIL);
  emailLink.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONTACT_EMAIL);
  emailLink.target = '_blank';
  emailLink.rel = 'noopener';

  var resume = el('a', 'contact-modal__resume', 'Resume');
  resume.href = RESUME_URL;
  resume.setAttribute('download', '');
  resume.setAttribute('data-cursor-gesture', 'thumbs-up');

  // Dead-link rule: if the PDF isn't actually there yet, the button is
  // greyed out and inert (.is-unavailable) instead of downloading a 404.
  fetch(RESUME_URL, { method: 'HEAD' }).then(function (r) {
    if (!r.ok) throw new Error('missing');
  }).catch(function () {
    resume.classList.add('is-unavailable');
    resume.setAttribute('aria-disabled', 'true');
    resume.setAttribute('tabindex', '-1');
    resume.removeAttribute('href');
    resume.removeAttribute('data-cursor-gesture');
  });

  content.appendChild(emailLink);
  content.appendChild(lines('contact-modal__meta', META_LINES));
  content.appendChild(lines('contact-modal__bio', BIO_LINES));
  content.appendChild(resume);
  paper.appendChild(closeBtn);
  paper.appendChild(content);
  modal.appendChild(paper);

  function open() { modal.classList.add('is-open'); }
  function close() { modal.classList.remove('is-open'); }

  document.querySelectorAll('[data-open-contact]').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      open();
    });
  });

  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
