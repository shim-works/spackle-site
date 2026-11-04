/*
 * The harness behind /react-spackle and /react-core-js.
 *
 * A subset of the js-framework-benchmark (Krausest) keyed React implementation:
 * the four ops that move real DOM in bulk — create 100 rows, create 1,000 rows,
 * replace all 100, clear. React 18 drives it, the polyfill library under test is
 * already installed underneath, and the question is what an app built this way
 * pays for shipping that library.
 *
 * Why this page exists next to /compare and /speed: those measure our own
 * workload calling polyfills directly. This one measures somebody else's code
 * — React's reconciler, its scheduler, its Map/Set/Promise use — which is the
 * only shape that resembles an actual app profile.
 *
 * Both pages load THIS file. The library differs and is loaded by the page
 * before React; the workload does not differ. `window.__LIB` is set inline by
 * the page, before anything loads. Same arrangement as speed-bench.js, and for
 * the same reason: two copies of a workload drift, and the day they do, every
 * number on both pages quietly stops being comparable.
 *
 * Natives are never deleted here. That is the whole condition of this page —
 * the library installs onto the engine as found, which is what a real app
 * ships into. The strip-the-natives worst case already has three pages.
 *
 * Hand-written ES5, no JSX: React.createElement directly. The page floor is
 * Chrome 38, there is no build step for this file, and Astro leaves
 * <script is:inline src> alone.
 */
(function () {
  var LIB = window.__LIB || 'unknown';

  var REPS = 50;         // per op; the first is thrown away. Enough churn to force collections
  var ROWS = 100;
  var LOTS = 1000;
  /*
   * No paint for this long and the run is abandoned.
   *
   * Generous on purpose. The first value here was 5 s, which is fine on a
   * laptop and wrong everywhere this library is aimed: 10,000 rows on a 2014
   * TV, or under a 50x CPU throttle, is tens of seconds of honest work. A
   * watchdog that fires on a slow device rather than a broken one would refuse
   * to measure exactly the case worth measuring.
   */
  var STALL_MS = 60000;

  var out = document.getElementById('out');
  var button = document.getElementById('run');
  var mount = document.getElementById('app');
  var slowdownPicker = document.getElementsByName('slowdown');

  /* ---- heap ---------------------------------------------------------- *
   * Copied from core-js-benchmark.js. performance.memory is Chrome-only,
   * quantized unless the browser was started with
   * --enable-precise-memory-info, and reports the JS heap rather than the
   * process. It is still the only heap number available to a page, and the
   * before/after delta with a manual GC on each side is the one reading here
   * worth printing.
   */
  var heapPanel = document.getElementById('heap-tools');
  var heapBefore = null;
  var heapCapture = document.getElementById('heap-capture');
  var heapResult = document.getElementById('heap-result');
  var heapBeforeLabel = document.getElementById('heap-before');
  var heapPeer = document.getElementById('heap-peer');
  // Off. The reading needs a manual GC in DevTools, and a TV has no DevTools.
  var heapAvailable = false;

  function heapSample() {
    if (!heapAvailable) return null;
    var m = window.performance.memory;
    return { used: m.usedJSHeapSize, total: m.totalJSHeapSize, limit: m.jsHeapSizeLimit };
  }

  function heapFormat(bytes) {
    var sign = bytes < 0 ? '-' : '';
    var n = Math.abs(bytes);
    if (n >= 1048576) return sign + (n / 1048576).toFixed(2) + ' MB';
    return sign + (n / 1024).toFixed(1) + ' KB';
  }

  if (heapAvailable && heapPanel) {
    heapPanel.style.display = 'block';
  } else if (heapPanel) {
    heapPanel.parentNode.removeChild(heapPanel);
  }

  if (heapCapture) heapCapture.onclick = function () {
    var after = heapSample();
    if (!heapBefore || !after) return;
    var delta = after.used - heapBefore.used;
    heapResult.innerHTML = 'Before: <b>' + heapFormat(heapBefore.used) +
      '</b> used of ' + heapFormat(heapBefore.total) + '. After: <b>' +
      heapFormat(after.used) + '</b> used of ' + heapFormat(after.total) +
      '. Change: <b>' + (delta >= 0 ? '+' : '') + heapFormat(delta) +
      '</b> (' + delta + ' bytes).';
    heapCapture.disabled = true;
  };

  /* ---- clock and frames ---------------------------------------------- */

  var now = (function () {
    if (window.performance && window.performance.now) {
      return function () { return window.performance.now(); };
    }
    return function () { return +new Date(); };
  })();

  // Safari 7.1 is one of the floors and only has the prefixed one. The final
  // fallback is a timer at roughly frame rate: worse, but it measures rather
  // than throwing.
  var raf = (function () {
    var f = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
    if (f) return function (cb) { return f.call(window, cb); };
    return function (cb) { return window.setTimeout(cb, 16); };
  })();

  /*
   * One paint boundary.
   *
   * js-framework-benchmark times click to paint, and that is the number worth
   * having: React 18's createRoot is concurrent, so anything measured at the
   * moment the state setter returns is measuring the scheduler accepting the
   * work rather than the work happening. rAF fires before paint; a macrotask
   * queued from inside it lands after. So rAF then setTimeout(0).
   */
  function afterPaint(cb) {
    var done = false;

    // A hidden tab does not paint, so rAF never fires and the run stops dead
    // with the page still saying "running". Watchdog rather than hang: a stalled
    // run aborts and says why, because a benchmark that hangs looks like a
    // benchmark that crashed the browser.
    var watchdog = window.setTimeout(function () {
      if (done) return;
      done = true;
      onStall();
    }, STALL_MS);

    raf(function () {
      window.setTimeout(function () {
        if (done) return;
        done = true;
        window.clearTimeout(watchdog);
        cb();
      }, 0);
    });
  }

  /*
   * A stalled or abandoned run. Set by run() while one is in flight; calling it
   * gives the page back and explains itself. Whatever was mid-flight is dropped
   * rather than reported: a partial number measured across a repaint the tab
   * never did is not a number.
   */
  var stalled = null;
  var stopLoad = null;

  function onStall() {
    if (stalled) stalled();
  }

  /* ---- CPU slowdown --------------------------------------------------- *
   * DevTools throttles the CPU through the debugger protocol, which a page
   * cannot reach. What a page can do is compete with itself: a timer that
   * spins the main thread for `busy` ms, yields for `idle`, and repeats, so the
   * benchmark gets roughly 1/factor of the thread. Same effect on the numbers
   * as a slower CPU, arrived at from the other direction.
   *
   * `idle` cannot go below the ~4 ms timer clamp, so `busy` scales up instead
   * of `idle` scaling down — which makes the blocks coarse (20 ms at 6x) and is
   * the honest limit of doing this in-page.
   *
   * Because the clamp, and the browser's own work, make the requested factor a
   * request rather than a fact, the loader counts the milliseconds it actually
   * spun. The effective factor is reported from that, per op. It is the reading
   * to trust; the picker value is the dial.
   *
   * ponytail: cooperative contention, not real throttling. If per-op numbers
   * ever need to line up with the public JFB table, drive
   * Emulation.setCPUThrottlingRate over CDP from outside the page instead.
   */
  var CLAMP = 4;

  function startLoad(factor) {
    var spun = 0;
    var stopped = false;

    if (factor > 1) {
      var idle = CLAMP;
      var busy = idle * (factor - 1);
      var slice = function () {
        if (stopped) return;
        var end = now() + busy;
        while (now() < end) { /* burn it */ }
        spun += busy;
        window.setTimeout(slice, idle);
      };
      window.setTimeout(slice, 0);
    }

    return function () {
      stopped = true;
      return spun;
    };
  }

  function chosenFactor() {
    for (var i = 0; i < slowdownPicker.length; i++) {
      if (slowdownPicker[i].checked) return parseInt(slowdownPicker[i].value, 10) || 1;
    }
    return 1;
  }

  /* ---- refuse rather than measure a broken install -------------------- *
   * A library that threw partway through installing looks FAST: the work it
   * failed to set up is work it never does. React on top of a half-installed
   * library is worse than that — it either dies on the first render or quietly
   * takes a different path, and either way the number means nothing.
   */
  var required = [
    ['React', function () { return window.React; }],
    ['ReactDOM', function () { return window.ReactDOM; }],
    ['ReactDOM.createRoot', function () { return window.ReactDOM && window.ReactDOM.createRoot; }],
    ['Promise', function () { return window.Promise; }],
    ['Map', function () { return window.Map; }],
    ['Set', function () { return window.Set; }],
    ['Object.assign', function () { return Object.assign; }]
  ];

  var missing = [];
  for (var r = 0; r < required.length; r++) {
    var ok = false;
    try { ok = !!required[r][1](); } catch (e) { ok = false; }
    if (!ok) missing.push(required[r][0]);
  }

  if (missing.length) {
    out.innerHTML = '<div class="score bad"><b>Cannot run</b></div>' +
      '<div class="note">Missing after ' + LIB + ' loaded: <b>' + missing.join(', ') +
      '</b>. Refusing to measure — a partial install produces a fast, meaningless number.</div>';
    if (button) button.parentNode.removeChild(button);
    return;
  }

  /* ---- data ----------------------------------------------------------- *
   * Word lists and label shape verbatim from the js-framework-benchmark React
   * implementation, so the string work per row is the same work.
   */
  var ADJECTIVES = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome',
    'plain', 'quaint', 'clean', 'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy',
    'odd', 'unsightly', 'adorable', 'important', 'inexpensive', 'cheap', 'expensive',
    'fancy'];
  var COLOURS = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown',
    'white', 'black', 'orange'];
  var NOUNS = ['table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie',
    'sandwich', 'burger', 'pizza', 'mouse', 'keyboard'];

  var nextId = 1;

  function pick(list) {
    return list[Math.round(Math.random() * 1000) % list.length];
  }

  function buildData(count) {
    var data = new Array(count);
    for (var i = 0; i < count; i++) {
      data[i] = {
        id: nextId++,
        label: pick(ADJECTIVES) + ' ' + pick(COLOURS) + ' ' + pick(NOUNS)
      };
    }
    return data;
  }

  /* ---- components ------------------------------------------------------ *
   * The keyed React implementation's shape: a memoized Row, keys on id, the
   * selected row carrying a class. Written with createElement because there is
   * no JSX step on this site. The select and remove handlers stay wired even
   * though no op in this subset clicks them — they are part of what React has
   * to allocate and diff per row, and dropping them would make the rows
   * cheaper than the benchmark's.
   */
  var e = React.createElement;

  var Row = React.memo(function (props) {
    var d = props.data;
    return e('tr', { className: props.selected ? 'danger' : null },
      e('td', { className: 'col-id' }, d.id),
      e('td', { className: 'col-label' },
        e('a', { onClick: function () { props.onSelect(d.id); } }, d.label)),
      e('td', { className: 'col-remove' },
        e('a', { onClick: function () { props.onRemove(d.id); } }, '×')),
      e('td', { className: 'col-pad' })
    );
  });

  /*
   * The harness lives outside React and has to be able to push state in. The
   * App hands its setter out on every render; `apply` is always the current
   * one. A ref would be tidier React and identical here.
   */
  var apply = null;

  /*
   * What React has actually committed, against what was last asked for.
   * createRoot is concurrent: a big render is split across frames, so the first
   * paint after a click can land before the rows exist -- core-js once logged
   * 10,000 rows in 5 ms that way. The layout effect runs at commit, so the op is
   * done only when committedData is the array setRows handed over.
   */
  var pendingData = null;
  var committedData = null;

  function App() {
    var st = React.useState({ data: [], selected: null });
    var state = st[0];
    apply = st[1];

    React.useLayoutEffect(function () { committedData = state.data; });

    var onSelect = React.useCallback(function (id) {
      apply(function (prev) { return { data: prev.data, selected: id }; });
    }, []);

    var onRemove = React.useCallback(function (id) {
      apply(function (prev) {
        var next = prev.data.slice();
        for (var i = 0; i < next.length; i++) {
          if (next[i].id === id) { next.splice(i, 1); break; }
        }
        return { data: next, selected: prev.selected };
      });
    }, []);

    var rows = new Array(state.data.length);
    for (var i = 0; i < state.data.length; i++) {
      var d = state.data[i];
      rows[i] = e(Row, {
        key: d.id,
        data: d,
        selected: d.id === state.selected,
        onSelect: onSelect,
        onRemove: onRemove
      });
    }

    return e('table', { className: 'rows' }, e('tbody', null, rows));
  }

  var root = ReactDOM.createRoot(mount);
  root.render(e(App, null));

  /* ---- ops ------------------------------------------------------------- *
   * Each op is { name, n, need, go }. `need` is the row count that has to be
   * on screen before the timed part starts; the harness puts it there and does
   * not time it, because "replace 1000 rows" that begins by creating them is
   * measuring creation.
   */
  function setRows(count) {
    pendingData = count ? buildData(count) : [];
    apply({ data: pendingData, selected: null });
  }

  // afterPaint, repeated until React has committed the last setRows: the paint
  // that follows the commit is the one that shows the rows.
  function afterCommit(cb) {
    afterPaint(function () {
      if (committedData === pendingData) cb();
      else afterCommit(cb);
    });
  }

  var OPS = [
    {
      name: 'create rows',
      detail: 'mount ' + ROWS + ' fresh rows onto an empty table',
      n: ROWS,
      need: 0,
      go: function () { setRows(ROWS); }
    },
    {
      name: 'create many rows',
      detail: 'mount ' + LOTS + ' fresh rows onto an empty table',
      n: LOTS,
      need: 0,
      go: function () { setRows(LOTS); }
    },
    {
      name: 'replace all rows',
      detail: 'swap ' + ROWS + ' rows for ' + ROWS + ' new ones — every key changes',
      n: ROWS,
      need: ROWS,
      go: function () { setRows(ROWS); }
    },
    {
      name: 'clear rows',
      detail: 'unmount ' + ROWS + ' rows',
      n: ROWS,
      need: ROWS,
      go: function () { setRows(0); }
    }
  ];

  /* ---- running --------------------------------------------------------- *
   * Chained through setTimeout rather than Promises, deliberately: the harness
   * must not lean on the thing it is measuring. A polyfilled Promise's
   * scheduling would sit inside every gap between ops and land in the numbers.
   */
  function median(list) {
    var sorted = list.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  function mean(list) {
    var sum = 0;
    for (var i = 0; i < list.length; i++) sum += list[i];
    return list.length ? sum / list.length : 0;
  }

  function round(ms) {
    return Math.round(ms * 100) / 100;
  }

  function runOp(op, factor, done) {
    var samples = [];
    var spunTotal = 0;
    var wallTotal = 0;

    function rep(i) {
      if (i >= REPS) {
        // The first rep paid parse and first-tier compilation, which on the
        // shorter ops is most of the number. Same rule as /speed: throw it
        // away, and say so on the page rather than in a comment only.
        var kept = samples.slice(1);
        done({
          name: op.name,
          detail: op.detail,
          n: op.n,
          reps: REPS,
          samples: samples,
          median: round(median(kept)),
          average: round(mean(kept)),
          min: round(Math.min.apply(Math, kept)),
          max: round(Math.max.apply(Math, kept)),
          first: round(samples[0]),
          // How much of the wall clock the loader actually took. 1 means the
          // thread was ours; 6 means we got a sixth of it.
          effective: wallTotal ? round(wallTotal / Math.max(wallTotal - spunTotal, 0.01)) : 1
        });
        return;
      }

      // Untimed setup: get the table into the state the op expects.
      setRows(op.need);
      afterCommit(function () {
        var stop = startLoad(factor);
        // So an abandoned run can shut the spinner down. A loader left running
        // after a stall burns a core until the tab is closed.
        stopLoad = stop;
        var t0 = now();
        var threw = null;
        try {
          op.go();
        } catch (err) {
          threw = err;
        }
        if (threw) {
          stop();
          stopLoad = null;
          done({ name: op.name, detail: op.detail, n: op.n, error: String(threw) });
          return;
        }
        afterCommit(function () {
          var elapsed = now() - t0;
          spunTotal += stop();
          stopLoad = null;
          wallTotal += elapsed;
          samples.push(elapsed);
          // Let the browser breathe between reps so one rep's teardown is not
          // inside the next rep's window.
          window.setTimeout(function () { rep(i + 1); }, 30);
        });
      });
    }

    rep(0);
  }

  function rowHtml(res) {
    if (res.error) {
      return '<tr class="fail"><td>' + res.name + '</td><td>' + res.n +
        '</td><td colspan="4">threw: ' + res.error + '</td></tr>';
    }
    return '<tr><td>' + res.name + '</td><td>' + res.n + '</td><td><b>' + res.median +
      ' ms</b></td><td>' + res.min + '</td><td>' + res.max + '</td><td>' + res.first +
      '</td></tr>';
  }

  function render(results, factor) {
    var total = 0;
    var effective = [];
    for (var i = 0; i < results.length; i++) {
      if (!results[i].error) {
        total += results[i].average; // Averages, not medians
        effective.push(results[i].effective);
      }
    }

    var rows = '';
    for (var j = 0; j < results.length; j++) rows += rowHtml(results[j]);

    var achieved = effective.length ? round(median(effective)) : 1;

    out.innerHTML = '<div class="score"><b>' + round(total) + ' ms</b> · ' + LIB +
      ' · four ops, medians summed</div>' +
      '<table><tr><th>op</th><th>rows</th><th>median</th><th>min</th><th>max</th>' +
      '<th>first (discarded)</th></tr>' + rows + '</table>' +
      '<div class="note">CPU dial at <b>' + factor + '×</b>; the loader actually held the ' +
      'thread to an effective <b>' + achieved + '×</b> (median across ops). Trust the second ' +
      'number — the timer clamp and the browser’s own work make the dial a request.</div>' +
      '<div class="note">' + (REPS - 1) + ' timed reps per op after one discarded warm-up. ' +
      'Setup is not timed: replace and clear start from ' + ROWS + ' rows already painted. ' +
      'Each number is click-to-paint, the same boundary js-framework-benchmark uses. ' +
      'Full results at <code>window.__react</code>.</div>';

    window.__react = { lib: LIB, factor: factor, effective: achieved, results: results };
    if (window.tvDone) {
      var ops = [];
      for (var j = 0; j < results.length; j++) {
        ops.push({ name: results[j].name, detail: results[j].detail, n: results[j].n, ms: results[j].error ? null : results[j].average });
      }
      window.tvDone({ lib: LIB, total: total, ops: ops });
    }
    console.log('[' + LIB + '] react bench, ' + factor + 'x dial / ' + achieved +
      'x effective, total ' + round(total) + 'ms');
  }

  function idle(message) {
    stalled = null;
    if (stopLoad) { stopLoad(); stopLoad = null; }
    button.disabled = false;
    button.innerHTML = 'Run';
    out.innerHTML = '<div class="note">' + message + '</div>';
  }

  function run() {
    var factor = chosenFactor();

    /*
     * Frame callbacks are paused in a background tab, and every number here is
     * measured to a paint. Refuse rather than report: the alternative is
     * timings that are mostly however long the tab spent hidden.
     */
    if (document.hidden) {
      idle('This tab is in the background, where the browser stops painting and pauses frame ' +
        'callbacks. Bring it to the front and press Run.');
      return;
    }

    button.disabled = true;
    button.innerHTML = 'running…';

    if (heapAvailable) {
      heapBefore = heapSample();
      heapBeforeLabel.innerHTML = 'Baseline captured: ' + heapFormat(heapBefore.used) +
        ' used of ' + heapFormat(heapBefore.total) + '. Run the workload, then collect ' +
        'garbage in DevTools and capture the end reading.';
      heapResult.innerHTML = '';
      heapCapture.disabled = true;
    }

    var results = [];
    var dead = false;

    /*
     * Hit when a paint never arrives — the usual cause is the tab going to the
     * background mid-run, which pauses frame callbacks. Everything measured so
     * far is thrown away rather than shown: the op that straddled the pause has
     * the pause in its number, and there is no way to tell from here which op
     * that was.
     */
    stalled = function () {
      if (dead) return;
      dead = true;
      idle('Run abandoned: no paint for ' + (STALL_MS / 1000) + ' s. Frame callbacks stop in a ' +
        'background tab, so keep this tab in front for the whole run, then press Run again.');
    };

    function next(i) {
      if (dead) return;
      if (i >= OPS.length) {
        stalled = null;
        render(results, factor);
        if (heapAvailable && heapBefore) heapCapture.disabled = false;
        button.disabled = false;
        button.innerHTML = 'Run again';
        return;
      }
      out.innerHTML = '<div class="note">Running <b>' + OPS[i].name + '</b> (' +
        (i + 1) + ' of ' + OPS.length + ')…</div>';
      // A throw in one op is a finding; losing the other three to it is not.
      runOp(OPS[i], factor, function (res) {
        results.push(res);
        next(i + 1);
      });
    }

    // Yield once so the button repaint lands before the first measured window.
    window.setTimeout(function () { next(0); }, 0);
  }

  button.onclick = run;
  out.innerHTML = '<div class="note">Ready. React ' + React.version + ' on top of <b>' +
    LIB + '</b>. Press Run.</div>';
})();
