/* DEV ONLY. Never inlined by build.mjs. Inject it BEFORE the page's scripts
   (e.g. Playwright page.addInitScript) so the real app code finds a fake
   claude.ai runtime:
   - claude.use('sample')    -> sample(input, opts) / sample.json(input, opts)
   - claude.use('downloads') -> { save({filename, data}) } recording window.__lastDownload
   Switch behaviour at any time through globals (read on every call):
   - window.__stubMode = 'ok' | 'rate_limited' | 'prose' | 'fewer' | 'not_granted'
                         | 'null_sample' | 'invalid_json' | 'session_expired'
                         | 'upstream_error' | 'weird_code'
   - window.__stubDownloads = 'ok' | 'null' | 'declined' | 'unavailable'
   - window.__stubDelay (ms, default 300)
   window.__stubCalls counts sample calls (a mode switch must make none);
   window.__stubLastPrompt holds the last prompt. */
(function () {
  var CANNED = [
    { term: 'Handpick',
      definition: 'To carefully select from a group, usually with special attention or preference.',
      synonyms: ['choose', 'select', 'pick', 'appoint', 'designate'],
      antonyms: ['ignore', 'reject', 'overlook', 'randomize'] },
    { term: 'Uncanny knack',
      definition: 'A strange or remarkable natural ability to do something well, almost beyond explanation.',
      synonyms: ['gift', 'talent', 'flair', 'aptitude', 'instinct'],
      antonyms: ['inability', 'incompetence', 'ineptitude', 'clumsiness'] },
    { term: 'Forging',
      definition: 'Making or shaping something, especially metal, by heating and hammering it; creating something strong through effort.',
      synonyms: ['shaping', 'crafting', 'building', 'creating', 'hammering'],
      antonyms: ['destroying', 'breaking', 'dismantling', 'ruining'] },
    { term: 'Twitching',
      definition: 'Making small, sudden, involuntary movements.',
      synonyms: ['jerking', 'quivering', 'trembling', 'flickering', 'spasming'],
      antonyms: ['still', 'steady', 'motionless', 'calm'] },
    { term: 'Crooked',
      definition: 'Bent or twisted out of shape; not straight.',
      synonyms: ['bent', 'twisted', 'warped', 'askew', 'curved'],
      antonyms: ['straight', 'even', 'aligned', 'level'] }
  ];

  window.__stubCalls = 0;
  if (window.__stubDelay == null) window.__stubDelay = 300;
  if (!window.__stubMode) window.__stubMode = 'ok';
  if (!window.__stubDownloads) window.__stubDownloads = 'ok';
  window.__stubCanned = CANNED;   // tests may replace it (long text, many cards)

  function fail(code, extra) {
    return Object.assign({ code: code, message: 'stub: ' + code }, extra || {});
  }

  // Resolves after the delay; rejects {code:'cancelled'} promptly on abort.
  function wait(ms, signal) {
    return new Promise(function (resolve, reject) {
      if (signal && signal.aborted) { reject(fail('cancelled')); return; }
      var t = setTimeout(resolve, ms);
      if (signal) signal.addEventListener('abort', function () {
        clearTimeout(t);
        reject(fail('cancelled'));
      }, { once: true });
    });
  }

  // The platform's tolerant reading: whole reply, else first [ / { to last ] / }.
  function readJson(text) {
    try { return JSON.parse(text); } catch (e) { /* fall through */ }
    var a = text.search(/[\[{]/), b = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));
    if (a >= 0 && b > a) {
      try { return JSON.parse(text.slice(a, b + 1)); } catch (e) { /* fall through */ }
    }
    throw fail('invalid_json', { text: text });
  }

  function reply() {
    var data = JSON.parse(JSON.stringify(window.__stubCanned));
    switch (window.__stubMode) {
      case 'prose':
        return 'Sure! Here are the cards you asked for:\n' + JSON.stringify(data, null, 2) + '\nHope this helps with the homework.';
      case 'fewer':
        return JSON.stringify(data.slice(0, 3));
      case 'invalid_json':
        return 'Sorry, I can only describe these words in prose.';
      default:
        return JSON.stringify(data);
    }
  }

  function call(input, opts) {
    window.__stubCalls += 1;
    window.__stubLastPrompt = input;
    var mode = window.__stubMode;
    return wait(window.__stubDelay, opts && opts.signal).then(function () {
      if (mode === 'rate_limited' || mode === 'not_granted' || mode === 'session_expired' ||
          mode === 'upstream_error' || mode === 'weird_code') {
        throw fail(mode === 'weird_code' ? 'something_new' : mode);
      }
      return reply();
    });
  }

  var sample = function (input, opts) {
    return call(input, opts).then(function (text) { return { text: text, truncated: false }; });
  };
  sample.json = function (input, opts) {
    return call(input, opts).then(readJson);
  };

  var downloads = {
    save: function (req) {
      window.__saveCalls = (window.__saveCalls || 0) + 1;
      var m = window.__stubDownloads;
      if (m === 'declined') return Promise.reject(fail('declined'));
      if (m === 'unavailable') return Promise.reject(fail('unavailable'));
      window.__lastDownload = { filename: req.filename, data: req.data };
      return Promise.resolve({ status: 'saved' });
    }
  };

  window.claude = {
    use: function (name) {
      if (name === 'sample') return Promise.resolve(window.__stubMode === 'null_sample' ? null : sample);
      if (name === 'downloads') return Promise.resolve(window.__stubDownloads === 'null' ? null : downloads);
      return Promise.resolve(null);
    }
  };
})();
