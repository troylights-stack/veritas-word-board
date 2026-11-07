/* DEV ONLY. Never inlined by build.mjs. Load it into dist/word-board.html
   (e.g. a <script> injected by the browser test) to fake Claude:
   - window.claude.use('sample') -> { json(prompt, {signal}) } returning canned JSON
   - window.__askClaude(terms, signal) -> Promise<Card[]> through that fake
   window.__stubCalls counts calls, so tests can prove a mode switch made none. */
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
  window.__stubDelay = 300;

  function wait(ms, signal) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(resolve, ms);
      if (signal) signal.addEventListener('abort', function () {
        clearTimeout(t);
        reject(Object.assign(new Error('cancelled'), { name: 'AbortError', code: 'cancelled' }));
      });
    });
  }

  var sample = {
    json: function (prompt, opts) {
      window.__stubCalls += 1;
      window.__stubLastPrompt = prompt;
      return wait(window.__stubDelay, opts && opts.signal).then(function () {
        return JSON.parse(JSON.stringify(CANNED));
      });
    }
  };

  window.claude = {
    use: function (name) { return Promise.resolve(name === 'sample' ? sample : null); }
  };

  window.__askClaude = function (terms, signal) {
    return window.claude.use('sample').then(function (s) {
      return s.json(window.WordPrompt.buildPrompt(terms), { signal: signal });
    }).then(function (raw) {
      return window.WordPrompt.normalizeResponse(raw, terms);
    });
  };
})();
