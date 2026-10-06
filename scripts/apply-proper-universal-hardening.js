const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const layoutsDir = path.join(process.cwd(), 'components/site/layouts');
const dirs = fs.readdirSync(layoutsDir).filter(f => fs.statSync(path.join(layoutsDir, f)).isDirectory());

let totalFilesModified = 0;
let totalLoadersRemoved = 0;
let totalUnoptRemoved = 0;
let totalDecodingAdded = 0;
let totalSsrFixed = 0;
let totalHeadersOptimized = 0;
let totalHeaderBlursOptimized = 0;

function walk(dir, callback) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      walk(full, callback);
    } else if (entry.endsWith('.tsx') || entry.endsWith('.jsx')) {
      callback(full);
    }
  }
}

// 1. AST-based Image transformer
function transformImages(code, filename) {
  const sourceFile = ts.createSourceFile(
    filename,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const edits = [];
  let fileLoaders = 0;
  let fileUnopt = 0;
  let fileDecoding = 0;

  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText(sourceFile);
      if (tagName === 'Image') {
        let hasDecoding = false;

        node.attributes.properties.forEach(prop => {
          if (ts.isJsxAttribute(prop)) {
            const propName = prop.name.getText(sourceFile);
            if (propName === 'loader') {
              fileLoaders++;
              edits.push({ start: prop.getFullStart(), end: prop.getEnd(), replacement: '' });
            } else if (propName === 'unoptimized') {
              fileUnopt++;
              edits.push({ start: prop.getFullStart(), end: prop.getEnd(), replacement: '' });
            } else if (propName === 'decoding') {
              hasDecoding = true;
            }
          }
        });

        if (!hasDecoding) {
          fileDecoding++;
          const imgStart = node.tagName.getEnd();
          edits.push({ start: imgStart, end: imgStart, replacement: ' decoding="async"' });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (edits.length === 0) return { code, changed: false, fileLoaders: 0, fileUnopt: 0, fileDecoding: 0 };

  // Apply edits in reverse order of start position
  edits.sort((a, b) => b.start - a.start);
  let result = code;
  for (const edit of edits) {
    result = result.slice(0, edit.start) + edit.replacement + result.slice(edit.end);
  }

  return { code: result, changed: true, fileLoaders, fileUnopt, fileDecoding };
}

// 2. SSR: false cleaner in layout bodies
function transformSsr(code) {
  if (!/ssr:\s*false/.test(code)) return { code, changed: false, count: 0 };
  const matches = code.match(/ssr:\s*false,?\s*/g);
  const count = matches ? matches.length : 0;
  const result = code.replace(/ssr:\s*false,?\s*/g, '');
  return { code: result, changed: true, count };
}

// 3. Header scroll listener optimization
function optimizeHeaderScroll(code) {
  // Check if header has unthrottled scroll listener
  // Typical patterns:
  // window.addEventListener('scroll', onScroll, ...);
  // window.addEventListener('scroll', handleScroll, ...);
  if (!code.includes("addEventListener('scroll'") && !code.includes('addEventListener("scroll"')) {
    return { code, changed: false };
  }

  // Already optimized with ticking requestAnimationFrame
  if (code.includes('requestAnimationFrame') && code.includes('ticking')) {
    return { code, changed: false };
  }

  let modified = false;
  let newCode = code;

  // Pattern A:
  // const onScroll = () => setScrolled(window.scrollY > ...);
  // useEffect(() => {
  //   const onScroll = () => ...
  //   window.addEventListener('scroll', onScroll...);
  //   return () => window.removeEventListener('scroll', onScroll);
  // }, []);
  const scrollEffectRegex = /useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*?(?:const\s+(?:onScroll|handleScroll)\s*=\s*[\s\S]*?)?window\.addEventListener\(['"]scroll['"]\s*,\s*(?:onScroll|handleScroll)[^)]*\);[\s\S]*?return\s*\(\)\s*=>\s*window\.removeEventListener\(['"]scroll['"]\s*,\s*(?:onScroll|handleScroll)\);[\s\S]*?\}\s*,\s*\[\]\);/;

  if (scrollEffectRegex.test(newCode)) {
    newCode = newCode.replace(scrollEffectRegex, `useEffect(() => {
    let ticking = false;
    let lastScrolled = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          if (isScrolled !== lastScrolled) {
            lastScrolled = isScrolled;
            setScrolled(isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);`);
    modified = true;
  }

  return { code: newCode, changed: modified };
}

// 4. Header backdrop blur optimization
function optimizeHeaderBlur(code) {
  let newCode = code;
  let modified = false;

  // Common header backdrop blurs
  const blurReplacements = [
    { from: /bg-white\/80\s+backdrop-blur-md/g, to: 'bg-white/95 shadow-sm' },
    { from: /bg-white\/80\s+backdrop-blur-xl/g, to: 'bg-white/95 shadow-sm' },
    { from: /bg-white\/80\s+dark:bg-zinc-900\/80\s+backdrop-blur-xl/g, to: 'bg-white/95 dark:bg-zinc-900/95 shadow-sm' },
    { from: /bg-white\/80\s+dark:bg-zinc-900\/80\s+backdrop-blur-md/g, to: 'bg-white/95 dark:bg-zinc-900/95 shadow-sm' },
    { from: /bg-zinc-950\/80\s+backdrop-blur-2xl/g, to: 'bg-zinc-950/95 shadow-sm' },
    { from: /bg-zinc-950\/80\s+backdrop-blur-xl/g, to: 'bg-zinc-950/95 shadow-sm' },
    { from: /bg-zinc-950\/80\s+backdrop-blur-md/g, to: 'bg-zinc-950/95 shadow-sm' },
    { from: /bg-black\/80\s+backdrop-blur-md/g, to: 'bg-black/95 shadow-sm' },
    { from: /bg-black\/70\s+backdrop-blur-md/g, to: 'bg-black/90 shadow-sm' },
    { from: /bg-black\/60\s+backdrop-blur-md/g, to: 'bg-black/90 shadow-sm' },
    { from: /bg-slate-900\/80\s+backdrop-blur-md/g, to: 'bg-slate-900/95 shadow-sm' },
    { from: /bg-slate-900\/80\s+backdrop-blur-xl/g, to: 'bg-slate-900/95 shadow-sm' },
    { from: /backdrop-blur-md\s+bg-white\/80/g, to: 'bg-white/95 shadow-sm' },
    { from: /backdrop-blur-xl\s+bg-white\/80/g, to: 'bg-white/95 shadow-sm' },
    { from: /backdrop-blur-md\s+bg-zinc-950\/80/g, to: 'bg-zinc-950/95 shadow-sm' },
  ];

  for (const { from, to } of blurReplacements) {
    if (from.test(newCode)) {
      newCode = newCode.replace(from, to);
      modified = true;
    }
  }

  return { code: newCode, changed: modified };
}

// Process all files
dirs.forEach(dir => {
  const dirPath = path.join(layoutsDir, dir);

  walk(dirPath, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileModified = false;

    // A. Image AST transformation
    const imgRes = transformImages(content, filePath);
    if (imgRes.changed) {
      content = imgRes.code;
      totalLoadersRemoved += imgRes.fileLoaders;
      totalUnoptRemoved += imgRes.fileUnopt;
      totalDecodingAdded += imgRes.fileDecoding;
      fileModified = true;
    }

    // B. SSR transformation for site bodies
    if (filePath.endsWith('Site.tsx') || filePath.endsWith('StoreBody.tsx')) {
      const ssrRes = transformSsr(content);
      if (ssrRes.changed) {
        content = ssrRes.code;
        totalSsrFixed += ssrRes.count;
        fileModified = true;
      }
    }

    // C. Header scroll listener optimization
    if (filePath.endsWith('Header.tsx')) {
      const scrollRes = optimizeHeaderScroll(content);
      if (scrollRes.changed) {
        content = scrollRes.code;
        totalHeadersOptimized++;
        fileModified = true;
      }

      const blurRes = optimizeHeaderBlur(content);
      if (blurRes.changed) {
        content = blurRes.code;
        totalHeaderBlursOptimized++;
        fileModified = true;
      }
    }

    // D. Card backdrop blur optimization
    if (filePath.toLowerCase().includes('card')) {
      const cardBlurRes = optimizeHeaderBlur(content);
      if (cardBlurRes.changed) {
        content = cardBlurRes.code;
        fileModified = true;
      }
    }

    if (fileModified) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalFilesModified++;
    }
  });
});

console.log('=== PLATFORM UNIVERSAL HARDENING COMPLETE ===');
console.log('Total files modified:', totalFilesModified);
console.log('Custom loaders removed (AST):', totalLoadersRemoved);
console.log('Unoptimized attributes removed (AST):', totalUnoptRemoved);
console.log('decoding="async" attributes added (AST):', totalDecodingAdded);
console.log('ssr: false removed from body sites:', totalSsrFixed);
console.log('Header scroll listeners upgraded to rAF:', totalHeadersOptimized);
console.log('Header/card backdrop blurs optimized:', totalHeaderBlursOptimized);
