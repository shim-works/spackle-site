/*
 * /verify
 *
 * Natives are NOT deleted here, deliberately. This is the real-world
 * condition: spackle installs only what this engine lacks, and spackle-verify
 * then checks that what ended up on the page actually behaves. Deleting first
 * would test the polyfill implementations instead, which is what the benchmark
 * pages do.
 *
 * This loads /vendor/spackle.js then /vendor/spackle-verify.js itself, after the
 * core-js frame is gone (see runCoreJs).
 */
(function () {
  var out = document.getElementById('out');

  function esc(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /*
   * render() is handed straight to .then(), so anything it throws becomes a
   * rejection with nowhere to go: no error, no output, the page sits on
   * "Running the checks..." forever and reads exactly like a hung engine. It
   * did, for a while, over a shadowed variable. Never again: a renderer fault
   * is now printed where the results would have been.
   */
  function render(result) {
    try {
      renderResult(result);
    } catch (e) {
      out.innerHTML = '<div class="bad">the REPORT failed to render (the run itself finished): ' +
        esc(e && e.message ? e.message : e) + '</div>';
      if (typeof console !== 'undefined' && console.log) {
        console.log('[verify] render threw', e);
      }
    }
  }

  /*
   * Four results. pass; fail; n/a (the engine cannot run the check at all --
   * the member is missing, or a host capability it needs is); and unsupported
   * (a known engine limit no polyfill can get past, detected on this engine,
   * with the reason). Only fail is red.
   */
  function statusOf(c) {
    return c.unsupported ? 'unsup' : c.skipped ? 'skip' : c.ok ? 'pass' : 'fail';
  }
  var LABEL = { pass: '&#10003; pass', fail: '&#10007; fail', skip: '&mdash; n/a', unsup: '&#9675; unsupported' };

  /*
   * The core-js column. After spackle's table renders, /verify-frame-core-js
   * (the /verify-compare frame) runs the same checks with core-js in its own
   * realm and posts its rows back: [batch, name, status, error], status 1 pass,
   * 0 fail, 2 n/a, 3 froze. ?nocorejs leaves it out.
   */
  var coreRows = null; // batch + '\u0000' + name -> row
  var coreState = /[?&]nocorejs\b/.test(String(location.search)) ? 'off' : 'waiting';
  var CORE_TEXT = { 1: 'pass', 0: 'fail', 2: 'n/a', 3: 'froze' };
  function coreText(c) {
    if (coreState === 'waiting') return '…';
    if (coreState !== 'done') return 'not run';
    var row = coreRows[c.batch + '\u0000' + c.name];
    if (row && row[2] === 3 && String(row[3] || '').indexOf('known freeze: ') === 0) return 'skipped: hangs older engines';
    return row ? CORE_TEXT[row[2]] : '—';
  }
  var CORE_LABEL = { pass: '&#10003; pass', fail: '<span class="bad">&#10007; fail</span>', 'n/a': '&mdash; n/a', froze: '<span class="bad">&#10007; froze</span>',
    'skipped: hangs older engines': '<span class="bad">skipped: hangs older engines</span>' };
  function coreCell(c) {
    var text = coreText(c);
    var cell = CORE_LABEL.hasOwnProperty(text) ? CORE_LABEL[text] : esc(text);
    return cell;
  }
  var coreFiled = null; // the check core-js froze in on the previous run, if any
  function coreNote() {
    var filed = coreFiled === null ? '' : '<div class="note bad">The engine froze with core-js installed, in &ldquo;' + esc(coreFiled) +
      '&rdquo; on the previous run: filed, so it was skipped this time and shows as &#10007; froze.</div>';
    if (coreState === 'off' || coreState === 'done') return filed;
    return filed + '<div class="note bad">core-js column: ' + esc(coreState) + '</div>';
  }

  function renderResult(result) {
    if (running) running.lastChild.nodeValue = 'Ran ' + result.checks.length + ' compatibility tests on Spackle';
    var btn = document.getElementById('run');
    btn.disabled = false;
    btn.innerHTML = 'Run again';
    // Per library: passed out of the tests it actually ran. A test core-js skips
    // (it locks up old engines) is counted apart, not as a failure.
    var spPass = 0, spRan = 0, corePass = 0, coreRan = 0, coreSkipped = 0;
    var html = '<table><tr><th>Test</th><th>Spackle</th><th>core-js</th></tr>';
    var lastBatch = null;
    for (var i = 0; i < result.checks.length; i++) {
      var c = result.checks[i];
      var status = statusOf(c);
      if (status === 'pass' || status === 'fail') spRan++;
      if (status === 'pass') spPass++;
      var core = coreText(c);
      if (core === 'pass' || core === 'fail' || core === 'froze') coreRan++;
      if (core === 'pass') corePass++;
      if (core === 'skipped: hangs older engines') coreSkipped++;
      if (c.batch !== lastBatch) {
        html += '<tr><td class="batch" colspan="3">' + esc(c.batch) + '</td></tr>';
        lastBatch = c.batch;
      }
      html += '<tr class="' + (status === 'pass' ? '' : status) + '"><td>' + esc(c.name) + '</td>' +
        '<td class="result">' + LABEL[status] + '</td><td class="result">' + coreCell(c) + '</td></tr>';
    }
    out.innerHTML = coreNote() + html + '</table>';
    if (window.tvDone) window.tvDone({ spacklePass: spPass, spackleRan: spRan,
      corePass: corePass, coreRan: coreState === 'done' ? coreRan : 0, coreSkipped: coreSkipped });
  }

  /*
   * One core-js frame, BEFORE spackle is even loaded: a low-memory engine can
   * run either realm alone but die holding both, so only one exists at a time,
   * as on /verify-compare. Same frame and message as there; removed once it
   * reports, then spackle loads and runs, and the table renders once.
   */
  var CORE_TAG = 'spackle-verify-compare';
  var ORIGIN = window.location.origin || (window.location.protocol + '//' + window.location.host);
  function runCoreJs() {
    var frame = document.createElement('iframe');
    var timer = null;
    function finish(state, rows) {
      if (timer === null) return;
      window.clearTimeout(timer);
      timer = null;
      window.removeEventListener('message', onMessage, false);
      if (frame.parentNode) frame.parentNode.removeChild(frame);
      frame = null;
      if (rows) {
        coreRows = {};
        for (var i = 0; i < rows.length; i++) coreRows[rows[i][0] + '\u0000' + rows[i][1]] = rows[i];
      }
      coreState = state;
      if (rows) running.lastChild.nodeValue = 'Ran ' + rows.length + ' compatibility tests on core-js';
      window.tvStep('core-js finished');
      // a pause so the tick reads, and for the frame's realm to go before spackle's arrives
      window.setTimeout(function () { window.tvStep('Installing Spackle'); startSpackle(); }, 900);
    }
    function onMessage(e) {
      if (e.origin !== ORIGIN) return;
      var d = e.data;
      if (!d || d.tag !== CORE_TAG || d.lib !== 'core-js') return;
      if (d.error) finish(String(d.error));
      else finish('done', d.rows);
    }
    window.addEventListener('message', onMessage, false);
    timer = window.setTimeout(function () {
      finish('core-js never reported back: the frame hung or failed to load.');
    }, 300000);
    frame.style.border = '0';
    frame.style.display = 'block';
    frame.style.width = '100%';
    frame.style.height = '0';
    frame.src = '/verify-frame-core-js';
    document.body.appendChild(frame);
  }

  /*
   * A core-js frame that froze the engine left the check it was in under
   * verify-compare:last. File it on the frozen list the frame skips, exactly as
   * /verify-compare does, so the next load gets past it.
   */
  try {
    var lastCore = window.localStorage && window.localStorage.getItem('verify-compare:last');
    if (lastCore && lastCore.indexOf('core-js: ') === 0) {
      window.localStorage.removeItem('verify-compare:last');
      var label = lastCore.substring('core-js: '.length);
      if (label.indexOf('loading the library') === 0) {
        // nothing to skip inside the frame: it never got past loading core-js,
        // so this run goes without it (the next reload tries again)
        if (coreState === 'waiting') {
          coreState = 'the engine froze while core-js was loading on the previous run, so this run skips it. Reload to try it again.';
        }
      } else {
        var frozen = JSON.parse(window.localStorage.getItem('verify-compare:froze') || '{}');
        if (!frozen['core-js']) frozen['core-js'] = [];
        if (frozen['core-js'].indexOf(label) === -1) frozen['core-js'].push(label);
        window.localStorage.setItem('verify-compare:froze', JSON.stringify(frozen));
        coreFiled = label;
      }
    }
  } catch (e) { /* storage blocked */ }

  // Prefer the async run: it covers Promise resolution ordering and the
  // combinators, which a synchronous pass cannot observe. Falling back is
  // itself a result worth seeing.
  //
  // Watchdog, because a page whose job is to report must never just sit there:
  // if the async run has neither resolved nor rejected in ten minutes (each async
  // check already times out on its own), run the
  // synchronous half and show that instead, saying so. On an engine whose
  // Promise never settles, a partial report beats a blank one.
  var settled = false;
  function settle(fn) {
    return function (value) {
      if (settled) return;
      settled = true;
      fn(value);
    };
  }

  /*
   * /verify?trace -- for a page that hangs or dies before it can render.
   * Before each check, its name goes to localStorage; a run that finishes
   * clears it. So on the next load, a name still there is the check the
   * previous run died in. ?skip=a|b skips every check whose "batch / name"
   * contains one of the pieces, to get past one culprit and find the next.
   */
  var TRACE_KEY = 'verify:last';
  var search = String(location.search);
  var tracing = /[?&]trace\b/.test(search);
  var skipMatch = /[?&]skip=([^&]*)/.exec(search);
  var skips = skipMatch ? decodeURIComponent(skipMatch[1].replace(/\+/g, ' ')).split('|') : [];
  function store() {
    try { return window.localStorage || null; } catch (e) { return null; }
  }
  if (tracing || skips.length) {
    var ls = store();
    var died = null;
    try { died = ls && ls.getItem(TRACE_KEY); } catch (e) { /* storage blocked */ }
    if (died) {
      out.innerHTML = '<div class="bad">the previous run died in: ' + esc(died) + '</div>' +
        '<p class="note">Running again&hellip;</p>';
    }
    window.spackleVerifyTrace = function (batch, name) {
      var label = batch + ' / ' + name;
      for (var k = 0; k < skips.length; k++) {
        if (skips[k] && label.indexOf(skips[k]) !== -1) return false;
      }
      if (tracing && ls) {
        try { ls.setItem(TRACE_KEY, label); } catch (e) { /* quota: keep going */ }
      }
      if (typeof console !== 'undefined' && console.log) console.log('[verify] ' + label);
      return true;
    };
    var plainRender = render;
    render = function (result) {
      try { if (ls) ls.removeItem(TRACE_KEY); } catch (e) { /* storage blocked */ }
      plainRender(result);
    };
  }

  /*
   * spackle and spackle-verify load only now (not as page scripts), so they never
   * share memory with the core-js frame. In order: spackle installs, then verify.
   */
  function loadScript(src, done) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = function () { done(null); };
    script.onerror = function () { done(src + ' failed to load'); };
    document.body.appendChild(script);
  }

  function startSpackle() {
    loadScript('/vendor/spackle.js', function (error) {
      if (error) { out.innerHTML = '<div class="bad">' + esc(error) + '</div>'; return; }
      loadScript('/vendor/spackle-verify.js', function (error2) {
        if (error2) { out.innerHTML = '<div class="bad">' + esc(error2) + '</div>'; return; }
        running = window.tvStep('Running compatibility tests on Spackle');
        // a tick so the step paints before the long synchronous run
        window.setTimeout(runSpackle, 50);
      });
    });
  }

  // /tv checklist: core-js in its frame, then spackle in this page. One run per load:
  // spackle installs into this realm, so "Run again" reloads.
  var running = null;
  var button = document.getElementById('run');
  button.onclick = function () {
    if (window.__verifyRan) { window.location.reload(); return; }
    window.__verifyRan = true;
    button.disabled = true;
    button.innerHTML = 'running…';
    // 'off' (?nocorejs), or skipped after it froze while loading
    if (coreState !== 'waiting') { window.tvStep('Installing Spackle'); startSpackle(); return; }
    window.tvStep('Installing core-js');
    window.setTimeout(function () {
      running = window.tvStep('Running compatibility tests on core-js');
      runCoreJs();
    }, 900);
  };

  function runSpackle() {
  try {
    if (typeof Promise === 'function' && spackleVerify.verifyPolyfillsAsync) {
      setTimeout(function () {
        if (settled) return;
        settled = true;
        try {
          render(spackleVerify.verifyPolyfills());
          var note = document.createElement('div');
          note.className = 'note';
          note.appendChild(document.createTextNode(
            'The async run never settled on this engine — this is the synchronous half only, ' +
            'so the Promise ordering checks are missing.'
          ));
          out.insertBefore(note, out.firstChild);
        } catch (e) {
          out.innerHTML = '<div class="bad">async run never settled, and the sync run threw: ' +
            esc(e && e.message ? e.message : e) + '</div>';
        }
      }, 600000); // last resort: each async check already times out on its own (8s)

      spackleVerify.verifyPolyfillsAsync().then(settle(render), settle(function (e) {
        out.innerHTML = '<div class="bad">async run threw: ' + esc(e && e.message) + '</div>';
      }));
    } else {
      render(spackleVerify.verifyPolyfills());
    }
  } catch (e) {
    out.innerHTML = '<div class="bad">verify threw: ' + esc(e && e.message ? e.message : e) + '</div>';
  }
  }
})();
