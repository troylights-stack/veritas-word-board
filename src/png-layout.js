(function (root, factory) {
  var modes = (typeof module === 'object' && module.exports) ? require('./modes') : root.WordModes;
  var api = factory(modes);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.WordPng = root.WordPng || {};
    root.WordPng.wrapText = api.wrapText;
    root.WordPng.layoutBoard = api.layoutBoard;
    root.WordPng.pickScale = api.pickScale;
    root.WordPng.fileName = api.fileName;
  }
})(typeof self !== 'undefined' ? self : this, function (modes) {
  var C = {
    width: 960, pad: 40, titleH: 56, titleGap: 28,
    wordW: 220, gap: 100, boxPad: 16, blockGap: 8,
    lineH: 22, wordLineH: 26, minWordH: 56, rowGap: 28,
    // word text is drawn in a larger font than the measured card font
    wordWrapFactor: 0.85,
    titleLineH: 48, titleScale: 2.5,
    maxCanvasSide: 16000, maxPixels: 200000000
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
    items = items || [];
    return wrapText(label + ': ' + (items.length ? items.join(', ') : 'none'), maxWidth, widthOf);
  }

  /* widthOf(text) measures the 16px body font. `measures` (optional) gives exact
     measures for the other drawn fonts: { list: bold 16px, word: 800 20px,
     title: heading 40px }. Without it those are estimated from widthOf. */
  function layoutBoard(cards, mode, title, widthOf, measures) {
    var m = measures || {};
    var listW = m.list || widthOf;
    var cardW = C.width - 2 * C.pad - C.wordW - C.gap;
    var cardInner = cardW - 2 * C.boxPad;
    var wordInner = C.wordW - 2 * C.boxPad;
    var wordW = m.word || function (t) { return widthOf(t) / C.wordWrapFactor; };
    var titleW = m.title || function (t) { return widthOf(t) * C.titleScale; };
    var titleLines = wrapText(title || '', C.width - 2 * C.pad, titleW);
    if (!titleLines.length) titleLines = [''];
    var titleH = C.titleH + (titleLines.length - 1) * C.titleLineH;
    var y = C.pad + titleH + C.titleGap;
    var rows = [];
    cards.forEach(function (c) {
      var blocks = [];
      if (c.failed) {
        blocks.push({ kind: 'definition', lines: ["couldn't generate, retry"] });
      } else {
        blocks.push({ kind: 'definition', lines: wrapText(c.definition || '', cardInner, widthOf) });
        if (modes.showsSynonyms(mode)) blocks.push({ kind: 'synonyms', lines: listLines('Synonyms', c.synonyms, cardInner, listW) });
        if (modes.showsAntonyms(mode)) blocks.push({ kind: 'antonyms', lines: listLines('Antonyms', c.antonyms, cardInner, listW) });
      }
      var n = 0;
      blocks.forEach(function (b) { n += b.lines.length; });
      var cardH = 2 * C.boxPad + n * C.lineH + (blocks.length - 1) * C.blockGap;
      var wordLines = wrapText(c.term || '', wordInner, wordW);
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
    var height = rows.length ? y - C.rowGap + C.pad : C.pad + titleH + C.pad;
    return { width: C.width, height: height, title: { text: title, lines: titleLines, x: C.pad, y: C.pad, h: titleH, lineH: C.titleLineH }, rows: rows };
  }

  function pickScale(width, height) {
    return Math.min(2, C.maxCanvasSide / Math.max(width, height), Math.sqrt(C.maxPixels / (width * height)));
  }

  // '<exercise name>.png' with path, reserved, control and invisible characters
  // removed, spaces collapsed, at most 80 characters; 'word-board.png' if nothing is left.
  function fileName(title) {
    var base = String(title == null ? '' : title)
      .replace(/[­​-‏‪-‮⁠-⁩﻿]/g, '')
      .replace(/[\u0000-\u001f\u007f-\u009f\/\\:*?"<>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^[\s.]+|[\s.]+$/g, '')
      .slice(0, 80)
      .replace(/[\s.]+$/, '');
    return (base || 'word-board') + '.png';
  }

  return { wrapText: wrapText, layoutBoard: layoutBoard, pickScale: pickScale, fileName: fileName, CONSTANTS: C };
});
