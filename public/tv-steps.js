/*
 * The friendly half of each /tv test page.
 *
 * The demo scripts (compare.js, speed.js, react-bench.js, verify.js) do the
 * measuring and print their full nerdy output into #out. When one finishes it
 * calls window.tvDone(data); this turns that into one headline, tucks the raw
 * output behind a button, shows "Next test" and puts the remote on it.
 *
 * Headlines go to sessionStorage so /device/done can show the whole run at the end.
 */
(function () {
  var page = document.getElementById('tv-test');
  var kind = page.getAttribute('data-kind');
  var slug = page.getAttribute('data-slug');
  var card = document.getElementById('result');
  var next = document.getElementById('next');
  var details = document.getElementById('details');
  var toggle = document.getElementById('toggle-details');

  // Display names: the ids stay lowercase (URLs, files), people see these.
  var tvName = window.tvName = function (lib) {
    return lib === 'spackle' ? 'Spackle' : lib === 'core-js' ? 'core-js' : lib;
  };

  function store(key, value) {
    try {
      if (value === undefined) return window.sessionStorage.getItem(key);
      window.sessionStorage.setItem(key, value);
    } catch (e) { /* private mode or blocked: the recap just goes without it */ }
    return null;
  }

  function time(ms) {
    return ms < 1000 ? Math.round(ms) + ' ms' : (ms / 1000).toFixed(1) + ' s';
  }

  // Both libraries' totals in, one friendly sentence out.
  // floor: below this both runs are mostly timer noise (single-run tests only)
  function race(spackleMs, coreMs, floor) {
    var line = 'Spackle ' + time(spackleMs) + ' · core-js ' + time(coreMs);
    var r = coreMs / spackleMs;
    if (floor && Math.max(spackleMs, coreMs) < floor) return { head: 'Too close to call', line: line + '. This browser is quick enough that both barely had to work.', good: true, result: 'level', stat: '=', sub: 'too quick to tell' };
    if (r >= 1.1) return { head: 'Spackle was ' + r.toFixed(1) + '× faster here', line: line, good: true, result: 'win', stat: r.toFixed(1) + '×', sub: 'faster' };
    if (r > 0.9) return { head: 'Neck and neck on this one', line: line + '. Your browser barely needed any polyfills.', good: true, result: 'level', stat: '=', sub: 'level' };
    return { head: 'core-js took this one (' + (1 / r).toFixed(1) + '×)', line: line + '. core-js is faster in this test.', good: false, result: 'loss', stat: (1 / r).toFixed(1) + '×', sub: 'slower' };
  }

  function byLib(pair, total) {
    var t = {};
    for (var i = 0; i < pair.length; i++) if (!pair[i].error) t[pair[i].lib] = total(pair[i]);
    return t;
  }

  var SUMMARY = {
    workload: function (pair) {
      var t = byLib(pair, function (p) { return p.totalMs; });
      return t.spackle && t['core-js'] ? race(t.spackle, t['core-js'], 200) : null;
    },
    speed: function (pair) {
      // Per function, not summed: a few slow functions would swamp the rest.
      // Wins inside the same 10% band race() uses; typical speedup is the
      // geometric mean of the ratios, as js-framework-benchmark scores.
      var ms = byLib(pair, function (p) {
        var m = {};
        for (var i = 0; p.results && i < p.results.length; i++) if (p.results[i].ms) m[p.results[i].id] = p.results[i].ms;
        return m;
      });
      var sp = ms.spackle, cj = ms['core-js'];
      if (!sp || !cj) return null;
      var n = 0, won = 0, lost = 0, logs = 0;
      for (var id in sp) {
        if (!sp.hasOwnProperty(id) || !cj[id]) continue;
        var r = cj[id] / sp[id];
        n++;
        logs += Math.log(r);
        if (r >= 1.1) won++; else if (r <= 0.9) lost++;
      }
      if (!n) return null;
      var g = Math.exp(logs / n), close = n - won - lost;
      var rest = (close ? ', ' + close + ' too close to call' : '');
      if (lost > won) {
        return { head: 'core-js faster on ' + lost + ' of ' + n + ' functions',
          line: 'about ' + (1 / g).toFixed(1) + '× slower per function · Spackle won ' + won + rest + '.', good: false, result: 'loss',
          stat: (1 / g).toFixed(1) + '×', sub: 'slower per function' };
      }
      return { head: won + ' of ' + n + ' functions faster',
        line: 'about ' + g.toFixed(1) + '× faster per function · core-js won ' + lost + rest + '.', good: true, result: won > lost ? 'win' : 'level',
        stat: g.toFixed(1) + '×', sub: 'faster per function' };
    },
    react: function (pair) {
      // React reports medians of many reps, so no noise floor: a small gap is real.
      var t = byLib(pair, function (p) { return p.total; });
      return t.spackle && t['core-js'] ? race(t.spackle, t['core-js']) : null;
    },
    verify: function (d) {
      // test262 pass rate per library: passed out of the tests it ran. Fair to
      // both: the tests only cover Spackle's API list, so no "% of core-js".
      function pct(p, r) { return r ? (Math.floor(p / r * 1000) / 10) + '%' : '—'; }
      var sp = pct(d.spacklePass, d.spackleRan);
      var spLine = 'Spackle passed ' + d.spacklePass + ' of ' + d.spackleRan;
      if (!d.coreRan) {
        return { head: 'test262 tests passed', line: spLine + '. core-js could not finish here.',
          good: d.spacklePass === d.spackleRan, result: 'level', big: sp, stat: sp, sub: 'passed test262' };
      }
      var cj = pct(d.corePass, d.coreRan);
      var a = d.spacklePass / d.spackleRan, b = d.corePass / d.coreRan;
      return {
        bigHtml: '<span class="big-label">Polyfill coverage</span><span class="' + (a >= b ? 'ok' : 'bad') + '">' + sp + '</span><span class="big-lib">Spackle</span>' +
          '<span class="big-other">' + cj + '</span><span class="big-lib">core-js</span>',
        head: 'test262 tests passed',
        line: spLine + ' · core-js passed ' + d.corePass + ' of ' + d.coreRan +
          (d.coreSkipped ? ', ' + d.coreSkipped + ' skipped' : '') + '.',
        // green when Spackle's rate is at least core-js's, red when less
        good: a >= b, result: a > b ? 'win' : a === b ? 'level' : 'loss',
        stat: sp, sub: 'passed test262 · core-js ' + cj
      };
    }
  };

  /*
   * The checklist for the two-library runs (workload, speed). compare.js /
   * speed.js call tvBegin, then tvStage('first' | 'wait' | 'second'), then
   * tvDone. The coin toss and "done" are instant, so they get a short pause
   * of their own: a tick that flashes past reads as nothing happening.
   */
  var list = document.getElementById('checklist');
  var order = null, current = null;

  function item(text) {
    var li = document.createElement('li');
    li.innerHTML = '<span class="tick"></span>';
    li.appendChild(document.createTextNode(text));
    list.appendChild(li);
    return li;
  }
  function tick(li) { if (li) li.className = 'done'; }

  // Shown while a run is going: input or a background app skews the timings.
  var busy = document.createElement('p');
  busy.className = 'note';
  busy.style.display = 'none';
  busy.appendChild(document.createTextNode('Testing, do not interact with your device'));
  list.parentNode.insertBefore(busy, list);

  function reset() {
    list.innerHTML = '';
    list.style.display = '';
    busy.style.display = '';
    card.style.display = 'none';
    if (next) next.style.display = 'none';
    toggle.style.display = 'none';
    details.style.display = 'none';
  }

  window.tvBegin = function (drawn, go) {
    order = drawn;
    reset();
    var coin = item('Flipping a coin');
    // flip, then a second's pause before the first run starts ("Running the X
    // test" says who won the toss; the run can block painting on a TV)
    window.setTimeout(function () {
      tick(coin);
      window.setTimeout(go, 1000);
    }, 1200);
  };

  window.tvStage = function (stage) {
    if (!order) return;
    tick(current);
    current = item(stage === 'wait' ? 'Tidying up'
      : 'Running the ' + tvName(order[stage === 'first' ? 0 : 1]) + ' test');
  };

  // Free-form checklist (verify): ticks the last item, adds the next, hands it back.
  window.tvStep = function (text) {
    if (!order) {
      order = [];
      reset();
    }
    tick(current);
    current = item(text);
    return current;
  };

  var finished = false;
  window.tvDone = function (data) {
    if (order && current) {
      tick(current);
      current = null;
      var last = item('Done');
      window.setTimeout(function () { tick(last); show(data); }, 700);
      return;
    }
    show(data);
  };

  function show(data) {
    // verify re-renders when its "Fails only" button is pressed; that's not a new result
    if (finished && kind === 'verify') return;
    finished = true;
    busy.style.display = 'none';
    var s = null;
    try { s = SUMMARY[kind](data); } catch (e) { /* fall through to the plain message */ }
    if (!s) s = { head: 'Done', line: 'One of the runs had a problem. Read the details.', good: false };

    var big = s.bigHtml ? '<div class="big">' + s.bigHtml + '</div>'
      : s.big ? '<div class="big ' + (s.good ? 'ok' : 'bad') + '">' + s.big + '</div>' : '';
    card.innerHTML = big + '<h2 class="' + (s.good && !big ? 'ok' : '') + '">' + s.head + '</h2><p class="dim">' + s.line + '</p>';
    card.style.display = '';
    // /device/done reads this back as one tile: big stat, few words, green or not
    store('tv:recap:' + slug, JSON.stringify({ stat: s.stat || '', sub: s.sub || s.head, result: s.result || (s.good ? 'win' : 'loss') }));

    details.style.display = 'none';
    toggle.innerHTML = 'Show the nerdy details';
    toggle.style.display = '';
    // /verify has no next button: it doesn't hand off to the race
    if (next) next.style.display = '';
    var run = document.getElementById('run');
    if (run) run.className = 'quiet';
    if (window.tvFocus) window.tvFocus(next || toggle);
  }

  toggle.onclick = function () {
    var open = details.style.display !== 'none';
    details.style.display = open ? 'none' : '';
    toggle.innerHTML = open ? 'Show the nerdy details' : 'Hide the details';
  };
})();
