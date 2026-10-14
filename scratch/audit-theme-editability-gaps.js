const fs = require('fs');
const path = require('path');

const layoutsBaseDir = path.resolve('components/site/layouts');
const themeDirs = fs.readdirSync(layoutsBaseDir).filter(d => 
  fs.statSync(path.join(layoutsBaseDir, d)).isDirectory()
);

function walk(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    if (fs.statSync(p).isDirectory()) {
      files = files.concat(walk(p));
    } else if (p.endsWith('.tsx')) {
      files.push(p);
    }
  }
  return files;
}

const report = {
  totalThemes: themeDirs.length,
  themesWithGaps: 0,
  details: {}
};

for (const theme of themeDirs) {
  // skip reference standard from mutation consideration, but inspect it for reference
  const themePath = path.join(layoutsBaseDir, theme);
  const files = walk(themePath);

  const themeAnalysis = {
    totalFiles: files.length,
    componentsWithoutEditable: [],
    targetIdCollisions: [],
    unwrappedStaticHeaders: [],
    unwrappedCTAs: [],
    unwrappedMetrics: []
  };

  for (const file of files) {
    const relFile = path.relative(layoutsBaseDir, file);
    const content = fs.readFileSync(file, 'utf8');

    // Skip shell wrapper root or simple index files if they just re-export or don't render content
    const hasEditable = content.includes('<EditableElement');
    
    // Check targetId collisions (duplicate static string literals in the file)
    const targetIdRegex = /targetId=["']([^"']+)["']/g;
    const targetIds = [];
    let match;
    while ((match = targetIdRegex.exec(content)) !== null) {
      targetIds.push(match[1]);
    }
    const counts = {};
    for (const id of targetIds) {
      counts[id] = (counts[id] || 0) + 1;
    }
    const collisions = Object.keys(counts).filter(id => counts[id] > 1);
    if (collisions.length > 0) {
      themeAnalysis.targetIdCollisions.push({
        file: relFile,
        collisions
      });
    }

    // Check if the component renders UI but has 0 EditableElement
    // Only check files in body/components or components
    const isComponent = relFile.includes('components') && !relFile.endsWith('Icons.tsx');
    if (isComponent && !hasEditable) {
      // Check if it renders actual DOM text
      if (/<(h[1-6]|p|span|button|a)\b[^>]*>[A-Za-z0-9]/.test(content)) {
        themeAnalysis.componentsWithoutEditable.push(relFile);
      }
    }

    // Check for unwrapped headers: <h1..6> containing static text without EditableElement
    // Simple heuristic: lines with <h1...h6> that do not contain EditableElement
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (/<h[1-6][^>]*>[A-Za-z0-9\s,.'"-]{4,}<\/h[1-6]>/.test(line) && !line.includes('EditableElement')) {
        themeAnalysis.unwrappedStaticHeaders.push({
          file: relFile,
          line: idx + 1,
          snippet: line.trim()
        });
      }
      // Check for unwrapped CTA buttons / links: <button...>Shop Now</button> or <Link...>View All</Link>
      if (/<(button|Link)[^>]*>(Shop|View|Explore|Learn|Discover|Get Started|Subscribe|Join|Order|Book|Contact)[A-Za-z\s]*<\/(button|Link)>/.test(line) && !line.includes('EditableElement')) {
        themeAnalysis.unwrappedCTAs.push({
          file: relFile,
          line: idx + 1,
          snippet: line.trim()
        });
      }
      // Check for unwrapped metrics / badges: uppercase tracking text e.g. text-[10px] uppercase font-black
      if (/(tracking-\[0\.[345]em\]|tracking-widest)[^>]*>[A-Za-z0-9\s]{3,}<\/span>/.test(line) && !line.includes('EditableElement')) {
        themeAnalysis.unwrappedMetrics.push({
          file: relFile,
          line: idx + 1,
          snippet: line.trim()
        });
      }
    });
  }

  const hasIssues = 
    themeAnalysis.componentsWithoutEditable.length > 0 ||
    themeAnalysis.targetIdCollisions.length > 0 ||
    themeAnalysis.unwrappedStaticHeaders.length > 0 ||
    themeAnalysis.unwrappedCTAs.length > 0 ||
    themeAnalysis.unwrappedMetrics.length > 0;

  if (hasIssues) {
    report.themesWithGaps++;
    report.details[theme] = themeAnalysis;
  }
}

fs.writeFileSync('scratch/editability-gap-report.json', JSON.stringify(report, null, 2));
console.log('Audit complete.');
console.log('Themes scanned:', report.totalThemes);
console.log('Themes with editability gaps:', report.themesWithGaps);
