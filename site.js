(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---- PillNav (GSAP): rising-circle hover, rotating logo, entrance, mobile menu ----
  var burger = $('#burger'), links = $('#navlinks');
  var hasG = typeof window.gsap !== 'undefined';
  var EASE = 'power3.out';
  var pills = $$('#pnavItems .npill'), tls = [], tweens = [];

  function layoutPills() {
    pills.forEach(function (pill, i) {
      var circle = $('.hc', pill); if (!circle) return;
      var r = pill.getBoundingClientRect(), w = r.width, h = r.height;
      var R = ((w * w) / 4 + h * h) / (2 * h);
      var D = Math.ceil(2 * R) + 2;
      var delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      circle.style.width = D + 'px'; circle.style.height = D + 'px'; circle.style.bottom = '-' + delta + 'px';
      gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: '50% ' + (D - delta) + 'px' });
      var label = $('.pl', pill), hov = $('.plh', pill);
      if (label) gsap.set(label, { y: 0 });
      if (hov) gsap.set(hov, { y: Math.ceil(h + 20), opacity: 0 });
      if (tls[i]) tls[i].kill();
      var tl = gsap.timeline({ paused: true });
      tl.to(circle, { scale: 1.2, xPercent: -50, duration: .8, ease: EASE, overwrite: 'auto' }, 0);
      if (label) tl.to(label, { y: -(h + 8), duration: .6, ease: EASE, overwrite: 'auto' }, 0);
      if (hov) tl.to(hov, { y: 0, opacity: 1, duration: .6, ease: EASE, overwrite: 'auto' }, 0);
      tls[i] = tl;
    });
  }
  if (hasG) {
    layoutPills();
    window.addEventListener('resize', layoutPills);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutPills);
    pills.forEach(function (pill, i) {
      pill.addEventListener('mouseenter', function () {
        if (!tls[i]) return; if (tweens[i]) tweens[i].kill();
        tweens[i] = tls[i].tweenTo(tls[i].duration(), { duration: .4, ease: EASE, overwrite: 'auto' });
      });
      pill.addEventListener('mouseleave', function () {
        if (!tls[i]) return; if (tweens[i]) tweens[i].kill();
        tweens[i] = tls[i].tweenTo(0, { duration: .3, ease: EASE, overwrite: 'auto' });
      });
    });
    var logo = $('#pnavLogo'), img = $('img', logo);
    logo.addEventListener('mouseenter', function () {
      gsap.fromTo(img, { scale: 1 }, { scale: 1.1, duration: .25, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: 'auto' });
    });
    // entrance
    gsap.from($$('#pnavItems li'), { opacity: 0, x: -20, duration: .6, stagger: .05, ease: 'power2.out', delay: .2 });
  }

  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    if (open) {
      links.classList.add('open');
      if (hasG) gsap.fromTo(links, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .4, ease: EASE });
    } else if (links.classList.contains('open')) {
      if (hasG) gsap.to(links, { opacity: 0, y: -20, duration: .3, ease: 'power3.in', onComplete: function () { links.classList.remove('open'); } });
      else links.classList.remove('open');
    }
  }
  burger.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  $$('a', links).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  // active-section dot on the pills
  var secs = ['why', 'owner', 'whatsapp', 'parents', 'platform', 'teams'];
  var spy = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (!e.isIntersecting) return;
      pills.forEach(function (p) { p.classList.toggle('on', p.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });

  // Nav logo: hidden at the top (the hero shows the big one), fades in once you scroll past it
  (function () {
    var nav = $('#nav'), logo = $('.hero__logo');
    function check() {
      var limit = logo ? (logo.getBoundingClientRect().bottom + window.scrollY - 70) : 120;
      nav.classList.toggle('logo-on', window.scrollY > limit);
    }
    check(); window.addEventListener('scroll', check, { passive: true }); window.addEventListener('resize', check);
  })();

  // ---- Letter-by-letter headings: fade in, slide up, de-blur ----
  function splitHeading(el) {
    var total = el.textContent.replace(/\s+/g, '').length;
    var step = Math.min(38, 1100 / Math.max(total, 1)), n = 0;
    var lc = el.cloneNode(true);
    Array.prototype.slice.call(lc.querySelectorAll('img')).forEach(function (im) { im.replaceWith(document.createTextNode(' ' + im.alt + ' ')); });
    Array.prototype.slice.call(lc.querySelectorAll('br')).forEach(function (br) { br.replaceWith(document.createTextNode(' ')); });
    el.setAttribute('aria-label', el.getAttribute('data-label') || lc.textContent.replace(/\s+/g, ' ').trim());
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            part.split('').forEach(function (chr) {
              var s = document.createElement('span'); s.className = 'ch'; s.textContent = chr;
              s.style.setProperty('--d', Math.round(n++ * step) + 'ms'); w.appendChild(s);
            });
            frag.appendChild(w);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName === 'IMG') {
          c.classList.add('ch'); c.style.setProperty('--d', Math.round(n++ * step) + 'ms');
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
    el.classList.add('split');
  }
  var heads = $$('h1, h2, [data-split]');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heads.forEach(splitHeading);
    var hio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { e.target.classList.toggle('is-in', e.isIntersecting); });
    }, { threshold: 0, rootMargin: '-8% 0px -8% 0px' });
    heads.forEach(function (el) { hio.observe(el); });
  }

  // Why Vetcos: tabs + detail panel (original layout)
  (function () {
    var tabs = $$('#whyTabs .why-tab'), panes = $$('.why-pane'), imgs = $$('.wv-slide');
    function pick(i) {
      tabs.forEach(function (t, j) { t.classList.toggle('is-active', i === j); t.setAttribute('aria-selected', i === j); });
      panes.forEach(function (p, j) { p.classList.toggle('is-active', i === j); });
      imgs.forEach(function (m, j) { m.classList.toggle('is-active', i === j); });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(i); });
      t.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) pick(i); });
    });
  })();

  // Dashboard: on small screens scale the full desktop layout to fit (nothing collapses)
  (function () {
    var app = $('.insights-visual'); if (!app) return;
    function fit() {
      var host = app.parentElement, cs = getComputedStyle(host);
      var avail = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (window.innerWidth > 1020) { app.style.zoom = ''; return; }
      app.style.zoom = Math.min(1, (avail - 8) / 640);
    }
    fit(); window.addEventListener('resize', fit);
  })();

  // Clinic: colour is revealed under the mouse (sketch -> colour), smooth follow
  (function () {
    var fg = $('#clinicFig'); if (!fg) return;
    var tx = -400, ty = -400, cx = -400, cy = -400, tr = 0, cr = 0, run = false, R = 200;
    function frame() {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2; cr += (tr - cr) * .12;
      fg.style.setProperty('--mx', cx + 'px'); fg.style.setProperty('--my', cy + 'px'); fg.style.setProperty('--r', Math.max(cr, .1) + 'px');
      if (Math.abs(tx - cx) + Math.abs(ty - cy) + Math.abs(tr - cr) > .5) requestAnimationFrame(frame); else run = false;
    }
    function go() { if (!run) { run = true; requestAnimationFrame(frame); } }
    fg.addEventListener('pointermove', function (e) {
      var b = fg.getBoundingClientRect(); tx = e.clientX - b.left; ty = e.clientY - b.top; tr = R;
      if (cr < 1) { cx = tx; cy = ty; } go();
    });
    fg.addEventListener('pointerleave', function () { tr = 0; go(); });
  })();

  // Hero dashboard: scale the 1432x922 canvas to the artwork width
  (function () {
    var d = $('#haDash'), st = d && d.parentElement; if (!d) return;
    function fit() { d.style.setProperty('--ds', (st.clientWidth * (window.innerWidth > 1020 ? 0.915 : 0.788)) / 1432); }
    fit(); window.addEventListener('resize', fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(st);
  })();

  // Why visuals: scale the 660x500 canvases to fit their box
  (function () {
    var box = $('#whyVisual'); if (!box) return;
    function fit() {
      var s = Math.min(box.clientWidth / 660, box.clientHeight / 520);
      box.style.setProperty('--s', s > 0 ? s : 1);
    }
    fit(); window.addEventListener('resize', fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(box);
  })();

  // Clinic (phones): start the sideways-swipe picture centred
  (function () { var s = $('#clinicScroll'); if (s && s.scrollWidth > s.clientWidth) s.scrollLeft = (s.scrollWidth - s.clientWidth) / 2; })();

  // Clinic hotspots: tap a dot -> centred popup (content from the original site)
  var PINS = {"appointments": {"t": "Appointments &amp; Queue", "s": "Keep your day on track.", "tone": "green", "icon": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"15\" rx=\"2\"/><path d=\"M8 3.5v3M16 3.5v3M4 10h16\"/></svg>", "d": ["Online booking and walk-in handling in one queue", "Doctor-wise schedules and token flow", "WhatsApp confirmations and reminders", "Fewer no-shows, smoother front desk"]}, "records": {"t": "Patient Records", "s": "Complete history, better care.", "tone": "lilac", "icon": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 3.5h10v17l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3.5Z\"/><path d=\"M9.5 8h5M9.5 11.5h5M9.5 15h3\"/></svg>", "d": ["Lifetime pet history in one place", "Visits, notes, labs, and attachments together", "Clear owner timeline for every patient", "Faster, safer clinical decisions"]}, "consult": {"t": "Consultations", "s": "Better care, every visit.", "tone": "blue", "icon": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 4v6a4 4 0 0 0 8 0V4M10 14v2a4 4 0 0 0 8 0v-1\"/><circle cx=\"18\" cy=\"13\" r=\"2\"/></svg>", "d": ["SOAP notes and prescriptions in the visit", "Vitals, follow-ups, and handoffs without switching tools", "Templates that speed documentation", "Care that stays connected to the patient record"]}, "branches": {"t": "Multi-Branch Management", "s": "One system, all locations.", "tone": "rose", "icon": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"9\" cy=\"9\" r=\"3\"/><circle cx=\"16.5\" cy=\"10.5\" r=\"2.4\"/><path d=\"M3.5 18.5c1.2-2.6 3.2-3.9 5.5-3.9s4.3 1.3 5.5 3.9M14 14.2c1.5-.4 3-.1 4.3 1.1v3.2\"/></svg>", "d": ["Central roles and shared catalogs", "Branch-wise stock, billing, and performance", "Consistent workflows across clinics", "One practice view for owners"]}, "lab": {"t": "Vaccination, Lab &amp; Imaging", "s": "Accurate results, faster decisions.", "tone": "lilac", "icon": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 3h6M10 3v6L5.5 18a2.5 2.5 0 0 0 2.2 3.5h8.6a2.5 2.5 0 0 0 2.2-3.5L14 9V3\"/></svg>", "d": ["Vaccine schedules and reminders", "Lab orders tracked to the patient", "Imaging linked into the record", "Results that reach the right clinician quickly"]}, "billing": {"t": "Billing &amp; Payments", "s": "Faster billing. Happier clients.", "tone": "orange", "icon": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M3 10h18M7 14.5h4\"/></svg>", "d": ["GST-ready invoices at checkout", "UPI, cash, card, and bank transfer", "Outstanding dues and collections clarity", "Less waiting at the front desk"]}, "pharmacy": {"t": "Pharmacy &amp; Inventory", "s": "Always in stock, always ready.", "tone": "green", "icon": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z\"/><path d=\"M12 12v8M4 8.5l8 3.5 8-3.5\"/></svg>", "d": ["Batch and expiry tracking", "Low-stock alerts before you run out", "Purchases and stock reports in one loop", "Pharmacy that matches Indian medicine catalogs"]}, "reports": {"t": "Reports &amp; Analytics", "s": "Data for smarter decisions.", "tone": "sky", "icon": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19V9M10 19V5M16 19v-7M22 19H2\"/></svg>", "d": ["Revenue, collections, and outstandings", "Consultations and performance by doctor", "New vs returning clients", "Owner dashboards that show practice truth"]}, "inpatient": {"t": "In-Patient Care", "s": "Monitor, treat, recover.", "tone": "blue", "icon": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 18V10h8a4 4 0 0 1 4 4h6v4\"/><path d=\"M3 14h18M5 18v2M19 18v2\"/></svg>", "d": ["Ward boards and treatment sheets", "Shift handovers without lost notes", "Discharge checklists that stay complete", "Continuous care from admit to home"]}};
  var fig = $('#clinicFig'), cpop = $('#cpop'), hs = $$('.hs', fig);
  function closePop() {
    cpop.hidden = true; document.body.style.overflow = '';
    hs.forEach(function (x) { x.classList.remove('on'); });
  }
  function openPop(id, btn) {
    var p = PINS[id]; if (!p) return;
    $('.cpop__card', cpop).className = 'cpop__card tone-' + p.tone;
    $('#cpopI').innerHTML = p.icon; $('#cpopT').innerHTML = p.t; $('#cpopS').textContent = p.s;
    $('#cpopL').innerHTML = p.d.map(function (l) { return '<li>' + l + '</li>'; }).join('');
    hs.forEach(function (x) { x.classList.toggle('on', x === btn); });
    cpop.hidden = false; document.body.style.overflow = 'hidden';
  }
  hs.forEach(function (b) { b.addEventListener('click', function () { openPop(b.dataset.pin, b); }); });
  cpop.addEventListener('click', closePop);
  $('.cpop__card', cpop).addEventListener('click', function (e) { e.stopPropagation(); });
  $('.cpop__x', cpop).addEventListener('click', closePop);
  $('.cpop__cta', cpop).addEventListener('click', closePop);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !cpop.hidden) closePop(); });

  // Workflow rail
  var rail = $('#rail'), bar = $('#bar');
  function step() { return rail.querySelector('li').offsetWidth + 18; }
  $('#next').addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: 'smooth' }); });
  $('#prev').addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: 'smooth' }); });
  function prog() {
    var max = rail.scrollWidth - rail.clientWidth;
    bar.style.width = (10 + (max > 0 ? rail.scrollLeft / max : 0) * 90) + '%';
  }
  rail.addEventListener('scroll', prog, { passive: true }); prog();

  // Pet parent stories
  var qs = $$('#quotes figure'), qd = $$('#qdots button'), qi = 0, timer;
  function showQ(i) {
    qi = i;
    qs.forEach(function (f, j) { f.classList.toggle('on', j === i); });
    qd.forEach(function (d, j) { d.classList.toggle('on', j === i); });
  }
  function auto() { clearInterval(timer); timer = setInterval(function () { showQ((qi + 1) % qs.length); }, 6000); }
  qd.forEach(function (d, i) { d.addEventListener('click', function () { showQ(i); auto(); }); });
  auto();

  // Scroll reveal (also triggers chart animations)
  $$('.sec__h,.why__grid,.insights-visual,.owner__copy,.owner__shot,.clinic__fig,.wa__stage,.role,.story__img,.story__r,.sys article,.ind li,.demo__l,.demo>.form,.intel').forEach(function (el) { el.classList.add('rv'); });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { e.target.classList.toggle('in-view', e.isIntersecting); });
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(function (el) { io.observe(el); });

  // Demo modal: every "Request a demo" / "Book a demo" link opens the box
  var modal = $('#demoModal');
  function openModal(e) {
    if (e) e.preventDefault();
    links.classList.remove('open'); burger.setAttribute('aria-expanded', false);
    if (!modal.open) modal.showModal();
    var f = $('input', modal); if (f) f.focus();
  }
  $$('a[href="#demo"]').forEach(function (a) { a.addEventListener('click', openModal); });
  $('#modalX').addEventListener('click', function () { modal.close(); });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });

  // Demo form: validate, then open a pre-filled email
  $$('form.form').forEach(function (form) {
    var note = $('.form__n', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('[required]', form).forEach(function (f) {
        var bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.classList.toggle('invalid', bad); if (bad) ok = false;
      });
      if (!ok) { note.textContent = 'Please fill in the highlighted fields.'; note.classList.remove('ok'); return; }
      var d = new FormData(form);
      var body = 'Clinic: ' + d.get('clinic') + '\nName: ' + d.get('name') + '\nEmail: ' + d.get('email') +
        '\nPhone: ' + (d.get('phone') || '-') + '\n\n' + (d.get('notes') || '');
      window.location.href = 'mailto:hello@vetcos.com?subject=' + encodeURIComponent('Demo request: ' + d.get('clinic')) + '&body=' + encodeURIComponent(body);
      note.textContent = 'Thanks! Your email app should open with the request ready to send.';
      note.classList.add('ok');
    });
  });
})();
