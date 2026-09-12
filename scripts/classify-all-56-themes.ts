import fs from 'fs';
import path from 'path';
import { TEMPLATE_REGISTRY } from '../lib/website-builder/template-registry';

const layoutsDir = path.resolve('components/site/layouts');
const layoutDirs = fs.readdirSync(layoutsDir).filter(f => fs.statSync(path.join(layoutsDir, f)).isDirectory());

interface ThemeAnalysis {
  index: number;
  layoutName: string;
  bodyFileName: string;
  hasBodyFile: boolean;
  templateId: string;
  usesSectionsProp: boolean;
  editorSectionCount: number;
  editorComponentCount: number;
  hasDynamicDispatch: boolean;
  hasCustomInternalState: boolean;
  hasInlineDataTransforms: boolean;
  classification: 'FULLY DYNAMIC' | 'PARTIALLY DYNAMIC' | 'HYBRID' | 'DYNAMIC-COMPATIBLE / STATIC-COMPOSITION' | 'STATIC MONOLITHIC';
  notes: string;
}

const analyses: ThemeAnalysis[] = [];

layoutDirs.forEach((layoutName, idx) => {
  const dirPath = path.join(layoutsDir, layoutName);
  const bodyDir = path.join(dirPath, 'body');
  
  let bodyFileName = 'NONE';
  let hasBodyFile = false;
  let fileContent = '';
  
  if (fs.existsSync(bodyDir)) {
    const files = fs.readdirSync(bodyDir).filter(f => f.endsWith('.tsx'));
    if (files.length > 0) {
      bodyFileName = files[0];
      hasBodyFile = true;
      fileContent = fs.readFileSync(path.join(bodyDir, bodyFileName), 'utf8');
    }
  }

  // Find template in registry
  const tpl = Object.values(TEMPLATE_REGISTRY).find(t => t.shellLayout === layoutName);
  const templateId = tpl ? tpl.id : (layoutName === 'SalonBookingsLayout' ? 'salon-bookings@v1 (discovered)' : 'NONE');

  const usesSectionsProp = fileContent.includes('pageData.sections') || fileContent.includes('sections') && fileContent.includes('.map(');
  
  const editorSections = [...fileContent.matchAll(/data-editor-section=["']([^"']+)["']/g)].map(m => m[1]);
  const editorComponents = [...fileContent.matchAll(/data-editor-component=["']([^"']+)["']/g)].map(m => m[1]);

  const hasDynamicDispatch = fileContent.includes('renderSectionComponent') || (fileContent.includes('.map(') && fileContent.includes('data-editor-section'));
  
  const hasCustomInternalState = (fileContent.match(/useState/g) || []).length > 2;
  const hasInlineDataTransforms = fileContent.includes('.map(') && !hasDynamicDispatch && (fileContent.includes('storeFormData?.CompanyLocation') || fileContent.includes('MOCK_PRODUCTS') || fileContent.includes('useCallback('));

  let classification: ThemeAnalysis['classification'] = 'STATIC MONOLITHIC';
  let notes = '';

  if (layoutName === 'FurnitureLayout') {
    classification = 'FULLY DYNAMIC';
    notes = 'Reference fully dynamic implementation via renderSectionComponent';
  } else if (layoutName === 'DeliveryLayout') {
    classification = 'PARTIALLY DYNAMIC';
    notes = 'Dynamic section iteration repaired; 33 sections mapped to authentic components';
  } else if (layoutName === 'RestaurantLayout') {
    classification = 'HYBRID';
    notes = 'Binds heroConfig dynamically from pageData.sections, hardcodes subsequent sections';
  } else if (hasBodyFile && editorSections.length > 0) {
    if (!hasInlineDataTransforms && (fileContent.match(/useState/g) || []).length <= 2) {
      classification = 'DYNAMIC-COMPATIBLE / STATIC-COMPOSITION';
      notes = `Clean modular composition with ${editorSections.length} data-editor-sections, ready for Theme Section Adapter`;
    } else {
      classification = 'STATIC MONOLITHIC';
      notes = `Static JSX with complex internal state/closures (${(fileContent.match(/useState/g) || []).length} states) requiring theme-specific adapter`;
    }
  } else {
    classification = 'STATIC MONOLITHIC';
    notes = 'No editor sections or missing body file';
  }

  analyses.push({
    index: idx + 1,
    layoutName,
    bodyFileName,
    hasBodyFile,
    templateId,
    usesSectionsProp,
    editorSectionCount: editorSections.length,
    editorComponentCount: editorComponents.length,
    hasDynamicDispatch,
    hasCustomInternalState,
    hasInlineDataTransforms,
    classification,
    notes,
  });
});

console.log('=== CLASSIFICATION SUMMARY ===');
const counts = {
  'FULLY DYNAMIC': analyses.filter(a => a.classification === 'FULLY DYNAMIC').length,
  'PARTIALLY DYNAMIC': analyses.filter(a => a.classification === 'PARTIALLY DYNAMIC').length,
  'HYBRID': analyses.filter(a => a.classification === 'HYBRID').length,
  'DYNAMIC-COMPATIBLE / STATIC-COMPOSITION': analyses.filter(a => a.classification === 'DYNAMIC-COMPATIBLE / STATIC-COMPOSITION').length,
  'STATIC MONOLITHIC': analyses.filter(a => a.classification === 'STATIC MONOLITHIC').length,
};
console.log(counts);
console.log('Total themes:', analyses.length);

fs.writeFileSync('scratch/theme-classifications-56.json', JSON.stringify(analyses, null, 2));
console.log('Saved to scratch/theme-classifications-56.json');
