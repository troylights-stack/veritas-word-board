(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WordBoardState = api;
})(typeof self !== 'undefined' ? self : this, function () {
  var MODE_IDS = ['all', 'syn', 'ant', 'def'];

  function assign(s, patch) {
    return {
      title: 'title' in patch ? patch.title : s.title,
      mode: 'mode' in patch ? patch.mode : s.mode,
      cards: 'cards' in patch ? patch.cards : s.cards,
      dirty: 'dirty' in patch ? patch.dirty : s.dirty
    };
  }
  function mapCard(s, key, fn) {
    return s.cards.map(function (c) {
      if (c.key !== key) return c;
      var n = {}; for (var k in c) n[k] = c[k];
      fn(n);
      return n;
    });
  }

  function createState() { return { title: '', mode: 'all', cards: [], dirty: false }; }
  function setTitle(s, title) { return assign(s, { title: title }); }
  function setMode(s, mode) {
    return MODE_IDS.indexOf(mode) < 0 ? s : assign(s, { mode: mode });
  }
  function setCards(s, cards) { return assign(s, { cards: cards.slice(), dirty: false }); }
  function editText(s, key, field, value) {
    if (field !== 'term' && field !== 'definition') return s;
    return assign(s, { cards: mapCard(s, key, function (c) { c[field] = value; }), dirty: true });
  }
  function editList(s, key, field, list) {
    if (field !== 'synonyms' && field !== 'antonyms') return s;
    var clean = [];
    for (var i = 0; i < list.length; i++) {
      var t = String(list[i]).trim();
      if (t) clean.push(t);
    }
    return assign(s, { cards: mapCard(s, key, function (c) { c[field] = clean; }), dirty: true });
  }
  function needsCastConfirm(s) { return s.cards.length > 0 && s.dirty; }

  return { createState: createState, setTitle: setTitle, setMode: setMode, setCards: setCards,
    editText: editText, editList: editList, needsCastConfirm: needsCastConfirm };
});
