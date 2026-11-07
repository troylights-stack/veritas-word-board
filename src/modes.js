(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WordModes = api;
})(typeof self !== 'undefined' ? self : this, function () {
  var MODES = [
    { id: 'all', label: 'Definition + synonyms + antonyms' },
    { id: 'syn', label: 'Definition + synonyms' },
    { id: 'ant', label: 'Definition + antonyms' },
    { id: 'def', label: 'Definition only' }
  ];
  function showsSynonyms(mode) { return mode === 'all' || mode === 'syn'; }
  function showsAntonyms(mode) { return mode === 'all' || mode === 'ant'; }
  return { MODES: MODES, showsSynonyms: showsSynonyms, showsAntonyms: showsAntonyms };
});
