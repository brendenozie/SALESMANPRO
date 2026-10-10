// Runs on VPS: node validate-candidates.js candidates.json outdir
// Uses production's sharp from /var/www/salesmanpro/current/node_modules
const sharp = require('/var/www/salesmanpro/current/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const [, , candFile, outDir] = process.argv;
const cands = JSON.parse(fs.readFileSync(candFile, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const TW = 240, TH = 200, LABEL = 36;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

(async () => {
  const results = [];
  const tiles = [];
  for (const [concept, ids] of Object.entries(cands)) {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const url = `https://images.unsplash.com/${id}?w=800&q=80&auto=format&fit=crop`;
      const r = { concept, idx: i, id, url };
      try {
        const res = await fetch(url, { redirect: 'follow' });
        r.status = res.status;
        r.contentType = res.headers.get('content-type');
        const buf = Buffer.from(await res.arrayBuffer());
        r.bytes = buf.length;
        if (res.ok && /^image\//.test(r.contentType || '')) {
          const meta = await sharp(buf).metadata();
          r.width = meta.width; r.height = meta.height; r.format = meta.format;
          r.decodable = true;
          const thumb = await sharp(buf).resize(TW, TH, { fit: 'cover' }).jpeg().toBuffer();
          tiles.push({ thumb, label: `${concept}#${i}` });
        } else {
          r.decodable = false;
        }
      } catch (e) {
        r.error = e.message; r.decodable = false;
      }
      results.push(r);
      process.stderr.write(`${concept}#${i} ${r.status} ${r.decodable}\n`);
    }
  }
  fs.writeFileSync(path.join(outDir, 'validation.json'), JSON.stringify(results, null, 2));

  // Contact sheets: 6 cols x 5 rows = 30 tiles per sheet
  const COLS = 6, ROWS = 5, PER = COLS * ROWS;
  for (let s = 0; s * PER < tiles.length; s++) {
    const chunk = tiles.slice(s * PER, (s + 1) * PER);
    const W = COLS * TW, H = Math.ceil(chunk.length / COLS) * (TH + LABEL);
    const comps = [];
    chunk.forEach((t, k) => {
      const x = (k % COLS) * TW, y = Math.floor(k / COLS) * (TH + LABEL);
      comps.push({ input: t.thumb, left: x, top: y });
      const svg = `<svg width="${TW}" height="${LABEL}"><rect width="100%" height="100%" fill="#111"/><text x="6" y="24" font-size="18" font-family="sans-serif" fill="#fff">${esc(t.label)}</text></svg>`;
      comps.push({ input: Buffer.from(svg), left: x, top: y + TH });
    });
    await sharp({ create: { width: W, height: H, channels: 3, background: '#222' } })
      .composite(comps).jpeg({ quality: 80 }).toFile(path.join(outDir, `sheet-${s + 1}.jpg`));
  }
  console.log(JSON.stringify({ total: results.length, ok: results.filter(r => r.decodable).length, sheets: Math.ceil(tiles.length / PER) }));
})();
