/*
  CASE STUDY — builds the whole page for ?project=<slug> from that
  project's entry in js/projects-data.js (field reference at the top of
  that file). project.html only holds an empty <main>.

  Page order:
    HERO      counter (from the portfolio order, js/order.js), title, hook,
              full-bleed image or video, Role + Disciplines, optional
              action button. Nothing else, so the top reads in a glance.
    STEPS     "01 Idea / 02 Friction / 03 Work" progress strip: sticky on
              desktop, slides in on scroll-up on phones (css/project.css)
    01 Idea, 02 Friction, 03 Work
              any section with no data is skipped entirely (and left out
              of the strip); Status "In Progress" renames Work to
              "Work So Far". Idea's images are loose papers (below).
    CREDITS   Duration, Status, Award, Released, Client, Course,
              Collaborators, Tools: whichever exist
    NEXT      next project's title + hero (loops last -> first), All Work,
              Contact

  IDEA PAPERS: Idea images are scattered like sheets on a table, sized to
  fill the section, tilted a little, overlapping (layoutPapers). Click a
  paper: it comes to the front (js/paper.js). Click the front paper again
  (or press Enter on any): it opens in the viewer. Mouse / trackpad can
  drag them anywhere inside the section (js/drag.js). Phones get a plain
  two-across stack where a tap opens the viewer. No captions: the images
  say what they are (the label still shows in the viewer).

  Images with no src render as grey "missing" boxes carrying their label,
  so unfinished projects show exactly what still needs an asset. Every
  real image opens in the shared viewer (js/viewer.js); each section is
  its own set for the arrow keys. Layout is the 8-column grid
  (css/tokens.css, css/project.css).
*/
(function () {
  var PROJECTS = window.PROJECTS || {};
  var ALIASES = window.PROJECT_ALIASES || {};
  var Order = window.PortfolioOrder || { ready: Promise.resolve(window.HOME_ORDER || []), link: function (u) { return u; } };

  var main = document.getElementById('case-study');
  if (!main) return;

  var slug = new URLSearchParams(window.location.search).get('project');
  if (slug && ALIASES[slug]) slug = ALIASES[slug];
  var data = slug && PROJECTS[slug];

  // ---------- helpers ----------
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }
  function list(v) {
    if (Array.isArray(v)) return v.map(function (s) { return String(s).trim(); }).filter(Boolean);
    return v ? [String(v).trim()] : [];
  }
  // a field can be a string or a list; either way, '' when empty
  function text(v) { return list(v).join(', '); }
  function pad(n) { return String(n).padStart(2, '0'); }

  // DURATION RULE: a number and a unit ("3 days", "2 weeks", "1 year"), or
  // the one word "Ongoing". Plural is fixed automatically ("1 weeks" ->
  // "1 week"). Anything else returns null: it doesn't render, and the
  // console reminder below flags it.
  var DURATION = /^(\d+)\s+(day|week|month|year)s?$/i;
  function duration(v) {
    var s = text(v);
    if (!s) return '';
    if (/^ongoing$/i.test(s)) return 'Ongoing';
    var m = s.match(DURATION);
    if (!m) return null;
    var n = Number(m[1]);
    return n + ' ' + m[2].toLowerCase() + (n === 1 ? '' : 's');
  }
  function projectUrl(s) { return Order.link('project.html?project=' + encodeURIComponent(s)); }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // img, or a muted loop when the entry has `video` (src becomes the poster)
  function media(item, cls, eager) {
    var node;
    if (item.video) {
      node = document.createElement('video');
      node.src = item.video;
      if (item.src) node.poster = item.src;
      node.muted = true;
      node.defaultMuted = true;
      node.loop = true;
      node.playsInline = true;
      node.autoplay = !reduceMotion;
      node.preload = eager ? 'auto' : 'metadata';
      node.setAttribute('role', 'img');
      node.setAttribute('aria-label', item.alt || '');
    } else {
      node = document.createElement('img');
      node.src = item.src;
      node.alt = item.alt || '';
      node.loading = eager ? 'eager' : 'lazy';
      node.decoding = 'async';
    }
    node.className = cls;
    if (item.position) node.style.objectPosition = item.position;
    return node;
  }

  // grey box standing in for an asset that isn't in the folder yet
  function missing(label, cls) {
    var box = el('div', cls + ' is-missing');
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', 'Image to come: ' + (label || 'image'));
    box.appendChild(el('span', 'is-missing__tag text-label', 'Missing'));
    if (label) box.appendChild(el('span', 'is-missing__label text-label', label));
    return box;
  }

  // one labeled image that opens in the viewer (or a missing box)
  function figure(item) {
    var fig = el('figure', 'cs-fig' + (item.large ? ' cs-fig--large' : '') +
      (item.cutout ? ' cs-fig--cutout' : '') + (item.contain ? ' cs-fig--contain' : ''));
    if (!item.src) {
      fig.appendChild(missing(item.label, 'cs-fig__open'));
    } else {
      var open = el('button', 'cs-fig__open');
      open.type = 'button';
      open.setAttribute('data-viewer', '');
      open.setAttribute('data-src', item.src);
      if (item.video) open.setAttribute('data-video', item.video);
      open.setAttribute('data-alt', item.alt || '');
      open.setAttribute('data-label', item.label || '');
      open.setAttribute('aria-label', 'View larger: ' + (item.alt || item.label || 'image'));
      open.setAttribute('data-cursor-label', item.video ? 'Play' : 'View');
      open.appendChild(media(item, 'cs-fig__media'));
      var icon = el('span', 'cs-fig__icon', item.video ? '▶' : '+');
      icon.setAttribute('aria-hidden', 'true');
      open.appendChild(icon);
      fig.appendChild(open);
    }
    if (item.label) fig.appendChild(el('figcaption', 'cs-fig__label', item.label));
    return fig;
  }

  // ratio: optional per-section tile shape, e.g. '16 / 10' for film frames
  function figures(items, cls, ratio) {
    var wrap = el('div', cls);
    wrap.setAttribute('data-viewer-group', '');
    if (ratio) wrap.style.setProperty('--tile-ratio', ratio);
    items.forEach(function (item) { wrap.appendChild(figure(item)); });
    return wrap;
  }

  // entries worth rendering: a real image, or a labeled placeholder
  function usable(items) {
    return (items || []).filter(function (i) { return i && (i.src || i.label); });
  }

  // ---------- Idea papers ----------
  var wide = window.matchMedia('(min-width: 761px)');

  function papers(items) {
    var wrap = el('div', 'cs-papers');
    wrap.setAttribute('data-drag-bounds', '');
    wrap.setAttribute('data-viewer-group', '');
    items.forEach(function (item) {
      var paper = el('div', 'paper cs-paper' + (item.cutout ? ' is-cutout' : ''));
      paper.setAttribute('data-draggable', '');
      var inner = el('div', 'paper__inner');
      if (item.src) {
        // opens in the viewer itself (on the second click), not on the first
        paper.setAttribute('role', 'button');
        paper.tabIndex = 0;
        paper.setAttribute('data-viewer', '');
        paper.setAttribute('data-viewer-manual', '');
        paper.setAttribute('data-src', item.src);
        if (item.video) paper.setAttribute('data-video', item.video);
        paper.setAttribute('data-alt', item.alt || '');
        paper.setAttribute('data-label', item.label || '');
        paper.setAttribute('aria-label', 'View larger: ' + (item.alt || item.label || 'image'));
        var img = media(item, 'cs-paper__img', true);
        img.draggable = false; // the browser's own image drag would hijack the pointer
        inner.appendChild(img);
      } else {
        inner.appendChild(missing(item.label, 'cs-paper__img'));
      }
      paper.appendChild(inner);
      wrap.appendChild(paper);
    });
    return wrap;
  }

  // small seeded random, so each project's scatter is the same every visit
  function seeded(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6D2B79F5;
      var t = Math.imul(h ^ (h >>> 15), 1 | h);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shape(paper) {
    var m = paper.querySelector('img, video');
    if (m && m.naturalWidth) return m.naturalWidth / m.naturalHeight;
    if (m && m.videoWidth) return m.videoWidth / m.videoHeight;
    return 4 / 3;
  }

  // Desktop / tablet: papers spread across the section, each about a third
  // of its width (more papers = smaller, more overlap), alternately high
  // and low with a little seeded jitter and tilt. The section grows to fit
  // the lowest paper, so nothing ever hangs outside it.
  function layoutPapers(wrap) {
    var list = Array.prototype.slice.call(wrap.children);
    if (!wide.matches) {
      list.forEach(function (p) { p.style.left = p.style.top = p.style.width = p.style.zIndex = ''; });
      wrap.style.height = '';
      return;
    }
    var rand = seeded(slug);
    var W = wrap.clientWidth;
    var n = list.length;
    var share = n === 1 ? 0.5 : n === 2 ? 0.46 : n === 3 ? 0.4 : n === 4 ? 0.34 : 0.28;
    var pw = Math.round(W * share);
    var heights = list.map(function (p) { return pw / shape(p); });
    var tallest = Math.max.apply(null, heights);
    var bottom = 0;
    list.forEach(function (p, i) {
      var x = n === 1 ? (W - pw) / 2 : i * (W - pw) / (n - 1);
      var y = ((i % 2 ? 0.2 : 0.02) + rand() * 0.1) * tallest;
      p.style.width = pw + 'px';
      p.style.left = Math.round(x) + 'px';
      p.style.top = Math.round(y) + 'px';
      p.style.zIndex = String(i + 1);
      p.style.setProperty('--tilt', ((rand() * 2 - 1) * 4).toFixed(1) + 'deg');
      bottom = Math.max(bottom, y + heights[i]);
    });
    wrap.style.height = Math.ceil(bottom + 32) + 'px'; // room for tilt + shadow
  }

  function startPapers(wrap) {
    var list = Array.prototype.slice.call(wrap.children);
    var relayout = function () { if (!wrap.querySelector('.was-dragged')) layoutPapers(wrap); };
    layoutPapers(wrap);
    // re-place as each image's real shape arrives (until someone drags)
    wrap.querySelectorAll('img').forEach(function (img) { if (!img.complete) img.addEventListener('load', relayout); });
    wrap.querySelectorAll('video').forEach(function (v) { v.addEventListener('loadedmetadata', relayout); });
    var lastW = wrap.clientWidth, resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (Math.abs(wrap.clientWidth - lastW) < 2) return;
        lastW = wrap.clientWidth;
        list.forEach(function (p) { p.classList.remove('was-dragged'); });
        layoutPapers(wrap);
      }, 150);
    });

    if (window.PaperInteraction) window.PaperInteraction.refresh();
    if (window.DragAndDrop) window.DragAndDrop.refresh();

    // the last paper starts on top, so it's the front one
    var front = list[list.length - 1];
    if (front && window.PaperInteraction) window.PaperInteraction.setFront(front);

    function labels(top) {
      list.forEach(function (p) {
        if (!p.hasAttribute('data-viewer')) return;
        p.setAttribute('data-cursor-label', p === top ? 'View' : 'Drag');
      });
    }
    labels(front);

    wrap.addEventListener('paper:activate', function (e) {
      var p = e.target;
      labels(p);
      if (e.detail.source === 'drag' || !p.hasAttribute('data-viewer') || !window.ImageViewer) return;
      // phones: no stack to shuffle, so a tap opens it straight away
      if (e.detail.wasActive || !wide.matches) window.ImageViewer.open(p);
    });
    wrap.addEventListener('keydown', function (e) {
      var p = e.target.closest('.cs-paper');
      if (!p || !p.hasAttribute('data-viewer') || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      if (window.PaperInteraction) window.PaperInteraction.setFront(p);
      labels(p);
      window.ImageViewer.open(p);
    });
  }

  // ---------- no such project ----------
  if (!data) {
    document.title = 'Project not found | Sadie Gold';
    var lost = el('section', 'cs-missing grid');
    lost.appendChild(el('h1', 'text-h1', 'Project not found'));
    var back = el('a', 'cs-link', 'See all work →');
    back.href = Order.link('index.html#work');
    lost.appendChild(back);
    main.appendChild(lost);
    return;
  }

  // the portfolio order (default, or a company link's) decides the
  // counter and Next Project, so build once it's known
  Order.ready.then(function (ORDER) { build(ORDER.filter(function (s) { return PROJECTS[s]; })); });

  function build(ORDER) {
    document.title = data.title + ' | Sadie Gold';
    document.body.setAttribute('data-project', slug);
    var inProgress = data.status === 'In Progress';
    var position = ORDER.indexOf(slug); // -1 for a draft or a project left out of this link

    // ---------- HERO ----------
    var hero = el('header', 'cs-hero');
    var head = el('div', 'cs-hero__head grid');
    if (position > -1) {
      var count = el('p', 'cs-hero__count text-label load-rise', pad(position + 1) + ' / ' + pad(ORDER.length));
      count.setAttribute('aria-label', 'Project ' + (position + 1) + ' of ' + ORDER.length);
      head.appendChild(count);
    }
    // "Name: Subtitle" -> the subtitle sits smaller under the name
    var split = data.title.indexOf(': ');
    var h1 = el('h1', 'cs-hero__title');
    var name = el('span', 'cs-hero__name text-title letter-reveal', split > -1 ? data.title.slice(0, split) : data.title);
    h1.appendChild(name);
    if (split > -1) h1.appendChild(el('span', 'cs-hero__subtitle load-rise', data.title.slice(split + 2)));
    head.appendChild(h1);
    if (text(data.hook)) {
      var hook = el('p', 'cs-hero__hook load-rise', text(data.hook));
      hook.style.setProperty('--load-delay', '300ms');
      head.appendChild(hook);
    }
    hero.appendChild(head);

    var heroData = data.hero || {};
    var heroFig = el('figure', 'cs-hero__media load-rise');
    heroFig.style.setProperty('--load-delay', '420ms');
    if (heroData.src) {
      var heroMedia = media(heroData, 'cs-hero__img', true);
      heroFig.appendChild(heroMedia);
      // moving hero: muted by default, sound only from this button
      if (heroData.video) {
        var mute = el('button', 'cs-hero__mute', 'Unmute');
        mute.type = 'button';
        mute.setAttribute('data-cursor-solid', 'white');
        mute.addEventListener('click', function () {
          heroMedia.muted = !heroMedia.muted;
          mute.textContent = heroMedia.muted ? 'Unmute' : 'Mute';
          heroMedia.play().catch(function () {});
        });
        heroFig.appendChild(mute);
        if (reduceMotion) heroMedia.controls = true;
        else heroMedia.play().catch(function () {});
      }
    } else {
      heroFig.appendChild(missing(heroData.label || 'Hero image', 'cs-hero__img'));
    }
    hero.appendChild(heroFig);

    var info = el('div', 'cs-hero__info grid');
    var meta = el('dl', 'cs-meta');
    // stacked: one entry per line (collaborators), otherwise comma-separated
    function metaRow(target, label, value, opts) {
      var items = list(value);
      if (!items.length) return;
      opts = opts || {};
      var row = el('div', 'cs-meta__row');
      row.appendChild(el('dt', 'text-label', label));
      var dd = el('dd');
      if (opts.tag) dd.appendChild(el('span', (opts.award ? 'award-tag' : 'cs-tag') + ' text-label', items[0]));
      else if (opts.stacked) items.forEach(function (i) { dd.appendChild(el('span', 'cs-meta__line', i)); });
      else dd.textContent = items.join(', ');
      row.appendChild(dd);
      target.appendChild(row);
    }
    // the top only answers "what did she do here"; the rest is in CREDITS
    metaRow(meta, 'Role', data.role);
    metaRow(meta, 'Disciplines', data.disciplines);
    if (meta.children.length) info.appendChild(meta);

    var act = data.action || {};
    if (act.label && (act.url || act.video)) {
      var action;
      if (act.video) {
        // plays right here, in the viewer, with sound and controls
        action = el('button', 'cs-action', act.label);
        action.type = 'button';
        action.setAttribute('data-viewer', '');
        action.setAttribute('data-video', act.video);
        action.setAttribute('data-src', heroData.src || '');
        action.setAttribute('data-alt', data.title);
        action.setAttribute('data-label', data.title);
        action.appendChild(el('span', 'cs-action__arrow', ' ▶'));
      } else {
        action = el('a', 'cs-action', act.label);
        action.href = act.url;
        if (/^https?:/.test(act.url)) {
          action.target = '_blank';
          action.rel = 'noopener';
          action.appendChild(el('span', 'cs-action__arrow', ' ↗'));
          action.setAttribute('aria-label', act.label + ' (opens in a new tab)');
        }
      }
      action.setAttribute('data-cursor-solid', 'white');
      info.appendChild(action);
    }
    if (info.children.length) hero.appendChild(info);
    main.appendChild(hero);

    // ---------- SECTIONS ----------
    function section(id, num, label) {
      var sec = el('section', 'cs-section grid');
      sec.id = id;
      sec.setAttribute('aria-labelledby', id + '-title');
      var h = el('h2', 'cs-section__title');
      h.id = id + '-title';
      h.appendChild(el('span', 'cs-section__num', num));
      h.appendChild(document.createTextNode(label));
      sec.appendChild(h);
      return sec;
    }

    var sections = [];

    var idea = data.idea || {};
    var ideaImages = usable(idea.images);
    if (text(idea.copy) || ideaImages.length) {
      var ideaSec = section('idea', '01', 'Idea');
      if (text(idea.copy)) ideaSec.appendChild(el('p', 'cs-section__copy text-project-body', text(idea.copy)));
      var ideaPapers = ideaImages.length ? papers(ideaImages) : null;
      if (ideaPapers) ideaSec.appendChild(ideaPapers);
      sections.push({ node: ideaSec, num: '01', name: 'Idea' });
    }

    var friction = data.friction || {};
    var beats = [['Problem', text(friction.problem)], ['Response', text(friction.response)], ['Result', text(friction.result)]]
      .filter(function (b) { return b[1]; });
    var frictionImages = usable(friction.images);
    if (beats.length || frictionImages.length) {
      var frictionSec = section('friction', '02', 'Friction');
      if (beats.length) {
        var dl = el('dl', 'cs-beats');
        beats.forEach(function (b) {
          var row = el('div', 'cs-beats__row');
          row.appendChild(el('dt', 'cs-beats__label', b[0]));
          row.appendChild(el('dd', 'cs-beats__text', b[1]));
          dl.appendChild(row);
        });
        frictionSec.appendChild(dl);
      }
      if (frictionImages.length) frictionSec.appendChild(figures(frictionImages, 'cs-figs cs-figs--' + Math.min(frictionImages.length, 4), friction.ratio));
      sections.push({ node: frictionSec, num: '02', name: 'Friction' });
    }

    var work = data.work || {};
    var workImages = usable(work.images);
    if (workImages.length || text(work.outcome)) {
      var workName = inProgress ? 'Work So Far' : 'Work';
      var workSec = section('work', '03', workName);
      if (workImages.length) workSec.appendChild(figures(workImages, 'cs-grid', work.ratio));
      if (text(work.outcome)) workSec.appendChild(el('p', 'cs-outcome', text(work.outcome)));
      sections.push({ node: workSec, num: '03', name: workName });
    }

    if (sections.length) {
      var bodyWrap = el('div', 'cs-body');

      // STEPS: the slim progress strip
      var steps = el('nav', 'cs-steps');
      steps.setAttribute('aria-label', 'Sections');
      var stepList = el('ol', 'cs-steps__list');
      var links = sections.map(function (s) {
        var li = el('li');
        var a = el('a', 'cs-steps__link');
        a.href = '#' + s.node.id;
        a.appendChild(el('span', 'cs-steps__num', s.num));
        a.appendChild(document.createTextNode(s.name));
        li.appendChild(a);
        stepList.appendChild(li);
        return a;
      });
      steps.appendChild(stepList);
      bodyWrap.appendChild(steps);
      sections.forEach(function (s) { bodyWrap.appendChild(s.node); });
      main.appendChild(bodyWrap);

      // highlight the section crossing the middle of the screen
      if ('IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            links.forEach(function (a) {
              var on = a.getAttribute('href') === '#' + e.target.id;
              a.classList.toggle('is-current', on);
              if (on) a.setAttribute('aria-current', 'location');
              else a.removeAttribute('aria-current');
            });
          });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(function (s) { spy.observe(s.node); });
      }

      // phones: the strip hides while scrolling down, slides in on scroll-up
      // (only once past the hero; css/project.css decides when this applies)
      var lastY = window.scrollY, ticking = false;
      var onScroll = function () {
        ticking = false;
        var y = window.scrollY;
        var pastHero = bodyWrap.getBoundingClientRect().top < 0;
        if (!pastHero || y > lastY + 4) steps.classList.remove('is-shown');
        else if (y < lastY - 4) steps.classList.add('is-shown');
        if (Math.abs(y - lastY) > 4) lastY = y;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
      }, { passive: true });
      // following a step link (or Tab-ing into the strip) keeps it visible
      steps.addEventListener('focusin', function () { steps.classList.add('is-shown'); });
    }

    if (ideaPapers) startPapers(ideaPapers);

    // ---------- CREDITS ----------
    var credits = el('section', 'cs-credits grid');
    credits.setAttribute('aria-label', 'Credits');
    var creditList = el('dl', 'cs-meta cs-meta--credits');
    var dur = duration(data.duration);
    metaRow(creditList, 'Duration', dur || '');
    metaRow(creditList, 'Status', data.status, { tag: true });
    metaRow(creditList, 'Award', data.award, { tag: true, award: true });
    // Released is hidden for now (Sadie, Oct 2026); the data stays in projects-data.js.
    // metaRow(creditList, 'Released', data.released);
    metaRow(creditList, 'Client', data.client);
    metaRow(creditList, 'Course', data.course);
    metaRow(creditList, 'Collaborators', data.collaborators, { stacked: true });
    metaRow(creditList, 'Tools', data.tools);
    if (creditList.children.length) {
      credits.appendChild(creditList);
      main.appendChild(credits);
    }

    // ---------- NEXT ----------
    var next = el('nav', 'cs-next grid');
    next.setAttribute('aria-label', 'More work');
    var nextSlug = position > -1 ? ORDER[(position + 1) % ORDER.length] : ORDER[0];
    var nextData = nextSlug && nextSlug !== slug ? PROJECTS[nextSlug] : null;
    if (nextData) {
      var card = el('a', 'cs-next__card subgrid');
      card.href = projectUrl(nextSlug);
      card.setAttribute('data-cursor-label', 'Next');
      var cardText = el('div', 'cs-next__text');
      var nextPos = ORDER.indexOf(nextSlug);
      var kicker = el('span', 'cs-next__kicker', 'Next project ');
      kicker.appendChild(el('span', 'cs-num', pad(nextPos + 1) + ' / ' + pad(ORDER.length)));
      cardText.appendChild(kicker);
      cardText.appendChild(el('span', 'cs-next__title text-h1', nextData.title));
      if (text(nextData.role)) cardText.appendChild(el('span', 'cs-next__role', text(nextData.role)));
      card.appendChild(cardText);
      var nextHero = nextData.hero || {};
      var cardMedia = el('div', 'cs-next__media');
      var nextImg = nextHero.src || (nextData.home && nextData.home.image);
      // decorative here: the title right beside it already names the link
      if (nextImg) cardMedia.appendChild(media({ src: nextImg, alt: '', position: nextHero.position }, 'cs-next__img'));
      else cardMedia.appendChild(missing(nextHero.label || 'Hero image', 'cs-next__img'));
      card.appendChild(cardMedia);
      next.appendChild(card);
    }
    var nextLinks = el('div', 'cs-next__links');
    var all = el('a', 'cs-link', 'All work');
    all.href = Order.link('index.html#work');
    var contact = el('button', 'cs-link', 'Contact');
    contact.type = 'button';
    contact.setAttribute('data-open-contact', '');
    [all, contact].forEach(function (n) { n.setAttribute('data-cursor-solid', 'white'); nextLinks.appendChild(n); });
    next.appendChild(nextLinks);
    main.appendChild(next);

    revealTitle(name);

    // ---------- reminders for Sadie (console only) ----------
    var todo = [];
    if (!text(data.role) || /^\[/.test(text(data.role))) todo.push('role');
    if (dur === null) todo.push('duration "' + text(data.duration) + '": use a number + day/week/month/year, or Ongoing');
    if (!heroData.src) todo.push('hero image');
    else if (/^\[|^$/.test(heroData.alt || '')) todo.push('hero alt text');
    [ideaImages, frictionImages, workImages].forEach(function (items) {
      items.forEach(function (i) {
        if (!i.src) todo.push('missing asset: ' + i.label);
        else if (/^\[|^$/.test(i.alt || '') || /^\[|^$/.test(i.label || '')) todo.push(i.src + ' (alt/label)');
      });
    });
    if (todo.length) console.info('[case study] still to fill in for "' + slug + '":\n  ' + todo.join('\n  '));
  }

  /*
    PAGE LOAD-IN
    The counter, hook and hero glide up via .load-rise (CSS-only), and the
    title reveals letter by letter with the homepage title's timing
    (30ms stagger / 220ms per letter).
  */
  function revealTitle(title) {
    var STAGGER_MS = 30, DURATION_MS = 220, START_DELAY_MS = 120;
    var words = title.textContent;
    title.textContent = '';
    title.parentNode.setAttribute('aria-label', data.title);
    title.style.setProperty('--letter-duration', DURATION_MS + 'ms');
    // Letters are grouped per WORD (nowrap) with real spaces between words,
    // so a long title only ever wraps between words, never mid-word.
    var i = 0;
    words.split(' ').forEach(function (word, w) {
      if (w > 0) title.appendChild(document.createTextNode(' '));
      var wordEl = document.createElement('span');
      wordEl.style.display = 'inline-block';
      wordEl.style.whiteSpace = 'nowrap';
      wordEl.setAttribute('aria-hidden', 'true');
      word.split('').forEach(function (ch) {
        var span = document.createElement('span');
        span.className = 'letter';
        span.textContent = ch;
        span.style.transitionDelay = (START_DELAY_MS + i * STAGGER_MS) + 'ms';
        wordEl.appendChild(span);
        i++;
      });
      i++; // the space between words counts as one beat in the stagger
      title.appendChild(wordEl);
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { title.classList.add('is-in'); });
    });
  }
})();
