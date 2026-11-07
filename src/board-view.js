/* Board rendering and the inline editor. DOM only; every piece of word,
   definition or list text goes through textContent. Editable targets carry
   data-key / data-field / data-index so app.js can delegate clicks. */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WordBoardView = api;
})(typeof self !== 'undefined' ? self : this, function (root) {
  var SVG = 'http://www.w3.org/2000/svg';

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }

  // An editable target: a button in normal view, plain text in answer view.
  function target(review, text, key, field, index, extraClass) {
    if (review) return el('span', extraClass || '', text);
    var b = el('button', 'editable' + (extraClass ? ' ' + extraClass : ''), text);
    b.type = 'button';
    b.dataset.key = key;
    b.dataset.field = field;
    if (index != null) b.dataset.index = String(index);
    return b;
  }

  // S-shaped curve from the word box (left, upper) to the card (right, lower).
  function arrow() {
    var svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'arrow');
    svg.setAttribute('viewBox', '0 0 64 48');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var curve = document.createElementNS(SVG, 'path');
    curve.setAttribute('d', 'M4 12 C 30 12, 30 36, 56 36');
    var head = document.createElementNS(SVG, 'path');
    head.setAttribute('d', 'M49 30 L57 36 L49 42');
    svg.appendChild(curve);
    svg.appendChild(head);
    return svg;
  }

  function list(card, field, label, kind, review) {
    var p = el('p', 'list list--' + kind);
    p.appendChild(el('span', 'list__label', label + ':'));
    var items = card[field] || [];
    if (!items.length) p.appendChild(el('span', 'list__none', 'none'));
    items.forEach(function (item, i) {
      // The comma lives inside the item's wrapper so it never wraps alone.
      var wrap = el('span', 'list__item');
      var t = target(review, item, card.key, field, i);
      if (!review) t.setAttribute('aria-label', label.slice(0, -1).toLowerCase() + ' ' + (i + 1) + ': ' + item + ', edit');
      wrap.appendChild(t);
      if (i < items.length - 1) wrap.appendChild(el('span', 'list__sep', ','));
      p.appendChild(wrap);
    });
    if (!review) {
      var add = el('button', 'list__add', '+ add');
      add.type = 'button';
      add.dataset.key = card.key;
      add.dataset.field = field;
      add.dataset.add = '1';
      add.setAttribute('aria-label', 'add ' + label.slice(0, -1).toLowerCase() + ' to ' + card.term);
      p.appendChild(add);
    }
    return p;
  }

  function rowFor(card, mode, review) {
    var li = el('li', 'row');
    var word = el('div', 'word');
    var term = target(review, card.term, card.key, 'term', null, 'editable--block');
    if (!review) term.setAttribute('aria-label', 'word: ' + card.term + ', edit');
    word.appendChild(term);
    li.appendChild(word);
    li.appendChild(arrow());

    var box = el('div', 'card');
    var defText, defClass = 'editable--block';
    if (card.definition) defText = card.definition;
    else if (card.failed) { defText = "couldn't generate, retry"; defClass += ' card__failed'; }
    else { defText = 'no definition'; defClass += ' list__none'; }
    var def = el('div', 'card__def');
    var dt = target(review, defText, card.key, 'definition', null, defClass);
    if (!review) dt.setAttribute('aria-label', 'definition of ' + card.term + ': ' + defText + ', edit');
    def.appendChild(dt);
    box.appendChild(def);
    if (root.WordModes.showsSynonyms(mode)) box.appendChild(list(card, 'synonyms', 'Synonyms', 'syn', review));
    if (root.WordModes.showsAntonyms(mode)) box.appendChild(list(card, 'antonyms', 'Antonyms', 'ant', review));
    li.appendChild(box);
    return li;
  }

  function emptyState() {
    var box = el('div', 'empty');
    var art = el('pre', '', '  /\\_/\\\n ( o.o )\n  > ^ <');
    art.setAttribute('aria-hidden', 'true');
    var p = el('p');
    p.append('Paste your text, then run ', el('code', '', 'cast'));
    box.append(art, p);
    return box;
  }

  function renderBoard(container, state, review) {
    var nodes = [];
    if (!state.cards.length) nodes.push(emptyState());
    else {
      var ul = el('ul', 'rows');
      ul.setAttribute('aria-label', 'words');
      state.cards.forEach(function (c) { ul.appendChild(rowFor(c, state.mode, review)); });
      nodes.push(ul);
    }
    container.replaceChildren.apply(container, nodes);
  }

  /* Swap `node` for an input. Enter saves, Esc cancels, leaving the field saves.
     onDone(value | null): null means cancelled. Returns { input, cancel }. */
  function openEditor(node, opts) {
    var input = el(opts.multiline ? 'textarea' : 'input', 'edit-input');
    if (!opts.multiline) input.type = 'text';
    input.value = opts.value || '';
    input.setAttribute('aria-label', opts.label);
    if (opts.placeholder) input.placeholder = opts.placeholder;
    var finished = false;
    function finish(value) {
      if (finished) return;
      finished = true;
      opts.onDone(value);
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); finish(input.value); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(null); }
    });
    input.addEventListener('blur', function () { finish(input.value); });
    node.replaceWith(input);
    input.focus();
    if (input.select) input.select();
    // cancel(): close silently, without saving and without calling onDone.
    return { input: input, cancel: function () { finished = true; } };
  }

  return { renderBoard: renderBoard, openEditor: openEditor };
});
