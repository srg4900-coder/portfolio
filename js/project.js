/*
  CASE STUDY — builds the whole page for ?project=<slug> from that
  project's entry in js/projects-data.js (field reference at the top of
  that file). project.html only holds an empty <main>.

  Page order:
    HERO      counter (from HOME_ORDER), title, hook, full-bleed image or
              video, meta row (Role + whichever optional fields exist),
              optional action button
    STEPS     "01 Idea / 02 Friction / 03 Work" progress strip: sticky on
              desktop, slides in on scroll-up on phones (css/project.css)
    01 Idea, 02 Friction, 03 Work
              any section with no data is skipped entirely (and left out
              of the strip); Status "In Progress" drops Friction and
              renames Work to "Work So Far"
    NEXT      next project's title + hero (loops last -> first), All Work,
              Contact

  Every case-study image opens in the shared viewer (js/viewer.js); each
  section is its own set for the arrow keys.
*/
(function () {
  var PROJECTS = window.PROJECTS || {};
  var ORDER = (window.HOME_ORDER || []).filter(function (s) { return PROJECTS[s]; });

  var main = document.getElementById('case-study');
  if (!main) return;

  var slug = new URLSearchParams(window.location.search).get('project');
  var data = slug && PROJECTS[slug];

  // ---------- helpers ----------
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }
  // a field can be a string or a list; either way, '' when empty
  function text(v) {
    if (Array.isArray(v)) return v.filter(Boolean).join(', ');
    return v ? String(v).trim() : '';
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function projectUrl(s) { return 'project.html?project=' + encodeURIComponent(s); }
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

  // one labeled image that opens in the viewer
  function figure(item) {
    var fig = el('figure', 'cs-fig' + (item.large ? ' cs-fig--large' : '') + (item.cutout ? ' cs-fig--cutout' : ''));
    var open = el('button', 'cs-fig__open');
    open.type = 'button';
    open.setAttribute('data-viewer', '');
    open.setAttribute('data-src', item.src || '');
    if (item.video) open.setAttribute('data-video', item.video);
    open.setAttribute('data-alt', item.alt || '');
    open.setAttribute('data-label', item.label || '');
    open.setAttribute('aria-label', 'View larger: ' + (item.alt || item.label || 'image'));
    open.setAttribute('data-cursor-label', 'View');
    open.appendChild(media(item, 'cs-fig__media'));
    var icon = el('span', 'cs-fig__icon', '+');
    icon.setAttribute('aria-hidden', 'true');
    open.appendChild(icon);
    fig.appendChild(open);
    if (item.label) fig.appendChild(el('figcaption', 'cs-fig__label text-label', item.label));
    return fig;
  }

  function figures(list, cls) {
    var wrap = el('div', cls);
    wrap.setAttribute('data-viewer-group', '');
    list.forEach(function (item) { if (item && item.src) wrap.appendChild(figure(item)); });
    return wrap;
  }

  // ---------- no such project ----------
  if (!data) {
    document.title = 'Project not found | Sadie Gold';
    var missing = el('section', 'cs-missing');
    missing.appendChild(el('h1', 'text-h1', 'Project not found'));
    var back = el('a', 'cs-link text-label', 'See all work →');
    back.href = 'index.html#work';
    missing.appendChild(back);
    main.appendChild(missing);
    return;
  }

  document.title = data.title + ' | Sadie Gold';
  document.body.setAttribute('data-project', slug);
  var inProgress = data.status === 'In Progress';
  var position = ORDER.indexOf(slug); // -1 for a draft

  // ---------- HERO ----------
  var hero = el('header', 'cs-hero');
  var head = el('div', 'cs-hero__head');
  if (position > -1) {
    var count = el('p', 'cs-hero__count text-label load-rise', pad(position + 1) + ' / ' + pad(ORDER.length));
    count.setAttribute('aria-label', 'Project ' + (position + 1) + ' of ' + ORDER.length);
    head.appendChild(count);
  }
  head.appendChild(el('h1', 'cs-hero__title text-title letter-reveal', data.title));
  if (text(data.hook)) {
    var hook = el('p', 'cs-hero__hook load-rise', text(data.hook));
    hook.style.setProperty('--load-delay', '300ms');
    head.appendChild(hook);
  }
  hero.appendChild(head);

  if (data.hero && data.hero.src) {
    var heroFig = el('figure', 'cs-hero__media load-rise');
    heroFig.style.setProperty('--load-delay', '420ms');
    var heroMedia = media(data.hero, 'cs-hero__img', true);
    heroFig.appendChild(heroMedia);
    // moving hero: muted by default, sound only from this button
    if (data.hero.video) {
      var mute = el('button', 'cs-hero__mute text-label', 'Unmute');
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
    hero.appendChild(heroFig);
  }

  var info = el('div', 'cs-hero__info');
  var meta = el('dl', 'cs-meta');
  function metaRow(name, value, isTag) {
    if (!value) return;
    var row = el('div', 'cs-meta__row');
    row.appendChild(el('dt', 'text-label', name));
    var dd = el('dd');
    if (isTag) dd.appendChild(el('span', 'cs-tag text-label', value));
    else dd.textContent = value;
    row.appendChild(dd);
    meta.appendChild(row);
  }
  metaRow('Role', text(data.role));
  metaRow('Disciplines', text(data.disciplines));
  metaRow('Duration', text(data.duration));
  metaRow('Status', text(data.status), true);
  metaRow('Collaborators', text(data.collaborators));
  metaRow('Tools', text(data.tools));
  if (meta.children.length) info.appendChild(meta);

  if (data.action && data.action.url && data.action.label) {
    var action = el('a', 'cs-action text-label', data.action.label);
    action.href = data.action.url;
    if (/^https?:/.test(data.action.url)) {
      action.target = '_blank';
      action.rel = 'noopener';
      action.appendChild(el('span', 'cs-action__arrow', ' ↗'));
      action.setAttribute('aria-label', data.action.label + ' (opens in a new tab)');
    }
    action.setAttribute('data-cursor-solid', 'white');
    info.appendChild(action);
  }
  if (info.children.length) hero.appendChild(info);
  main.appendChild(hero);

  // ---------- SECTIONS ----------
  function section(id, num, name) {
    var sec = el('section', 'cs-section');
    sec.id = id;
    sec.setAttribute('aria-labelledby', id + '-title');
    var h = el('h2', 'cs-section__title text-h2');
    h.id = id + '-title';
    h.appendChild(el('span', 'cs-section__num', num));
    h.appendChild(document.createTextNode(name));
    sec.appendChild(h);
    return sec;
  }

  var sections = [];

  var idea = data.idea || {};
  var ideaImages = (idea.images || []).filter(function (i) { return i && i.src; });
  if (text(idea.copy) || ideaImages.length) {
    var ideaSec = section('idea', '01', 'Idea');
    if (text(idea.copy)) ideaSec.appendChild(el('p', 'cs-section__copy text-project-body', text(idea.copy)));
    if (ideaImages.length) ideaSec.appendChild(figures(ideaImages, 'cs-figs cs-figs--' + ideaImages.length));
    sections.push({ node: ideaSec, num: '01', name: 'Idea' });
  }

  var friction = data.friction || {};
  var beats = [['Problem', text(friction.problem)], ['Response', text(friction.response)], ['Result', text(friction.result)]]
    .filter(function (b) { return b[1]; });
  var frictionImages = (friction.images || []).filter(function (i) { return i && i.src; });
  if (!inProgress && (beats.length || frictionImages.length)) {
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
    if (frictionImages.length) frictionSec.appendChild(figures(frictionImages, 'cs-figs cs-figs--' + frictionImages.length));
    sections.push({ node: frictionSec, num: '02', name: 'Friction' });
  }

  var work = data.work || {};
  var workImages = (work.images || []).filter(function (i) { return i && i.src; });
  if (workImages.length || text(work.outcome)) {
    var workName = inProgress ? 'Work So Far' : 'Work';
    var workSec = section('work', '03', workName);
    if (workImages.length) workSec.appendChild(figures(workImages, 'cs-grid'));
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
      var a = el('a', 'cs-steps__link text-label');
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
    function onScroll() {
      ticking = false;
      var y = window.scrollY;
      var pastHero = bodyWrap.getBoundingClientRect().top < 0;
      if (!pastHero || y > lastY + 4) steps.classList.remove('is-shown');
      else if (y < lastY - 4) steps.classList.add('is-shown');
      if (Math.abs(y - lastY) > 4) lastY = y;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    // following a step link (or Tab-ing into the strip) keeps it visible
    steps.addEventListener('focusin', function () { steps.classList.add('is-shown'); });
  }

  // ---------- NEXT ----------
  var next = el('nav', 'cs-next');
  next.setAttribute('aria-label', 'More work');
  var nextSlug = position > -1 ? ORDER[(position + 1) % ORDER.length] : ORDER[0];
  var nextData = nextSlug && nextSlug !== slug ? PROJECTS[nextSlug] : null;
  if (nextData) {
    var card = el('a', 'cs-next__card');
    card.href = projectUrl(nextSlug);
    card.setAttribute('data-cursor-label', 'Next');
    var cardText = el('div', 'cs-next__text');
    var nextPos = ORDER.indexOf(nextSlug);
    cardText.appendChild(el('span', 'text-label', 'Next project · ' + pad(nextPos + 1) + ' / ' + pad(ORDER.length)));
    cardText.appendChild(el('span', 'cs-next__title text-h1', nextData.title));
    if (text(nextData.role)) cardText.appendChild(el('span', 'cs-next__role text-label', text(nextData.role)));
    card.appendChild(cardText);
    var nextImg = (nextData.hero && nextData.hero.src) || (nextData.home && nextData.home.image);
    if (nextImg) {
      var cardMedia = el('div', 'cs-next__media');
      // decorative here: the title right beside it already names the link
      cardMedia.appendChild(media({ src: nextImg, alt: '', position: nextData.hero && nextData.hero.position }, 'cs-next__img'));
      card.appendChild(cardMedia);
    }
    next.appendChild(card);
  }
  var nextLinks = el('div', 'cs-next__links');
  var all = el('a', 'cs-link text-label', 'All work');
  all.href = 'index.html#work';
  var contact = el('button', 'cs-link text-label', 'Contact');
  contact.type = 'button';
  contact.setAttribute('data-open-contact', '');
  [all, contact].forEach(function (n) { n.setAttribute('data-cursor-solid', 'white'); nextLinks.appendChild(n); });
  next.appendChild(nextLinks);
  main.appendChild(next);

  // ---------- reminders for Sadie (console only) ----------
  var todo = [];
  if (!text(data.role)) todo.push('role');
  if (data.hero && /^\[|^$/.test(data.hero.alt || '')) todo.push('hero alt text');
  [ideaImages, frictionImages, workImages].forEach(function (list) {
    list.forEach(function (i) {
      if (/^\[|^$/.test(i.alt || '') || /^\[|^$/.test(i.label || '')) todo.push(i.src + ' (alt/label)');
    });
  });
  if (todo.length) console.info('[case study] still to fill in for "' + slug + '":\n  ' + todo.join('\n  '));
})();

/*
  PAGE LOAD-IN
  The counter, hook and hero glide up via .load-rise (CSS-only), and the
  title reveals letter by letter with the homepage title's timing
  (30ms stagger / 220ms per letter).
*/
(function () {
  var title = document.querySelector('.cs-hero__title.letter-reveal');
  if (!title) return;
  var STAGGER_MS = 30, DURATION_MS = 220, START_DELAY_MS = 120;
  var text = title.textContent;
  title.textContent = '';
  title.setAttribute('aria-label', text);
  title.style.setProperty('--letter-duration', DURATION_MS + 'ms');
  // Letters are grouped per WORD (nowrap) with real spaces between words,
  // so a long title only ever wraps between words, never mid-word.
  var i = 0;
  text.split(' ').forEach(function (word, w) {
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
})();
