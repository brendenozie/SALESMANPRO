const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(__dirname, '..', 'components', 'site', 'layouts');
const layouts = fs.readdirSync(layoutsDir).filter(f => fs.statSync(path.join(layoutsDir, f)).isDirectory());

console.log('Total layout directories:', layouts.length);

const results = [];

for (const layout of layouts) {
  const dir = path.join(layoutsDir, layout);
  let files = [];
  function scan(d) {
    for (const item of fs.readdirSync(d)) {
      const p = path.join(d, item);
      if (fs.statSync(p).isDirectory()) {
        scan(p);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(p);
      }
    }
  }
  scan(dir);

  let unoptimizedCount = 0;
  let cardBackdropBlur = 0;
  let headerScrollListeners = 0;
  let missingAsyncDecoding = 0;
  const offendingCards = [];

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const isCard = f.toLowerCase().includes('card');
    const isHeader = f.toLowerCase().includes('header');

    if (content.includes('unoptimized')) {
      const matches = content.match(/unoptimized/g) || [];
      unoptimizedCount += matches.length;
    }
    if (isCard && content.includes('backdrop-blur')) {
      const matches = content.match(/backdrop-blur/g) || [];
      cardBackdropBlur += matches.length;
      offendingCards.push(path.relative(layoutsDir, f));
    }
    if (isHeader && content.includes('addEventListener') && content.includes('scroll')) {
      headerScrollListeners++;
    }
    if (isCard && content.includes('<Image') && !content.includes('decoding="async"')) {
      missingAsyncDecoding++;
    }
  }

  results.push({
    layout,
    filesCount: files.length,
    unoptimizedCount,
    cardBackdropBlur,
    headerScrollListeners,
    missingAsyncDecoding,
    offendingCards
  });
}

fs.writeFileSync(path.join(__dirname, '..', 'docs', 'performance', 'layout_audit_deep.json'), JSON.stringify(results, null, 2));

const withIssues = results.filter(r => r.unoptimizedCount > 0 || r.cardBackdropBlur > 0 || r.headerScrollListeners > 0 || r.missingAsyncDecoding > 0);
console.log(`Audited ${results.length} layouts. ${withIssues.length} layouts flagged for optimization.`);

for (const r of withIssues) {
  console.log(`[${r.layout}] unoptimized: ${r.unoptimizedCount}, cardBlur: ${r.cardBackdropBlur}, scrollListeners: ${r.headerScrollListeners}, missingAsync: ${r.missingAsyncDecoding}`);
  if (r.offendingCards.length) {
    console.log(`  Cards with blur: ${r.offendingCards.join(', ')}`);
  }
}
