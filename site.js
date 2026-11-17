(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Mobile menu
  var burger = $('#burger'), links = $('#navlinks');
  burger.addEventListener('click', function () {
    var o = links.classList.toggle('open'); burger.setAttribute('aria-expanded', o);
  });
  $$('a', links).forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); }); });

  // Why Vetcos accordion + screenshot swap
  var items = $$('#whyList > li'), shots = $$('.why__shot img');
  function pick(i) {
    items.forEach(function (li, j) { li.classList.toggle('is-on', i === j); });
    shots.forEach(function (im, j) { im.classList.toggle('on', i === j); });
  }
  items.forEach(function (li, i) { $('button', li).addEventListener('click', function () { pick(i); }); });

  // Clinic hotspots
  var fig = $('#clinicFig'), pop = $('#pop'), popT = $('#popT'), pts = $$('#pts button');
  pts.forEach(function (b) {
    b.addEventListener('click', function () {
      pts.forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on'); fig.classList.add('on');
      popT.textContent = b.textContent; pop.hidden = false;
    });
  });
  $('.pop__x').addEventListener('click', function () {
    pop.hidden = true; fig.classList.remove('on'); pts.forEach(function (x) { x.classList.remove('on'); });
  });

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
  $$('.sec__h,.why__grid,.app,.owner__copy,.clinic__fig,.pts,.wa__stage,.role,.story__img,.story__r,.sys article,.ind li,.demo__l,.form,.intel').forEach(function (el) { el.classList.add('rv'); });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(function (el) { io.observe(el); });

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
