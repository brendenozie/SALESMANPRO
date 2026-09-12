const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(process.cwd(), 'components/site/layouts');
const appSiteSlugDir = path.join(process.cwd(), 'app/site/[slug]');

// 1. Read template registry
const registryContent = fs.readFileSync(path.join(process.cwd(), 'lib/website-builder/template-registry.ts'), 'utf8');

// Parse TEMPLATE_REGISTRY entries
const templateMap = {};
const templateBlocks = registryContent.match(/export const TEMPLATE_REGISTRY:\s*Record<string,\s*TemplateDefinition>\s*=\s*\{([\s\S]*?)\n\};\n\n\/\*\*/);

// Extract template definitions from registry
const tplRegex = /["']?([a-zA-Z0-9_-]+)["']?:\s*\{[\s\S]*?id:\s*["']([^"']+)["'],[\s\S]*?name:\s*["']([^"']+)["'],[\s\S]*?category:\s*["']([^"']+)["'],[\s\S]*?variant:\s*["']([^"']+)["'],[\s\S]*?shellLayout:\s*["']([^"']+)["'],[\s\S]*?bodyComponent:\s*["']([^"']+)["']/g;
let m;
while ((m = tplRegex.exec(registryContent)) !== null) {
  templateMap[m[1]] = {
    key: m[1],
    id: m[2],
    name: m[3],
    category: m[4],
    variant: m[5],
    shellLayout: m[6],
    bodyComponent: m[7]
  };
}

// 2. Scan all subpage folders in app/site/[slug]
const subpageFolders = {};
if (fs.existsSync(appSiteSlugDir)) {
  fs.readdirSync(appSiteSlugDir).forEach(item => {
    const full = path.join(appSiteSlugDir, item);
    if (fs.statSync(full).isDirectory() && !item.startsWith('[')) {
      const pages = fs.readdirSync(full).filter(p => {
        const pFull = path.join(full, p);
        return fs.statSync(pFull).isDirectory() && fs.existsSync(path.join(pFull, 'page.tsx'));
      });
      subpageFolders[item] = pages;
    }
  });
}

// 3. Scan each of the 56 layout folders
const layoutDirs = fs.readdirSync(layoutsDir).filter(f => {
  const full = path.join(layoutsDir, f);
  return fs.statSync(full).isDirectory() && f.includes('Layout');
});

const results = [];

for (const lName of layoutDirs) {
  const lDir = path.join(layoutsDir, lName);
  
  // Find layout wrapper file
  const lFiles = fs.readdirSync(lDir);
  const layoutFile = lFiles.find(f => f.includes('Layout.tsx') || f.includes('Layout.jsx'));
  let layoutContent = '';
  let headerName = 'Unknown';
  let footerName = 'Unknown';
  if (layoutFile) {
    layoutContent = fs.readFileSync(path.join(lDir, layoutFile), 'utf8');
    const hMatch = layoutContent.match(/<([A-Za-z0-9_]*Header[A-Za-z0-9_]*)/);
    if (hMatch) headerName = hMatch[1];
    const fMatch = layoutContent.match(/<([A-Za-z0-9_]*Footer[A-Za-z0-9_]*)/);
    if (fMatch) footerName = fMatch[1];
  }

  // Find body file
  let bodyFile = null;
  let bodyContent = '';
  const bodyDir = path.join(lDir, 'body');
  if (fs.existsSync(bodyDir)) {
    const bFiles = fs.readdirSync(bodyDir);
    const candidate = bFiles.find(f => f.endsWith('Site.tsx') || f.endsWith('Site2.tsx') || f.endsWith('Site3.tsx') || f.endsWith('Body.tsx'));
    if (candidate) {
      bodyFile = path.join('body', candidate);
      bodyContent = fs.readFileSync(path.join(bodyDir, candidate), 'utf8');
    }
  }
  if (!bodyFile) {
    const candidate = lFiles.find(f => f.endsWith('Site.tsx') || f.endsWith('Site2.tsx') || f.endsWith('Site3.tsx') || f.endsWith('Body.tsx'));
    if (candidate) {
      bodyFile = candidate;
      bodyContent = fs.readFileSync(path.join(lDir, candidate), 'utf8');
    }
  }

  // Scan internal components in components/
  const components = [];
  const compDirs = [path.join(lDir, 'components'), path.join(lDir, 'body', 'components')];
  for (const cDir of compDirs) {
    if (fs.existsSync(cDir)) {
      const scanComp = (dir, rel) => {
        fs.readdirSync(dir).forEach(item => {
          const full = path.join(dir, item);
          if (fs.statSync(full).isDirectory()) {
            scanComp(full, path.join(rel, item));
          } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
            const code = fs.readFileSync(full, 'utf8');
            const lines = code.split('\n').length;
            const hasFramer = code.includes('framer-motion');
            const hasSwiper = code.includes('swiper');
            const hasDark = /dark:/.test(code);
            const hasGrid = /grid|grid-cols/.test(code);
            const hasFlex = /flex|flex-col|flex-row/.test(code);
            const hasResponsive = /sm:|md:|lg:|xl:/.test(code);
            const hasMobileHidden = /hidden\s+(?:sm:|md:|lg:)/.test(code) || /(?:sm:|md:|lg:):hidden/.test(code);
            const hasDirectionShift = /flex-col\s+(?:sm:|md:|lg:):flex-row/.test(code) || /flex-row\s+(?:sm:|md:|lg:):flex-col/.test(code);
            
            components.push({
              name: item.replace(/\.[^/.]+$/, ""),
              relPath: path.join(rel, item),
              lines,
              hasFramer,
              hasSwiper,
              hasDark,
              hasGrid,
              hasFlex,
              hasResponsive,
              hasMobileHidden,
              hasDirectionShift
            });
          }
        });
      };
      scanComp(cDir, '');
    }
  }

  // Parse rendered sections in body
  const renderedSections = [];
  if (bodyContent) {
    const lines = bodyContent.split('\n');
    let insideReturn = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('return (') || line.includes('return(') || line.includes('return <')) {
        insideReturn = true;
      }
      if (!insideReturn) continue;

      const compMatch = line.match(/<([A-Z][A-Za-z0-9_]+)(\s|>|\/)/);
      if (compMatch) {
        const cName = compMatch[1];
        if (!['React', 'Fragment', 'Suspense', 'SkeletonGrid', 'ComponentSkeleton', 'div', 'main', 'section'].includes(cName)) {
          // Look for editor wrappers
          const edSecMatch = line.match(/data-editor-section=["']([^"']+)["']/);
          const edCompMatch = line.match(/data-editor-component=["']([^"']+)["']/);
          const idMatch = line.match(/id=["'](section-[^"']+)["']/);

          // Check conditional
          const isCond = line.includes('&&') || (i > 0 && lines[i-1].includes('&&'));

          // Check props
          let propSnippet = line;
          let k = i;
          while (k < lines.length && !propSnippet.includes('/>') && !propSnippet.includes('>') && k < i + 8) {
            k++;
            propSnippet += ' ' + lines[k];
          }
          const props = [...propSnippet.matchAll(/([a-zA-Z0-9_-]+)=\{/g)].map(x => x[1]);

          // Find internal comp file if exists
          const compInfo = components.find(c => c.name === cName || c.name.toLowerCase() === cName.toLowerCase());

          renderedSections.push({
            name: cName,
            editorSection: edSecMatch ? edSecMatch[1] : (idMatch ? idMatch[1].replace('section-', '') : null),
            editorComponent: edCompMatch ? edCompMatch[1] : cName,
            isConditional: isCond,
            props,
            internalDetails: compInfo || null,
          });
        }
      }
    }
  }

  // Match subpages
  let matchedSubpages = [];
  const normalizedLName = lName.toLowerCase().replace('layout', '').replace('ecommerce', '');
  for (const [folder, pages] of Object.entries(subpageFolders)) {
    const nFolder = folder.toLowerCase().replace('ecommerce', '');
    if (folder.toLowerCase() === lName.toLowerCase() || 
        folder.toLowerCase() === lName.toLowerCase().replace('layout', '') ||
        nFolder === normalizedLName ||
        (normalizedLName && nFolder.includes(normalizedLName)) ||
        (normalizedLName && normalizedLName.includes(nFolder))) {
      matchedSubpages = pages;
      break;
    }
  }

  // Match template registry info
  const regTpl = Object.values(templateMap).find(t => t.shellLayout === lName || t.bodyComponent === (bodyFile ? path.basename(bodyFile).replace('.tsx', '') : ''));

  results.push({
    themeName: lName,
    templateInfo: regTpl || null,
    shell: {
      file: layoutFile || null,
      header: headerName,
      footer: footerName,
      lines: layoutContent ? layoutContent.split('\n').length : 0,
      hasHeaderDir: fs.existsSync(path.join(lDir, 'header')),
      hasFooterDir: fs.existsSync(path.join(lDir, 'footer')),
    },
    body: {
      file: bodyFile,
      lines: bodyContent ? bodyContent.split('\n').length : 0,
      sections: renderedSections,
    },
    componentsCount: components.length,
    components,
    subpages: matchedSubpages,
  });
}

// Write compiled data
const compiledPath = path.join(process.cwd(), 'scratch', 'complete_theme_discovery_dataset.json');
fs.writeFileSync(compiledPath, JSON.stringify(results, null, 2));
console.log(`Audited ${results.length} themes. Compiled data written to ${compiledPath}`);
