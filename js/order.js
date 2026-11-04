/*
  PORTFOLIO ORDER — which projects show, and in what order.

  Default: HOME_ORDER from js/projects-data.js.
  Company links: sadiegold.co/?for=<name> loads the order saved for that
  name in /admin/ (stored by functions/api, GET /api/order/<name>). The
  ?for= stays on every internal link the visitor follows, so the counter
  ("02 / 04") and Next Project follow that order too, and a reload of any
  page lands on the same order again.

  If the name is unknown or the backend can't be reached, the last order
  this browser saw for that name is used, else the default, so a link
  never breaks into an empty page.

  The same link can also carry a Skills group order (About page,
  js/skills.js): saved alongside it in /admin/, cached the same way.

  window.PortfolioOrder:
    ready         Promise resolving to the list of slugs to show
    skills        Promise resolving to the link's skill group ids (in
                  order), or [] for the default
    key           the ?for= name, or null
    link(url)     url with ?for= added (unchanged when there's no key)
    defaultOrder  HOME_ORDER, cleaned
*/
(function () {
  var PROJECTS = window.PROJECTS || {};
  var TIMEOUT_MS = 3500;

  function clean(list) {
    return (Array.isArray(list) ? list : []).filter(function (slug, i, all) {
      return PROJECTS[slug] && all.indexOf(slug) === i;
    });
  }

  var defaultOrder = clean(window.HOME_ORDER);
  var key = new URLSearchParams(window.location.search).get('for');
  if (key && !/^[a-z0-9-]{1,48}$/.test(key)) key = null;

  function link(url) {
    if (!key || /[?&]for=/.test(url)) return url;
    var hashAt = url.indexOf('#');
    var hash = hashAt > -1 ? url.slice(hashAt) : '';
    var base = hashAt > -1 ? url.slice(0, hashAt) : url;
    return base + (base.indexOf('?') > -1 ? '&' : '?') + 'for=' + encodeURIComponent(key) + hash;
  }

  var ready, skills;
  if (!key) {
    ready = Promise.resolve(defaultOrder);
    skills = Promise.resolve([]);
  } else {
    var CACHE_KEY = 'sg-order:' + key;
    var SKILLS_KEY = 'sg-skills:' + key;
    var cached = function (name) {
      try { return JSON.parse(localStorage.getItem(name)); } catch (e) { return null; }
    };
    var store = function (name, value) {
      try { localStorage.setItem(name, JSON.stringify(value)); } catch (e) {}
    };
    var fromCache = function () {
      var order = clean(cached(CACHE_KEY));
      return order.length ? order : defaultOrder;
    };
    var cleanSkills = function (list) {
      return (Array.isArray(list) ? list : []).filter(function (id) { return /^[a-z0-9-]{1,32}$/.test(id); });
    };
    var timeout = new Promise(function (_, reject) { setTimeout(reject, TIMEOUT_MS); });
    var request = Promise.race([
      fetch('/api/order/' + encodeURIComponent(key), { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); }),
      timeout
    ]);
    ready = request.then(function (data) {
      var order = clean(data.order);
      if (!order.length) throw new Error('empty');
      store(CACHE_KEY, order);
      return order;
    }).catch(fromCache);
    skills = request.then(function (data) {
      var list = cleanSkills(data.skills);
      store(SKILLS_KEY, list);
      return list;
    }).catch(function () { return cleanSkills(cached(SKILLS_KEY)); });
  }

  // keep ?for= on internal page links (nav, footer, cards) as they're followed
  if (key) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (/^(\/|index\.html|project\.html|about\.html|studio\.html)/.test(href) && !/^\/(mindcloud|admin|api)/.test(href)) {
        a.setAttribute('href', link(href));
      }
    }, true);
  }

  window.PortfolioOrder = { ready: ready, skills: skills, key: key, link: link, defaultOrder: defaultOrder };
})();
