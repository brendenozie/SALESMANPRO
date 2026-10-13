const fs = require('fs');
const path = require('path');
const { TEMPLATE_REGISTRY } = require('../dist-worker/lib/website-builder/template-registry');

const layoutsDir = path.resolve('./components/site/layouts');

function analyzeComponentFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');

  const hasEditableElement = content.includes('EditableElement');
  const hasUseEditableContent = content.includes('useEditableContent');
  const hasStoreContext = content.includes('useStoreContext');
  const hasPageDataOrStore = content.includes('pageData') || content.includes('storeFormData') || content.includes('storeData') || content.includes('store.');
  
  // Extract target IDs if any
  const targetIds = Array.from(content.matchAll(/targetId=\{?["'`]([^"'`]+)["'`]/g)).map(m => m[1]);
  const legacyTargets = Array.from(content.matchAll(/data-editor-target=["']([^"']+)["']/g)).map(m => m[1]);
  const allTargets = Array.from(new Set([...targetIds, ...legacyTargets]));

  // Extract raw text or props that could be editable
  const hasHeadline = content.includes('headline') || content.includes('title');
  const hasSubline = content.includes('subline') || content.includes('subtitle') || content.includes('description');
  const hasBadge = content.includes('badge') || content.includes('badgeText');
  const hasCta = content.includes('ctaText') || content.includes('buttonText') || content.includes('ctaLink') || content.includes('buttonLink');
  const hasImage = content.includes('imageUrl') || content.includes('image') || content.includes('bannerUrl');
  const hasSlides = content.includes('slides') || content.includes('heroSlides');

  return {
    filePath: path.relative(process.cwd(), filePath),
    hasEditableElement,
    hasUseEditableContent,
    hasStoreContext,
    hasPageDataOrStore,
    targets: allTargets,
    fields: {
      headline: hasHeadline,
      subline: hasSubline,
      badge: hasBadge,
      cta: hasCta,
      image: hasImage,
      slides: hasSlides
    }
  };
}

const themeInventory = [];

for (const [tplId, tpl] of Object.entries(TEMPLATE_REGISTRY)) {
  const shellLayout = tpl.shellLayout;
  const bodyComponent = tpl.bodyComponent;
  const layoutPath = path.join(layoutsDir, shellLayout);
  
  const themeObj = {
    themeId: tplId,
    themeName: tpl.name,
    category: tpl.category,
    shellLayout,
    bodyComponent,
    shellFile: path.relative(process.cwd(), path.join(layoutPath, `${shellLayout}.tsx`)),
    headerFile: null,
    footerFile: null,
    bodyFile: null,
    components: []
  };

  // Check header
  const headerPath = path.join(layoutPath, 'header', 'index.tsx');
  if (fs.existsSync(headerPath)) {
    themeObj.headerFile = path.relative(process.cwd(), headerPath);
    const analysis = analyzeComponentFile(headerPath);
    if (analysis) themeObj.components.push({ name: 'Header', ...analysis, role: 'header' });
  }

  // Check footer
  const footerPath = path.join(layoutPath, 'footer', 'index.tsx');
  if (fs.existsSync(footerPath)) {
    themeObj.footerFile = path.relative(process.cwd(), footerPath);
    const analysis = analyzeComponentFile(footerPath);
    if (analysis) themeObj.components.push({ name: 'Footer', ...analysis, role: 'footer' });
  }

  // Check body
  const bodyFiles = [
    path.join(layoutPath, 'body', `${bodyComponent}.tsx`),
    path.join(layoutPath, 'body', `${shellLayout.replace('Layout', 'Site')}.tsx`),
    path.join(layoutPath, `${shellLayout.replace('Layout', 'Site')}.tsx`),
  ];
  const foundBody = bodyFiles.find(f => fs.existsSync(f));
  if (foundBody) {
    themeObj.bodyFile = path.relative(process.cwd(), foundBody);
    
    // Check components inside body/components/
    const bodyCompDir = path.join(path.dirname(foundBody), 'components');
    if (fs.existsSync(bodyCompDir)) {
      const items = fs.readdirSync(bodyCompDir, { withFileTypes: true });
      for (const item of items) {
        let compFile = null;
        if (item.isDirectory()) {
          const indexFile = path.join(bodyCompDir, item.name, 'index.tsx');
          const namedFile = path.join(bodyCompDir, item.name, `${item.name}.tsx`);
          if (fs.existsSync(indexFile)) compFile = indexFile;
          else if (fs.existsSync(namedFile)) compFile = namedFile;
        } else if (item.name.endsWith('.tsx')) {
          compFile = path.join(bodyCompDir, item.name);
        }

        if (compFile) {
          const compName = item.name.replace(/\.tsx$/, '');
          const analysis = analyzeComponentFile(compFile);
          if (analysis) {
            themeObj.components.push({ name: compName, ...analysis, role: 'body-section' });
          }
        }
      }
    }
  }

  themeInventory.push(themeObj);
}

fs.writeFileSync('./scratch/theme-inventory-56.json', JSON.stringify(themeInventory, null, 2));

console.log(`Audited ${themeInventory.length} themes.`);
let totalComps = 0;
let editableComps = 0;
let uneditableComps = 0;

themeInventory.forEach(t => {
  t.components.forEach(c => {
    totalComps++;
    if (c.hasEditableElement || (c.hasStoreContext && c.hasPageDataOrStore)) {
      editableComps++;
    } else {
      uneditableComps++;
    }
  });
});

console.log(`Total components discovered across 56 themes: ${totalComps}`);
console.log(`Directly editable (EditableElement or StoreContext): ${editableComps}`);
console.log(`Potentially uneditable (missing EditableElement & StoreContext): ${uneditableComps}`);
