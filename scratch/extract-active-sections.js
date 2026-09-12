const fs = require('fs');
const path = require('path');
const r = require(path.join(__dirname, 'forensic-audit-results.json'));

const results = {};

r.forEach(item => {
  if (!item.siteFilePath || !fs.existsSync(item.siteFilePath)) {
    results[item.templateKey] = { shellLayout: item.shellLayout, components: [] };
    return;
  }
  const content = fs.readFileSync(item.siteFilePath, 'utf8');
  // Match the return ( ... );
  const returnIdx = content.indexOf('return (');
  if (returnIdx === -1) {
    results[item.templateKey] = { shellLayout: item.shellLayout, components: [] };
    return;
  }
  const jsxSlice = content.slice(returnIdx + 8);
  // Remove JSX block comments {/* ... */}
  const cleanJsx = jsxSlice.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  // Extract all component tags: <ComponentName
  const tagMatches = [...cleanJsx.matchAll(/<([A-Z][A-Za-z0-9]+)/g)].map(m => m[1]);
  // Filter out standard non-section tags
  const ignored = new Set([
    'Fragment', 'StoreContextProvider', 'StoreDataSync', 'Layout', 'Link', 'Image',
    'motion', 'AnimatePresence', 'Suspense', 'Dialog', 'Transition', 'Menu', 'Tab',
    'EditableElement', 'SectionErrorBoundary', 'Icon'
  ]);
  const sections = tagMatches.filter(t => !ignored.has(t));
  
  // Also check data-editor-component attributes in the clean JSX
  const editorComponentMatches = [...cleanJsx.matchAll(/data-editor-component=["']([^"']+)["']/g)].map(m => m[1]);
  
  const combined = [];
  const seen = new Set();
  
  // Preserve order of appearance
  const allFound = [...cleanJsx.matchAll(/(?:<([A-Z][A-Za-z0-9]+)|data-editor-component=["']([^"']+)["'])/g)];
  for (const m of allFound) {
    const name = m[2] || m[1];
    if (name && !ignored.has(name) && !seen.has(name)) {
      seen.add(name);
      combined.push(name);
    }
  }

  results[item.templateKey] = {
    templateKey: item.templateKey,
    shellLayout: item.shellLayout,
    bodyComponent: item.bodyComponent,
    components: combined
  };
});

fs.writeFileSync('scratch/exact-active-sections.json', JSON.stringify(results, null, 2));
console.log('Extracted exact active sections for', Object.keys(results).length, 'templates.');
Object.entries(results).forEach(([k, v]) => {
  console.log(k, '(' + v.shellLayout + '):', v.components.join(', '));
});
