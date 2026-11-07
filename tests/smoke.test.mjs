import test from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';

test('assets/cat.png exists and is under 400 KB', () => {
  const s = statSync(new URL('../assets/cat.png', import.meta.url));
  assert.ok(s.size < 400 * 1024, `cat.png is ${s.size} bytes`);
});
