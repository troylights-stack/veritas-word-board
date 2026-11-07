import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { wrapText, layoutBoard } = createRequire(import.meta.url)('../src/png-layout.js');
const w = (s) => s.length * 8;
const card = (key, over = {}) => ({ key, term: 'Term' + key, definition: 'a short definition', synonyms: ['choose', 'pick'], antonyms: ['reject'], failed: false, ...over });

test('wrapText wraps at word boundaries', () => {
  const lines = wrapText('aaa bbb ccc ddd', 8 * 7, w);
  assert.deepEqual(lines, ['aaa bbb', 'ccc ddd']);
});
test('wrapText splits an overlong word', () => {
  const lines = wrapText('x'.repeat(60), 8 * 20, w);
  assert.ok(lines.length >= 3);
  lines.forEach((l) => assert.ok(w(l) <= 160));
  assert.equal(lines.join(''), 'x'.repeat(60));
});
test('def mode has only a definition block', () => {
  const l = layoutBoard([card(1)], 'def', 'ex 1', w);
  assert.deepEqual(l.rows[0].card.blocks.map((b) => b.kind), ['definition']);
});
test('all mode has three blocks with labels', () => {
  const b = layoutBoard([card(1)], 'all', 'ex 1', w).rows[0].card.blocks;
  assert.deepEqual(b.map((x) => x.kind), ['definition', 'synonyms', 'antonyms']);
  assert.equal(b[1].lines[0], 'Synonyms: choose, pick');
  assert.equal(b[2].lines[0], 'Antonyms: reject');
});
test('syn and ant modes', () => {
  assert.deepEqual(layoutBoard([card(1)], 'syn', 't', w).rows[0].card.blocks.map((b) => b.kind), ['definition', 'synonyms']);
  assert.deepEqual(layoutBoard([card(1)], 'ant', 't', w).rows[0].card.blocks.map((b) => b.kind), ['definition', 'antonyms']);
});
test('taller card for longer definition', () => {
  const a = layoutBoard([card(1)], 'def', 't', w).rows[0].card.h;
  const b = layoutBoard([card(1, { definition: 'word '.repeat(80) })], 'def', 't', w).rows[0].card.h;
  assert.ok(b > a);
});
test('height covers rows and rows do not overlap', () => {
  const l = layoutBoard([card(1), card(2, { definition: 'word '.repeat(40) }), card(3)], 'all', 'ex 1', w);
  for (let i = 1; i < l.rows.length; i++) assert.ok(l.rows[i].card.y >= l.rows[i - 1].card.y + l.rows[i - 1].card.h);
  const last = l.rows[l.rows.length - 1];
  assert.ok(l.height >= last.card.y + last.card.h);
  assert.ok(l.rows[0].card.y >= l.title.y);
});
test('failed card shows placeholder', () => {
  const b = layoutBoard([card(1, { failed: true, definition: '' })], 'all', 't', w).rows[0].card.blocks;
  assert.equal(b.length, 1);
  assert.deepEqual(b[0].lines, ["couldn't generate, retry"]);
});
test('empty cards gives title only', () => {
  const l = layoutBoard([], 'all', 'ex 1', w);
  assert.equal(l.rows.length, 0);
  assert.equal(l.title.text, 'ex 1');
  assert.ok(l.height > 0);
});
