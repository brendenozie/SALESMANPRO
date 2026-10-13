import fs from 'fs';

interface Profile {
  layout: string;
  componentName: string;
  category: string;
  filePath: string;
}

const audit: Profile[] = JSON.parse(fs.readFileSync('scratch/comprehensive-component-audit.json', 'utf8'));
const fv = audit.filter((c) => c.category === 'features_values' && c.currentEditabilityStatus !== 'CANONICAL_ITEMS');
const custom = fv.filter((c) => !fs.readFileSync(c.filePath, 'utf8').includes('UniversalFeaturesSection'));

const summary = custom.map((c) => {
  const code = fs.readFileSync(c.filePath, 'utf8');
  const hasEditable = code.includes('EditableElement');
  const hasUseEditable = code.includes('useEditableContent');
  const hasMap = code.includes('.map(');
  const targetIds: string[] = [];
  for (const m of code.matchAll(/targetId=\{?["'`]([^"'`]+)["'`]/g)) {
    targetIds.push(m[1]);
  }
  return {
    layout: c.layout,
    componentName: c.componentName,
    filePath: c.filePath,
    hasEditable,
    hasMap,
    targetCount: targetIds.length,
    targets: targetIds.slice(0, 5),
  };
});

console.log(JSON.stringify(summary, null, 2));
