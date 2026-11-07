(function (root, factory) {
  var modes = (typeof module === 'object' && module.exports) ? require('./modes') : root.WordModes;
  var api = factory(modes);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.WordPng = root.WordPng || {};
    root.WordPng.wrapText = api.wrapText;
    root.WordPng.layoutBoard = api.layoutBoard;
  }
})(typeof self !== 'undefined' ? self : this, function (modes) {
  var C = {
    width: 960, pad: 40, titleH: 56, titleGap: 28,
    wordW: 220, gap: 100, boxPad: 16, blockGap: 8,
    lineH: 22, wordLineH: 26, minWordH: 56, rowGap: 28,
    // word text is drawn in a larger font than the measured card font
    wordWrapFactor: 0.85
  };

  function wrapText(text, maxWidth, widthOf) {
    var words = String(text).split(/\s+/).filter(Boolean);
    var lines = [];
    var cur = '';
    function pushLong(word) {
      var chunk = '';
      for (var i = 0; i < word.length; i++) {
        if (chunk && widthOf(chunk + word[i]) > maxWidth) { lines.push(chunk); chunk = ''; }
        chunk += word[i];
      }
      return chunk;
    }
    words.forEach(function (word) {
      var next = cur ? cur + ' ' + word : word;
      if (widthOf(next) <= maxWidth) { cur = next; return; }
      if (cur) { lines.push(cur); cur = ''; }
      cur = widthOf(word) <= maxWidth ? word : pushLong(word);
    });
    if (cur) lines.push(cur);
    return lines;
  }

  function listLines(label, items, maxWidth, widthOf) {
    return wrapText(label + ': ' + (items || []).join(', '), maxWidth, widthOf);
  }

  function layoutBoard(cards, mode, title, widthOf) {
    var cardW = C.width - 2 * C.pad - C.wordW - C.gap;
    var cardInner = cardW - 2 * C.boxPad;
    var wordInner = (C.wordW - 2 * C.boxPad) * C.wordWrapFactor;
    var y = C.pad + C.titleH + C.titleGap;
    var rows = [];
    cards.forEach(function (c) {
      var blocks = [];
      if (c.failed) {
        blocks.push({ kind: 'definition', lines: ["couldn't generate, retry"] });
      } else {
        blocks.push({ kind: 'definition', lines: wrapText(c.definition || '', cardInner, widthOf) });
        if (modes.showsSynonyms(mode)) blocks.push({ kind: 'synonyms', lines: listLines('Synonyms', c.synonyms, cardInner, widthOf) });
        if (modes.showsAntonyms(mode)) blocks.push({ kind: 'antonyms', lines: listLines('Antonyms', c.antonyms, cardInner, widthOf) });
      }
      var n = 0;
      blocks.forEach(function (b) { n += b.lines.length; });
      var cardH = 2 * C.boxPad + n * C.lineH + (blocks.length - 1) * C.blockGap;
      var wordLines = wrapText(c.term || '', wordInner, widthOf);
      var wordH = Math.max(C.minWordH, 2 * C.boxPad + wordLines.length * C.wordLineH);
      var cardX = C.pad + C.wordW + C.gap;
      var word = { x: C.pad, y: y, w: C.wordW, h: wordH, lines: wordLines };
      var cardBox = { x: cardX, y: y, w: cardW, h: cardH, blocks: blocks };
      rows.push({
        word: word,
        card: cardBox,
        arrow: { from: { x: word.x + word.w, y: word.y + word.h / 2 }, to: { x: cardX, y: y + Math.min(cardH, 2 * C.boxPad + C.lineH) / 2 } }
      });
      y += Math.max(wordH, cardH) + C.rowGap;
    });
    var height = rows.length ? y - C.rowGap + C.pad : C.pad + C.titleH + C.pad;
    return { width: C.width, height: height, title: { text: title, x: C.pad, y: C.pad }, rows: rows };
  }

  return { wrapText: wrapText, layoutBoard: layoutBoard, CONSTANTS: C };
});
