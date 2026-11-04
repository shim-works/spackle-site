/*
 * /device/react: React 18 on each library, back to back on this tab.
 *
 * Same shape as compare.js: a coin toss picks the order, each library runs in
 * its own iframe (/react-frame/<lib>), the frame is removed when it reports,
 * the page idles so the collector can take that realm, then the other runs.
 * The frame stays visible: React is timed to paint, and an offscreen frame's
 * timers and frames get throttled.
 *
 * The workload is react-bench.js: create, replace and clear rows, after
 * js-framework-benchmark's keyed React implementation.
 */
(function () {
  var LIBS = ['spackle', 'core-js'];
  var GC_IDLE_MS = 8000;
  var FRAME_TIMEOUT_MS = 300000;
  var ORIGIN = window.location.origin || (window.location.protocol + '//' + window.location.host);
  var button = document.getElementById('run');
  var live = document.getElementById('live');
  var out = document.getElementById('out');

  function runOne(lib, done) {
    var frame = document.createElement('iframe');
    var timer = null;
    function settle(result) {
      if (!frame) return;
      window.clearTimeout(timer);
      window.removeEventListener('message', onMessage, false);
      // Out of the document, then dropped: only then is the realm collectable.
      frame.parentNode.removeChild(frame);
      frame = null;
      done(result);
    }
    function onMessage(e) {
      if (e.origin !== ORIGIN) return;
      var d = e.data;
      if (d && d.tag === 'spackle-react' && d.lib === lib) settle(d);
    }
    window.addEventListener('message', onMessage, false);
    timer = window.setTimeout(function () {
      settle({ lib: lib, error: lib + ' never reported back: the frame hung or failed to load.' });
    }, FRAME_TIMEOUT_MS);
    frame.className = 'live-frame';
    frame.src = '/react-frame/' + lib;
    live.appendChild(frame);
  }

  function ms(v) { return v === null || typeof v === 'undefined' ? '—' : (Math.round(v * 10) / 10) + ' ms'; }

  // Two plain bars, then one row per step. Shorter is faster, bold wins.
  function detail(results) {
    var max = 0, sp = null, cj = null, html = '', i;
    for (i = 0; i < results.length; i++) {
      if (!results[i].error && results[i].total > max) max = results[i].total;
      if (results[i].lib === 'spackle') sp = results[i]; else cj = results[i];
    }
    for (i = 0; i < results.length; i++) {
      var r = results[i];
      html += '<div class="bar-row"><span class="bar-name">' + window.tvName(r.lib) + '</span>' +
        (r.error ? '<span class="note bad">' + r.error + '</span>'
          : '<span class="bar-fill bar-' + (r.lib === 'spackle' ? 'spackle' : 'other') +
            '" style="width:' + Math.max(1, Math.round(r.total / (max || 1) * 60)) + '%"></span>' +
            '<span class="bar-ms">' + ms(r.total) + '</span>') + '</div>';
    }
    if (!sp || !cj || sp.error || cj.error) return html;
    html += '<table><tr><th>Step</th><th style="text-align:right">Spackle</th><th style="text-align:right">core-js</th></tr>';
    for (i = 0; i < sp.ops.length; i++) {
      var a = sp.ops[i].ms, b = cj.ops[i] ? cj.ops[i].ms : null, win = a !== null && (b === null || a <= b);
      var op = sp.ops[i];
      html += '<tr><td>' + op.name.charAt(0).toUpperCase() + op.name.slice(1) +
        (op.detail ? '<div class="note">' + op.detail.charAt(0).toUpperCase() + op.detail.slice(1) + '</div>' : '') + '</td>' +
        '<td style="text-align:right">' + (win ? '<b>' + ms(a) + '</b>' : ms(a)) + '</td>' +
        '<td style="text-align:right">' + (win ? ms(b) : '<b>' + ms(b) + '</b>') + '</td></tr>';
    }
    return html + '</table><p class="note">Each step ran 49 times after a warm-up; this is the average. Bold is the faster one.</p>';
  }

  button.onclick = function () {
    var order = Math.random() < 0.5 ? [LIBS[0], LIBS[1]] : [LIBS[1], LIBS[0]];
    var results = [];
    button.disabled = true;
    button.innerHTML = 'running…';
    out.innerHTML = '';

    function step(i) {
      window.tvStage(i === 0 ? 'first' : 'second');
      runOne(order[i], function (r) {
        results.push(r);
        if (i === 0) {
          window.tvStage('wait');
          window.setTimeout(function () { step(1); }, GC_IDLE_MS);
          return;
        }
        out.innerHTML = detail(results);
        button.disabled = false;
        button.innerHTML = 'Run again';
        window.tvDone(results);
      });
    }
    window.tvBegin(order, function () { step(0); });
  };
})();
