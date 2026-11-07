import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { MODES, showsSynonyms, showsAntonyms } = createRequire(import.meta.url)('../src/modes.js');

test('MODES ids and labels', () => {
  assert.deepEqual(MODES, [
    { id: 'all', label: 'Definition + synonyms + antonyms' },
    { id: 'syn', label: 'Definition + synonyms' },
    { id: 'ant', label: 'Definition + antonyms' },
    { id: 'def', label: 'Definition only' }]);
});
test('showsSynonyms', () => {
  assert.equal(showsSynonyms('all'), true);
  assert.equal(showsSynonyms('syn'), true);
  assert.equal(showsSynonyms('ant'), false);
  assert.equal(showsSynonyms('def'), false);
});
test('showsAntonyms', () => {
  assert.equal(showsAntonyms('all'), true);
  assert.equal(showsAntonyms('ant'), true);
  assert.equal(showsAntonyms('syn'), false);
  assert.equal(showsAntonyms('def'), false);
});
