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

  window.PortfolioOrder:
    ready         Promise resolving to the list of slugs to show
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

  var ready;
  if (!key) {
    ready = Promise.resolve(defaultOrder);
  } else {
    var CACHE_KEY = 'sg-order:' + key;
    var fromCache = function () {
      try {
        var cached = clean(JSON.parse(localStorage.getItem(CACHE_KEY)));
        if (cached.length) return cached;
      } catch (e) {}
      return defaultOrder;
    };
    var request = fetch('/api/order/' + encodeURIComponent(key), { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        var order = clean(data.order);
        if (!order.length) throw new Error('empty');
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(order)); } catch (e) {}
        return order;
      });
    var timeout = new Promise(function (_, reject) { setTimeout(reject, TIMEOUT_MS); });
    ready = Promise.race([request, timeout]).catch(fromCache);
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

  window.PortfolioOrder = { ready: ready, key: key, link: link, defaultOrder: defaultOrder };
})();
