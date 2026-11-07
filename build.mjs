// Build: src/index.template.html -> dist/word-board.html, one self-contained page.
// Inlines <link rel="stylesheet" href="*.css"> and <script src="*.js"> from src/,
// and turns every assets/... image reference into a base64 data URI.
// The only external reference left is the Google Fonts stylesheet.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'dist', 'word-board.html');

// Scripts must appear in the template in this dependency order.
const ORDER = ['parse.js', 'modes.js', 'board-state.js', 'prompt.js', 'png-layout.js', 'png-render.js',
  'paste-clean.js', 'board-view.js', 'app.js'];

const MIME = { '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

function dataUri(rel) {
  const type = MIME[extname(rel).toLowerCase()];
  if (!type) throw new Error(`build: unsupported asset type ${rel}`);
  return `data:${type};base64,${readFileSync(join(ROOT, rel)).toString('base64')}`;
}

function inlineAssets(text) {
  const cache = new Map();
  return text.replace(/assets\/[A-Za-z0-9_\/.-]+\.(?:png|svg|jpg|webp)/g, (rel) => {
    if (!cache.has(rel)) cache.set(rel, dataUri(rel));
    return cache.get(rel);
  });
}

let html = readFileSync(join(SRC, 'index.template.html'), 'utf8');

// CSS first, so its asset urls get inlined with the markup's.
html = html.replace(/<link rel="stylesheet" href="([\w.-]+\.css)">/g, (_, file) => {
  const css = readFileSync(join(SRC, file), 'utf8').replace(/<\/style/gi, '<\\/style');
  return `<style>\n${css}\n</style>`;
});
html = inlineAssets(html);

const seen = [];
html = html.replace(/<script src="([\w.-]+\.js)"><\/script>/g, (_, file) => {
  seen.push(file);
  const js = readFileSync(join(SRC, file), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script>\n${js}\n</script>`;
});
if (seen.join() !== ORDER.join()) {
  throw new Error(`build: template scripts ${seen.join(', ')} do not match ${ORDER.join(', ')}`);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log(`build: wrote ${OUT} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
