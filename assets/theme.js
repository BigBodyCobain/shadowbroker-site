/* ShadowBroker theme controller — 3-state toggle: auto (system) → light → dark */
(function () {
  var KEY = 'sb-theme-mode';
  var MODES = ['system', 'light', 'dark'];
  var ICONS = { system: '◐', light: '☀', dark: '☾' };
  var NAMES = { system: 'auto', light: 'light', dark: 'dark' };
  var mq = window.matchMedia('(prefers-color-scheme: light)');
  var btns = [];
  var initialized = false;
  var transitionTimer;

  function mode() {
    try {
      var v = localStorage.getItem(KEY);
      return MODES.indexOf(v) >= 0 ? v : 'system';
    } catch (e) { return 'system'; }
  }

  function store(m) {
    try { localStorage.setItem(KEY, m); } catch (e) {}
  }

  function resolve(m) {
    return m === 'system' ? (mq.matches ? 'light' : 'dark') : m;
  }

  function startTransition() {
    var root = document.documentElement;
    root.classList.add('sb-theme-transition');
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(function () { root.classList.remove('sb-theme-transition'); }, 320);
  }

  function apply(m, save) {
    var t = resolve(m);
    var prev = document.documentElement.getAttribute('data-theme');
    if (initialized && prev !== t) startTransition();
    document.documentElement.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#f8fafc' : '#03060c');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i], lbl = NAMES[m].toUpperCase();
      b.setAttribute('aria-label', 'Color theme: ' + NAMES[m] + '. Activate to change.');
      b.setAttribute('title', 'Theme: ' + NAMES[m] + ' — click to change');
      var ico = b.querySelector('.tt-ico'), txt = b.querySelector('.tt-lbl');
      if (ico) ico.textContent = ICONS[m];
      if (txt) txt.textContent = lbl;
    }
    if (save) store(m);
    try {
      document.dispatchEvent(new CustomEvent('sb-theme-change', { detail: { mode: m, theme: t } }));
    } catch (e) {}
  }

  function cycle() {
    var m = mode();
    apply(MODES[(MODES.indexOf(m) + 1) % MODES.length], true);
  }

  function init() {
    btns = [].slice.call(document.querySelectorAll('[data-theme-toggle]'));
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener('click', cycle);
    apply(mode(), false);
    initialized = true;
    var onChange = function () { if (mode() === 'system') apply('system', false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
    window.addEventListener('storage', function (e) {
      if (e.key === KEY) apply(mode(), false);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
