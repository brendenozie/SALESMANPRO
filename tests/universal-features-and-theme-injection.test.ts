import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { parseCanonicalTargetId, getCanonicalLookupKeys } from '../lib/website-builder/canonical-target-id';
import { getEditableComponentAdapter } from '../lib/website-builder/editable-adapters';

console.log('\n=======================================================');
console.log('🔍 UNIVERSAL FEATURES & PROP INJECTION VERIFICATION');
console.log('=======================================================\n');

let totalTests = 0;
let passedTests = 0;

function test(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// 1. Verify all 20 upgraded eCommerce FeaturesSection files exist and use UniversalFeaturesSection
const UPGRADED_LAYOUTS = [
  'EcommerceGroceriesLayout',
  'EcommerceAccessoriesLayout',
  'EcommerceWatchLayout',
  'EcommercePetsLayout',
  'EcommerceBookLayout',
  'EcommerceCakeLayout',
  'EcommerceBikeLayout',
  'EcommerceGamingLayout',
  'EcommerceFlowersLayout',
  'EcommerceEarphonesLayout',
  'EcommerceGlassesLayout',
  'EcommerceHardwareLayout',
  'EcommerceHoneyLayout',
  'EcommerceLayout',
  'EcommerceMeatLayout',
  'EcommerceMotorCycleLayout',
  'EcommercePeanutsLayout',
  'EcommerceBabyLayout',
  'EcommerceAgrovetLayout',
  'FurnitureLayout',
];

console.log('--- 1. Shared Layout File Upgrades ---');
for (const layout of UPGRADED_LAYOUTS) {
  test(`Layout ${layout} FeaturesSection exists and delegates to UniversalFeaturesSection`, () => {
    const filePath = path.join(
      process.cwd(),
      'components/site/layouts',
      layout,
      'body/components/FeaturesSection/index.tsx'
    );
    assert(fs.existsSync(filePath), `File missing: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert(
      content.includes('UniversalFeaturesSection'),
      `File ${filePath} does not reference UniversalFeaturesSection`
    );
    assert(
      content.includes('useStoreContext'),
      `File ${filePath} does not wire StoreContext`
    );
  });
}

console.log('\n--- 2. UniversalFeaturesSection Component Integrity ---');
test('UniversalFeaturesSection file exists and contains editable targets', () => {
  const filePath = path.join(
    process.cwd(),
    'components/site/shared/UniversalFeaturesSection.tsx'
  );
  assert(fs.existsSync(filePath), 'UniversalFeaturesSection.tsx missing');
  const content = fs.readFileSync(filePath, 'utf8');
  assert(content.includes('<EditableElement'), 'Missing <EditableElement> wrappers');
  assert(content.includes('useEditableContent'), 'Missing useEditableContent hook');
  assert(content.includes('badgeText'), 'Missing badgeText editable element');
  assert(content.includes('title'), 'Missing title editable element');
  assert(content.includes('description'), 'Missing description editable element');
  assert(content.includes('badge'), 'Missing badge editable element');
});

console.log('\n--- 3. Canonical Target ID Resolution for Features Array & Fields ---');
test('Resolves feature item title canonical target ID', () => {
  const targetId = 'ecommerce-groceries.home.features.FeaturesSection.main.features.0.title';
  const parsed = parseCanonicalTargetId(targetId);
  assert(parsed !== null, 'Failed to parse canonical target ID');
  assert.strictEqual(parsed?.componentKey, 'FeaturesSection');
  assert.strictEqual(parsed?.fieldKey, 'features.0.title');
  assert.strictEqual(parsed?.itemIndex, 0);

  const keys = getCanonicalLookupKeys(targetId);
  assert(keys.includes(targetId), 'Exact target ID should be included');
  assert(keys.includes('FeaturesSection.features.0.title'), 'Component key + field path should be included');
});

test('Resolves feature section top-level headline and description target IDs', () => {
  const targetId = 'ecommerce-cake.home.features.FeaturesSection.main.title';
  const parsed = parseCanonicalTargetId(targetId);
  assert(parsed !== null, 'Failed to parse canonical target ID');
  assert.strictEqual(parsed?.fieldKey, 'title');

  const keys = getCanonicalLookupKeys(targetId);
  assert(keys.includes('FeaturesSection.title'), 'Component key + field path should be included');
});

console.log('\n--- 4. ThemeSectionContainer Universal Prop Injection ---');
test('createThemeSectionAdapter implements cloneElement prop injection', () => {
  const adapterPath = path.join(
    process.cwd(),
    'lib/website-builder/createThemeSectionAdapter.tsx'
  );
  assert(fs.existsSync(adapterPath), 'createThemeSectionAdapter.tsx missing');
  const content = fs.readFileSync(adapterPath, 'utf8');
  assert(
    content.includes('React.cloneElement(content'),
    'Missing React.cloneElement in createThemeSectionAdapter'
  );
  assert(
    content.includes('sectionId: section.id'),
    'Missing sectionId injection'
  );
  assert(
    content.includes('sectionType: section.type'),
    'Missing sectionType injection'
  );
  assert(
    content.includes('section.content') && content.includes('? section.content'),
    'Missing shallow spread of section.content'
  );
});

console.log('\n=======================================================');
console.log(`📊 RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('=======================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
