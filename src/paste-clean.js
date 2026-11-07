/* Paste sanitizer for the stdin field. Turns clipboard HTML (or plain text)
   into a clean DocumentFragment that keeps only paragraphs, line breaks and
   bold. The raw HTML is parsed with DOMParser, whose document is inert
   (no scripts run, no images load); the output is rebuilt from scratch with
   createElement/createTextNode, so no markup from the clipboard survives. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WordPasteClean = api;
})(typeof self !== 'undefined' ? self : this, function () {
  var BLOCK = { P: 1, DIV: 1, LI: 1, UL: 1, OL: 1, TR: 1, TABLE: 1, BLOCKQUOTE: 1, PRE: 1, SECTION: 1,
    ARTICLE: 1, DD: 1, DT: 1, H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1 };
  var SKIP = { STYLE: 1, SCRIPT: 1, HEAD: 1, TITLE: 1, META: 1, LINK: 1, TEMPLATE: 1, NOSCRIPT: 1,
    IFRAME: 1, OBJECT: 1, EMBED: 1, SVG: 1, MATH: 1, XML: 1, IMG: 1, VIDEO: 1, AUDIO: 1, CANVAS: 1 };

  // Same rule as parse.js: an explicit font-weight wins; otherwise <b>/<strong>.
  // Word's mso-bidi-font-weight is not font-weight, so its <b> stays bold.
  function boldOf(el, inherited) {
    var fw = el.style && el.style.fontWeight ? String(el.style.fontWeight) : '';
    if (/^(bold|bolder|[6-9]00)$/i.test(fw)) return true;
    if (/^(normal|lighter|[1-5]00)$/i.test(fw)) return false;
    var tag = el.tagName.toUpperCase();
    return tag === 'B' || tag === 'STRONG' ? true : inherited;
  }

  function builder(doc) {
    var out = doc.createDocumentFragment();
    var cur = null;
    function para() {
      if (!cur) { cur = doc.createElement('p'); out.appendChild(cur); }
      return cur;
    }
    return {
      text: function (t, bold) {
        t = t.replace(/[ \t\n\r\f]+/g, ' ');
        if (!t || (!cur && !t.trim())) return;
        var p = para();
        var last = p.lastChild;
        if (bold) {
          if (!last || last.nodeName !== 'B') { last = doc.createElement('b'); p.appendChild(last); }
          last.appendChild(doc.createTextNode(t));
        } else {
          p.appendChild(doc.createTextNode(t));
        }
      },
      br: function () { para().appendChild(doc.createElement('br')); },
      end: function () { cur = null; },
      done: function () {
        Array.prototype.slice.call(out.childNodes).forEach(function (p) {
          if (!p.textContent.trim()) out.removeChild(p);
        });
        out.normalize();
        return out;
      }
    };
  }

  function walk(node, bold, b) {
    for (var c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { b.text(c.nodeValue, bold); continue; }
      if (c.nodeType !== 1) continue;
      var tag = c.tagName.toUpperCase();
      if (SKIP[tag]) continue;
      if (tag === 'BR') { b.br(); continue; }
      var block = !!BLOCK[tag];
      if (block) b.end();
      walk(c, boldOf(c, bold), b);
      if (block) b.end();
    }
  }

  // doc: the target document (where nodes are created).
  // html: clipboard text/html or ''. plain: clipboard text/plain or ''.
  function fromPlain(doc, plain) {
    var b = builder(doc);
    String(plain || '').split(/\r\n?|\n/).forEach(function (line) {
      b.text(line, false);
      b.end();
    });
    return b.done();
  }

  function cleanFragment(doc, html, plain) {
    if (html && typeof DOMParser === 'function') {
      var b = builder(doc);
      walk(new DOMParser().parseFromString(html, 'text/html').body, false, b);
      var frag = b.done();
      if (frag.textContent.trim() || !plain) return frag;
    }
    return fromPlain(doc, plain);
  }

  return { cleanFragment: cleanFragment };
});
