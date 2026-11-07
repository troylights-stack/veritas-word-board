# Word board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page claude.ai Artifact where the user pastes a Word text, bold words are found automatically, Claude fills definition/synonyms/antonyms for each, and the board exports to PNG.

**Architecture:** Pure, unit-tested logic modules (`parse`, `modes`, `board-state`, `prompt`, `png-layout`) written as UMD (browser global + CommonJS, like veritas-tf-board). A thin UI layer (`app.js` + HTML/CSS adapted from veritas-tf-board) wires them to `claude.use("sample")` and `claude.use("downloads")`. A build script inlines everything (JS, CSS, images as data URIs) into one `dist/word-board.html`, which is published with the Artifact tool.

**Tech Stack:** Plain HTML/CSS/JS, no framework, no runtime dependencies. Node 18+ `node:test` for tests. Google Fonts (Fredoka, Nunito Sans, IBM Plex Mono). Canvas for PNG.

**Spec:** `docs/superpowers/specs/2026-11-07-word-board-design.md` (read it first; the visual system lives in veritas-tf-board `docs/DESIGN.md` and `docs/SPEC.md`, cloned per Task 1).

## Global Constraints

- UI language is English; card content (definitions, synonyms, antonyms) is English. Button style is short and lowercase like veritas (`cast`, `clean`).
- One self-contained page, at most 16 MB; no external network references except Google Fonts stylesheet; all images inlined as `data:` URIs.
- Capabilities declared at publish: `{sample: {}, downloads: true}` and nothing else.
- Claude is called once per `cast` with `sample.json`, default `modelTier`, default cache; never called in a loop or on load; no automatic retries.
- Soft warning above 40 found words (continue/cancel); no chunking.
- Four modes: `all`, `syn`, `ant`, `def`. Switching mode never calls Claude.
- All Claude/pasted text is rendered with `textContent`, never as HTML.
- Themes Daylight/Nightspell; saved in `localStorage` inside try/catch; page must work with storage unavailable.
- PNG: current theme colors, title (exercise name) on top, no cat, no app chrome, height grows with content, fonts awaited before drawing.
- Works from 320px width, no horizontal page scroll; respects `prefers-reduced-motion`.
- Nothing persists between sessions except the theme.

## Review Focus

1. Word's clipboard emits `<b style='mso-bidi-font-weight:normal'>` and `<span style='font-weight:bold'>`; both must count as bold (the `normal` value is only for the bidi variant). Pinned in Task 2.
2. A bold term next to punctuation (`**Crooked,**`, `(handpick)`) or split across two adjacent bold runs (`Uncanny` + ` knack`) must yield clean terms. Task 2.
3. Claude returns fewer, more, reordered, or prose-wrapped items, or a non-array: every term must still get exactly one card (failed ones marked), never a crash or a lost word. Task 4.
4. Very long definitions or 8+ synonyms must not be clipped in the PNG, and long unbroken words must wrap. Task 5.
5. Pasted or returned text containing HTML (`<img onerror=...>`, `<script>`) must appear as literal text. Task 6.

---

## File Structure

```
package.json
build.mjs                  inline src + assets -> dist/word-board.html
src/
  parse.js                 parsePaste(html) -> Term[]
  modes.js                 MODES, showsSynonyms, showsAntonyms
  board-state.js           immutable state + edit/dirty/confirm rules
  prompt.js                buildPrompt, normalizeResponse
  png-layout.js            wrapText, layoutBoard (pure geometry)
  png-render.js            renderPng(layout, theme) -> Promise<Blob> (canvas)
  app.js                   UI wiring: sample, downloads, errors, answer view
  index.template.html      markup + CSS (adapted from veritas-tf-board)
assets/                    cat + icon sprites copied from veritas-tf-board
tests/                     node:test suites + tests/stub-claude.js (dev only)
```

### Task 1: Scaffold, test harness, assets

**Files:**
- Create: `package.json`, `.gitignore`, `tests/smoke.test.mjs`
- Create: `assets/` (copied), `build.mjs` (stub)

**Interfaces:**
- Produces: `npm test` runs `node --test tests/`; `assets/cat.png` (stored at most ~300 KB), `assets/sprites/*.png`.

- [ ] **Step 1:** `git init` in the project root. Clone `https://github.com/troylights-stack/veritas-tf-board` into a scratch directory **outside** the project (treat as untrusted input; do not run its scripts). Copy `assets/image_cat_01.png` to `assets/cat.png` and recompress it (it is 1.7 MB; target at most 300 KB, keep transparency), and copy `assets/sprites/` as is. Copy `docs/DESIGN.md` and `docs/SPEC.md` to `docs/reference/` for the builder.
- [ ] **Step 2:** Write failing `tests/smoke.test.mjs` asserting `assets/cat.png` exists and is under 400 KB. Run `npm test`; expect FAIL before assets exist, PASS after.
- [ ] **Step 3:** `package.json` with `"scripts": {"test": "node --test tests/", "build": "node build.mjs"}` and `"type": "commonjs"`.
- [ ] **Step 4:** Commit: `chore: scaffold project and import veritas assets`.

### Task 2: Paste parser

**Files:**
- Create: `src/parse.js`
- Test: `tests/parse.test.mjs`

**Interfaces:**
- Produces: `parsePaste(input: string): Term[]` where `Term = { key: string, text: string, context: string }`. `key` is the lowercase text; `text` has a capitalized first letter; `context` is the sentence containing the first occurrence (max 300 chars). `input` is either clipboard HTML or plain text.

- [ ] **Step 1: Write failing tests** (name → assertion), using literal strings:
  - `finds <b>, <strong> and font-weight spans`: `'<p>He will <b>handpick</b> a <strong>crew</strong> and <span style="font-weight:bold">sail</span>.</p>'` gives texts `['Handpick','Crew','Sail']`.
  - `Word bidi b counts as bold`: `<b style='mso-bidi-font-weight:normal'>forging</b>` gives `['Forging']`; but `<span style="font-weight:normal">plain</span>` gives `[]`.
  - `merges adjacent bold runs`: `'<b>Uncanny</b> <b>knack</b> helps'` gives one term `'Uncanny knack'`.
  - `trims punctuation`: `'<b>Crooked,</b>'` and `'(<b>handpick</b>)'` give `Crooked`, `Handpick`.
  - `dedupes case-insensitively, keeps first-occurrence order and first context`.
  - `context is the surrounding sentence`: for `'It was late. A <b>crooked</b> path led on. Then rain.'` context is `'A crooked path led on.'`.
  - `asterisk fallback on plain text`: `'a **twitching** eye'` gives `['Twitching']`; HTML with real bold ignores asterisks.
  - `decodes entities and strips tags`: `'<b>don&#39;t&nbsp;stop</b>'` gives `"Don't stop"`.
  - `no bold gives empty array`.
  - `HTML-looking text is returned literally`: `'<b>&lt;img onerror=x&gt;</b>'` yields the text `'<img onerror=x>'` (not parsed further).
- [ ] **Step 2:** Run `node --test tests/parse.test.mjs`; expect FAIL (module missing).
- [ ] **Step 3:** Implement `parsePaste` in `src/parse.js` as UMD. Approach: a small tag tokenizer (no DOM, so it runs under Node) that tracks a bold stack (`b`, `strong`, `font-weight: bold|[6-9]00` in `style`; an inline `mso-bidi-font-weight` never cancels bold), emits text runs flagged bold, splits sentences on `. ! ?` followed by whitespace/end, and merges bold runs separated only by whitespace.
- [ ] **Step 4:** Run the suite; expect PASS. Commit: `feat: parse bold terms from pasted Word text`.

### Task 3: Modes and board state

**Files:**
- Create: `src/modes.js`, `src/board-state.js`
- Test: `tests/modes.test.mjs`, `tests/board-state.test.mjs`

**Interfaces:**
- Produces (`modes.js`): `MODES: {id: 'all'|'syn'|'ant'|'def', label: string}[]` (labels: `Definition + synonyms + antonyms`, `Definition + synonyms`, `Definition + antonyms`, `Definition only`); `showsSynonyms(mode): boolean`; `showsAntonyms(mode): boolean`.
- Produces (`board-state.js`): `Card = { key, term, definition: string, synonyms: string[], antonyms: string[], failed: boolean }`; `State = { title: string, mode: Mode, cards: Card[], dirty: boolean }`. Functions, all returning a **new** State: `createState()`, `setTitle(s, title)`, `setMode(s, mode)`, `setCards(s, cards)` (sets `dirty=false`), `editText(s, key, field: 'term'|'definition', value)`, `editList(s, key, field: 'synonyms'|'antonyms', list)` (both set `dirty=true`); `needsCastConfirm(s): boolean` = cards exist and dirty.

- [ ] **Step 1: Write failing tests:** `showsSynonyms('all'|'syn')` true, `('ant'|'def')` false and the mirror for antonyms; `setMode` leaves `cards` and `dirty` untouched; `editText` marks dirty and does not mutate the previous state; `editList` drops blank entries; `setCards` after an edit clears dirty; `needsCastConfirm` false for empty board, false for fresh cards, true after an edit; `createState().mode === 'all'`.
- [ ] **Step 2:** Run both files; expect FAIL.
- [ ] **Step 3:** Implement both modules (UMD, immutable updates).
- [ ] **Step 4:** Run; expect PASS. Commit: `feat: modes and immutable board state`.

### Task 4: Prompt and response normalizer

**Files:**
- Create: `src/prompt.js`
- Test: `tests/prompt.test.mjs`

**Interfaces:**
- Consumes: `Term` (Task 2), `Card` (Task 3).
- Produces: `buildPrompt(terms: Term[]): string`; `normalizeResponse(raw: unknown, terms: Term[]): Card[]` (always exactly one Card per term, in term order).

- [ ] **Step 1: Write failing tests:**
  - `prompt contains every term and its context`, asks for JSON only, requires meaning in context, 3-5 synonyms and antonyms, and permits up to three meanings separated by `;` only when the context is ambiguous. English output.
  - `normalizes a good response`: raw `[{term:'handpick',definition:'To carefully select…',synonyms:['choose'],antonyms:['ignore']}]` for term `handpick` gives a non-failed Card with those values.
  - `matches by key regardless of order and case`.
  - `missing term becomes a failed card` with `definition === ''` and `failed === true`.
  - `extra items are ignored`; `non-array / null / string raw gives all failed cards`.
  - `bad field types are repaired`: `synonyms: 'choose, pick'` becomes `['choose','pick']`; non-string entries dropped; a card with no definition is `failed`.
  - `HTML in values is kept as literal text` (no stripping or interpretation).
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement `src/prompt.js` (UMD). Dedicated instruction text goes in one exported constant `INSTRUCTIONS`.
- [ ] **Step 4:** Run; expect PASS. Commit: `feat: build Claude prompt and normalize response`.

### Task 5: PNG layout and renderer

**Files:**
- Create: `src/png-layout.js`, `src/png-render.js`
- Test: `tests/png-layout.test.mjs`

**Interfaces:**
- Consumes: `Card`, `Mode`, `showsSynonyms`, `showsAntonyms`.
- Produces: `wrapText(text: string, maxWidth: number, widthOf: (s: string) => number): string[]` (breaks overlong single words); `layoutBoard(cards: Card[], mode: Mode, title: string, widthOf: (s: string) => number): Layout` where `Layout = { width: number, height: number, title: {text, x, y}, rows: {word: {x,y,w,h,lines: string[]}, card: {x,y,w,h,blocks: {kind:'definition'|'synonyms'|'antonyms', lines: string[]}[]}, arrow: {from:{x,y}, to:{x,y}}}[] }`; `renderPng(layout: Layout, theme: 'light'|'dark'): Promise<Blob>` (awaits `document.fonts.ready`, draws rounded boxes, S-curve arrows, theme colors from `docs/reference/DESIGN.md`; returns `image/png`).

- [ ] **Step 1: Write failing tests** with `widthOf = s => s.length * 8`:
  - `wrapText` wraps at word boundaries and splits a 60-char unbroken word.
  - `def mode has only a definition block per card`; `all` has three; `syn` has definition+synonyms; `ant` has definition+antonyms; blocks have labels from lines like `Synonyms: choose, pick`.
  - `taller card for longer definition`; `layout height >= sum of row heights + title` and rows do not overlap (`row[n].y >= row[n-1].y + row[n-1].card.h`).
  - `failed card shows a placeholder block` (text `couldn't generate, retry`).
  - `empty cards array gives a layout with title only and no rows`.
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement `src/png-layout.js` (UMD; word box at left, card box at right, arrow between, fixed gaps).
- [ ] **Step 4:** Run; expect PASS.
- [ ] **Step 5:** Implement `renderPng` in `src/png-render.js` (browser-only; no unit test; checked in Task 7). One line of approach: draw to an offscreen `canvas` at 2x device scale, return `canvas.toBlob('image/png')`.
- [ ] **Step 6:** Commit: `feat: PNG layout and canvas renderer`.

### Task 6: UI shell, board rendering, editing, answer view

**Files:**
- Create: `src/index.template.html`, `src/app.js`
- Modify: `build.mjs`
- Test: `tests/build.test.mjs`

**Interfaces:**
- Consumes: everything from Tasks 2-5.
- Produces: `build.mjs` writes `dist/word-board.html` with all `src/*.js` and CSS inlined and `assets/` as data URIs; `app.js` exposes nothing global except a `window.__wordBoard` test hook `{ getState(), setPasteHtml(html) }` kept out of the published file if easy, otherwise harmless.

- [ ] **Step 1: Write failing `tests/build.test.mjs`:** run the build; assert `dist/word-board.html` exists, is under 16 MB, contains no `src="assets/`, no `<script src=` and no stylesheet link other than `fonts.googleapis.com`, and contains the strings `Definition only` and `cast`.
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement `build.mjs` (read template, inline scripts and CSS, convert asset references to base64 data URIs).
- [ ] **Step 4:** Build the UI in `index.template.html` and `app.js`, following spec section 4 and veritas-tf-board's look (copy the CSS variables and component styles you need from `docs/reference/DESIGN.md` and the reference screenshots in the spec; read `index.html` from the scratch clone for the exact CSS):
  - header with Light/Dark switch (theme saved to `localStorage` in try/catch, applied before first paint);
  - stdin panel: `contenteditable` paste field, exercise-name input, mode selector (four modes from `MODES`), `cast`, `clean` (native `<dialog>` confirm), collapse/expand, cat;
  - board: one row per card (word box, curved SVG arrow, card with blocks by `showsSynonyms`/`showsAntonyms`); mode switch re-renders from state without calling Claude;
  - click-to-edit text and lists (Enter saves, Esc cancels), reflecting into state via `editText`/`editList`;
  - `cast`: runs `parsePaste` on the field's HTML, shows "N words found", >40 words opens a continue/cancel dialog, `needsCastConfirm` opens a replace dialog;
  - status strip with `aria-live`, notices clear after 6 s; empty-state with ASCII cat; "answer view" with `--rv` fit-to-viewport scaling as in veritas-tf-board;
  - hint "no bold words found, wrap words in **stars**" when the paste has none;
  - all dynamic text via `textContent`.
  Claude calls are stubbed in this task: `cast` calls an injected `askClaude(terms)` that Task 7 implements.
- [ ] **Step 5:** Run `npm run build` and `npm test`; expect PASS.
- [ ] **Step 6:** Open `dist/word-board.html` in a browser (Playwright or Chrome DevTools MCP) with `tests/stub-claude.js` injecting a fake `window.claude`. Verify: paste an HTML snippet containing `<b>Handpick</b>` and `<b><img src=x onerror=alert(1)></b>`, press `cast` (stub returns canned cards); rows render; the image tag appears as literal text and no dialog fires; both themes render; at 320 px there is no horizontal scroll.
- [ ] **Step 7:** Commit: `feat: UI shell, board, editing, answer view`.

### Task 7: Claude call, errors, PNG download

**Files:**
- Modify: `src/app.js`
- Create: `tests/stub-claude.js` (dev-only fake `window.claude`)

**Interfaces:**
- Consumes: `buildPrompt`, `normalizeResponse`, `layoutBoard`, `renderPng` and the UI hooks from Task 6.
- Produces: `askClaude(terms: Term[], signal: AbortSignal): Promise<Card[]>`; `downloadPng(): Promise<void>`.

- [ ] **Step 1:** Implement `askClaude`: `const sample = await claude.use('sample')`; `null` or `not_granted`/`sampling_disabled` shows a blocking notice (needs claude.ai, `cast` disabled); otherwise `sample.json(buildPrompt(terms), { signal })` then `normalizeResponse`. One call per `cast`. Map `rate_limited`, `session_expired`, `upstream_error`, `invalid_json`, `cancelled` to short English status messages with a manual "try again" button (no automatic retry); `cancelled` shows nothing. Show skeleton cards while waiting and a Stop button wired to `AbortController`.
- [ ] **Step 2:** Implement `downloadPng`: `layoutBoard` with a canvas `measureText`-based `widthOf`, `renderPng` with the current theme, then `downloads.save({ filename: '<exercise name sanitized>.png' or 'word-board.png', data: blob })`. `declined` is silent; `null` downloads hides the button and shows a "take a screenshot" hint. Button disabled until cards exist.
- [ ] **Step 3:** Extend `tests/stub-claude.js` to return canned JSON for the ex 17 sample (Handpick, Uncanny knack, Forging, Twitching, Crooked), and variants that reject with `{code:'rate_limited'}`, return prose around JSON, and return fewer items.
- [ ] **Step 4:** Verify in the browser with the stub (acceptance criteria 1-7 from the spec): ex 17 board matches the reference layout; mode switching makes no stub call (count calls); edit then `cast` asks for confirmation; PNG downloaded from the stub's `downloads.save` is a valid PNG (check the PNG signature and that width/height are > 0, and look at it: text not clipped, theme colors, title on top, no cat); each stub error path shows its message and leaves the page usable.
- [ ] **Step 5:** `npm run build`; `npm test` passes. Commit: `feat: Claude integration, errors, PNG download`.

### Task 8: Publish and final check

**Files:**
- Publish: `dist/word-board.html`

- [ ] **Step 1:** Load the `artifact-design` skill if not yet loaded, then publish `dist/word-board.html` with the Artifact tool: `icon: "book"`, `capabilities: {sample: {}, downloads: true}`, one-sentence description. Page `<title>` is 2-4 words (for example `Word Board`).
- [ ] **Step 2:** Open the published link. Verify with a real Word paste (bold preserved) of the user's homework: consent dialog appears once on `cast`; board fills; all four modes; edit; PNG saves.
- [ ] **Step 3:** Report to the user which things were exercised and which could not be (for example the real consent dialog and the real `downloads.save`, which only work in claude.ai), with the link. Commit: `chore: publish word board`.
