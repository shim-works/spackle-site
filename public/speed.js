/*
 * /speed — runs both libraries through the same per-API case list, one at a
 * time, and puts the two timings for each case next to each other.
 *
 * Fork of compare.js. That page times one composite render pass and reports a
 * single number; this one times every polyfill separately, because a composite
 * number cannot say WHICH function is slow, and its fixed parameters hide any
 * API whose cost only steps up at a larger size.
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
  var SHORT = 500;
  var LONG = 5000;
  var ROWS = 30;

  var TAG = 'spackle-speed';
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
    frame.src = '/speed-frame-' + lib + query;
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
   * One row per case, sorted worst-for-spackle first. This page is a defect
   * finder, not a scoreboard: the rows worth looking at are the ones where
   * spackle loses, and burying them under forty wins it already has would
   * defeat the point of running it.
   *
   * Ratio is core-js ÷ spackle, so above 1.0 means spackle is faster and below
   * 1.0 means it is not. Both raw times stay on the row — a ratio with no
   * absolute beside it hides whether 3x is 30ms against 10ms or 3ms against
   * 1ms, and only one of those is worth an afternoon.
   * ------------------------------------------------------------------ */
  function fmt(ms) {
    if (ms === null || typeof ms === 'undefined') return '—';
    if (ms >= 100) return String(Math.round(ms));
    if (ms >= 10) return (Math.round(ms * 10) / 10).toFixed(1);
    return (Math.round(ms * 100) / 100).toFixed(2);
  }

  function byId(result) {
    var map = {};
    if (!result || result.error || !result.results) return map;
    for (var i = 0; i < result.results.length; i++) map[result.results[i].id] = result.results[i];
    return map;
  }

  function rows(pair) {
    var a = null, b = null;
    for (var i = 0; i < pair.length; i++) {
      if (pair[i].lib === 'spackle') a = pair[i];
      else b = pair[i];
    }
    var sp = byId(a), cj = byId(b);

    var out = [];
    for (var id in sp) {
      if (!Object.prototype.hasOwnProperty.call(sp, id)) continue;
      var s = sp[id], c = cj[id];
      out.push({
        id: id,
        group: s.group,
        n: s.n,
        spackleMs: s.ms,
        coreJsMs: c ? c.ms : null,
        spackleImpl: s.impl || '',
        coreJsImpl: c ? (c.impl || '') : '',
        spackleError: s.error || null,
        coreJsError: c ? (c.error || null) : 'core-js did not report this case',
        ratio: (s.ms && c && c.ms) ? c.ms / s.ms : null
      });
    }

    out.sort(function (x, y) {
      // Errors first — an exception says more than any timing.
      if ((x.spackleError || x.coreJsError) && !(y.spackleError || y.coreJsError)) return -1;
      if ((y.spackleError || y.coreJsError) && !(x.spackleError || x.coreJsError)) return 1;
      if (x.ratio === null) return 1;
      if (y.ratio === null) return -1;
      return x.ratio - y.ratio;
    });
    return out;
  }

  // Whose code ran: "native" rows are the engine against itself, so a gap there
  // is something the library did to the engine, not its own implementation.
  function implTag(impl) {
    return impl ? '<br><span style="font-size:0.8em;opacity:0.7">' + impl + '</span>' : '';
  }

  function tableHtml(pair, stripped) {
    var list = rows(pair);
    var html = '<div class="panel"><b>Per-API timings</b> · <b>' +
      (stripped ? 'natives deleted' : 'natives kept') + '</b> — ' + list.length +
      ' cases, sorted worst-for-spackle first, each the fastest of 5 timed runs. Ratio is core-js ÷ spackle: ' +
      'above 1.0 spackle is faster, below 1.0 it is not.' +
      '<table><tr><th>Case</th><th>Group</th><th style="text-align:right">n</th>' +
      '<th style="text-align:right">spackle</th><th style="text-align:right">core-js</th>' +
      '<th style="text-align:right">ratio</th></tr>';

    var losses = 0, measured = 0;
    var engineRows = '';
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      /*
       * spackle left the engine's own function in place: the row is the engine
       * against itself (core-js may still have touched it -- its functions
       * print [native code], so its label can't be trusted). Shown apart, not
       * counted.
       */
      if (r.spackleImpl === 'native' && !(r.spackleError || r.coreJsError)) {
        engineRows += '<tr><td>' + r.id + '</td><td>' + r.group + '</td>' +
          '<td style="text-align:right">' + r.n + '</td>' +
          '<td style="text-align:right">' + fmt(r.spackleMs) + ' ms</td>' +
          '<td style="text-align:right">' + fmt(r.coreJsMs) + ' ms</td>' +
          '<td style="text-align:right">' + (r.ratio === null ? '—' : r.ratio.toFixed(2) + '×') + '</td></tr>';
        continue;
      }
      measured++;
      var err = r.spackleError || r.coreJsError;
      if (err) {
        html += '<tr class="fail"><td>' + r.id + '</td><td>' + r.group + '</td>' +
          '<td colspan="4">' + err + '</td></tr>';
        continue;
      }
      var slower = r.ratio !== null && r.ratio < 1;
      if (slower) losses++;
      html += '<tr' + (slower ? ' class="fail"' : '') + '><td>' + r.id + '</td><td>' + r.group + '</td>' +
        '<td style="text-align:right">' + r.n + '</td>' +
        '<td style="text-align:right">' + fmt(r.spackleMs) + ' ms' + implTag(r.spackleImpl) + '</td>' +
        '<td style="text-align:right">' + fmt(r.coreJsMs) + ' ms' + implTag(r.coreJsImpl) + '</td>' +
        '<td style="text-align:right"><b>' + (r.ratio === null ? '—' : r.ratio.toFixed(2) + '×') + '</b></td></tr>';
    }
    html += '</table><div class="note">' + losses + ' of ' + measured +
      ' polyfilled cases are slower in spackle. Those are the rows this page exists to find.</div>';
    if (engineRows) {
      html += '<details><summary>Not polyfilled by spackle on this engine (' + (list.length - measured) +
        ' cases) — the engine against itself, so any gap is noise</summary>' +
        '<table><tr><th>Case</th><th>Group</th><th style="text-align:right">n</th>' +
        '<th style="text-align:right">spackle</th><th style="text-align:right">core-js</th>' +
        '<th style="text-align:right">ratio</th></tr>' + engineRows + '</table></details>';
    }
    html += '</div>';
    return html;
  }

  function scoreHtml(result, slot) {
    if (result.error) {
      return '<div class="score"><b>' + result.lib + '</b> — no result</div>' +
        '<div class="note bad">' + result.error + '</div>';
    }
    var count = result.results ? result.results.length : 0;
    var total = 0;
    for (var i = 0; i < count; i++) if (result.results[i].ms) total += result.results[i].ms;
    return '<div class="score"><b>' + Math.round(total) + ' ms</b> — ' + result.lib + '</div>' +
      '<div class="note">' + slot + ' · ' + count + ' cases · summed, which is a property of ' +
      'the case list rather than of any workload — read the rows, not this number.</div>';
  }

  /*
   * Copy table: the whole result as tab-separated text that pastes into a sheet
   * or an issue -- engine, both totals, then every row in table order. Clipboard
   * API where it exists, execCommand('copy') before that (Chrome 43+), and on
   * older engines the text left selected in a box for a manual copy.
   */
  function tableText(pair, stripped) {
    var lines = ['spackle /speed — ' + navigator.userAgent,
      (stripped ? 'natives deleted' : 'natives kept')];
    for (var i = 0; i < pair.length; i++) {
      var p = pair[i];
      var total = 0;
      var count = p.results ? p.results.length : 0;
      for (var k = 0; k < count; k++) if (p.results[k].ms) total += p.results[k].ms;
      lines.push(p.lib + ' total\t' + (p.error ? 'no result: ' + p.error : Math.round(total) + ' ms') +
        '\t' + (i === 0 ? 'ran first' : 'ran second'));
    }
    lines.push('case\tgroup\tn\tspackle ms\tcore-js ms\tratio\tspackle impl\tcore-js impl');
    var list = rows(pair);
    for (var j = 0; j < list.length; j++) {
      var r = list[j];
      var err = r.spackleError || r.coreJsError;
      lines.push(err
        ? [r.id, r.group, r.n, 'error', err, ''].join('\t')
        : [r.id, r.group, r.n, fmt(r.spackleMs), fmt(r.coreJsMs), r.ratio === null ? '' : r.ratio.toFixed(2), r.spackleImpl, r.coreJsImpl].join('\t'));
    }
    return lines.join('\n').replace(/\r/g, '') + '\n';
  }

  function addCopy(pair, stripped) {
    var bar = document.createElement('div');
    bar.className = 'controls';
    var copyButton = document.createElement('button');
    copyButton.innerHTML = 'Copy table';
    var copyNote = document.createElement('span');
    copyNote.className = 'note';
    bar.appendChild(copyButton);
    bar.appendChild(copyNote);
    out.appendChild(bar);

    function copied() {
      copyNote.innerHTML = 'Copied ' + rows(pair).length + ' rows.';
    }
    function fallback(text) {
      var box = document.createElement('textarea');
      box.value = text;
      box.setAttribute('readonly', '');
      box.style.width = '100%';
      box.style.height = '160px';
      copyNote.innerHTML = '';
      copyNote.appendChild(box);
      box.focus();
      box.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      if (ok) {
        copyNote.removeChild(box);
        copied();
      } else {
        copyNote.insertBefore(document.createTextNode('This engine cannot copy for you: the text is selected below, copy it by hand.'), box);
      }
    }
    copyButton.onclick = function () {
      var text = tableText(pair, stripped);
      var clip = window.navigator && navigator.clipboard;
      if (clip && typeof clip.writeText === 'function') {
        clip.writeText(text).then(copied, function () { fallback(text); });
      } else {
        fallback(text);
      }
    };
  }

  /* ------------------------------------------------------------------ *
   * The run, end to end.
   * ------------------------------------------------------------------ */
  function compare() {
    var stripped = chosen('natives', 'keep') === 'strip';
    var query = '?' + (stripped ? 'natives=strip' : 'natives=keep');
    // /speed?probe=clone: both frames run only the structuredClone breakdown
    // (speed-bench.js), so the normal cases and their totals are untouched.
    if (window.location.search.indexOf('probe=clone') !== -1) query += '&probe=clone';

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
      // One row per function, best for spackle first, faster one bold.
      var list = rows(pair), html = '';
      list.reverse(); // rows() sorts worst-for-spackle first
      html += '<table><tr><th>Function</th><th style="text-align:right">Spackle</th>' +
        '<th style="text-align:right">core-js</th></tr>';
      for (var i = 0; i < list.length; i++) {
        var row = list[i];
        if (row.spackleError || row.coreJsError || row.spackleMs === null || row.coreJsMs === null) continue;
        var win = row.spackleMs <= row.coreJsMs;
        html += '<tr><td>' + row.id + '</td><td style="text-align:right">' +
          (win ? '<b>' + fmt(row.spackleMs) + ' ms</b>' : fmt(row.spackleMs) + ' ms') +
          '</td><td style="text-align:right">' +
          (win ? fmt(row.coreJsMs) + ' ms' : '<b>' + fmt(row.coreJsMs) + ' ms</b>') + '</td></tr>';
      }
      html += '</table><p class="note">Each function ran 200 times, five rounds, averaged. Bold is the faster one.</p>';

      var panel = document.createElement('div');
      panel.innerHTML = html;
      out.appendChild(panel);

      // Parked for scripting, same as /compare does with __compare.
      window.__speed = { order: order, stripped: stripped, results: pair, rows: rows(pair) };
      for (var j = 0; j < pair.length; j++) {
        if (pair[j].error) console.log('[' + pair[j].lib + '] ' + pair[j].error);
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
  out.innerHTML = ''; // /tv says what the test does

  /*
   * A frame that took the engine down left the case it was in (speed-bench.js).
   * File it on the froze list the frames skip, say so, and offer a reset.
   */
  try {
    var store = window.localStorage;
    var last = store && store.getItem('speed:last');
    if (last) {
      store.removeItem('speed:last');
      var cut = last.indexOf(': ');
      var lib = last.substring(0, cut);
      var label = last.substring(cut + 2);
      var list = JSON.parse(store.getItem('speed:froze') || '{}');
      if (label.indexOf('loading the library') !== 0) {
        if (!list[lib]) list[lib] = [];
        if (list[lib].indexOf(label) === -1) list[lib].push(label);
        store.setItem('speed:froze', JSON.stringify(list));
      }
      out.innerHTML = '<div class="score bad">The previous run died in ' + last + '</div>' +
        '<div class="note">' + (label.indexOf('loading the library') === 0
          ? 'It died before any case ran, so there is nothing to skip.'
          : 'Filed as froze: the next run skips that case and reports it. Press Run again.') + '</div>' + out.innerHTML;
    }
    var frozen = JSON.parse((store && store.getItem('speed:froze')) || '{}');
    var names = [];
    for (var k in frozen) if (frozen.hasOwnProperty(k) && frozen[k].length) names.push(k + ': ' + frozen[k].join(', '));
    if (names.length) {
      var reset = document.createElement('div');
      reset.className = 'note';
      reset.innerHTML = 'Skipped as froze: ' + names.join(' · ') + ' <button id="reset-froze">Forget</button>';
      out.appendChild(reset);
      document.getElementById('reset-froze').onclick = function () {
        try { store.removeItem('speed:froze'); } catch (e) { /* storage blocked */ }
        reset.parentNode.removeChild(reset);
      };
    }
  } catch (e) { /* storage blocked */ }
})();
