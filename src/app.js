/* UI wiring: stdin, cast, board, editing, answer view, theme, status strip.
   All pasted and generated text is rendered with textContent (board-view.js). */
(function () {
  'use strict';
  var BS = window.WordBoardState;
  var Modes = window.WordModes;
  var View = window.WordBoardView;
  var WARN_AT = 40;
  var THEME_KEY = 'word-board-theme';

  function $(sel) { return document.querySelector(sel); }
  var workspace = $('#workspace');
  var paste = $('#paste');
  var titleInput = $('#title');
  var modesBox = $('#modes');
  var castButton = $('#cast');
  var cleanButton = $('#clean');
  var wordCount = $('#word-count');
  var pasteHint = $('#paste-hint');
  var boardPanel = $('#board');
  var boardTitle = $('#board-title');
  var boardScroll = $('#board-scroll');
  var answerButton = $('#answer-view');
  var collapseButton = $('#collapse-stdin');
  var expandButton = $('#expand-stdin');
  var stdinContent = $('#stdin-content');
  var notice = $('#notice');
  var readyText = $('#ready-text');
  var announcer = $('#announcer');
  var dialog = $('#confirm');
  var retryButton = $('#retry');
  var stopButton = $('#stop');
  var blocker = $('#blocker');
  var downloadButton = $('#download-png');
  var pngHint = $('#png-hint');

  var state = BS.createState();
  var review = false;
  var compact = false;
  var busy = false;
  var controller = null;
  var activeEditor = null;   // { cancel() } of the open inline editor, if any
  var noticeTimer = 0;
  var pending = 0;           // how many skeleton rows to show while a cast runs
  var exporting = false;     // a PNG export is being drawn or offered
  var downloadsGone = false; // downloads capability is unavailable in this view

  /* ── Claude: one sample.json call per cast ──────────────────────
     askClaude(terms, signal) -> Promise<Card[]>; rejects with {code}. */
  // claude.use(name) or null: outside claude.ai there is no `claude` global.
  async function capability(name) {
    if (typeof claude === 'undefined' || !claude || typeof claude.use !== 'function') return null;
    try { return (await claude.use(name)) || null; } catch (err) { return null; }
  }
  async function askClaude(terms, signal) {
    var sample = await capability('sample');
    if (!sample || typeof sample.json !== 'function') throw { code: 'no_sample' };
    if (signal.aborted) throw { code: 'cancelled' };
    var raw = await sample.json(window.WordPrompt.buildPrompt(terms), { signal: signal });
    return window.WordPrompt.normalizeResponse(raw, terms);
  }

  // Codes after which this view can never use Claude: explain, never re-ask by itself.
  var BLOCKING = { no_sample: 1, not_granted: 1, sampling_disabled: 1, not_declared: 1, capability_disabled: 1, capability_removed: 1 };
  var FAILURE_TEXT = {
    rate_limited: 'Claude is busy or your usage limit is reached, wait a little and try again',
    session_expired: 'your claude.ai session expired, sign in again and try again',
    invalid_json: "Claude's answer came back in the wrong shape, try again",
    prompt_too_large: 'too much text for one go, try fewer words',
    refused: 'Claude declined this text, change it and try again',
    empty_completion: 'Claude sent an empty answer, try again with fewer words',
    upstream_error: "couldn't reach Claude, try again"
  };

  /* ── status strip ───────────────────────────────────────────── */
  function announce(text) {
    announcer.textContent = '';
    window.setTimeout(function () { announcer.textContent = text; }, 30);
  }
  // sticky notices (e.g. "Thinking…") stay until replaced; others clear after 6 s.
  // withRetry shows the manual "try again" button beside the notice (it stays put).
  function write(text, kind, sticky, withRetry) {
    notice.textContent = '· ' + text;
    notice.dataset.kind = kind || 'note';
    notice.hidden = false;
    retryButton.hidden = !withRetry;
    announce(text);
    window.clearTimeout(noticeTimer);
    if (!sticky && !withRetry) noticeTimer = window.setTimeout(clearNotice, 6000);
  }
  function clearNotice() {
    window.clearTimeout(noticeTimer);
    notice.hidden = true;
    retryButton.hidden = true;
  }

  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  /* ── paste field ────────────────────────────────────────────── */
  function currentTerms() { return window.parsePaste(paste.innerHTML); }

  function refreshInput() {
    if (!paste.textContent.trim() && paste.childNodes.length) paste.replaceChildren();
    var n = currentTerms().length;
    var hasText = !!paste.textContent.trim();
    wordCount.textContent = plural(n, 'word') + ' found';
    pasteHint.hidden = !(hasText && n === 0);
    castButton.disabled = busy || n === 0;
    cleanButton.disabled = !hasText && !state.cards.length && !titleInput.value;
  }

  function insertFragment(frag) {
    var sel = window.getSelection();
    var range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
    if (!range || !paste.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(paste);
      range.collapse(false);
    }
    range.deleteContents();
    // One paragraph goes in inline, at the caret; several stay blocks.
    var nodes = frag.childNodes.length === 1 && frag.firstChild.nodeName === 'P'
      ? Array.prototype.slice.call(frag.firstChild.childNodes)
      : Array.prototype.slice.call(frag.childNodes);
    var holder = document.createDocumentFragment();
    nodes.forEach(function (n) { holder.appendChild(n); });
    var last = holder.lastChild;
    range.insertNode(holder);
    if (last) {
      var after = document.createRange();
      after.setStartAfter(last);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
    }
  }

  function takeTransfer(data) {
    if (!data) return null;
    var html = data.getData('text/html') || '';
    var plain = data.getData('text/plain') || '';
    if (!html && !plain) return null;
    return window.WordPasteClean.cleanFragment(document, html, plain);
  }

  paste.addEventListener('paste', function (e) {
    e.preventDefault();
    var frag = takeTransfer(e.clipboardData);
    if (frag) insertFragment(frag);
    refreshInput();
  });
  paste.addEventListener('drop', function (e) {
    e.preventDefault();
    var frag = takeTransfer(e.dataTransfer);
    if (!frag) return;
    paste.focus();
    if (document.caretRangeFromPoint) {
      var r = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (r && paste.contains(r.startContainer)) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      }
    }
    insertFragment(frag);
    refreshInput();
  });
  paste.addEventListener('input', refreshInput);

  /* ── modes ──────────────────────────────────────────────────── */
  Modes.MODES.forEach(function (m) {
    var label = document.createElement('label');
    label.className = 'mode';
    var input = document.createElement('input');
    input.type = 'radio';
    input.name = 'mode';
    input.value = m.id;
    input.checked = m.id === state.mode;
    var dot = document.createElement('span');
    dot.className = 'mode__dot';
    dot.setAttribute('aria-hidden', 'true');
    label.append(input, dot, document.createTextNode(m.label));
    modesBox.appendChild(label);
    input.addEventListener('change', function () {
      if (!input.checked) return;
      state = BS.setMode(state, m.id);
      render();
    });
  });

  /* ── title ──────────────────────────────────────────────────── */
  titleInput.addEventListener('input', function () {
    state = BS.setTitle(state, titleInput.value.trim());
    renderTitle();
    refreshInput();
  });

  /* ── rendering ──────────────────────────────────────────────── */
  function renderTitle() { boardTitle.textContent = state.title || 'The word board'; }

  function render(focus) {
    renderTitle();
    review = review && state.cards.length > 0;
    workspace.classList.toggle('is-review', review);
    boardPanel.classList.toggle('is-review', review);
    answerButton.disabled = busy || !state.cards.length;
    answerButton.setAttribute('aria-pressed', String(review));
    workspace.classList.toggle('is-compact', compact && !review);
    stdinContent.hidden = compact;
    expandButton.hidden = !compact;
    collapseButton.setAttribute('aria-expanded', String(!compact));
    expandButton.setAttribute('aria-expanded', String(!compact));
    // An in-flight cast shows skeleton rows; answer view locks editing.
    if (busy) View.renderSkeleton(boardScroll, pending);
    else View.renderBoard(boardScroll, state, review);
    boardPanel.setAttribute('aria-busy', String(busy));
    stopButton.hidden = !busy;
    renderDownload();
    refreshInput();
    if (focus) refocus(focus);
    fitReview();
  }

  function renderDownload() {
    downloadButton.hidden = downloadsGone;
    // While exporting the button keeps focus (aria-disabled); downloadPng ignores repeat clicks.
    downloadButton.disabled = busy || !state.cards.length;
    downloadButton.setAttribute('aria-disabled', String(exporting));
    downloadButton.setAttribute('aria-busy', String(exporting));
    pngHint.hidden = !downloadsGone;
  }

  function refocus(f) {
    var sel = '[data-key="' + CSS.escape(f.key) + '"][data-field="' + f.field + '"]';
    var node = f.add ? boardScroll.querySelector(sel + '[data-add]')
      : boardScroll.querySelector(sel + (f.index != null ? '[data-index="' + f.index + '"]' : ':not([data-add])'));
    if (!node && f.index != null) node = boardScroll.querySelector(sel + '[data-add]');
    if (node) node.focus({ preventScroll: true });
  }

  /* Answer view: largest --rv at which every row fits without scrolling.
     Only in app-height layouts; small screens keep ordinary page scroll. */
  var appHeight = window.matchMedia('(min-width: 900px) and (min-height: 700px)');
  var MIN_SCALE = 0.55;
  function fitReview() {
    boardPanel.style.removeProperty('--rv');
    if (!review || !appHeight.matches) return;
    function fits() { return boardScroll.scrollHeight <= boardScroll.clientHeight; }
    function setScale(v) { boardPanel.style.setProperty('--rv', v.toFixed(3)); }
    setScale(1);
    if (fits()) return;
    setScale(MIN_SCALE);
    if (!fits()) return;
    var lo = MIN_SCALE, hi = 1;
    for (var i = 0; i < 9; i += 1) {
      var mid = (lo + hi) / 2;
      setScale(mid);
      if (fits()) lo = mid; else hi = mid;
    }
    setScale(lo);
  }
  var fitFrame = 0;
  function scheduleFit() {
    window.cancelAnimationFrame(fitFrame);
    fitFrame = window.requestAnimationFrame(fitReview);
  }
  window.addEventListener('resize', scheduleFit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit);

  /* ── editing ────────────────────────────────────────────────── */
  function cardOf(key) {
    for (var i = 0; i < state.cards.length; i++) if (state.cards[i].key === key) return state.cards[i];
    return null;
  }

  function startEdit(node) {
    var key = node.dataset.key, field = node.dataset.field;
    var card = cardOf(key);
    if (!card || review || busy) return;
    var isList = field === 'synonyms' || field === 'antonyms';
    var adding = isList && node.dataset.add === '1';
    var index = isList && !adding ? Number(node.dataset.index) : null;
    var noun = field === 'term' ? 'word' : field === 'definition' ? 'definition' : field.slice(0, -1);
    var old = field === 'term' || field === 'definition' ? card[field] : adding ? '' : card[field][index];
    if (activeEditor) { activeEditor.cancel(); activeEditor = null; }
    activeEditor = View.openEditor(node, {
      value: old,
      multiline: field === 'definition',
      label: (adding ? 'new ' : 'edit ') + noun + ' for ' + card.term + '. Enter saves, Escape cancels',
      placeholder: isList ? (adding ? 'new ' + noun : 'empty removes it') : '',
      onDone: function (value) {
        activeEditor = null;
        if (busy) return;   // never save into a board that a cast is about to replace
        var focus = { key: key, field: field, index: index, add: adding };
        if (value === null) { render(focus); return; }
        value = value.replace(/\s+/g, ' ').trim();
        if (value === old || (field === 'term' && !value) || (adding && !value)) { render(focus); return; }
        if (isList) {
          var next = card[field].slice();
          if (adding) next.push(value); else next[index] = value;
          state = BS.editList(state, key, field, next);
        } else {
          state = BS.editText(state, key, field, value);
        }
        render(focus);
        announce(noun + ' saved');
      }
    });
  }

  boardScroll.addEventListener('click', function (e) {
    var node = e.target.closest('[data-field]');
    if (node && boardScroll.contains(node)) startEdit(node);
  });

  /* ── dialogs ────────────────────────────────────────────────── */
  var dialogResolve = null;
  var returnFocus = null;
  function ask(title, desc, yesLabel, danger) {
    $('#confirm-title').textContent = title;
    $('#confirm-desc').textContent = desc;
    var yes = $('#confirm-yes');
    yes.textContent = yesLabel;
    yes.className = 'btn ' + (danger ? 'btn--danger' : 'btn--go');
    returnFocus = document.activeElement;
    if (typeof dialog.showModal !== 'function') return Promise.resolve(window.confirm(title + '\n' + desc));
    return new Promise(function (resolve) {
      dialogResolve = resolve;
      dialog.showModal();
      $('#confirm-no').focus();
    });
  }
  function settle(answer) {
    var r = dialogResolve;
    dialogResolve = null;
    if (dialog.open) dialog.close();
    if (r) r(answer);
  }
  $('#confirm-no').addEventListener('click', function () { settle(false); });
  $('#confirm-yes').addEventListener('click', function () { settle(true); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) settle(false); });
  dialog.addEventListener('close', function () {
    settle(false);
    var t = returnFocus && document.contains(returnFocus) ? returnFocus : castButton;
    returnFocus = null;
    if (t && typeof t.focus === 'function') t.focus();
  });

  /* ── cast ───────────────────────────────────────────────────── */
  async function cast() {
    if (busy) return;
    var starter = document.activeElement;   // cast button, retry or a shortcut elsewhere
    var terms = currentTerms();
    if (!terms.length) {
      write(paste.textContent.trim() ? 'no bold words found, wrap words in **stars**' : 'paste your text first', 'error');
      return;
    }
    write(plural(terms.length, 'word') + ' found');
    if (terms.length > WARN_AT) {
      var go = await ask('Found ' + terms.length + " words, that's a lot for one go",
        'Claude will handle them in one request, which may take a while. Continue anyway?', 'continue', false);
      if (!go) { write('cast cancelled'); return; }
    }
    if (BS.needsCastConfirm(state)) {
      var replace = await ask('Replace your edited board?',
        'cast rebuilds every card from the text and drops the edits you made.', 'replace', true);
      if (!replace) { write('cast cancelled, your edits are kept'); return; }
    }
    // Each request owns its controller. A result is applied only while it is
    // still the current request and was not aborted (clean, or a newer cast).
    var my = new AbortController();
    controller = my;
    busy = true;
    pending = Math.min(terms.length, 8);
    if (activeEditor) { activeEditor.cancel(); activeEditor = null; }   // editing locks while Claude works
    var hadFocus = starter === castButton || starter === retryButton;
    render();
    if (hadFocus) stopButton.focus();   // the control that started it is now disabled or gone
    write('Thinking…', 'note', true);
    function current() { return controller === my && !my.signal.aborted; }
    try {
      var cards = await askClaude(terms, my.signal);
      if (!current()) return;
      state = BS.setCards(state, cards);
      compact = true;
      busy = false;
      controller = null;
      blocker.hidden = true;
      // stdin collapses now, so focus inside it would be lost too.
      var lost = focusLost() || stdinContent.contains(document.activeElement);
      render();
      if (lost) (boardScroll.querySelector('[data-field]') || answerButton).focus();
      var failed = cards.filter(function (c) { return c.failed; }).length;
      write(failed ? 'done, ' + plural(failed, 'card') + " couldn't be generated" : 'done', failed ? 'error' : 'note');
    } catch (err) {
      if (!current()) return;
      busy = false;
      controller = null;
      var lostFocus = focusLost();
      render();
      var code = err && typeof err.code === 'string' ? err.code : 'upstream_error';
      if (code === 'cancelled' || (err && err.name === 'AbortError')) {
        clearNotice();
        if (lostFocus) castControl().focus();
        return;
      }
      if (BLOCKING[code]) {
        blocker.hidden = false;
        write("Claude isn't available here, see the note on the board", 'error', true);
        if (lostFocus) castControl().focus();
        return;
      }
      write(FAILURE_TEXT[code] || FAILURE_TEXT.upstream_error, 'error', true, true);
      if (lostFocus) retryButton.focus();
    }
  }

  // True when focus sits on Stop (about to be hidden) or nowhere: only then
  // does the end of a cast move focus, never away from a place the user chose.
  function focusLost() {
    var a = document.activeElement;
    return !a || a === document.body || a === stopButton;
  }
  // The visible control that starts a cast: the button, or the stdin rail when collapsed.
  function castControl() { return compact ? expandButton : castButton; }

  // Drop the in-flight request (if any) so its result is never applied.
  function abortCast() {
    if (controller) controller.abort();
    controller = null;
    busy = false;
  }

  castButton.addEventListener('click', function () { cast(); });
  retryButton.addEventListener('click', function () { cast(); });
  stopButton.addEventListener('click', function () {
    if (!busy) return;
    abortCast();
    render();
    write('stopped, the board is unchanged');
    castControl().focus();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !dialog.open) {
      if (e.target.closest && e.target.closest('.edit-input')) return;
      e.preventDefault();
      if (!castButton.disabled) cast();
    }
  });

  /* ── clean ──────────────────────────────────────────────────── */
  cleanButton.addEventListener('click', async function () {
    var ok = await ask('Clean everything?', 'This clears the pasted text, the exercise name and every card. It cannot be undone.', 'clean', true);
    if (!ok) return;
    abortCast();
    paste.replaceChildren();
    titleInput.value = '';
    state = BS.setMode(BS.createState(), state.mode);
    review = false;
    compact = false;
    render();
    write('board cleaned');
    paste.focus();
  });

  /* ── answer view, collapse ──────────────────────────────────── */
  answerButton.addEventListener('click', function () {
    review = !review;
    render();
    write(review ? 'answer view on, editing locked' : 'answer view off, editing unlocked');
  });
  collapseButton.addEventListener('click', function () { compact = true; render(); expandButton.focus(); });
  expandButton.addEventListener('click', function () { compact = false; render(); paste.focus(); });

  /* ── download PNG ───────────────────────────────────────────── */
  var measureCtx = null;
  // Measures for WordPng.layoutBoard: canvas measureText in exactly the fonts
  // renderPng draws (body 16px for widthOf, plus bold list, word and title),
  // taken only after the web fonts are in, so the layout matches the drawing.
  async function measurer() {
    var F = window.WordPng.FONTS;
    await window.WordPng.loadFonts();
    if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
    function by(font) {
      return function (text) { measureCtx.font = font; return measureCtx.measureText(text).width; };
    }
    return { widthOf: by(F.body), measures: { list: by(F.list), word: by(F.word), title: by(F.title) } };
  }

  function noDownloads() {
    var hadFocus = document.activeElement === downloadButton;
    downloadsGone = true;
    renderDownload();
    if (hadFocus) answerButton.focus();
    write("PNG download isn't available here, use answer view and take a screenshot", 'note', true);
  }

  async function downloadPng() {
    if (busy || exporting || !state.cards.length) return;
    exporting = true;
    renderDownload();
    try {
      var downloads = await capability('downloads');
      if (!downloads || typeof downloads.save !== 'function') { exporting = false; noDownloads(); return; }
      write('drawing the PNG…', 'note', true);
      var m = await measurer();
      var title = state.title || 'The word board';
      var layout = window.WordPng.layoutBoard(state.cards, state.mode, title, m.widthOf, m.measures);
      var theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      var blob = await window.WordPng.renderPng(layout, theme);
      clearNotice();
      var result = await downloads.save({ filename: window.WordPng.fileName(state.title), data: blob });
      if (result && result.status === 'saved') write('PNG saved');
    } catch (err) {
      var code = err && typeof err.code === 'string' ? err.code : '';
      if (code === 'declined') clearNotice();
      else if (code === 'rate_limited') write('a save prompt is already open, try again in a moment', 'error');
      else if (code === 'too_large') write('this board is too large for one PNG, take a screenshot instead', 'error');
      else if (code === 'bad_request' || code === 'transform_error' || !code) write("couldn't make the PNG, try again", 'error');
      else { exporting = false; noDownloads(); return; }   // unavailable and unknown codes: hide the save UI
    }
    exporting = false;
    renderDownload();
  }
  downloadButton.addEventListener('click', function () { downloadPng(); });

  /* ── theme ──────────────────────────────────────────────────── */
  function themeColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F7F0E5' : '#19152E');
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeColor(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (err) { /* preference stays for this tab */ }
  }
  var currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  themeColor(currentTheme);
  document.querySelectorAll('input[name="theme"]').forEach(function (input) {
    input.checked = input.value === currentTheme;
    input.addEventListener('change', function () { if (input.checked) applyTheme(input.value); });
  });

  /* ── test hook (harmless in the published page) ─────────────── */
  window.__wordBoard = {
    getState: function () { return state; },
    setPasteHtml: function (html) {
      paste.replaceChildren(window.WordPasteClean.cleanFragment(document, html, ''));
      refreshInput();
    }
  };

  readyText.textContent = 'ready when you are';
  render();
  // Hide the PNG button up front when this view cannot save files.
  capability('downloads').then(function (d) {
    if (!d && !downloadsGone) { downloadsGone = true; renderDownload(); }
  });
})();
