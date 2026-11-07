import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = new URL('../dist/word-board.html', import.meta.url);

test('build writes one self-contained dist/word-board.html', () => {
  execFileSync(process.execPath, ['build.mjs'], { cwd: root, stdio: 'pipe' });
  const size = statSync(out).size;
  assert.ok(size < 16 * 1024 * 1024, `dist is ${size} bytes`);
  const html = readFileSync(out, 'utf8');

  assert.ok(!html.includes('src="assets/'), 'asset src left un-inlined');
  assert.ok(!/url\(["']?assets\//.test(html), 'CSS asset url left un-inlined');
  assert.ok(!/<script[^>]*\ssrc=/i.test(html), 'external <script src=> left in output');

  const links = html.match(/<link\b[^>]*>/gi) || [];
  for (const l of links) {
    if (/rel=["']?stylesheet/i.test(l)) {
      assert.match(l, /href="https:\/\/fonts\.googleapis\.com\//, `foreign stylesheet: ${l}`);
    }
  }

  assert.ok(html.includes('Definition only'), 'mode labels missing');
  assert.ok(html.includes('cast'), 'cast button missing');
});

test('dev-only Claude stub never reaches dist', () => {
  const html = readFileSync(out, 'utf8');
  assert.ok(!html.includes('stub-claude'), 'stub-claude referenced in dist');
  assert.ok(!html.includes('__stubCalls'), 'stub code inlined into dist');
});

test('inlined scripts cannot close their own <script> element early', () => {
  const html = readFileSync(out, 'utf8');
  const opens = (html.match(/<script\b/gi) || []).length;
  const closes = (html.match(/<\/script>/gi) || []).length;
  assert.equal(opens, closes);
});
