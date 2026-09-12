const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(process.cwd(), 'components/site/layouts');
const appSiteDir = path.join(process.cwd(), 'app/(site)/[slug]');

// 1. Load siteBodyComponentMap to get official category -> layout -> component mappings
const siteBodyComponentMapPath = path.join(layoutsDir, 'siteBodyComponentMap.ts');
const siteBodyMapContent = fs.readFileSync(siteBodyComponentMapPath, 'utf8');

// Extract siteComponentNameMap
const compNameMap = {};
const compMapRegex = /([A-Za-z0-9_]+Layout):\s*["']([A-Za-z0-9_]+)["']/g;
let m;
while ((m = compMapRegex.exec(siteBodyMapContent)) !== null) {
  compNameMap[m[1]] = m[2];
}

// 2. Discover all layout directories
const layoutDirs = fs.readdirSync(layoutsDir).filter(f => {
  const full = path.join(layoutsDir, f);
  return fs.statSync(full).isDirectory() && f.includes('Layout');
});

// Map of subpages in app/(site)/[slug]
const subpageDirs = {};
if (fs.existsSync(appSiteDir)) {
  const entries = fs.readdirSync(appSiteDir);
  for (const entry of entries) {
    const full = path.join(appSiteDir, entry);
    if (fs.statSync(full).isDirectory()) {
      const pages = fs.readdirSync(full).filter(p => {
        const pFull = path.join(full, p);
        return fs.statSync(pFull).isDirectory() && fs.existsSync(path.join(pFull, 'page.tsx'));
      });
      subpageDirs[entry] = pages;
    }
  }
}

function parseComponentFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Extract props interface / type
  const propsMatch = content.match(/(?:interface|type)\s+([A-Za-z0-9_]+Props)[\s\S]*?\{([\s\S]*?)\}/);
  const props = propsMatch ? propsMatch[2].split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//')) : [];

  // Extract hooks
  const hooks = [];
  if (content.includes('useState(') || content.includes('useState<')) hooks.push('useState');
  if (content.includes('useEffect(')) hooks.push('useEffect');
  if (content.includes('useMemo(')) hooks.push('useMemo');
  if (content.includes('useCallback(')) hooks.push('useCallback');
  if (content.includes('useRef(') || content.includes('useRef<')) hooks.push('useRef');
  if (content.includes('useRouter(')) hooks.push('useRouter');
  if (content.includes('useSWR(')) hooks.push('useSWR');
  if (content.includes('useStoreContext(')) hooks.push('useStoreContext');
  if (content.includes('useStateContext(')) hooks.push('useStateContext');

  // Check libraries
  const usesFramerMotion = content.includes('framer-motion');
  const usesSwiper = content.includes('swiper');
  const usesHeroicons = content.includes('@heroicons');
  const usesLucide = content.includes('lucide-react');

  // Responsive patterns
  const responsiveBreakpoints = [];
  if (/\bsm:/.test(content)) responsiveBreakpoints.push('sm (640px)');
  if (/\bmd:/.test(content)) responsiveBreakpoints.push('md (768px)');
  if (/\blg:/.test(content)) responsiveBreakpoints.push('lg (1024px)');
  if (/\bxl:/.test(content)) responsiveBreakpoints.push('xl (1280px)');
  if (/\b2xl:/.test(content)) responsiveBreakpoints.push('2xl (1536px)');

  // Responsive layout shifts
  const hasHiddenOnMobile = /hidden\s+(?:sm:|md:|lg:)/.test(content) || /(?:sm:|md:|lg:):hidden/.test(content);
  const hasDirectionShift = /flex-col\s+(?:sm:|md:|lg:):flex-row/.test(content) || /flex-row\s+(?:sm:|md:|lg:):flex-col/.test(content);
  const hasGridShift = /grid-cols-\d\s+(?:sm:|md:|lg:):grid-cols-\d/.test(content);

  // Styling characteristics
  const hasDarkClasses = /dark:/.test(content);
  const hasGradients = /bg-gradient-/.test(content);
  const hasShadows = /shadow-(?:sm|md|lg|xl|2xl)/.test(content);
  const hasRounded = /rounded-(?:md|lg|xl|2xl|3xl|full)/.test(content);
  const hasBackdropBlur = /backdrop-blur/.test(content);

  return {
    lineCount: lines.length,
    props: props.slice(0, 10),
    hooks,
    usesFramerMotion,
    usesSwiper,
    usesHeroicons,
    usesLucide,
    responsiveBreakpoints,
    hasHiddenOnMobile,
    hasDirectionShift,
    hasGridShift,
    hasDarkClasses,
    hasGradients,
    hasShadows,
    hasRounded,
    hasBackdropBlur,
  };
}

const detailedAudit = [];

for (const layoutName of layoutDirs) {
  const layoutDirPath = path.join(layoutsDir, layoutName);
  
  // 1. Root Layout File
  let rootLayoutFile = fs.readdirSync(layoutDirPath).find(f => f === `${layoutName}.tsx` || f.endsWith('Layout.tsx'));
  let rootLayoutInfo = null;
  if (rootLayoutFile) {
    const rootPath = path.join(layoutDirPath, rootLayoutFile);
    const rootContent = fs.readFileSync(rootPath, 'utf8');
    
    // Check header and footer references
    const hasHeaderImport = /Header/.test(rootContent);
    const hasFooterImport = /Footer/.test(rootContent);
    const headerSource = (rootContent.match(/import\s+([A-Za-z0-9_]*Header[A-Za-z0-9_]*)\s+from\s+['"]([^'"]+)['"]/) || [])[2] || 'inline/standard';
    const footerSource = (rootContent.match(/import\s+([A-Za-z0-9_]*Footer[A-Za-z0-9_]*)\s+from\s+['"]([^'"]+)['"]/) || [])[2] || 'inline/standard';
    
    rootLayoutInfo = {
      filename: rootLayoutFile,
      lines: rootContent.split('\n').length,
      hasHeaderImport,
      hasFooterImport,
      headerSource,
      footerSource,
      hasThemeContext: rootContent.includes('StoreContext') || rootContent.includes('ThemeProvider'),
    };
  }

  // 2. Body Site File
  const expectedSiteComp = compNameMap[layoutName] || `${layoutName.replace('Layout', '')}Site`;
  let bodyFilePath = null;
  const candidates = [
    path.join(layoutDirPath, 'body', `${expectedSiteComp}.tsx`),
    path.join(layoutDirPath, `${expectedSiteComp}.tsx`),
    path.join(layoutDirPath, 'body', 'Site.tsx'),
    path.join(layoutDirPath, 'Site.tsx'),
  ];
  
  // Also check if any file ends with Site.tsx in layoutDirPath or layoutDirPath/body
  for (const c of candidates) {
    if (fs.existsSync(c)) { bodyFilePath = c; break; }
  }
  if (!bodyFilePath && fs.existsSync(path.join(layoutDirPath, 'body'))) {
    const bFiles = fs.readdirSync(path.join(layoutDirPath, 'body'));
    const f = bFiles.find(x => x.endsWith('Site.tsx') || x.endsWith('Site2.tsx') || x.endsWith('Site3.tsx') || x.endsWith('Body.tsx'));
    if (f) bodyFilePath = path.join(layoutDirPath, 'body', f);
  }
  if (!bodyFilePath) {
    const lFiles = fs.readdirSync(layoutDirPath);
    const f = lFiles.find(x => x.endsWith('Site.tsx') || x.endsWith('Site2.tsx') || x.endsWith('Site3.tsx') || x.endsWith('Body.tsx'));
    if (f) bodyFilePath = path.join(layoutDirPath, f);
  }

  let bodyAnalysis = null;
  const sections = [];
  
  if (bodyFilePath && fs.existsSync(bodyFilePath)) {
    const bodyContent = fs.readFileSync(bodyFilePath, 'utf8');
    const parsedComp = parseComponentFile(bodyFilePath);

    // Extract imports map to resolve component files
    const importMap = {};
    const importMatches = bodyContent.matchAll(/import\s+([A-Za-z0-9_{},\s*]+)\s+from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      const specifiers = match[1];
      const src = match[2];
      specifiers.split(',').forEach(s => {
        const clean = s.replace(/[{}]/g, '').trim();
        if (clean) importMap[clean] = src;
      });
    }

    // Dynamic imports
    const dynMatches = bodyContent.matchAll(/const\s+([A-Za-z0-9_]+)\s*=\s*dynamic\(\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/g);
    for (const match of dynMatches) {
      importMap[match[1]] = match[2];
    }

    // Scan rendered sections in JSX order
    const bodyLines = bodyContent.split('\n');
    let insideReturn = false;

    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i];
      if (line.includes('return (') || line.includes('return(') || line.includes('return <')) {
        insideReturn = true;
      }
      if (!insideReturn) continue;

      // Check section div wrapper: id="section-..." or data-editor-section="..."
      const editorSecMatch = line.match(/data-editor-section=["']([^"']+)["']/);
      const editorCompMatch = line.match(/data-editor-component=["']([^"']+)["']/);
      const idMatch = line.match(/id=["'](section-[^"']+)["']/);

      // Check component tag invocation
      const compMatch = line.match(/<([A-Z][A-Za-z0-9_]+)(\s|>|\/)/);
      if (compMatch) {
        const cName = compMatch[1];
        if (!['React', 'Fragment', 'Suspense', 'SkeletonGrid', 'ComponentSkeleton', 'div', 'main', 'section'].includes(cName)) {
          // Find component source file
          const impSrc = importMap[cName];
          let compFilePath = null;
          if (impSrc) {
            if (impSrc.startsWith('.')) {
              const resolved = path.resolve(path.dirname(bodyFilePath), impSrc);
              if (fs.existsSync(resolved + '.tsx')) compFilePath = resolved + '.tsx';
              else if (fs.existsSync(path.join(resolved, 'index.tsx'))) compFilePath = path.join(resolved, 'index.tsx');
              else if (fs.existsSync(resolved)) compFilePath = resolved;
            }
          }

          const compParsed = compFilePath ? parseComponentFile(compFilePath) : null;

          // Extract props from line or upcoming lines
          const propMatches = [];
          let propScan = line;
          let j = i;
          while (j < bodyLines.length && !propScan.includes('/>') && !propScan.includes('>') && j < i + 10) {
            j++;
            propScan += ' ' + bodyLines[j];
          }
          const pNames = [...propScan.matchAll(/([a-zA-Z0-9_-]+)=\{/g)].map(x => x[1]);

          // Check conditional rendering in preceding code
          const isConditional = line.includes('&&') || (i > 0 && bodyLines[i-1].includes('&&'));

          sections.push({
            componentName: cName,
            editorSectionId: editorSecMatch ? editorSecMatch[1] : (idMatch ? idMatch[1].replace('section-', '') : null),
            editorComponentName: editorCompMatch ? editorCompMatch[1] : null,
            importSource: impSrc || 'local/unknown',
            propsPassed: pNames,
            isConditional,
            componentDetails: compParsed,
          });
        }
      }
    }

    bodyAnalysis = {
      filename: path.relative(layoutDirPath, bodyFilePath),
      totalLines: bodyLines.length,
      hooksUsed: parsedComp?.hooks || [],
      usesFramerMotion: parsedComp?.usesFramerMotion || false,
      usesSwiper: parsedComp?.usesSwiper || false,
      sectionsRendered: sections,
    };
  }

  // 3. Components in components/ folder
  const internalComponents = [];
  const compFolder = path.join(layoutDirPath, 'components');
  const bodyCompFolder = path.join(layoutDirPath, 'body', 'components');
  
  const scanDirForComps = (dir) => {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        scanDirForComps(full);
      } else if (item.endsWith('.tsx') && !item.includes('Skeleton')) {
        const p = parseComponentFile(full);
        internalComponents.push({
          name: item.replace('.tsx', ''),
          relPath: path.relative(layoutDirPath, full),
          ...p,
        });
      }
    }
  };

  scanDirForComps(compFolder);
  scanDirForComps(bodyCompFolder);

  // 4. Subpages mapped
  const subpageCandidates = [
    layoutName.toLowerCase().replace('layout', ''),
    layoutName.toLowerCase(),
  ];
  let matchedSubpages = [];
  for (const [slug, pages] of Object.entries(subpageDirs)) {
    if (subpageCandidates.some(c => slug.includes(c) || c.includes(slug))) {
      matchedSubpages = pages;
      break;
    }
  }

  detailedAudit.push({
    themeName: layoutName,
    rootLayout: rootLayoutInfo,
    body: bodyAnalysis,
    internalComponentCount: internalComponents.length,
    internalComponents: internalComponents.map(c => ({
      name: c.name,
      relPath: c.relPath,
      lines: c.lineCount,
      responsive: c.responsiveBreakpoints,
      hasGridShift: c.hasGridShift,
      hasDirectionShift: c.hasDirectionShift,
      hasDarkClasses: c.hasDarkClasses,
    })),
    subpages: matchedSubpages,
  });
}

const finalAuditPath = path.join(process.cwd(), 'scratch', 'complete_forensic_theme_audit.json');
fs.writeFileSync(finalAuditPath, JSON.stringify(detailedAudit, null, 2));
console.log(`Successfully generated forensic audit for ${detailedAudit.length} themes!`);
