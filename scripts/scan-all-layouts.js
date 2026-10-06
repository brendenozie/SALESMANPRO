const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(process.cwd(), 'components/site/layouts');
const dirs = fs.readdirSync(layoutsDir).filter(f => fs.statSync(path.join(layoutsDir, f)).isDirectory());

console.log('Total layout dirs:', dirs.length);

const issues = [];

dirs.forEach(dir => {
  const dirPath = path.join(layoutsDir, dir);
  let unopt = 0;
  let customLoaders = 0;
  let backdropBlurs = 0;
  let ssrFalse = 0;
  let missingDecoding = 0;
  let totalImages = 0;

  function scan(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const f of files) {
      const full = path.join(dirPath, f);
      if (fs.statSync(full).isDirectory()) {
        scan(full);
      } else if (f.endsWith('.tsx') || f.endsWith('.jsx')) {
        const content = fs.readFileSync(full, 'utf8');
        
        // Unoptimized
        const unoptMatches = content.match(/unoptimized/g);
        if (unoptMatches) unopt += unoptMatches.length;

        // Custom loaders
        const loaderMatches = content.match(/loader=\{/g);
        if (loaderMatches) customLoaders += loaderMatches.length;

        // Backdrop blur
        const blurMatches = content.match(/backdrop-blur-(md|lg|xl|2xl|3xl)/g);
        if (blurMatches) backdropBlurs += blurMatches.length;

        // SSR false
        const ssrMatches = content.match(/ssr:\s*false/g);
        if (ssrMatches) ssrFalse += ssrMatches.length;

        // Images count & decoding
        const imgMatches = content.match(/<Image\s/g);
        if (imgMatches) {
          totalImages += imgMatches.length;
          const decodingMatches = content.match(/decoding=["']async["']/g);
          const decCount = decodingMatches ? decodingMatches.length : 0;
          if (imgMatches.length > decCount) {
            missingDecoding += (imgMatches.length - decCount);
          }
        }
      }
    }
  }

  scan(dirPath);

  issues.push({
    layout: dir,
    unopt,
    customLoaders,
    backdropBlurs,
    ssrFalse,
    missingDecoding,
    totalImages
  });
});

console.log(JSON.stringify(issues, null, 2));
