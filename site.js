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
      gsap.to(img, { rotate: 360, duration: .8, ease: 'elastic.out(1, 0.5)', overwrite: 'auto', onComplete: function () { gsap.set(img, { rotate: 0 }); } });
    });
    // entrance
    gsap.from(logo, { scale: 0, opacity: 0, duration: .8, ease: 'back.out(1.7)' });
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

  // ---- Letter-by-letter headings: fade in, slide up, de-blur ----
  function splitHeading(el) {
    var total = el.textContent.replace(/\s+/g, '').length;
    var step = Math.min(38, 1100 / Math.max(total, 1)), n = 0;
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
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
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
    el.classList.add('split');
  }
  var heads = $$('h1, h2, [data-split]');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heads.forEach(splitHeading);
    var hio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); hio.unobserve(e.target); } });
    }, { threshold: .25 });
    heads.forEach(function (el) { hio.observe(el); });
  }

  // Why Vetcos accordion + screenshot swap
  var items = $$('#whyList > li'), shots = $$('.why__shot img');
  function pick(i) {
    items.forEach(function (li, j) { li.classList.toggle('is-on', i === j); });
    shots.forEach(function (im, j) { im.classList.toggle('on', i === j); });
  }
  items.forEach(function (li, i) { $('button', li).addEventListener('click', function () { pick(i); }); });

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

  // Clinic hotspots: tap a dot to see the part of care + Book a demo
  var fig = $('#clinicFig'), pop = $('#pop'), popT = $('#popT'), hs = $$('.hs', fig);
  function closePop() { pop.hidden = true; hs.forEach(function (x) { x.classList.remove('on'); }); }
  hs.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      hs.forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on'); popT.innerHTML = b.dataset.n;
      var px = Math.min(Math.max(+b.style.getPropertyValue('--x'), 14), 86);
      pop.style.setProperty('--px', px); pop.style.setProperty('--py', b.style.getPropertyValue('--y'));
      pop.hidden = false;
    });
  });
  $('.pop__x', pop).addEventListener('click', closePop);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(); });
  document.addEventListener('click', function (e) { if (!pop.hidden && !pop.contains(e.target)) closePop(); });

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
  $$('.sec__h,.why__grid,.app,.owner__copy,.clinic__fig,.wa__stage,.role,.story__img,.story__r,.sys article,.ind li,.demo__l,.demo__card,.intel').forEach(function (el) { el.classList.add('rv'); });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
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
  var form = $('#demoForm'), note = $('#formNote');
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
})();
