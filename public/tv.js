/*
 * Remote control for every page: arrows move focus, Enter clicks, Back goes back.
 *
 * Hand-written rather than js-spatial-navigation because that library only
 * moves between focusables. Half of these pages is prose, tables and an
 * animation with nothing to focus, and a remote that cannot scroll past them
 * leaves the viewer stuck. So: Up/Down takes the nearest focusable that way if
 * it is within reach of the screen, otherwise it scrolls the page. Mouse and
 * touch are untouched: this only listens to keys.
 *
 * ES5, no built-ins newer than Chrome 38 / Safari 7.1: the test pages keep
 * their parent realm unpolyfilled, so this runs on the bare engine.
 */
(function () {
  var KEY = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };
  // webOS 461, Tizen 10009, plus Escape and Backspace for keyboards.
  var BACK = { 461: 1, 10009: 1, 27: 1, 8: 1 };
  var SELECTOR = 'a[href], button, [tabindex]';

  var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
    function (cb) { return window.setTimeout(cb, 16); };

  function viewH() { return window.innerHeight || document.documentElement.clientHeight; }
  function scrollY() { return window.pageYOffset || document.documentElement.scrollTop || 0; }

  function focusables() {
    var all = document.querySelectorAll(SELECTOR);
    var list = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.disabled || el.getAttribute('tabindex') === '-1') continue;
      if (!el.offsetWidth && !el.offsetHeight) continue; // display:none or collapsed
      list.push(el);
    }
    return list;
  }

  // Page coordinates, so off-screen candidates compare correctly.
  function box(el) {
    var r = el.getBoundingClientRect();
    var y = scrollY();
    return { l: r.left, r: r.right, t: r.top + y, b: r.bottom + y,
      cx: (r.left + r.right) / 2, cy: (r.top + r.bottom) / 2 + y };
  }

  /*
   * Nearest candidate in the direction pressed. Distance along the direction,
   * plus twice the sideways offset, so a button straight below beats one
   * slightly closer but far to the side.
   */
  function best(from, a, dir, list) {
    var pick = null, score = Infinity;
    for (var i = 0; i < list.length; i++) {
      if (list[i] === from) continue;
      var b = box(list[i]), along, side;
      // Up/Down: the candidate must clear the current element's middle, not just
      // its centre line. Same-row items differ by fractions of a pixel (a focused
      // link turns bold, the current nav button is pushed 3px), and comparing
      // centres made Down bounce sideways along a row instead of leaving it.
      if (dir === 'down') { along = b.t - a.b; side = Math.abs(b.cx - a.cx); if (b.t <= a.cy) continue; }
      else if (dir === 'up') { along = a.t - b.b; side = Math.abs(b.cx - a.cx); if (b.b >= a.cy) continue; }
      // Left/Right stay on the row: a candidate must overlap the current one vertically.
      else if (b.b <= a.t || b.t >= a.b) continue;
      else if (dir === 'right') { along = b.l - a.r; side = Math.abs(b.cy - a.cy); if (b.cx <= a.cx) continue; }
      else { along = a.l - b.r; side = Math.abs(b.cy - a.cy); if (b.cx >= a.cx) continue; }
      var s = Math.max(along, 0) + side * 2;
      if (s < score) { score = s; pick = list[i]; }
    }
    return pick;
  }

  var anim = 0, aim = null;
  // Where the page is headed: mid-animation, the next press builds on that, not on now.
  function here() { return aim === null ? scrollY() : aim; }
  function scrollTo(target) {
    var max = document.documentElement.scrollHeight - viewH();
    target = Math.max(0, Math.min(max, target));
    var start = scrollY(), dist = target - start, t0 = null, id = ++anim;
    if (Math.abs(dist) < 2) { aim = null; return; }
    aim = target;
    function step(t) {
      if (id !== anim) return;
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / 220);
      window.scrollTo(0, start + dist * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf(step); else aim = null;
    }
    raf(step);
  }

  // Pages built from full-height .screen sections (home) move a screen at a time.
  function screenOf(el) {
    while (el && el !== document.body) {
      if ((' ' + el.className + ' ').indexOf(' screen ') !== -1) return el;
      el = el.parentNode;
    }
    return null;
  }
  function screenTops() {
    var all = document.querySelectorAll('.screen'), tops = [];
    for (var i = 0; i < all.length; i++) tops.push(box(all[i]).t);
    return tops;
  }

  // Bring an element (or the screen it lives in) into view, then focus it.
  function go(el) {
    var b = box(el), top = here(), h = viewH(), y = scrollY();
    var scr = screenOf(el);
    // Snap to the screen's top whenever the element is still visible from there.
    if (scr && b.b - box(scr).t <= h) {
      el.focus();
      window.scrollTo(0, y);
      scrollTo(box(scr).t);
      return;
    }
    // focus() jumps an off-screen element into view; undo that before paint
    // and glide there instead. (No preventScroll on Chrome 38.)
    el.focus();
    window.scrollTo(0, y);
    if (b.t < top + h * 0.15 || b.b > top + h * 0.85) scrollTo(b.cy - h / 2);
  }

  function move(dir) {
    var list = focusables();
    var from = document.activeElement;
    var a;
    if (from && from !== document.body && list.indexOf(from) !== -1) {
      a = box(from);
    } else {
      // Nothing focused (first key, or we scrolled away from it): move from
      // the middle of the screen, so Down keeps going down.
      from = null;
      var w = document.documentElement.clientWidth, mid = here() + viewH() / 2;
      a = { l: w / 2, r: w / 2, t: mid, b: mid, cx: w / 2, cy: mid };
    }
    var next = best(from, a, dir, list);
    if (dir === 'left' || dir === 'right') { if (next) go(next); return; }
    // Up/Down: jump only if the next stop is within reach, else scroll toward it.
    var h = viewH(), tops = screenTops();
    if (next) {
      var gap = dir === 'down' ? box(next).t - (here() + h) : here() - box(next).b;
      // With screens, the next one is always within reach; otherwise a quarter screen.
      if (gap < (tops.length ? h : h * 0.25)) { go(next); return; }
    }
    var to = here() + (dir === 'down' ? 1 : -1) * h * 0.6;
    for (var i = 0; tops.length && i < tops.length; i++) {
      // Snap to the next screen edge that way instead of a fixed step.
      if (dir === 'down' && tops[i] > here() + 2) { to = tops[i]; break; }
      if (dir === 'up' && tops[i] < here() - 2) to = tops[i];
    }
    scrollTo(to);
    // Focus would otherwise sit off screen while the page moves away from it.
    if (from && from.blur) from.blur();
  }

  // Mouse vs remote: hover styles only apply under html.mouse.
  var root = document.documentElement;
  function mouseMode(on) {
    var has = (' ' + root.className + ' ').indexOf(' mouse ') !== -1;
    if (on && !has) root.className += ' mouse';
    if (!on && has) root.className = (' ' + root.className + ' ').replace(' mouse ', ' ').replace(/^\s+|\s+$/g, '');
  }
  // Scrolling the page fires mousemove in some engines without the mouse moving; check it really moved.
  var lastX = -1, lastY = -1;
  document.addEventListener('mousemove', function (e) {
    if (e.clientX === lastX && e.clientY === lastY) return;
    if (lastX !== -1) mouseMode(true);
    lastX = e.clientX; lastY = e.clientY;
  }, false);

  document.addEventListener('keydown', function (e) {
    mouseMode(false);
    var code = e.keyCode;
    var tag = (e.target && e.target.tagName) || '';
    var typing = tag === 'INPUT' || tag === 'TEXTAREA';
    if (KEY[code]) {
      if (typing && (code === 37 || code === 39)) return;
      e.preventDefault();
      move(KEY[code]);
    } else if (BACK[code] && !typing) {
      if (window.location.pathname === '/' ) return;
      e.preventDefault();
      window.history.back();
    }
  }, false);

  window.tvFocus = go;

  // First paint: land focus on the page's main action, if it marked one.
  var first = document.querySelector('[data-autofocus]');
  if (first) first.focus();
})();
