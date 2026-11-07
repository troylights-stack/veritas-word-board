import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { parsePaste } = createRequire(import.meta.url)('../src/parse.js');
const texts = (s) => parsePaste(s).map((t) => t.text);

test('finds <b>, <strong> and font-weight spans', () => {
  assert.deepEqual(
    texts('<p>He will <b>handpick</b> a <strong>crew</strong> and <span style="font-weight:bold">sail</span>.</p>'),
    ['Handpick', 'Crew', 'Sail']);
});

test('Word bidi b counts as bold', () => {
  assert.deepEqual(texts("<b style='mso-bidi-font-weight:normal'>forging</b>"), ['Forging']);
  assert.deepEqual(texts('<span style="font-weight:normal">plain</span>'), []);
});

test('merges adjacent bold runs', () => {
  const r = parsePaste('<b>Uncanny</b> <b>knack</b> helps');
  assert.equal(r.length, 1);
  assert.equal(r[0].text, 'Uncanny knack');
});

test('trims punctuation', () => {
  assert.deepEqual(texts('<b>Crooked,</b>'), ['Crooked']);
  assert.deepEqual(texts('(<b>handpick</b>)'), ['Handpick']);
});

test('dedupes case-insensitively, keeps first-occurrence order and first context', () => {
  const r = parsePaste('<p>Go <b>Sail</b> now. Then <b>crew</b> up. Later <b>sail</b> again.</p>');
  assert.deepEqual(r.map((t) => t.text), ['Sail', 'Crew']);
  assert.equal(r[0].key, 'sail');
  assert.equal(r[0].context, 'Go Sail now.');
});

test('context is the surrounding sentence', () => {
  const r = parsePaste('It was late. A <b>crooked</b> path led on. Then rain.');
  assert.equal(r[0].context, 'A crooked path led on.');
});

test('asterisk fallback on plain text', () => {
  assert.deepEqual(texts('a **twitching** eye'), ['Twitching']);
  assert.deepEqual(texts('<p>**ignored** and <b>real</b></p>'), ['Real']);
});

test('decodes entities and strips tags', () => {
  assert.equal(parsePaste('<b>don&#39;t&nbsp;stop</b>')[0].text, "Don't stop");
});

test('no bold gives empty array', () => {
  assert.deepEqual(parsePaste('just some plain text. Nothing here.'), []);
  assert.deepEqual(parsePaste('<p>nothing bold</p>'), []);
  assert.deepEqual(parsePaste(''), []);
});

test('HTML-looking text is returned literally', () => {
  assert.equal(parsePaste('<b>&lt;img onerror=x&gt;</b>')[0].text, '<img onerror=x>');
});

test('ignores Word style blocks, comments and head', () => {
  const html = '<html><head><title>T</title><style>p {font-weight:bold}</style></head><body>' +
    '<!--[if gte mso 9]><xml><o:x>junk.</o:x></xml><![endif]-->' +
    '<p>First line. <b>Brave</b><o:p></o:p> deed.</p></body></html>';
  const r = parsePaste(html);
  assert.deepEqual(r.map((t) => t.text), ['Brave']);
  assert.equal(r[0].context, 'Brave deed.');
  assert.ok(!/junk|font-weight|T\b/.test(r[0].context));
});

test('does not merge bold runs across paragraph, br or li boundaries', () => {
  assert.deepEqual(texts('<p><b>alpha</b></p><p><b>beta</b></p>'), ['Alpha', 'Beta']);
  assert.deepEqual(texts('<b>alpha</b><br><b>beta</b>'), ['Alpha', 'Beta']);
  assert.deepEqual(texts('<li><b>a</b></li><li><b>b</b></li>'), ['A', 'B']);
  assert.deepEqual(texts('<b>one<br>two</b>'), ['One', 'Two']);
  assert.deepEqual(texts('<b>Uncanny</b> <b>knack</b>'), ['Uncanny knack']);
});
