/*
 * The harness inside a /verify-compare frame.
 *
 * Both frame documents load THIS file; only the library before it differs.
 * `window.__LIB` is set inline by the frame. It runs spackle-verify once on
 * load and posts every row to the parent, which then removes the frame so the
 * realm can be collected before the other library loads.
 *
 * The API column is not sent: it reads spackle's __polyfilled stamp, so every
 * core-js row would say "native". The comparison is pass / fail / n/a only.
 *
 * Hand-written ES5, like every page here.
 */
(function () {
  var LIB = window.__LIB || 'unknown';
  var TAG = 'spackle-verify-compare';
  var status = document.getElementById('status');

  var posted = false;
  function post(payload) {
    if (posted) return;
    posted = true;
    payload.tag = TAG;
    payload.lib = LIB;
    try {
      window.parent.postMessage(payload, '*');
    } catch (e) {
      /* nothing in here to report it to */
    }
  }

  function say(text) {
    if (status) status.innerHTML = '<b>' + LIB + '</b> — ' + text;
  }

  // Rows only, errors trimmed: ~1400 of them cross the frame boundary.
  // Status: 1 pass, 0 fail, 2 n/a, 3 froze on an earlier run.
  function rows(result) {
    var out = [];
    for (var i = 0; i < result.checks.length; i++) {
      var c = result.checks[i];
      var error = c.error ? String(c.error) : '';
      if (error.length > 240) error = error.substring(0, 240) + '…';
      var status = c.skipped ? 2 : c.ok ? 1 : 0;
      var label = c.batch + ' / ' + c.name;
      if (c.skipped && known.hasOwnProperty(label)) {
        status = 3;
        error = 'known freeze: ' + known[label];
      } else if (c.skipped && froze.hasOwnProperty(label)) {
        status = 3;
        error = 'the engine froze here on an earlier run, so it was skipped this time';
      }
      out.push([c.batch, c.name, status, error]);
    }
    return out;
  }

  /*
   * The check about to run goes to localStorage first; a finished run clears
   * it. A frame that freezes the engine leaves the name behind, and the page
   * shows it on the next load.
   */
  var TRACE_KEY = 'verify-compare:last';
  var store = null;
  try { store = window.localStorage || null; } catch (e) { /* storage blocked */ }
  /*
   * Checks this library froze the engine on in an earlier run (the page files
   * them under verify-compare:froze). They are skipped, and reported as
   * frozen rather than as n/a -- so every reload gets further, and a freeze
   * ends up as a row in the comparison instead of a run that never finishes.
   */
  var froze = {};
  try {
    var all = JSON.parse((store && store.getItem('verify-compare:froze')) || '{}');
    var mine = all[LIB] || [];
    for (var f = 0; f < mine.length; f++) froze[mine[f]] = true;
  } catch (e) { /* unreadable list: run everything */ }

  /*
   * Freezes found in the lab, shipped with the demo so a run on someone's own
   * device finishes in one pass. A synchronous loop cannot be interrupted from
   * the page (one thread), so the only way past one is not to start it. Each is
   * skipped for that library on every engine -- no guessing which ones freeze
   * -- and reported as "buggy on older webviews"; the page offers to run it
   * anyway (verify:run-anyway, one shot).
   */
  var KNOWN_FREEZES = [
    { lib: 'core-js', check: 'Promise (methods, async) / Array.fromAsync collects sync, async and array-like inputs',
      note: 'older engines hang here with core-js installed, so it is skipped' },
    { lib: 'core-js', check: 'Iterator (methods) / Iterator helpers throw a TypeError on re-entrant next()',
      note: 'older engines hang here with core-js installed, so it is skipped' },
    { lib: 'core-js', check: 'Map / Set (methods) / new Map(iterable) closes the iterator on per-item failures only',
      note: 'older engines hang here with core-js installed, so it is skipped' },
    { lib: 'core-js', check: 'Web APIs (methods) / URL.canParse, URL.parse and toJSON',
      note: 'older engines hang here with core-js installed, so it is skipped' }
  ];
  var runAnyway = null;
  try { runAnyway = store && store.getItem('verify:run-anyway'); } catch (e) { /* storage blocked */ }
  var known = {};
  for (var k = 0; k < KNOWN_FREEZES.length; k++) {
    var kf = KNOWN_FREEZES[k];
    if (kf.lib === LIB && kf.check !== runAnyway) known[kf.check] = kf.note;
  }
  // one shot: a deliberate run of a known freeze happens once, then it is skipped again
  if (runAnyway) {
    try { store.removeItem('verify:run-anyway'); } catch (e) { /* storage blocked */ }
  }

  window.spackleVerifyTrace = function (batch, name) {
    var label = batch + ' / ' + name;
    if (known.hasOwnProperty(label) || froze.hasOwnProperty(label)) return false;
    if (store) {
      try { store.setItem(TRACE_KEY, LIB + ': ' + label); } catch (e) { /* quota */ }
    }
    return true;
  };
  function clearTrace() {
    try { if (store) store.removeItem(TRACE_KEY); } catch (e) { /* storage blocked */ }
  }

  function done(result, note) {
    clearTrace();
    say(result.passed + ' passed, ' + result.failed + ' failed — sending to the page');
    post({ rows: rows(result), engine: result.engine, note: note || '' });
  }

  function fail(message) {
    clearTrace();
    say('failed: ' + message);
    post({ error: LIB + ': ' + message });
  }

  if (typeof window.spackleVerify === 'undefined') {
    fail('spackle-verify did not load');
    return;
  }

  say('running the checks…');
  // A tick first, so the status paints before the long synchronous run.
  window.setTimeout(function () {
    try {
      if (typeof Promise === 'function' && spackleVerify.verifyPolyfillsAsync) {
        // Same fallback as /verify: an async half that never settles still
        // leaves the synchronous half worth reporting.
        var fallback = window.setTimeout(function () {
          try {
            done(spackleVerify.verifyPolyfills(), 'the async run never settled; synchronous checks only');
          } catch (e) {
            fail('async run never settled, and the sync run threw: ' + (e && e.message));
          }
        }, 600000); // last resort: each async check already times out on its own (8s)
        spackleVerify.verifyPolyfillsAsync().then(function (result) {
          window.clearTimeout(fallback);
          done(result);
        }, function (e) {
          window.clearTimeout(fallback);
          fail('async run threw: ' + (e && e.message));
        });
      } else {
        done(spackleVerify.verifyPolyfills(), 'no Promise: synchronous checks only');
      }
    } catch (e) {
      fail('run threw: ' + (e && e.message));
    }
  }, 50);
})();
