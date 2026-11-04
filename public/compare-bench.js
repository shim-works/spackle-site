/*
 * The harness inside a /compare frame.
 *
 * Body copied from core-js-benchmark.js — same reason those two files are
 * duplicates of each other: the traces only compare if the work is literally
 * the same code. What differs here is the shell around it. A frame has no
 * button and nothing to render into: it is handed its condition on the query
 * string, runs once on load, posts the numbers to the parent and is then
 * removed from the DOM so its realm can be collected.
 *
 * Both frame documents load THIS file; the library differs, the workload does
 * not. `window.__LIB` is set inline by the frame, before the library loads.
 *
 * Hand-written ES5. The library itself is loaded by the frame, before this
 * file.
 */
(function () {
  var LIB = window.__LIB || 'unknown';

  var QUICK = 100;
  var SHORT = 500;
  var LONG = 5000;
  var ROWS = 30;

  var TAG = 'spackle-compare';

  /*
   * One message to the parent, ever — a result or a refusal. The parent is
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
    // The status line: inside /compare the parent shows progress, but opened on
    // its own this frame would otherwise sit on "loading…" after it finished.
    try {
      var status = document.getElementById('status');
      if (status) {
        status.innerHTML = '<b>' + LIB + '</b> — ' + (payload.error
          ? 'failed: ' + payload.error
          : 'done: ' + payload.passes + ' passes in ' + Math.round(payload.totalMs) + ' ms');
      }
    } catch (e) { /* no DOM to write to */ }
    try {
      window.parent.postMessage(payload, '*');
    } catch (e) {
      // Nothing left to do: there is no UI in here to report it to.
    }
  }

  function fail(message) {
    post({ error: message });
  }

  // Timing samples: every 10th pass on the short run, every 100th on the long
  // one, so both produce ~50 points whatever the length. Logged as an array
  // for now; a graph can read it straight off window.__timings.
  function sampleEvery(passes) {
    return passes >= LONG ? 100 : passes >= SHORT ? 10 : 1;
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

  // Length, also from the parent. Anything unrecognised falls back to the
  // short run rather than trusting a number off a URL.
  var PASSES = (function () {
    var m = /(?:\?|&)passes=(\d+)/.exec(window.location.search);
    var n = m ? parseInt(m[1], 10) : QUICK;
    return n === LONG || n === SHORT || n === QUICK ? n : QUICK;
  })();

  /*
   * A library that threw partway through its own install looks FAST — the work
   * it failed to set up is work it never does. Profiling that produces a
   * beautiful, meaningless flame chart, so refuse instead.
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
        'this is not a partial-install profile.'
      : 'This engine is missing ' + missing.join(', ') + ' and ' + LIB +
        ' did not fill the gap. The workload needs all of them, so there is nothing to time. ' +
        'That is a real result: it is the reason this library exists.');
    return;
  }

  if (console.timeStamp) console.timeStamp(LIB + '-install-end');

  /* ------------------------------------------------------------------ *
   * One simulated React render pass.
   *
   * NOT a page navigation — no DOM, no router, no paint. This is the JS work a
   * render does: resolve the route, build an element tree, merge props down it,
   * reconcile against the previous tree by key, run effects, drop it.
   * ------------------------------------------------------------------ */

  var sink = [];
  function keep(v) {
    // Touch the value so an optimiser cannot drop the work that produced it.
    if (v !== null && typeof v !== 'undefined') sink.push(typeof v);
    if (sink.length > 64) sink.length = 0;
  }

  var REACT_ELEMENT = null;
  var instanceCache = null;
  var prevHooks = null;

  function tag() {
    if (REACT_ELEMENT === null) REACT_ELEMENT = Symbol.for('react.element');
    return REACT_ELEMENT;
  }

  // JSX compiles to an object literal built at the call site — no copy, so no
  // Object.assign.
  function el(type, props, children) {
    props.children = children || [];
    return { $$typeof: tag(), type: type, key: props.key != null ? props.key : null, ref: null, props: props };
  }

  // `<li {...props}>`. Babel lowers the spread to Object.assign, so only the
  // elements that actually spread pay for one — which is what a real tree does.
  function elSpread(type, props, children) {
    return {
      $$typeof: tag(),
      type: type,
      key: props.key != null ? props.key : null,
      ref: null,
      props: Object.assign({}, props, { children: children || [] })
    };
  }

  // Route resolution, the way a router does it before anything renders.
  function resolveRoute(routeIndex) {
    var url = new URL('/channel/' + routeIndex + '?page=' + routeIndex + '&sort=time', 'https://app.example/');
    var params = new URLSearchParams(url.search);
    var pairs = [];
    params.forEach(function (v, k) { pairs.push([k, v]); });
    return Object.fromEntries(pairs);
  }

  // "01:05" — app-level formatting, per row. Not something React does.
  function clock(i) {
    return String((i % 12) + 1).padStart(2, '0') + ':' + String((i * 7) % 60).padStart(2, '0');
  }

  function buildTree(routeIndex, rowCount, routeProps) {
    var rows = [];
    for (var i = 0; i < rowCount; i++) {
      rows.push(
        elSpread('li', { key: 'row-' + i, className: 'row row--' + (i % 3) }, [
          el('img', { src: '/img/' + routeIndex + '/' + i + '.jpg', alt: 'Item ' + i }, []),
          el('span', { className: 'title' }, ['Programme ' + i]),
          el('time', { dateTime: '2026-01-0' + ((i % 9) + 1) }, [clock(i)])
        ])
      );
    }
    return elSpread('main', { className: 'page', 'data-route': String(routeIndex), page: routeProps.page, sort: routeProps.sort }, [
      elSpread('h1', { className: 'heading' }, ['Route ' + routeIndex]),
      elSpread('ul', { className: 'grid' }, rows)
    ]);
  }

  // Reconcile children by key, the way React pairs old and new lists.
  function reconcile(prevChildren, nextChildren) {
    var prevByKey = new Map();
    for (var i = 0; i < prevChildren.length; i++) {
      var pk = prevChildren[i].key;
      if (pk !== null) prevByKey.set(pk, prevChildren[i]);
    }
    var updates = 0, mounts = 0;
    var seen = new Set();
    for (var j = 0; j < nextChildren.length; j++) {
      var next = nextChildren[j];
      var key = next.key;
      seen.add(key);
      var prev = key !== null ? prevByKey.get(key) : undefined;
      if (prev) {
        var changed = Object.keys(next.props).some(function (k) {
          return k !== 'children' && prev.props[k] !== next.props[k];
        });
        if (changed) updates++;
      } else {
        mounts++;
      }
    }
    var unmounts = 0;
    prevByKey.forEach(function (_v, k) { if (!seen.has(k)) unmounts++; });
    return { updates: updates, mounts: mounts, unmounts: unmounts };
  }

  // React compares each hook's next value with the previous one via Object.is
  // and bails out when nothing moved; deps arrays are compared the same way.
  function runHooks(routeIndex, previous) {
    var hookState = Array.from({ length: 12 }, function (_, i) {
      return { value: routeIndex * i, deps: [routeIndex, i] };
    });
    var bailouts = 0;
    if (previous) {
      for (var i = 0; i < hookState.length; i++) {
        if (Object.is(previous[i].value, hookState[i].value)) bailouts++;
      }
    }
    return { hooks: hookState, bailouts: bailouts };
  }

  function pass(routeIndex, prevTree) {
    var routeProps = resolveRoute(routeIndex);
    var tree = buildTree(routeIndex, ROWS, routeProps);

    var hooks = runHooks(routeIndex, prevHooks);
    prevHooks = hooks.hooks;

    if (instanceCache === null) instanceCache = new WeakMap();
    instanceCache.set(tree, { mountedAt: routeIndex, hooks: hooks.hooks });

    var diff = { updates: 0, mounts: 0, unmounts: 0 };
    if (prevTree) {
      diff = reconcile(prevTree.props.children[1].props.children, tree.props.children[1].props.children);
    }

    var rowEls = tree.props.children[1].props.children;

    // flattenChildren — the nested arrays a .map() inside JSX produces
    var flattened = [rowEls, [tree.props.children[0]]].flat();
    var activeIndex = flattened.findIndex(function (node) {
      return node.key === 'row-' + (routeIndex % ROWS);
    });

    // className churn — string work on every row
    var variants = ['row--0', 'row--1', 'row--2'];
    var classNames = [];
    for (var r = 0; r < rowEls.length; r++) {
      var cn = rowEls[r].props.className.trim();
      if (cn.startsWith('row') && variants.includes(cn.split(' ')[1])) classNames.push(cn);
    }

    // effects: async work kicked off on mount, flushed after commit
    var cleanups = [];
    var effect = Promise.resolve(diff.mounts).then(function (n) { return n + diff.updates; });
    var fetches = Promise.allSettled([Promise.resolve(routeProps.page), Promise.resolve(routeProps.sort)]);
    queueMicrotask(function () { /* passive effect flush */ });
    for (var e = 0; e < 6; e++) {
      cleanups.push((function (id) { return function () { return id; }; })(e));
    }

    // analytics: a params object serialised on navigation
    var beacon = Object.entries({ route: routeIndex, rows: ROWS }).length;

    keep(classNames.length);
    keep(activeIndex);
    keep(beacon);
    keep(diff.updates + diff.mounts + diff.unmounts);
    keep(hooks.bailouts);
    keep(effect);
    keep(fetches);
    keep(cleanups.length);

    cleanups.length = 0;
    return tree;
  }

  function dropEverything() {
    sink.length = 0;
    prevHooks = null;
    instanceCache = null;
  }

  /* ------------------------------------------------------------------ *
   * How much did the library install on THIS engine?
   *
   * spackle stamps every global and method it replaces with `__polyfilled`, so
   * counting them shows the incremental-install behaviour directly: near-zero
   * on a modern engine, near-total on the floor. core-js carries no equivalent
   * marker and reads 0 — it is a spackle self-report, not a comparison. The
   * timing is the comparison.
   * ------------------------------------------------------------------ */
  function installedCount() {
    var checked = 0;
    var installed = 0;

    function look(owner, names) {
      if (!owner) return;
      for (var i = 0; i < names.length; i++) {
        checked++;
        try {
          var v = owner[names[i]];
          if (v && v.__polyfilled === true) installed++;
        } catch (e) { /* getter threw — count as not installed */ }
      }
    }

    look(window, ['URL', 'URLSearchParams', 'Symbol', 'Map', 'Set', 'WeakMap', 'WeakSet',
      'Promise', 'DOMException', 'structuredClone', 'setImmediate', 'clearImmediate',
      'Reflect', 'queueMicrotask']);
    look(Array.prototype, ['flat', 'flatMap', 'includes', 'find', 'findIndex', 'findLast',
      'findLastIndex', 'at', 'copyWithin', 'fill', 'entries', 'toSorted', 'toReversed', 'with']);
    look(Array, ['from', 'of', 'isArray', 'fromAsync']);
    look(String.prototype, ['padStart', 'padEnd', 'trimStart', 'trimEnd', 'replaceAll', 'at',
      'includes', 'startsWith', 'endsWith', 'repeat', 'codePointAt', 'normalize']);
    look(Object, ['assign', 'entries', 'values', 'fromEntries', 'is',
      'getOwnPropertyDescriptors', 'freeze', 'seal', 'isFrozen', 'setPrototypeOf']);
    look(Object.prototype, ['toString']);
    look(Number, ['isInteger', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'isSafeInteger']);
    look(Math, ['trunc', 'sign', 'cbrt', 'log2', 'log10', 'hypot', 'fround', 'clz32',
      'expm1', 'log1p', 'sinh', 'cosh', 'tanh']);
    look(Promise, ['allSettled', 'any', 'try', 'withResolvers']);
    look(JSON, ['stringify', 'parse']);

    return { installed: installed, checked: checked };
  }

  /* ------------------------------------------------------------------ *
   * No forced GC, no heap readings.
   *
   * window.gc() needs --js-flags=--expose-gc, which no TV, set-top box or
   * kiosk has, and hand-holding the collector hides the thing being looked for
   * anyway.
   *
   * performance.memory was tried and removed. Correcting the record, since the
   * standalone pages still claim otherwise: it does NOT need
   * --enable-precise-memory-info, and Chrome reports usedJSHeapSize flagless
   * and unbucketed. It was dropped because the plot of it was not worth
   * looking at — Chrome refreshes the number lazily, so short windows come
   * back as a staircase, and a same-origin frame shares its heap with the
   * parent, so the baseline is not the library's to begin with.
   *
   * So the measurement is TIME, sampled through one continuous run. Flat means
   * the collector is keeping up. Rising means it is not, and that is what the
   * viewer feels as the app going sluggish.
   * ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ *
   * The run: one continuous loop, whichever length was picked.
   *
   * No cycles and no idle pauses. Breaking the run into batches with gaps
   * hands the collector free time OUTSIDE the timed window, so whichever
   * library allocates more gets its collection bill amortised into a gap that
   * nobody is measuring — which flattens exactly the difference being looked
   * for.
   * ------------------------------------------------------------------ */
  /*
   * ?yield=1: one pass per task, as a real app renders one frame per task, so
   * the microtasks a pass queues (promise jobs, queueMicrotask) run before the
   * next pass instead of piling up across the whole synchronous loop. Only the
   * time inside the passes counts; the waits between them do not.
   */
  var YIELD = /(?:\?|&)yield=1(?:&|$)/.test(window.location.search);
  var clock = window.performance && typeof window.performance.now === 'function'
    ? function () { return window.performance.now(); }
    : function () { return new Date().getTime(); };
  var nextTask = (function () {
    if (typeof window.MessageChannel === 'function') {
      var channel = new window.MessageChannel();
      var queued = null;
      channel.port1.onmessage = function () {
        var fn = queued;
        queued = null;
        if (fn) fn();
      };
      return function (fn) {
        queued = fn;
        channel.port2.postMessage(0);
      };
    }
    return function (fn) { window.setTimeout(fn, 0); };
  })();

  function runPassesYielding(passes, done, warmup) {
    var every = sampleEvery(passes);
    var timings = [];
    var busy = 0;
    var windowBusy = 0;
    var i = 0;
    var prev = null;
    if (console.timeStamp) console.timeStamp(LIB + (warmup ? '-warmup-start' : '-run-start'));
    function step() {
      try {
        var t0 = clock();
        prev = pass(i, prev);
        var spent = clock() - t0;
        busy += spent;
        windowBusy += spent;
        i++;
        if (i % every === 0) {
          timings.push(Math.round(windowBusy * 100) / 100);
          windowBusy = 0;
        }
      } catch (e) {
        fail(LIB + ' threw during the run: ' + (e && e.message ? e.message : String(e)));
        return;
      }
      if (i < passes) {
        nextTask(step);
        return;
      }
      prev = null;
      if (console.timeStamp) console.timeStamp(LIB + (warmup ? '-warmup-end' : '-run-end'));
      dropEverything();
      done({ elapsed: Math.round(busy), passes: passes, every: every, timings: timings, samples: null });
    }
    nextTask(step);
  }

  function runPasses(passes, done, warmup) {
    if (YIELD) {
      runPassesYielding(passes, done, warmup);
      return;
    }
    var every = sampleEvery(passes);
    var timings = [];

    if (console.timeStamp) console.timeStamp(LIB + (warmup ? '-warmup-start' : '-run-start'));
    var started = new Date().getTime();
    var mark = started;

    var prev = null;
    for (var i = 0; i < passes; i++) {
      prev = pass(i, prev);
      // One Date call per `every` passes, inside the measured window. 50 of
      // them against 500 passes is noise, and the alternative (timing outside
      // the loop) cannot show drift at all.
      if ((i + 1) % every === 0) {
        var now = new Date().getTime();
        timings.push(now - mark);
        mark = now;
      }
    }
    prev = null;

    var elapsed = new Date().getTime() - started;
    if (console.timeStamp) console.timeStamp(LIB + (warmup ? '-warmup-end' : '-run-end'));
    dropEverything();
    done({
      elapsed: elapsed,
      passes: passes,
      every: every,
      timings: timings,
      samples: null
    });
  }


  /* ------------------------------------------------------------------ *
   * Hand the numbers up and stop.
   *
   * No rendering in here. A paint inside the marks pollutes the trace, and
   * there is nowhere to paint to anyway — the frame is 240px of "running",
   * removed from the document as soon as this message lands. The parent owns
   * every table on the page.
   * ------------------------------------------------------------------ */
  function finish(result) {
    var inst = installedCount();
    post({
      passes: result.passes,
      every: result.every,
      totalMs: result.elapsed,
      timings: result.timings || [],
      installed: inst.installed,
      checked: inst.checked
    });
  }

  /*
   * Runs on load: a frame has no button. The setTimeout is the same yield the
   * standalone pages use — it keeps the "running" paint out of the measured
   * window. A throw anywhere in the run is reported rather than swallowed,
   * because a silent frame reads to the parent as a hang.
   */
  /*
   * ?delay=ms: wait before starting, so a recording or a "before" snapshot can be
   * set up in DevTools first (the page stays usable during the wait). Capped at
   * 60 s; the status line counts down.
   */
  var DELAY = (function () {
    var m = /(?:\?|&)delay=(\d+)/.exec(window.location.search);
    var ms = m ? parseInt(m[1], 10) : 0;
    return ms > 60000 ? 60000 : ms;
  })();
  if (DELAY > 0 && window.parent !== window) {
    var statusLine = document.getElementById('status');
    var startAt = new Date().getTime() + DELAY;
    var countdown = function () {
      var left = Math.ceil((startAt - new Date().getTime()) / 1000);
      if (statusLine && left > 0) statusLine.innerHTML = '<b>' + LIB + '</b> — starting in ' + left + ' s';
      if (left > 0) window.setTimeout(countdown, 250);
      else if (statusLine) statusLine.innerHTML = '<b>' + LIB + '</b> — running…';
    };
    countdown();
  }

  /*
   * Opened directly (not as /compare's iframe): wait for a Start button, so a
   * recording can be set up first. Inside /compare the frame starts on its own.
   */
  var STANDALONE = window.parent === window;
  var begin = function (fn) {
    if (!STANDALONE) {
      window.setTimeout(fn, DELAY);
      return;
    }
    var line = document.getElementById('status');
    var start = document.createElement('button');
    start.innerHTML = 'Start ' + LIB;
    start.style.marginLeft = '12px';
    start.onclick = function () {
      start.parentNode.removeChild(start);
      if (line) line.innerHTML = '<b>' + LIB + '</b> — running…';
      window.setTimeout(fn, DELAY);
    };
    if (line) {
      line.innerHTML = '<b>' + LIB + '</b> — ready';
      line.appendChild(start);
    } else {
      document.body.appendChild(start);
    }
  };

  begin(function () {
    try {
      // Warm every library with the same render passes, then start the selected
      // measurement in a fresh task. Warm-up timings are discarded. Scaled to the
      // run, so only the 5000 run gets the 5,000-pass warm-up.
      runPasses(PASSES === QUICK ? 50 : PASSES === SHORT ? 500 : 5000, function () {
        window.setTimeout(function () {
          try {
            runPasses(PASSES, finish, false);
          } catch (e) {
            fail(LIB + ' threw during the run: ' + (e && e.message ? e.message : String(e)));
          }
        }, 0);
      }, true);
    } catch (e) {
      fail(LIB + ' threw during the run: ' + (e && e.message ? e.message : String(e)));
    }
  });

})();
