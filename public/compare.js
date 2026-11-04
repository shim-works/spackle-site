/*
 * /compare — runs both libraries, one at a time, and puts the two numbers next
 * to each other.
 *
 * The two standalone benchmark pages cannot be merged: both patch globals, and
 * neither can share a realm with the other. An iframe is a realm, so this page
 * gets to run both — sequentially, never at once. Two libraries installing and
 * allocating on the same main thread at the same time measures the scheduler,
 * not the libraries.
 *
 * Three rules make the pair comparable:
 *
 *   1. Order is random. Whichever runs first pays for a cold JIT and a cold
 *      allocator, so a fixed order quietly hands the second slot an advantage
 *      every single time. The order actually drawn is reported with the result.
 *   2. The finished frame is removed from the document before the next one is
 *      created, and the page then sits idle for 30 seconds. Removing the frame
 *      is what makes its realm collectable; the idle is what gives the
 *      collector the chance to take it. Without that gap, library B is timed
 *      against library A's garbage still being alive.
 *   3. Both frames get the same options, put on their src — the natives are
 *      deleted before the library parses or not at all, so the condition
 *      cannot be a control inside the frame.
 *
 * This page loads NO library itself. The parent realm stays unpolyfilled, so
 * hand-written ES5 only in here: no Promise, no Map, no arrow functions, no
 * const. The engines this demo is for are the whole point.
 */
(function () {
  var QUICK = 100;
  var SHORT = 500;
  var LONG = 5000;
  var ROWS = 30;

  var TAG = 'spackle-compare';
  var GC_IDLE_MS = 8000;
  // A 5000-pass run on a slow set-top box is minutes, not seconds. This is a
  // hang detector, not a timeout anyone should ever hit.
  var FRAME_TIMEOUT_MS = 300000;

  var LIBS = ['spackle', 'core-js'];

  // location.origin is missing on some of the engines this page targets, so it
  // is rebuilt rather than assumed. Used to check where a frame's message came
  // from.
  var ORIGIN = window.location.origin ||
    (window.location.protocol + '//' + window.location.host);

  var out = document.getElementById('out');
  var button = document.getElementById('run');

  function chosen(name, fallback) {
    var radios = document.getElementsByName(name);
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) return radios[i].value;
    }
    return fallback;
  }

  /* ------------------------------------------------------------------ *
   * One library, one frame.
   *
   * The frame is visible and 240px tall on purpose. A display:none or
   * offscreen iframe gets its timers throttled by the browser, which would
   * corrupt the very thing being measured — so it stays on screen, doing
   * nothing but saying which library is running.
   *
   * SAME ORIGIN, deliberately, no sandbox attribute. The isolation that
   * matters here is the realm, and every iframe is its own realm with its own
   * globals whether it is sandboxed or not — that is the whole requirement.
   *
   * sandbox="allow-scripts" was tried and is actively wrong: it gives the
   * frame an opaque origin, so the frame's own requests for its library and
   * harness go out as Sec-Fetch-Site: cross-site, and Astro's dev server
   * refuses them. The frame then loads its HTML, runs nothing, and reports
   * nothing. Same origin also buys a real e.origin check below, which beats
   * trusting a tag on an unauthenticated message.
   * ------------------------------------------------------------------ */
  function runOne(lib, query, done) {
    var frame = document.createElement('iframe');
    var timer = null;
    var settled = false;

    function settle(result) {
      if (settled) return;
      settled = true;

      if (timer !== null) window.clearTimeout(timer);
      if (window.removeEventListener) window.removeEventListener('message', onMessage, false);
      else window.detachEvent('onmessage', onMessage);

      // Out of the document first, THEN the reference dropped: while either
      // still holds, the realm and everything the library allocated in it is
      // reachable, and the idle that follows buys nothing.
      if (frame.parentNode) frame.parentNode.removeChild(frame);
      frame = null;

      done(result);
    }

    function onMessage(e) {
      // Our own frame, our own page, and the library this call is waiting on.
      if (e.origin !== ORIGIN) return;
      var d = e.data;
      if (!d || d.tag !== TAG || d.lib !== lib) return;
      settle(d);
    }

    if (window.addEventListener) window.addEventListener('message', onMessage, false);
    else window.attachEvent('onmessage', onMessage);

    timer = window.setTimeout(function () {
      settle({
        tag: TAG,
        lib: lib,
        error: lib + ' never reported back. The frame either hung or failed to load; ' +
          'the console will say which.'
      });
    }, FRAME_TIMEOUT_MS);

    frame.setAttribute('width', '100%');
    frame.setAttribute('height', '240');
    frame.style.border = '2px solid #413333';
    frame.style.background = '#fff';
    frame.style.display = 'block';
    frame.style.width = '100%';
    frame.style.height = '240px';
    frame.style.marginTop = '18px';
    frame.src = '/compare-frame-' + lib + query;
    out.appendChild(frame);
  }

  /* ------------------------------------------------------------------ *
   * The gap between the two runs.
   *
   * Nothing here can force a collection — window.gc() needs a devtools flag
   * that no TV has. All this does is stop making work and wait, which is the
   * only lever a page actually has. 30 seconds is far longer than a major GC
   * needs, and the wait is in plain sight so nobody reads it as the page
   * having stalled.
   * ------------------------------------------------------------------ */
  // The /tv checklist shows the wait, so no panel here.
  function idle(finishedLib, nextLib, done) {
    window.setTimeout(done, GC_IDLE_MS);
  }

  /* ------------------------------------------------------------------ *
   * Reading the pair.
   *
   * Drift maths copied from the benchmark pages: halves rather than
   * first-vs-last, because a single sample is noise on any machine with an OS
   * scheduler, plus a least-squares slope over the samples.
   * ------------------------------------------------------------------ */
  function slope(samples) {
    var points = [];
    for (var i = 0; i < samples.length; i++) points.push([i + 1, samples[i]]);
    if (points.length < 2) return null;
    var sx = 0, sy = 0, sxy = 0, sxx = 0, n = points.length;
    for (var p = 0; p < n; p++) {
      sx += points[p][0]; sy += points[p][1];
      sxy += points[p][0] * points[p][1]; sxx += points[p][0] * points[p][0];
    }
    var denom = n * sxx - sx * sx;
    return denom === 0 ? null : (n * sxy - sx * sy) / denom;
  }

  function drift(result) {
    var t = result.timings;
    if (!t || t.length < 4) return null;
    var half = Math.floor(t.length / 2);
    var a = 0, b = 0, i;
    for (i = 0; i < half; i++) a += t[i];
    for (i = half; i < t.length; i++) b += t[i];
    a = a / half;
    b = b / (t.length - half);
    return {
      first: a,
      last: b,
      change: a === 0 ? 0 : ((b - a) / a) * 100,
      slope: slope(t)
    };
  }

  function pct(n) {
    return (n >= 0 ? '+' : '') + n.toFixed(0) + '%';
  }

  /* ------------------------------------------------------------------ *
   * The chart: both runs on one pair of axes.
   *
   * The totals say which library won. They cannot say WHEN it won, and that
   * is the interesting part — a library that retains leaves more live data to
   * trace on every pass, so its line climbs while a library the collector can
   * keep up with stays flat. Flat is the good shape.
   *
   * Hand-rolled SVG, because no charting library clears the bar this site
   * sets: Chart.js needs ES6, Flot needs jQuery, and everything current ships
   * as an ES module that assumes Map and Promise. SVG is native well below
   * Chrome 38, so the chart is a string built the same way every other panel
   * on the page is built.
   *
   * ONE POINT IS ONE RAW STOPWATCH READING. Point n is the elapsed ms for
   * passes n*every to (n+1)*every, exactly as runPasses recorded it. Nothing
   * here averages, smooths or resamples: `every` is already 10 on the 500-pass
   * run and 100 on the 5000-pass run, so both lengths arrive as 50 points.
   * ------------------------------------------------------------------ */
  // Room under the plot for three rows that must not collide: the tick
  // numbers, the axis title, then the legend.
  var PLOT = { left: 54, right: 704, top: 16, bottom: 264, width: 720, height: 340 };

  var SERIES = {
    spackle: { colour: '#d9553c', dash: '' },
    'core-js': { colour: '#315b8c', dash: '5,4' }
  };

  /*
   * A Y maximum that divides into four whole numbers.
   *
   * Floored at 1 for the reason the 500-pass run makes unavoidable: on a quick
   * machine most windows come in under a millisecond and every sample reads 0.
   * A max of 0 would divide by zero and draw nothing at all.
   */
  var TICK_STEPS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];

  function axisMax(value) {
    var peak = Math.max(1, Math.ceil(Math.max(0, value)));
    // Four intervals of a round size, so the axis reads 0/25/50/75/100 rather
    // than 0/21/42/63/84.
    for (var i = 0; i < TICK_STEPS.length; i++) {
      if (TICK_STEPS[i] * 4 >= peak) return TICK_STEPS[i] * 4;
    }
    return Math.ceil(peak / 4) * 4;
  }

  /*
   * Pull one plottable series per library.
   *
   * `pick` is what turns a posted result into a line. A library that failed,
   * or that reported nothing usable, drops out here — so the chart handles a
   * missing library by simply having one fewer line.
   */
  function seriesFrom(results, pick) {
    var series = [];
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      if (r.error) continue;
      var values = pick(r);
      if (!values || values.length < 2) continue;
      series.push({ result: r, slot: i === 0 ? 'first' : 'second', values: values });
    }
    return series;
  }

  /*
   * Axes, scaling and the lines themselves.
   *
   * `series` is what seriesFrom returned; `opts` carries the Y axis title, the
   * aria description, and a function that labels each line in the legend.
   */
  function chartSvg(series, opts) {
    var i, j;
    var passes = series[0].result.passes;
    var every = series[0].result.every;

    var peak = 0;
    for (i = 0; i < series.length; i++) {
      var t = series[i].values;
      for (j = 0; j < t.length; j++) if (t[j] > peak) peak = t[j];
    }
    var yMax = axisMax(peak);

    // The first sample covers passes 1..every, so the axis starts at `every`.
    var xSpan = passes - every;
    function x(pass) {
      if (xSpan <= 0) return PLOT.left;
      return PLOT.left + ((pass - every) / xSpan) * (PLOT.right - PLOT.left);
    }
    function y(ms) {
      return PLOT.bottom - (ms / yMax) * (PLOT.bottom - PLOT.top);
    }
    function round(n) {
      return Math.round(n * 10) / 10;
    }

    var svg = '<svg viewBox="0 0 ' + PLOT.width + ' ' + PLOT.height + '" width="100%" ' +
      'role="img" aria-label="' + opts.aria + '" ' +
      'style="display:block;max-width:100%;height:auto">';

    // Gridlines and Y labels: four intervals, so every tick is a whole number.
    for (i = 0; i <= 4; i++) {
      var value = (yMax / 4) * i;
      var gy = y(value);
      svg += '<line x1="' + PLOT.left + '" y1="' + round(gy) + '" x2="' + PLOT.right +
        '" y2="' + round(gy) + '" stroke="' + (i === 0 ? '#413333' : '#f0e7da') +
        '" stroke-width="' + (i === 0 ? 2 : 1) + '" />';
      svg += '<text x="' + (PLOT.left - 8) + '" y="' + round(gy) + '" dy="4" ' +
        'text-anchor="end" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" ' +
        'font-size="11" fill="#8a7a76">' + value + '</text>';
    }

    svg += '<line x1="' + PLOT.left + '" y1="' + PLOT.top + '" x2="' + PLOT.left +
      '" y2="' + PLOT.bottom + '" stroke="#413333" stroke-width="2" />';

    // X labels: first sample, halfway, last. Enough to read the axis without
    // 50 overlapping numbers.
    var marks = [every, Math.round(passes / 2), passes];
    for (i = 0; i < marks.length; i++) {
      var mx = x(marks[i]);
      svg += '<line x1="' + round(mx) + '" y1="' + PLOT.bottom + '" x2="' + round(mx) +
        '" y2="' + (PLOT.bottom + 5) + '" stroke="#413333" stroke-width="1" />';
      svg += '<text x="' + round(mx) + '" y="' + (PLOT.bottom + 18) + '" text-anchor="' +
        (i === 0 ? 'start' : i === marks.length - 1 ? 'end' : 'middle') + '" ' +
        'font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="11" ' +
        'fill="#8a7a76">' + marks[i] + '</text>';
    }

    // Axis titles.
    svg += '<text x="' + PLOT.left + '" y="' + (PLOT.top - 4) + '" ' +
      'font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="11" ' +
      'fill="#6b5a56">' + opts.yTitle + '</text>';
    // Centred on its own row: right-aligned, it lands on top of the last tick
    // number, which is always the largest one.
    svg += '<text x="' + ((PLOT.left + PLOT.right) / 2) + '" y="' + (PLOT.bottom + 36) + '" ' +
      'text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" ' +
      'font-size="11" fill="#6b5a56">pass number</text>';

    /*
     * One polyline per library. The dash on the second line carries the
     * distinction as well as the colour does, so the chart still reads for
     * anyone who cannot tell coral from blue.
     */
    for (i = 0; i < series.length; i++) {
      var samples = series[i].values;
      var style = SERIES[series[i].result.lib] || { colour: '#413333', dash: '2,2' };
      var points = [];
      for (j = 0; j < samples.length; j++) {
        points.push(round(x((j + 1) * every)) + ',' + round(y(samples[j])));
      }
      svg += '<polyline fill="none" stroke="' + style.colour + '" stroke-width="2" ' +
        (style.dash ? 'stroke-dasharray="' + style.dash + '" ' : '') +
        'points="' + points.join(' ') + '" />';
    }

    // Legend, inside the same SVG so it scales with the plot.
    var lx = PLOT.left;
    for (i = 0; i < series.length; i++) {
      var s = series[i];
      var sy = SERIES[s.result.lib] || { colour: '#413333', dash: '2,2' };
      var label = opts.label(s);
      svg += '<line x1="' + lx + '" y1="' + (PLOT.height - 10) + '" x2="' + (lx + 22) +
        '" y2="' + (PLOT.height - 10) + '" stroke="' + sy.colour + '" stroke-width="2" ' +
        (sy.dash ? 'stroke-dasharray="' + sy.dash + '" ' : '') + '/>';
      svg += '<text x="' + (lx + 28) + '" y="' + (PLOT.height - 10) + '" dy="4" ' +
        'font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="12" ' +
        'fill="#413333">' + label + '</text>';
      lx += 34 + label.length * 6.2;
    }

    svg += '</svg>';
    return svg;
  }

  // "Only spackle reported" — said once, by whichever panel is rendering.
  function missingNote(series, results) {
    if (series.length === results.length) return '';
    return ' Only ' + series[0].result.lib + ' reported, so there is one line; the other ' +
      'library’s failure is in the table below.';
  }

  function timingChartHtml(results) {
    var series = seriesFrom(results, function (r) { return r.timings; });
    if (!series.length) return '';
    var every = series[0].result.every;

    var svg = chartSvg(series, {
      yTitle: 'ms — each ' + every + ' passes',
      aria: 'Elapsed milliseconds for each window of ' + every + ' passes, plotted ' +
        'against pass number, one line per library',
      label: function (s) {
        return s.result.lib + ' — ' + s.result.totalMs + ' ms, ran ' + s.slot;
      }
    });

    return '<div class="panel"><b>Time through the run</b>' + svg +
      '<div class="note">Every ' + every + 'th pass boundary, ' + series[0].values.length +
      ' readings per library — each point is the raw elapsed time for that window of ' +
      every + ' passes, not an average of the run. Flat means the collector is keeping ' +
      'up; a line that climbs while the other stays flat is a library the collector is ' +
      'falling behind on.' + missingNote(series, results) + '</div></div>';
  }

  function scoreHtml(result, slot) {
    if (result.error) {
      return '<div class="score"><b>' + result.lib + '</b> — no result</div>' +
        '<div class="note bad">' + result.error + '</div>';
    }
    return '<div class="score"><b>' + result.totalMs + ' ms</b> — ' + result.lib + '</div>' +
      '<div class="note">' + slot + ' · ' + result.passes + ' render passes · ' +
      (Math.round(result.totalMs / result.passes * 1000) / 1000) + ' ms per pass, ' +
      'one continuous loop' +
      (result.installed ? ' · ' + result.installed + '/' + result.checked +
        ' members installed' : '') + '</div>';
  }

  function tableHtml(results) {
    var html = '<div class="panel"><b>Side by side</b>' +
      '<table><tr><th>Library</th><th>Slot</th><th style="text-align:right">Total</th>' +
      '<th style="text-align:right">Per pass</th><th style="text-align:right">Drift</th>' +
      '<th>Samples</th></tr>';
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var slot = i === 0 ? 'first' : 'second';
      if (r.error) {
        html += '<tr class="fail"><td>' + r.lib + '</td><td>' + slot +
          '</td><td colspan="4">did not report</td></tr>';
        continue;
      }
      var d = drift(r);
      html += '<tr><td>' + r.lib + '</td><td>' + slot + '</td>' +
        '<td style="text-align:right">' + r.totalMs + ' ms</td>' +
        '<td style="text-align:right">' + (Math.round(r.totalMs / r.passes * 1000) / 1000) + ' ms</td>' +
        '<td style="text-align:right">' + (d === null ? '—' : pct(d.change)) + '</td>' +
        '<td>' + (d === null ? '—' : d.first.toFixed(1) + ' → ' + d.last.toFixed(1) +
          ' ms per ' + r.every + ' passes' +
          (d.slope === null ? '' : ', slope ' + d.slope.toFixed(3))) + '</td></tr>';
    }
    html += '</table>';

    var both = results[0].error || results[1].error ? null : results;
    if (both) {
      var a = both[0], b = both[1];
      var faster = a.totalMs <= b.totalMs ? a : b;
      var slower = faster === a ? b : a;
      var gap = slower.totalMs - faster.totalMs;
      var rel = faster.totalMs === 0 ? 0 : (gap / faster.totalMs) * 100;
      html += '<div class="note"><b>' + faster.lib + ' finished ' + gap + ' ms sooner</b> (' +
        rel.toFixed(0) + '% of ' + faster.lib + '’s own total). ' +
        (rel < 5
          ? 'Under 5% is inside the noise of one run on one machine — run it again before ' +
            'calling it a difference.'
          : 'Run it a few times: the slot a library draws still moves the number, which is why ' +
            'the order is random rather than fixed.') +
        '</div>';
    }

    html += '<div class="note">core-js stamps nothing it installs, so its install count reads ' +
      'blank — that column is a spackle self-report, not a comparison. The timing is the ' +
      'comparison.</div></div>';
    return html;
  }

  /* ------------------------------------------------------------------ *
   * What ONE pass calls. Static, not counted at runtime: a counter inside the
   * workload would land inside the measured window and show in the trace, and
   * these numbers are exact anyway — the workload is deterministic.
   *
   * Per-iteration figures. They do not accumulate over the run. `(app)` marks
   * calls made by code AROUND React rather than by React itself.
   * ------------------------------------------------------------------ */
  var MANIFEST = [
    ['Object.assign', 33, 'Props spread — Babel lowers &lt;li {...props}&gt; to Object.assign, on the 30 rows and 3 containers'],
    ['Object.keys', 30, 'Shallow prop diff, one per reconciled row'],
    ['Object.is', 12, 'Hook bailout and deps comparison — React\'s own objectIs'],
    ['Symbol.for', 0, '$$typeof element tag — interned on the first pass, every later pass reuses it'],
    ['Array.from', 1, 'Hook state list (12 entries) rebuilt every render'],
    ['Array.prototype.flat', 1, 'Flattening the nested arrays a .map() inside JSX produces (app)'],
    ['Array.prototype.findIndex', 1, 'Locating the active row by key'],
    ['Array.prototype.includes', 30, 'className variant check, one per row (app)'],
    ['Map.set / Map.get', '30 / 30', 'Keyed reconciliation — index the old children, look each new key up'],
    ['Set.add / Set.has', '30 / 30', 'Which keys survived; the rest are unmounts'],
    ['WeakMap.set', 1, 'Instance cache keyed by the element object, so it dies with the tree'],
    ['String.prototype.trim', 30, 'className churn — strings rebuilt every render'],
    ['String.prototype.startsWith', 30, 'className prefix check, one per row (app)'],
    ['String.prototype.padStart', 60, 'Time cell formatting, two fields per row (app)'],
    ['Object.entries', 1, 'Serialising a params object for an analytics call (app)'],
    ['new URL', 1, 'Router resolving the next route against the current location'],
    ['URLSearchParams', 1, 'Reading the query off that route'],
    ['Object.fromEntries', 1, 'Query params to a props object'],
    ['Promise + .then', 3, 'One effect, plus the two subscriptions allSettled makes internally'],
    ['Promise.allSettled', 1, 'Parallel fetches a route kicks off on mount'],
    ['queueMicrotask', 1, 'Flushing passive effects after commit']
  ];

  function manifestHtml() {
    var cell = 'padding:2px 12px 2px 0;vertical-align:top';
    var html = '<div class="panel"><b>One render pass</b> — a ' + ROWS + '-row list, ' +
      (ROWS * 4 + 3) + ' elements. Both frames run this same pass; counts are per pass, and ' +
      'the run repeats the pass, not the table.' +
      '<table><tr><th>Function</th><th style="text-align:right">Calls</th><th>Why a front-end app calls it</th></tr>';
    for (var i = 0; i < MANIFEST.length; i++) {
      html += '<tr><td style="' + cell + '"><code>' + MANIFEST[i][0] + '</code></td>' +
        '<td style="' + cell + ';text-align:right">' + MANIFEST[i][1] + '</td>' +
        '<td style="' + cell + ';color:#777">' + MANIFEST[i][2] + '</td></tr>';
    }
    html += '</table><div class="note">Steady state: the first pass has no previous tree, ' +
      'so it skips reconciliation. Rows marked (app) are what code <i>around</i> React does, ' +
      'not React itself.</div></div>';
    return html;
  }

  /* ------------------------------------------------------------------ *
   * The comparison, end to end.
   * ------------------------------------------------------------------ */
  function compare() {
    var stripped = chosen('natives', 'keep') === 'strip';
    var passes = parseInt(chosen('passes', String(QUICK)), 10);
    if (passes !== QUICK && passes !== SHORT && passes !== LONG) passes = QUICK;
    // /compare-yield-1 sets window.__COMPARE_YIELD: frames run one pass per task
    var query = '?passes=' + passes + (stripped ? '&natives=strip' : '') + (window.__COMPARE_YIELD ? '&yield=1' : '');

    // Coin toss, not a fixed order: the first slot pays for a cold JIT.
    var order = Math.random() < 0.5 ? [LIBS[0], LIBS[1]] : [LIBS[1], LIBS[0]];
    var results = [];

    button.disabled = true;
    button.innerHTML = 'running…';

    out.innerHTML = '';

    function step(i) {
      if (window.tvStage) window.tvStage(i === 0 ? 'first' : 'second');
      runOne(order[i], query, function (result) {
        results.push(result);
        if (i === 0) {
          if (window.tvStage) window.tvStage('wait');
          idle(order[0], order[1], function () { step(1); });
          return;
        }
        render(results);
      });
    }

    function render(pair) {
      // Two plain bars, shorter is faster.
      var max = 1, html = '';
      for (var i = 0; i < pair.length; i++) if (!pair[i].error) max = Math.max(max, pair[i].totalMs);
      for (i = 0; i < pair.length; i++) {
        var r = pair[i];
        html += '<div class="bar-row"><span class="bar-name">' + window.tvName(r.lib) + '</span>' +
          (r.error ? '<span class="note bad">no result</span>'
            : '<span class="bar-fill bar-' + (r.lib === 'spackle' ? 'spackle' : 'other') +
              '" style="width:' + Math.max(1, Math.round(r.totalMs / max * 60)) + '%"></span>' +
              '<span class="bar-ms">' + r.totalMs + ' ms · ' +
              (Math.round(r.totalMs / r.passes * 100) / 100) + ' ms per render</span>') + '</div>';
      }

      var panel = document.createElement('div');
      panel.innerHTML = html;
      out.appendChild(panel);

      // Parked for graphing, same as the standalone pages do with __timings.
      window.__compare = { order: order, passes: passes, stripped: stripped, results: pair };
      for (var j = 0; j < pair.length; j++) {
        if (pair[j].error) {
          console.log('[' + pair[j].lib + '] ' + pair[j].error);
        } else {
          console.log('[' + pair[j].lib + '] ' + pair[j].totalMs + 'ms / ' + pair[j].passes +
            ' passes, ms per ' + pair[j].every + ': [' + pair[j].timings.join(', ') + ']');
        }
      }

      button.disabled = false;
      button.innerHTML = 'Run again';
      if (window.tvDone) window.tvDone(pair);
    }

    // /tv shows the coin toss before the first run starts
    if (window.tvBegin) window.tvBegin(order, function () { step(0); });
    else step(0);
  }

  button.onclick = compare;
  // No "Ready" note or manifest up front; /tv says what the test does,
  // and the manifest still comes with the results in the details.
  out.innerHTML = '';
})();
