const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(process.cwd(), 'components/site/layouts');

function parseJSXSections(content) {
  const sections = [];
  
  // Find all JSX components rendered inside return (...)
  // We can look for <ComponentName ... /> or <div id="section-..."><ComponentName ... /></div>
  const lines = content.split('\n');
  let inReturn = false;
  let returnBlock = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('return (') || line.includes('return(')) {
      inReturn = true;
      returnBlock = lines.slice(i).join('\n');
      break;
    }
  }

  // Regex to extract data-editor-section or section divs
  const sectionDivRegex = /<div[^>]*?(?:id=["']([^"']+)["']|data-editor-section=["']([^"']+)["']|data-editor-component=["']([^"']+)["'])[^>]*>([\s\S]*?)<\/div>/g;
  
  // Also look for direct component invocations <ComponentName ... />
  const compRegex = /<([A-Z][A-Za-z0-9_]+)([\s\S]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g;
  
  // Extract imports to know where components come from
  const imports = {};
  const importLines = content.match(/import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g) || [];
  for (const imp of importLines) {
    const match = imp.match(/import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/);
    if (match) {
      const imported = match[1].trim();
      const source = match[2].trim();
      imports[imported] = source;
    }
  }

  // Also dynamic imports: const Comp = dynamic(() => import('path'))
  const dynamicImports = {};
  const dynamicMatches = content.match(/const\s+([A-Za-z0-9_]+)\s*=\s*dynamic\(\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/g) || [];
  for (const dyn of dynamicMatches) {
    const match = dyn.match(/const\s+([A-Za-z0-9_]+)\s*=\s*dynamic\(\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/);
    if (match) {
      dynamicImports[match[1]] = match[2];
    }
  }

  return { returnBlock, imports, dynamicImports };
}

function analyzeTheme(themeDirName) {
  const themeDir = path.join(layoutsDir, themeDirName);
  const items = fs.readdirSync(themeDir);
  
  // Find layout wrapper file
  let layoutWrapperFile = items.find(f => f.endsWith('Layout.tsx') || f.endsWith('Layout.jsx'));
  let layoutWrapperContent = '';
  if (layoutWrapperFile) {
    layoutWrapperContent = fs.readFileSync(path.join(themeDir, layoutWrapperFile), 'utf8');
  }

  // Find body file
  let bodyFile = null;
  let bodyContent = '';
  const bodyDir = path.join(themeDir, 'body');
  if (fs.existsSync(bodyDir)) {
    const bodyItems = fs.readdirSync(bodyDir);
    const candidate = bodyItems.find(f => f.endsWith('Site.tsx') || f.endsWith('Site.jsx') || f.endsWith('Body.tsx'));
    if (candidate) {
      bodyFile = path.join('body', candidate);
      bodyContent = fs.readFileSync(path.join(bodyDir, candidate), 'utf8');
    }
  }
  if (!bodyFile) {
    const candidate = items.find(f => f.endsWith('Site.tsx') || f.endsWith('Site.jsx') || f.endsWith('Body.tsx'));
    if (candidate) {
      bodyFile = candidate;
      bodyContent = fs.readFileSync(path.join(themeDir, candidate), 'utf8');
    }
  }

  // Find components directory
  let components = [];
  const compDirs = [
    path.join(themeDir, 'components'),
    path.join(themeDir, 'body', 'components'),
  ];
  for (const cDir of compDirs) {
    if (fs.existsSync(cDir)) {
      const scanCompDir = (dir, rel) => {
        const dirItems = fs.readdirSync(dir);
        for (const item of dirItems) {
          const full = path.join(dir, item);
          const relPath = path.join(rel, item);
          if (fs.statSync(full).isDirectory()) {
            scanCompDir(full, relPath);
          } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
            const code = fs.readFileSync(full, 'utf8');
            const lines = code.split('\n').length;
            
            // Check responsive classes
            const usesResponsive = /sm:|md:|lg:|xl:|2xl:/.test(code);
            const usesGrid = /grid|grid-cols/.test(code);
            const usesFlex = /flex|flex-col|flex-row/.test(code);
            const usesFramer = code.includes('framer-motion');
            const usesSwiper = code.includes('swiper');
            const usesSWR = code.includes('useSWR');
            
            components.push({
              name: item.replace(/\.[^/.]+$/, ""),
              relPath,
              lines,
              usesResponsive,
              usesGrid,
              usesFlex,
              usesFramer,
              usesSwiper,
              usesSWR,
            });
          }
        }
      };
      scanCompDir(cDir, '');
    }
  }

  // Header & Footer info
  const hasHeaderDir = fs.existsSync(path.join(themeDir, 'header'));
  const hasFooterDir = fs.existsSync(path.join(themeDir, 'footer'));

  // Extract rendered components in order from bodyContent
  const renderedComponents = [];
  const parsed = parseJSXSections(bodyContent);

  // Extract all tags like <ComponentName or <DynamicComponentName
  // and check for data-editor-section
  const sectionDivMatches = [...bodyContent.matchAll(/<div[^>]*?(?:data-editor-section=["']([^"']+)["'][^>]*?data-editor-component=["']([^"']+)["']|data-editor-component=["']([^"']+)["'][^>]*?data-editor-section=["']([^"']+)["']|id=["'](section-[^"']+)["'])[\s\S]*?>([\s\S]*?)<\/div>/g)];
  
  // Also scan line-by-line for component invocations
  const compInvocations = [];
  const bodyLines = bodyContent.split('\n');
  let insideJSX = false;
  for (let i = 0; i < bodyLines.length; i++) {
    const line = bodyLines[i].trim();
    if (line.includes('return (') || line.includes('return <') || line.includes('return(')) insideJSX = true;
    if (insideJSX) {
      const match = line.match(/<([A-Z][A-Za-z0-9_]+)(\s|>|\/)/);
      if (match && !['React', 'Fragment', 'Suspense', 'SkeletonGrid', 'ComponentSkeleton'].includes(match[1])) {
        // Find if line has props
        const compName = match[1];
        if (!compInvocations.includes(compName)) {
          compInvocations.push(compName);
        }
      }
    }
  }

  // Detect data hooks and sources
  const dataSources = [];
  if (bodyContent.includes('useSWR')) dataSources.push('Client useSWR');
  if (bodyContent.includes('useStoreContext') || bodyContent.includes('StoreContext')) dataSources.push('StoreContext');
  if (bodyContent.includes('useStateContext')) dataSources.push('StateContext (Cart)');
  if (bodyContent.includes('pageData.heroSlides')) dataSources.push('heroSlides');
  if (bodyContent.includes('pageData.StoreCategory') || bodyContent.includes('StoreCategory')) dataSources.push('StoreCategory');
  if (bodyContent.includes('marketplaceListings')) dataSources.push('marketplaceListings');
  if (bodyContent.includes('promotions')) dataSources.push('promotions');
  if (bodyContent.includes('testimonials')) dataSources.push('testimonials');
  if (bodyContent.includes('themeSettings')) dataSources.push('themeSettings');
  if (bodyContent.includes('heroConfig')) dataSources.push('heroConfig / structured sections');

  return {
    themeName: themeDirName,
    layoutWrapperFile: layoutWrapperFile || null,
    bodyFile: bodyFile || null,
    hasHeaderDir,
    hasFooterDir,
    totalComponents: components.length,
    componentList: components,
    renderedComponents: compInvocations,
    dataSources,
    hasEditorSectionAttributes: bodyContent.includes('data-editor-section'),
    hasEditableElement: bodyContent.includes('EditableElement'),
    linesOfBodyCode: bodyContent.split('\n').length,
    rawImports: parsed.imports,
    rawDynamicImports: parsed.dynamicImports
  };
}

const allThemes = fs.readdirSync(layoutsDir)
  .filter(item => fs.statSync(path.join(layoutsDir, item)).isDirectory());

console.log(`Found ${allThemes.length} theme layout directories.`);

const results = allThemes.map(analyzeTheme);

// Sort by themeName
results.sort((a, b) => a.themeName.localeCompare(b.themeName));

const outPath = path.join(process.cwd(), 'scratch', 'comprehensive_theme_audit.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

console.log(`Saved comprehensive audit of ${results.length} themes to ${outPath}`);

// Generate a summary report
let summary = '# MASTER THEME INVENTORY & DISCOVERY SUMMARY\n\n';
summary += `Total Themes Discovered: ${results.length}\n\n`;
summary += '| # | Theme Layout | Body File | Components | Rendered Sections | Header Dir | Footer Dir | Data Sources | Editor Tagged |\n';
summary += '|---|---|---|---|---|---|---|---|---|\n';

results.forEach((r, idx) => {
  summary += `| ${idx+1} | ${r.themeName} | ${r.bodyFile || 'NONE'} | ${r.totalComponents} | ${r.renderedComponents.length} | ${r.hasHeaderDir ? 'Yes' : 'No'} | ${r.hasFooterDir ? 'Yes' : 'No'} | ${r.dataSources.slice(0, 3).join(', ')} | ${r.hasEditorSectionAttributes ? 'Yes' : 'No'} |\n`;
});

const summaryPath = path.join(process.cwd(), 'scratch', 'comprehensive_theme_summary.md');
fs.writeFileSync(summaryPath, summary);
console.log(`Summary written to ${summaryPath}`);
