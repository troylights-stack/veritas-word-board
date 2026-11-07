import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const S = createRequire(import.meta.url)('../src/board-state.js');
const card = (key) => ({ key, term: 'Term' + key, definition: 'd', synonyms: ['a'], antonyms: ['b'], failed: false });
const deepFreeze = (o) => { Object.values(o).forEach((v) => typeof v === 'object' && v && deepFreeze(v)); return Object.freeze(o); };
const loaded = () => deepFreeze(S.setCards(S.createState(), [card(1), card(2)]));

test('createState defaults', () => {
  const s = S.createState();
  assert.deepEqual(s, { title: '', mode: 'all', cards: [], dirty: false });
});
test('setTitle returns new state', () => {
  const s = deepFreeze(S.createState());
  assert.equal(S.setTitle(s, 'Unit 1').title, 'Unit 1');
  assert.equal(s.title, '');
});
test('setMode keeps cards and dirty', () => {
  const s = deepFreeze(S.editText(loaded(), 1, 'term', 'X'));
  const n = S.setMode(s, 'def');
  assert.equal(n.mode, 'def');
  assert.equal(n.cards, s.cards);
  assert.equal(n.dirty, true);
  assert.equal(s.mode, 'all');
});
test('setMode unknown returns same state', () => {
  const s = loaded();
  assert.equal(S.setMode(s, 'bogus'), s);
});
test('editText marks dirty without mutating', () => {
  const s = loaded();
  const n = S.editText(s, 2, 'definition', 'new');
  assert.equal(n.dirty, true);
  assert.equal(n.cards[1].definition, 'new');
  assert.equal(s.cards[1].definition, 'd');
  assert.equal(s.dirty, false);
  assert.equal(n.cards[0], s.cards[0]);
});
test('editList drops blank entries and marks dirty', () => {
  const s = loaded();
  const n = S.editList(s, 1, 'synonyms', ['x', '  ', '', ' y ']);
  assert.deepEqual(n.cards[0].synonyms, ['x', 'y']);
  assert.equal(n.dirty, true);
  assert.deepEqual(s.cards[0].synonyms, ['a']);
});
test('setCards after edit clears dirty', () => {
  const s = S.editText(loaded(), 1, 'term', 'Z');
  assert.equal(s.dirty, true);
  assert.equal(S.setCards(s, [card(3)]).dirty, false);
});
test('needsCastConfirm', () => {
  assert.equal(S.needsCastConfirm(S.createState()), false);
  assert.equal(S.needsCastConfirm(loaded()), false);
  assert.equal(S.needsCastConfirm(S.editText(loaded(), 1, 'term', 'Z')), true);
});
