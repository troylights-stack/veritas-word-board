(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.WordPng = root.WordPng || {};
    root.WordPng.renderPng = api.renderPng;
  }
})(typeof self !== 'undefined' ? self : this, function (root) {
  var SCALE = 2;
  var HEAD = 'Fredoka, "Trebuchet MS", sans-serif';
  var BODY = '"Nunito Sans", "Trebuchet MS", sans-serif';
  // Tokens from docs/reference/DESIGN.md (light-* / dark-*).
  var THEMES = {
    light: { canvas: '#F7F0E5', panel: '#FFF9F0', raised: '#FFFCF7', text: '#243F40', border: '#C99F77', primary: '#58C8C3', primaryEdge: '#247F7C', trueC: '#26786B', falseC: '#A54335' },
    dark: { canvas: '#19152E', panel: '#302344', raised: '#44315D', text: '#F5EBDD', border: '#715587', primary: '#9560E8', primaryEdge: '#9560E8', trueC: '#75E3C3', falseC: '#C5A3FF' }
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function box(ctx, b, fill, stroke) {
    roundRect(ctx, b.x, b.y, b.w, b.h, 14);
    ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke();
  }

  function arrow(ctx, a, color) {
    var f = a.from, t = a.to, mx = (f.x + t.x) / 2;
    var tipX = t.x - 4;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(f.x + 6, f.y);
    ctx.bezierCurveTo(mx, f.y, mx, t.y, tipX - 8, t.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tipX, t.y);
    ctx.lineTo(tipX - 12, t.y - 7);
    ctx.lineTo(tipX - 12, t.y + 7);
    ctx.closePath();
    ctx.fill();
  }

  async function loadFonts() {
    var specs = ['600 40px Fredoka', '800 20px "Nunito Sans"', '400 16px "Nunito Sans"', '700 16px "Nunito Sans"'];
    try {
      await Promise.all(specs.map(function (s) { return document.fonts.load(s); }));
      await document.fonts.ready;
    } catch (e) { /* fall back to system fonts */ }
  }

  async function renderPng(layout, theme) {
    var c = THEMES[theme] || THEMES.light;
    await loadFonts();
    var canvas = document.createElement('canvas');
    canvas.width = Math.ceil(layout.width * SCALE);
    canvas.height = Math.ceil(layout.height * SCALE);
    var ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = c.canvas;
    ctx.fillRect(0, 0, layout.width, layout.height);
    ctx.textBaseline = 'top';

    ctx.fillStyle = c.text;
    ctx.font = '600 40px ' + HEAD;
    ctx.fillText(layout.title.text, layout.title.x, layout.title.y);

    layout.rows.forEach(function (row) {
      arrow(ctx, row.arrow, c.primaryEdge);
      var w = row.word;
      box(ctx, w, c.panel, c.border);
      ctx.fillStyle = c.text; ctx.font = '800 20px ' + BODY;
      var wy = w.y + (w.h - w.lines.length * 26) / 2;
      w.lines.forEach(function (ln, i) { ctx.fillText(ln, w.x + 16, wy + i * 26 + 2); });

      var cd = row.card;
      box(ctx, cd, c.raised, c.border);
      var y = cd.y + 16;
      cd.blocks.forEach(function (b) {
        ctx.fillStyle = b.kind === 'synonyms' ? c.trueC : b.kind === 'antonyms' ? c.falseC : c.text;
        ctx.font = (b.kind === 'definition' ? '400' : '700') + ' 16px ' + BODY;
        b.lines.forEach(function (ln) { ctx.fillText(ln, cd.x + 16, y + 2); y += 22; });
        y += 8;
      });
    });

    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('PNG export failed')); }, 'image/png');
    });
  }

  return { renderPng: renderPng };
});
