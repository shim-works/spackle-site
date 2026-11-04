/*
 * The harness inside a /speed frame.
 *
 * Shell copied from compare-bench.js — same reason those files are duplicates
 * of each other: a frame has no button and nothing to render into, it is handed
 * its condition on the query string, runs once on load, posts its numbers to
 * the parent and is then removed from the DOM so its realm can be collected.
 * What differs is the workload. compare-bench.js runs one composite render pass
 * and reports one number; this runs one case per polyfill and reports a row
 * each.
 *
 * Why per-API at all. The render pass answers "which library is faster for an
 * app". It cannot answer "which of these forty functions is slower, and by how
 * much" — and worse, it hides step changes, because it calls every API with one
 * set of parameters. Its maps hold 30 keys and its promise chains are 3 links
 * long, and both of those sit on the cheap side of a cliff that only appears
 * further out.
 *
 * So every case that CAN have a cliff gets more than one size: maps and sets at
 * 30 / 1000 / 10000, promise chains at depth 3 and depth 50. A row that is level
 * at the small size and terrible at the large one is the finding. One size would
 * have printed the level number and said nothing.
 *
 * Counts are hard-coded per case, picked so each lands in a window the clock can
 * resolve. They are not tuned per engine — a slower engine makes every row
 * slower, and the comparison is between the two columns.
 *
 * Both frame documents load THIS file; the library differs, the workload does
 * not. `window.__LIB` is set inline by the frame, before the library loads.
 *
 * Hand-written ES5. The library itself is loaded by the frame, before this file.
 */
(function () {
  var LIB = window.__LIB || 'unknown';

  var TAG = 'spackle-speed';

  /*
   * One message to the parent, ever — results or a refusal. The parent is
   * blocked on this: it waits for the frame before starting the other library,
   * so a frame that dies quietly stalls the whole comparison until the
   * parent's failsafe fires.
   */
  var posted = false;
  function post(payload) {
    if (posted) return;
    posted = true;
    payload.tag = TAG;
    payload.lib = LIB;
    payload.stripped = STRIPPED;
    try {
      window.parent.postMessage(payload, '*');
    } catch (e) {
      // Nothing left to do: there is no UI in here to report it to.
    }
  }

  function fail(message) {
    post({ error: message });
  }

  /*
   * Which condition is this run in?
   *
   * The natives were deleted, or not, by the inline block at the top of the
   * frame — before this file parsed, and before the library did. All this can
   * do is read the same query string and describe what already happened. The
   * parent decides, by putting it on the frame's src; there is no control in
   * here to change it, because nothing can un-delete a native after the fact.
   */
  var STRIPPED = window.location.search.indexOf('natives=strip') !== -1;

  /*
   * A library that threw partway through its own install looks FAST — the work
   * it failed to set up is work it never does. Timing that produces beautiful,
   * meaningless rows, so refuse instead.
   */
  var required = [
    ['Symbol', function () { return window.Symbol; }],
    ['Map', function () { return window.Map; }],
    ['Set', function () { return window.Set; }],
    ['WeakMap', function () { return window.WeakMap; }],
    ['Promise', function () { return window.Promise; }],
    ['Object.assign', function () { return Object.assign; }],
    ['Object.is', function () { return Object.is; }],
    ['Object.entries', function () { return Object.entries; }],
    ['Object.fromEntries', function () { return Object.fromEntries; }],
    ['Array.from', function () { return Array.from; }],
    ['Array.prototype.flat', function () { return Array.prototype.flat; }],
    ['Array.prototype.includes', function () { return Array.prototype.includes; }],
    ['String.prototype.padStart', function () { return String.prototype.padStart; }],
    ['URL', function () { return window.URL; }],
    ['URLSearchParams', function () { return window.URLSearchParams; }],
    ['queueMicrotask', function () { return window.queueMicrotask; }]
  ];

  var missing = [];
  for (var q = 0; q < required.length; q++) {
    var ok;
    try { ok = !!required[q][1](); } catch (e) { ok = false; }
    if (!ok) missing.push(required[q][0]);
  }
  if (missing.length) {
    fail(STRIPPED
      ? LIB + ' did not finish installing. Missing: ' + missing.join(', ') +
        '. These natives were deleted before load, so the library owned replacing them — ' +
        'this is not a partial-install run.'
      : 'This engine is missing ' + missing.join(', ') + ' and ' + LIB +
        ' did not fill the gap. The cases need all of them, so there is nothing to time. ' +
        'That is a real result: it is the reason this library exists.');
    return;
  }

  if (console.timeStamp) console.timeStamp(LIB + '-install-end');

  /*
   * performance.now where it exists, Date.now where it does not.
   *
   * Not interchangeable: Date.now is whole milliseconds and several of these
   * land in single digits, which is how you end up reporting a ratio built out
   * of zeroes. Chrome 38 and Safari 8 both have performance.now; the fallback
   * costs one line and removes the question.
   */
  var now = (window.performance && window.performance.now)
    ? function () { return window.performance.now(); }
    : function () { return Date.now(); };

  // Touched by every case so the work cannot be dropped as dead.
  var sink = 0;
  function keep(v) {
    if (typeof v === 'number') sink += v;
    else if (v !== null && typeof v !== 'undefined') sink += 1;
  }

  /* ------------------------------------------------------------------ *
   * Fixtures
   * ------------------------------------------------------------------ */

  function plainObject(width) {
    var o = {};
    for (var i = 0; i < width; i++) o['f' + i] = i;
    return o;
  }

  // Each entry gets a different hidden class, which is the point of the
  // '24 shapes' case below: a shared helper called with all of them goes
  // megamorphic; a per-module copy that only ever sees one or two does not.
  function shapeSpread(count) {
    var out = [];
    for (var i = 0; i < count; i++) out.push(plainObject(i + 1));
    return out;
  }

  function numbers(n) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(i);
    return a;
  }

  function filledMap(size) {
    var m = new Map();
    for (var i = 0; i < size; i++) m.set('key-' + i, i);
    return m;
  }

  function filledSet(size) {
    var s = new Set();
    for (var i = 0; i < size; i++) s.add('key-' + i);
    return s;
  }

  var ONE_SHAPE = shapeSpread(1);
  var MANY_SHAPES = shapeSpread(24);
  var FIFTY = numbers(50);
  var NESTED = [[1, 2], [3, [4, 5]], [6], [7, [8, [9]]]];
  var MAP_20 = null, MAP_30 = null, MAP_1K = null, MAP_10K = null;
  var SET_20 = null, SET_30 = null, SET_1K = null, SET_10K = null;

  /* ------------------------------------------------------------------ *
   * The cases.
   *
   * { id, group, n, run(n) } — or async: true and run(n, done).
   * Optional setup(n) builds fixtures outside the timer; run gets them as run(n, fixture).
   * ------------------------------------------------------------------ */
  var CASES = [
    /* --- object ---------------------------------------------------- */
    { id: 'Object.assign, 1 shape', group: 'object', n: 40000, run: function (n) {
      for (var i = 0; i < n; i++) { var t = {}; Object.assign(t, ONE_SHAPE[0]); keep(t.f0); }
    } },
    { id: 'Object.assign, 24 shapes', group: 'object', n: 40000, run: function (n) {
      for (var i = 0; i < n; i++) { var t = {}; Object.assign(t, MANY_SHAPES[i % 24]); keep(t.f0); }
    } },
    { id: 'Object.assign, 3 sources', group: 'object', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Object.assign({}, ONE_SHAPE[0], MANY_SHAPES[3], { z: i }).z);
    } },
    { id: 'Object.keys', group: 'object', n: 40000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Object.keys(MANY_SHAPES[i % 24]).length);
    } },
    { id: 'Object.entries', group: 'object', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Object.entries(MANY_SHAPES[i % 24]).length);
    } },
    { id: 'Object.values', group: 'object', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Object.values(MANY_SHAPES[i % 24]).length);
    } },
    { id: 'Object.fromEntries', group: 'object', n: 20000, run: function (n) {
      var pairs = [['a', 1], ['b', 2], ['c', 3]];
      for (var i = 0; i < n; i++) keep(Object.fromEntries(pairs).b);
    } },
    { id: 'Object.is', group: 'object', n: 200000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Object.is(i, i) ? 1 : 0);
    } },
    { id: 'Object.getOwnPropertyDescriptors', group: 'object', n: 10000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Object.getOwnPropertyDescriptors(MANY_SHAPES[i % 24]).f0 ? 1 : 0);
    } },

    /* --- array ----------------------------------------------------- */
    { id: 'Array.from(array-like)', group: 'array', n: 20000, run: function (n) {
      var like = { length: 8, 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h' };
      for (var i = 0; i < n; i++) keep(Array.from(like).length);
    } },
    { id: 'Array.from(string)', group: 'array', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Array.from('programme ' + (i % 10)).length);
    } },
    { id: 'Array.from(iterable, mapFn)', group: 'array', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Array.from(FIFTY, function (v) { return v + 1; }).length);
    } },
    { id: 'Array.of', group: 'array', n: 50000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Array.of(i, i + 1, i + 2).length);
    } },
    { id: 'Array#includes (50 items)', group: 'array', n: 50000, run: function (n) {
      for (var i = 0; i < n; i++) keep(FIFTY.includes(i % 60) ? 1 : 0);
    } },
    { id: 'Array#find', group: 'array', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep(FIFTY.find(function (v) { return v === 49; }));
    } },
    { id: 'Array#findIndex', group: 'array', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep(FIFTY.findIndex(function (v) { return v === 49; }));
    } },
    { id: 'Array#findLast', group: 'array', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep(FIFTY.findLast(function (v) { return v < 5; }));
    } },
    { id: 'Array#flat (depth 2)', group: 'array', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep(NESTED.flat(2).length);
    } },
    { id: 'Array#flatMap', group: 'array', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep(FIFTY.flatMap(function (v) { return [v, v]; }).length);
    } },
    { id: 'Array#at', group: 'array', n: 100000, run: function (n) {
      for (var i = 0; i < n; i++) keep(FIFTY.at(-1));
    } },
    { id: 'Array#fill', group: 'array', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep(numbers(20).fill(i, 2, 18).length);
    } },
    { id: 'Array#copyWithin', group: 'array', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep(numbers(20).copyWithin(0, 10).length);
    } },

    /* --- string ---------------------------------------------------- */
    { id: 'String#padStart', group: 'string', n: 100000, run: function (n) {
      for (var i = 0; i < n; i++) keep(String(i % 60).padStart(2, '0').length);
    } },
    { id: 'String#padEnd', group: 'string', n: 100000, run: function (n) {
      for (var i = 0; i < n; i++) keep(String(i % 60).padEnd(6, '.').length);
    } },
    { id: 'String#trimStart/trimEnd', group: 'string', n: 50000, run: function (n) {
      for (var i = 0; i < n; i++) keep(('   row ' + i + '   ').trimStart().trimEnd().length);
    } },
    { id: 'String#replaceAll', group: 'string', n: 20000, run: function (n) {
      for (var i = 0; i < n; i++) keep('a-b-c-d-e'.replaceAll('-', '+').length);
    } },
    { id: 'String#repeat', group: 'string', n: 50000, run: function (n) {
      for (var i = 0; i < n; i++) keep('ab'.repeat(8).length);
    } },
    { id: 'String#startsWith/endsWith', group: 'string', n: 100000, run: function (n) {
      for (var i = 0; i < n; i++) keep(('row row--' + (i % 3)).startsWith('row') ? 1 : 0);
    } },
    { id: 'String#includes', group: 'string', n: 100000, run: function (n) {
      for (var i = 0; i < n; i++) keep(('row row--' + (i % 3)).indexOf('--') !== -1 ? 1 : 0);
    } },
    { id: 'String#at', group: 'string', n: 100000, run: function (n) {
      for (var i = 0; i < n; i++) keep('programme'.at(-1));
    } },
    { id: 'String#codePointAt', group: 'string', n: 100000, run: function (n) {
      for (var i = 0; i < n; i++) keep('programme'.codePointAt(i % 9));
    } },

    /*
     * --- collections, with a size axis -------------------------------
     *
     * The size IS the case. A linear scan and a hash table are indistinguishable
     * at 30 keys and orders of magnitude apart at 10000, so one size would
     * report "about level" and miss it entirely. Lookup counts come down as the
     * size goes up, to keep each row's window sane.
     */
    { id: 'Map get/has — 20 keys (one rail)', group: 'collections', n: 20000, run: function (n) {
      if (!MAP_20) MAP_20 = filledMap(20);
      for (var i = 0; i < n; i++) { keep(MAP_20.get('key-' + (i % 20))); keep(MAP_20.has('key-' + (i % 20)) ? 1 : 0); }
    } },
    { id: 'Map get/has — 30 keys', group: 'collections', n: 20000, run: function (n) {
      if (!MAP_30) MAP_30 = filledMap(30);
      for (var i = 0; i < n; i++) { keep(MAP_30.get('key-' + (i % 30))); keep(MAP_30.has('key-' + (i % 30)) ? 1 : 0); }
    } },
    { id: 'Map get/has — 1000 keys (stress)', group: 'collections', n: 20000, run: function (n) {
      if (!MAP_1K) MAP_1K = filledMap(1000);
      for (var i = 0; i < n; i++) { keep(MAP_1K.get('key-' + (i % 1000))); keep(MAP_1K.has('key-' + (i % 1000)) ? 1 : 0); }
    } },
    { id: 'Map get/has — 10000 keys (stress)', group: 'collections', n: 4000, run: function (n) {
      if (!MAP_10K) MAP_10K = filledMap(10000);
      for (var i = 0; i < n; i++) { keep(MAP_10K.get('key-' + (i % 10000))); keep(MAP_10K.has('key-' + (i % 10000)) ? 1 : 0); }
    } },
    { id: 'Map set — build 1000 (stress)', group: 'collections', n: 40, run: function (n) {
      for (var i = 0; i < n; i++) keep(filledMap(1000).size);
    } },
    /*
     * Builds stay outside the timed window: c.run times everything, so the
     * Maps are made by setup() first, otherwise this row is the build row again.
     */
    { id: 'Map delete — 500 of 1000 (stress)', group: 'collections', n: 20,
      setup: function (n) { var ms = []; for (var i = 0; i < n; i++) ms.push(filledMap(1000)); return ms; },
      run: function (n, ms) {
        for (var i = 0; i < n; i++) {
          var m = ms[i];
          for (var k = 0; k < 1000; k += 2) m['delete']('key-' + k);
          keep(m.size);
        }
      } },
    { id: 'Map iterate — 1000 entries', group: 'collections', n: 400, run: function (n) {
      if (!MAP_1K) MAP_1K = filledMap(1000);
      for (var i = 0; i < n; i++) {
        var c = 0;
        MAP_1K.forEach(function (v) { c += v; });
        keep(c);
      }
    } },
    { id: 'Set has — 20 items (one rail)', group: 'collections', n: 20000, run: function (n) {
      if (!SET_20) SET_20 = filledSet(20);
      for (var i = 0; i < n; i++) keep(SET_20.has('key-' + (i % 20)) ? 1 : 0);
    } },
    { id: 'Set has — 30 items', group: 'collections', n: 20000, run: function (n) {
      if (!SET_30) SET_30 = filledSet(30);
      for (var i = 0; i < n; i++) keep(SET_30.has('key-' + (i % 30)) ? 1 : 0);
    } },
    { id: 'Set has — 1000 items (stress)', group: 'collections', n: 20000, run: function (n) {
      if (!SET_1K) SET_1K = filledSet(1000);
      for (var i = 0; i < n; i++) keep(SET_1K.has('key-' + (i % 1000)) ? 1 : 0);
    } },
    { id: 'Set has — 10000 items (stress)', group: 'collections', n: 4000, run: function (n) {
      if (!SET_10K) SET_10K = filledSet(10000);
      for (var i = 0; i < n; i++) keep(SET_10K.has('key-' + (i % 10000)) ? 1 : 0);
    } },
    { id: 'WeakMap set/get', group: 'collections', n: 20000, run: function (n) {
      var wm = new WeakMap();
      var keys = shapeSpread(24);
      for (var i = 0; i < n; i++) { var k = keys[i % 24]; wm.set(k, i); keep(wm.get(k)); }
    } },

    /* --- symbol ---------------------------------------------------- */
    { id: 'Symbol() create', group: 'symbol', n: 50000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Symbol('tag-' + (i % 50)).toString().length);
    } },
    { id: 'Symbol as object key', group: 'symbol', n: 50000, run: function (n) {
      for (var i = 0; i < n; i++) { var s = Symbol('k'); var o = {}; o[s] = i; keep(o[s]); }
    } },
    { id: 'Symbol.for', group: 'symbol', n: 50000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Symbol['for']('shared-' + (i % 20)) ? 1 : 0);
    } },

    /* --- url ------------------------------------------------------- */
    { id: 'new URL', group: 'url', n: 4000, run: function (n) {
      for (var i = 0; i < n; i++) keep(new URL('/programmes/' + i + '?autoplay=1#t=30', 'https://example.com').pathname.length);
    } },
    { id: 'URLSearchParams parse + toString', group: 'url', n: 10000, run: function (n) {
      for (var i = 0; i < n; i++) {
        var p = new URLSearchParams('page=' + i + '&sort=date&q=news');
        p.append('extra', '1');
        keep(p.toString().length);
      }
    } },

    /* --- misc ------------------------------------------------------ */
    { id: 'structuredClone', group: 'misc', n: 4000, run: function (n) {
      var src = { a: 1, b: [1, 2, 3], c: { d: 'x' } };
      for (var i = 0; i < n; i++) keep(structuredClone(src).b.length);
    } },
    { id: 'Number.isInteger', group: 'misc', n: 200000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Number.isInteger(i / 2) ? 1 : 0);
    } },
    { id: 'Math.trunc/sign/cbrt', group: 'misc', n: 100000, run: function (n) {
      for (var i = 0; i < n; i++) keep(Math.trunc(i / 3) + Math.sign(i - 50) + Math.cbrt(i));
    } },

    /*
     * --- promise, with a depth axis ----------------------------------
     *
     * Depth, not count. If the scheduler is setTimeout-based, a .then chain is
     * nested timers, and the HTML nested-timer clamp only starts past depth 5 —
     * so a 3-link chain is fast and a 50-link chain is not, on identical code.
     * Both are here for exactly that reason.
     */
    { id: 'Promise chain — depth 3', group: 'promise', n: 200, async: true, run: function (n, done) {
      var left = n;
      function once() {
        var p = Promise.resolve(0);
        for (var d = 0; d < 3; d++) p = p.then(function (v) { return v + 1; });
        p.then(function (v) { keep(v); if (--left <= 0) done(); else once(); });
      }
      once();
    } },
    { id: 'Promise chain — depth 50', group: 'promise', n: 20, async: true, run: function (n, done) {
      var left = n;
      function once() {
        var p = Promise.resolve(0);
        for (var d = 0; d < 50; d++) p = p.then(function (v) { return v + 1; });
        p.then(function (v) { keep(v); if (--left <= 0) done(); else once(); });
      }
      once();
    } },
    { id: 'Promise.all — 200 promises', group: 'promise', n: 100, async: true, run: function (n, done) {
      var left = n;
      function once() {
        var ps = [];
        for (var i = 0; i < 200; i++) ps.push(Promise.resolve(i));
        Promise.all(ps).then(function (vals) { keep(vals.length); if (--left <= 0) done(); else once(); });
      }
      once();
    } },
    { id: 'Promise.allSettled — 100 promises', group: 'promise', n: 100, async: true, run: function (n, done) {
      var left = n;
      function once() {
        var ps = [];
        for (var i = 0; i < 100; i++) ps.push(Promise.resolve(i));
        Promise.allSettled(ps).then(function (vals) { keep(vals.length); if (--left <= 0) done(); else once(); });
      }
      once();
    } },
    { id: 'queueMicrotask — 500 tasks', group: 'promise', n: 20, async: true, run: function (n, done) {
      var rounds = n;
      function round() {
        var left = 500;
        for (var i = 0; i < 500; i++) {
          queueMicrotask(function () {
            if (--left <= 0) { if (--rounds <= 0) done(); else round(); }
          });
        }
      }
      round();
    } }
  ];

  /*
   * ?probe=clone (passed down by /speed?probe=clone): replace the cases with a
   * breakdown of structuredClone -- three input shapes, then each step a clone
   * takes for them. The step closest to the whole clone is the hot spot. The
   * steps are the same code in both frames; what differs is what each library
   * installed underneath (DOMException, toString, Map).
   */
  if (window.location.search.indexOf('probe=clone') !== -1) {
    var CLONE_SRC = { a: 1, b: [1, 2, 3], c: { d: 'x' } };
    var DATA = { value: 1, writable: true, enumerable: true, configurable: true };
    var probe = function (id, run) {
      return { id: id, group: 'clone probe', n: 4000, run: function (n) { for (var i = 0; i < n; i++) keep(run()); } };
    };
    // Round 2: the steps all matched core-js; split nesting from reuse.
    var REUSED_FLAT = { a: 1 };
    CASES = [
      probe('reused nested {a, b:[1,2,3], c:{d}}', function () { return structuredClone(CLONE_SRC); }),
      probe('fresh nested {a, b:[1,2,3], c:{d}}', function () { return structuredClone({ a: 1, b: [1, 2, 3], c: { d: 'x' } }); }),
      probe('reused flat {a: 1}', function () { return structuredClone(REUSED_FLAT); }),
      probe('fresh flat {a: 1}', function () { return structuredClone({ a: 1 }); }),
      probe('fresh {c: {d}} (object in object)', function () { return structuredClone({ c: { d: 'x' } }); }),
      probe('fresh {b: [1,2,3]} (array in object)', function () { return structuredClone({ b: [1, 2, 3] }); }),
      probe('fresh [[1]] (array in array)', function () { return structuredClone([[1]]); }),
      probe('fresh [1, 2, 3]', function () { return structuredClone([1, 2, 3]); }),
      probe('primitive 1', function () { return structuredClone(1); }),
      // After the runs above: did cloning leave anything on the reused source?
      // Reported as the row's error text, the one column a case can write to.
      { id: 'own keys left on the reused source', group: 'clone probe', n: 1, run: function () {
        var names = Object.getOwnPropertyNames(CLONE_SRC);
        var arrayNames = Object.getOwnPropertyNames(CLONE_SRC.b);
        throw new Error('object: ' + names.length + ' [' + names.slice(0, 6).join(', ') + '] / array: ' +
          arrayNames.length + ' [' + arrayNames.slice(0, 6).join(', ') + ']');
      } }
    ];
  }

  /* ------------------------------------------------------------------ *
   * Running them.
   * ------------------------------------------------------------------ */

  var results = [];

  /*
   * Crash tracing, as /verify-compare does it: the case about to run goes to
   * localStorage first and a finished run clears it, so a case that kills the
   * engine is left behind for the page to report on the next load. Cases filed
   * there as froze (speed:froze, per library) are skipped and reported as such,
   * so each reload gets further and the last run is complete.
   */
  var TRACE_KEY = 'speed:last';
  var store = null;
  try { store = window.localStorage || null; } catch (e) { /* storage blocked */ }
  var froze = {};
  try {
    var frozeAll = JSON.parse((store && store.getItem('speed:froze')) || '{}');
    var mine = frozeAll[LIB] || [];
    for (var f = 0; f < mine.length; f++) froze[mine[f]] = true;
  } catch (e) { /* unreadable list: run everything */ }
  function trace(id) {
    try { if (store) store.setItem(TRACE_KEY, LIB + ': ' + id); } catch (e) { /* quota */ }
  }
  function clearTrace() {
    try { if (store) store.removeItem(TRACE_KEY); } catch (e) { /* storage blocked */ }
  }

  /*
   * A warm-up of the same count for every case, always discarded.
   *
   * The first trip through any of these pays parse and first-tier compilation,
   * and on the shorter cases that is most of the number. Without it, whichever
   * library the parent happened to run first looks slower for a reason that has
   * nothing to do with its code.
  */
  // Every case runs at most COUNT times, warm-up and measurement alike.
  var COUNT = 200;

  /*
   * Each case is timed REPEATS times and the average kept.
   */
  var REPEATS = 5;

  function runOne(c, done) {
    var n = c.n < COUNT ? c.n : COUNT;
    var warm = n;
    var sum = 0;

    if (c.async) {
      var left = REPEATS;
      var measure = function () {
        // Start in a new task, after the previous scheduler has fully drained.
        // Otherwise queue-based cases can append measured callbacks to a
        // still-active drain and inherit its queue state.
        window.setTimeout(function () {
          var t0 = now();
          c.run(n, function () {
            var ms = now() - t0;
            sum += ms;
            if (--left > 0) measure();
            else done({ id: c.id, group: c.group, n: n, ms: sum / REPEATS });
          });
        }, 0);
      };
      c.run(warm, measure);
      return;
    }

    c.run(warm, c.setup ? c.setup(warm) : undefined);
    for (var r = 0; r < REPEATS; r++) {
      var fixture = c.setup ? c.setup(n) : undefined;
      var t1 = now();
      c.run(n, fixture);
      var ms = now() - t1;
      sum += ms;
    }
    done({ id: c.id, group: c.group, n: n, ms: sum / REPEATS });
  }

  /*
   * Whose code a case measures: the engine's own function, or the library's.
   * Read from the function's source text -- a native one says [native code].
   * Where a native method stays but its constructor was wrapped, say so.
   */
  var fnToString = Function.prototype.toString;
  function isNative(fn) {
    try { return typeof fn === 'function' && /\[native code\]/.test(fnToString.call(fn)); } catch (e) { return false; }
  }
  function apiOf(id) {
    var m, w = window;
    if ((m = /^Object\.(\w+)/.exec(id))) return Object[m[1]];
    if ((m = /^Array\.(\w+)/.exec(id))) return Array[m[1]];
    if ((m = /^Array#(\w+)/.exec(id))) return Array.prototype[m[1]];
    if ((m = /^String#(\w+)/.exec(id))) return String.prototype[m[1]];
    if ((m = /^Map (get|set|delete|iterate)/.exec(id))) return [w.Map, w.Map && w.Map.prototype[m[1] === 'iterate' ? 'forEach' : m[1]]];
    if (/^Set has/.test(id)) return [w.Set, w.Set && w.Set.prototype.has];
    if (/^WeakMap/.test(id)) return w.WeakMap && w.WeakMap.prototype.set;
    if (id === 'Symbol.for') return w.Symbol && w.Symbol['for'];
    if (/^Symbol/.test(id)) return w.Symbol;
    if (id === 'new URL') return w.URL;
    if (/^URLSearchParams/.test(id)) return w.URLSearchParams;
    if (id === 'structuredClone') return w.structuredClone;
    if (id === 'queueMicrotask — 500 tasks') return w.queueMicrotask;
    if (/^Number\./.test(id)) return Number.isInteger;
    if (/^Math\./.test(id)) return Math.trunc;
    if (/^Promise chain/.test(id)) return w.Promise && w.Promise.prototype.then;
    if ((m = /^Promise\.(\w+)/.exec(id))) return w.Promise && w.Promise[m[1]];
    return null;
  }
  function implOf(id) {
    var api = apiOf(id);
    if (api === null || api === undefined) return '';
    if (api instanceof Array) {
      if (!isNative(api[1])) return 'lib';
      return isNative(api[0]) ? 'native' : 'native, wrapped ctor';
    }
    return isNative(api) ? 'native' : 'lib';
  }

  function step(i) {
    if (i >= CASES.length) {
      clearTrace();
      post({ results: results, sink: sink });
      return;
    }

    var c = CASES[i];
    if (froze.hasOwnProperty(c.id)) {
      results.push({ id: c.id, group: c.group, n: c.n, ms: null, error: 'froze the engine on an earlier run, so it was skipped this time' });
      window.setTimeout(function () { step(i + 1); }, 0);
      return;
    }
    trace(c.id);

    // A case that throws becomes a row, not a dead run: one missing API in one
    // library is a finding, and losing the other forty rows to it is not.
    var settled = false;
    function finish(r) {
      if (settled) return;
      settled = true;
      r.impl = implOf(c.id);
      results.push(r);
      // Yield between cases so each measured window sits in its own task and
      // the frame gets to paint its status line.
      window.setTimeout(function () { step(i + 1); }, 0);
    }

    try {
      runOne(c, finish);
    } catch (e) {
      finish({ id: c.id, group: c.group, n: c.n, ms: null, error: (e && e.message) ? e.message : String(e) });
    }
  }

  window.setTimeout(function () { step(0); }, 0);
})();
