(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Nav: scrolled state + mobile menu
  var nav = $('#nav'), burger = $('#burger'), links = $('#navlinks');
  window.addEventListener('scroll', function () { nav.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', links).forEach(function (a) {
    a.addEventListener('click', function () { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); });
  });

  // Tabs (outcomes + roles)
  $$('[data-tabs]').forEach(function (root) {
    var tabs = $$('[role=tab]', root), panels = $$('[role=tabpanel]', root);
    function select(i) {
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', i === j); });
      panels.forEach(function (p, j) { p.hidden = i !== j; p.classList.toggle('is-on', i === j); });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (n) { e.preventDefault(); var k = (i + n + tabs.length) % tabs.length; select(k); tabs[k].focus(); }
      });
    });
  });

  // Workflow explorer
  var flow = $('[data-flow]');
  if (flow) {
    var btns = $$('.flow__steps button', flow), ot = $('[data-out-t]', flow), od = $('[data-out-d]', flow);
    btns.forEach(function (b, i) {
      b.setAttribute('data-n', i + 1);
      var s = b.querySelector('span'); b.setAttribute('aria-label', 'Step ' + (i + 1) + ': ' + b.dataset.t);
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('is-on'); });
        b.classList.add('is-on'); ot.textContent = (i + 1) + '. ' + b.dataset.t; od.textContent = b.dataset.d;
      });
    });
    ot.textContent = '1. ' + btns[0].dataset.t;
    // gentle auto-play until the user interacts
    var idx = 0, auto = null, touched = false;
    var vis = new IntersectionObserver(function (en) {
      if (touched) return;
      if (en[0].isIntersecting) { auto = setInterval(function () { idx = (idx + 1) % btns.length; btns[idx].click(); }, 2600); }
      else clearInterval(auto);
    }, { threshold: .4 });
    vis.observe(flow);
    flow.addEventListener('pointerdown', function () { touched = true; clearInterval(auto); });
  }

  // Scroll reveal (+ chart animations)
  $$('.sec__head,.stats,.dash,.phone,.grid8 article,.role,.story > *,.form,.demo__copy,.analytics__copy,.wa__copy,.clinic').forEach(function (el) { el.classList.add('rv'); });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(function (el) { io.observe(el); });

  // Demo form: validate, then open a pre-filled email to the sales inbox
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
