(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.parsePaste = factory().parsePaste;
})(typeof self !== 'undefined' ? self : this, function () {
  var VOID = { br: 1, hr: 1, img: 1, meta: 1, link: 1, input: 1, col: 1, wbr: 1 };
  var BLOCK = { p: 1, div: 1, br: 1, li: 1, ul: 1, ol: 1, tr: 1, table: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, blockquote: 1 };
  var SKIP = { style: 1, script: 1, head: 1, title: 1, xml: 1 };
  var NAMED = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c', ndash: '\u2013', mdash: '\u2014', hellip: '\u2026' };
  var TRIM = /^[\s.,;:!?()\[\]{}"'\u2018\u2019\u201c\u201d\-\u2013\u2014\u2026*]+|[\s.,;:!?()\[\]{}"'\u2018\u2019\u201c\u201d\-\u2013\u2014\u2026*]+$/g;
  var TAG = /^<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/;

  function decode(s) {
    return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, function (m, e) {
      if (e[0] === '#') {
        var n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        try { return String.fromCodePoint(n); } catch (x) { return m; }
      }
      var v = NAMED[e.toLowerCase()];
      return v === undefined ? m : v;
    }).replace(/\u00a0/g, ' ');
  }

  function boldOf(name, attrs, inherited) {
    var m = /(?:^|[\s;"'])font-weight\s*:\s*([a-z0-9]+)/i.exec(attrs);
    if (m) return /^(bold|bolder|[6-9]00)$/i.test(m[1]) ? true : (/^(normal|lighter|[1-5]00)$/i.test(m[1]) ? false : inherited);
    return name === 'b' || name === 'strong' ? true : inherited;
  }

  // Returns runs: [{ t: text, b: bool }]
  function tokenize(html) {
    var runs = [], stack = [], bold = false, skip = 0, i = 0, n = html.length, buf = '';
    function flush() {
      if (buf) { runs.push({ t: skip ? '' : decode(buf.replace(/\s+/g, ' ')), b: bold }); buf = ''; }
    }
    while (i < n) {
      var lt = html.indexOf('<', i);
      if (lt < 0) { buf += html.slice(i); break; }
      buf += html.slice(i, lt);
      var rest = html.slice(lt);
      if (rest.indexOf('<!--') === 0) {
        var end = html.indexOf('-->', lt + 4);
        i = end < 0 ? n : end + 3; continue;
      }
      if (rest.charAt(1) === '!' || rest.charAt(1) === '?') {
        var e2 = html.indexOf('>', lt);
        i = e2 < 0 ? n : e2 + 1; continue;
      }
      var m = TAG.exec(rest);
      if (!m) { buf += '<'; i = lt + 1; continue; }
      i = lt + m[0].length;
      var closing = m[1] === '/', name = m[2].toLowerCase();
      flush();
      if (BLOCK[name] && !skip) runs.push({ t: '\n', b: false });
      if (VOID[name]) continue;
      if (closing) {
        for (var k = stack.length - 1; k >= 0; k--) {
          if (stack[k].name === name) {
            while (stack.length > k) { var top = stack.pop(); if (top.skip) skip--; }
            break;
          }
        }
        bold = stack.length ? stack[stack.length - 1].bold : false;
      } else if (!/\/\s*$/.test(m[3])) {
        var s = !!SKIP[name];
        if (s) skip++;
        bold = boldOf(name, m[3], bold);
        stack.push({ name: name, bold: bold, skip: s });
      }
    }
    flush();
    return runs.filter(function (r) { return r.t; });
  }

  function fallbackRuns(text) {
    var parts = text.split('**'), runs = [];
    for (var i = 0; i < parts.length; i++) if (parts[i]) runs.push({ t: parts[i], b: i % 2 === 1 });
    return runs;
  }

  function sentenceAt(text, pos) {
    var start = 0, re = /[.!?]+(?=\s|$)|\n/g, m;
    while ((m = re.exec(text))) {
      var endIdx = m.index + m[0].length;
      if (pos < endIdx || (pos === m.index && m[0] !== '\n' && false)) {
        return text.slice(start, m[0] === '\n' ? m.index : endIdx);
      }
      start = endIdx;
    }
    return text.slice(start);
  }

  function parsePaste(input) {
    input = String(input == null ? '' : input);
    var isHtml = /<\/?[a-zA-Z][^>]*>/.test(input);
    var runs = isHtml ? tokenize(input) : fallbackRuns(input.replace(/\r\n?/g, '\n'));
    if (isHtml && !runs.some(function (r) { return r.b; })) {
      var plain = runs.map(function (r) { return r.t; }).join('');
      runs = fallbackRuns(plain);
    }
    var text = '', ranges = [];
    runs.forEach(function (r) {
      if (r.b) {
        var last = ranges[ranges.length - 1];
        if (last && /^\s*$/.test(text.slice(last.end))) last.end = text.length + r.t.length;
        else ranges.push({ start: text.length, end: text.length + r.t.length });
      }
      text += r.t;
    });
    var seen = {}, out = [];
    ranges.forEach(function (r) {
      var word = text.slice(r.start, r.end).replace(/\s+/g, ' ').replace(TRIM, '');
      if (!word) return;
      var key = word.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      var ctx = sentenceAt(text, r.start).replace(/\s+/g, ' ').trim();
      if (ctx.length > 300) ctx = ctx.slice(0, 300);
      out.push({ key: key, text: word.charAt(0).toUpperCase() + word.slice(1), context: ctx });
    });
    return out;
  }

  return { parsePaste: parsePaste };
});
