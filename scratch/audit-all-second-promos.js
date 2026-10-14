const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components', 'site', 'layouts');
const results = [];

for (const theme of fs.readdirSync(layoutsDir)) {
  const f = path.join(layoutsDir, theme, 'body', 'components', 'SecondPromoSection', 'index.tsx');
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    const openMatches = c.match(/<EditableElement/g) || [];
    const closeMatches = c.match(/<\/EditableElement>/g) || [];
    
    // Check if home.secondPromo.description opening is separated from {promo.description}
    const hasBadDescriptionWrap = c.includes('Valid Until') && 
      c.includes('<EditableElement targetId="home.secondPromo.description"') &&
      c.indexOf('<EditableElement targetId="home.secondPromo.description"') < c.indexOf('Valid Until');
    
    // Also check if any other theme has <EditableElement targetId="home.secondPromo.description" placed before {promo.description}
    const descOpenIdx = c.indexOf('<EditableElement targetId="home.secondPromo.description"');
    const descContentIdx = c.indexOf('{promo.description}');
    const isBadNesting = descOpenIdx !== -1 && descContentIdx !== -1 && descContentIdx - descOpenIdx > 200;

    results.push({
      theme,
      openCount: openMatches.length,
      closeCount: closeMatches.length,
      hasBadDescriptionWrap,
      isBadNesting,
      file: f
    });
  }
}

console.table(results);
