/*
  SITE NAV — builds the header on every page from one list, so a link
  only ever changes here. Each page holds just:
    <header class="site-nav"><a class="logo-button" href="index.html">SG</a></header>
  (the logo works without JS). Must load BEFORE contact.js is used, which
  is fine either way: contact.js listens for [data-open-contact] clicks
  on the whole document.

  The current page's link gets aria-current="page" (underlined in
  components.css). Project pages count as Work.
  When a company link is open (?for=, js/order.js), the links carry it.
*/
(function () {
  // Studio is deliberately NOT here: it's found from About, the homepage
  // (under the prints) and the footer, so it never competes with the work.
  var LINKS = [
    { label: 'Work', href: 'index.html#work', page: 'work' },
    { label: 'About', href: 'about.html', page: 'about' },
    { label: 'Contact', contact: true }
  ];

  var header = document.querySelector('.site-nav');
  if (!header) return;

  var body = document.body;
  var current =
    body.classList.contains('project-page') || body.classList.contains('home') ? 'work' :
    body.getAttribute('data-page') || '';

  // logo: "SG" mark, full name beside it on wider screens (components.css)
  var logo = header.querySelector('.logo-button');
  if (logo) {
    logo.setAttribute('aria-label', 'Sadie Gold, home');
    logo.innerHTML = '<span aria-hidden="true">SG</span><span class="logo-button__name" aria-hidden="true">Sadie Gold</span>';
  }

  var nav = document.createElement('nav');
  nav.className = 'nav-right';
  nav.setAttribute('aria-label', 'Main');

  LINKS.forEach(function (link) {
    var item;
    if (link.contact) {
      item = document.createElement('button');
      item.type = 'button';
      item.setAttribute('data-open-contact', '');
    } else {
      item = document.createElement('a');
      item.href = link.href;
      // the homepage itself shows Work, but it's a place on the page, not
      // a separate page, so it doesn't claim aria-current there
      if (link.page === current && !body.classList.contains('home')) item.setAttribute('aria-current', 'page');
    }
    item.textContent = link.label;
    item.setAttribute('data-cursor-solid', 'white');
    nav.appendChild(item);
  });

  header.appendChild(nav);

  // GRID OVERLAY: Shift+G shows the 8 columns of the page grid (margins +
  // gutters from css/tokens.css), to check that things line up. Press again
  // to hide. Ignored while typing in a field.
  var overlay = null;
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'G' || !e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if (overlay) { overlay.remove(); overlay = null; return; }
    overlay = document.createElement('div');
    overlay.className = 'grid-overlay grid';
    overlay.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 8; i++) overlay.appendChild(document.createElement('span'));
    document.body.appendChild(overlay);
  });
})();
