const fs = require('fs');
const path = require('path');

const targetCards = [
  'EcommerceAccessoriesLayout/body/components/ProductShowcaseGrid/ProductCard',
  'EcommerceAgrovetLayout/body/components/ProductCard',
  'EcommerceBabyLayout/body/components/ProductCard',
  'EcommerceBabyLayout/body/components/ProductShowcaseGrid/ProductCard',
  'EcommerceBikeLayout/body/components/ProductCard',
  'EcommerceBookLayout/body/components/ProductCard',
  'EcommerceCakeLayout/body/components/ProductCard',
  'EcommerceEarphonesLayout/body/components/ProductCard',
  'EcommerceFlowersLayout/body/components/ProductCard',
  'EcommerceGamingLayout/body/components/ProductCard',
  'EcommerceGlassesLayout/body/components/ProductCard',
  'EcommerceGroceriesLayout/body/components/ProductCard',
  'EcommerceHardwareLayout/body/components/ProductShowcaseGrid/ProductCard',
  'EcommerceHoneyLayout/body/components/ProductCard',
  'EcommerceMeatLayout/body/components/ProductCard',
  'EcommerceMotorCycleLayout/body/components/ProductCard',
  'EcommercePeanutsLayout/body/components/ProductCard',
  'EcommercePetsLayout/body/components/ProductCard',
  'EcommerceWatchLayout/body/components/ProductCard',
  'FashionLayout/body/components/ProductCard',
  'FurnitureLayout/body/components/ProductCard'
];

let updatedCount = 0;

for (const relPath of targetCards) {
  const filePath = path.join('components/site/layouts', relPath, 'index.tsx');
  if (!fs.existsSync(filePath)) {
    console.log('Skipping missing:', filePath);
    continue;
  }

  let code = fs.readFileSync(filePath, 'utf8');
  if (code.includes('UniversalQuickBuyDrawer')) {
    console.log('Already updated:', relPath);
    continue;
  }

  // 1. Add UniversalQuickBuyDrawer and BoltIcon import if not present
  if (!code.includes('UniversalQuickBuyDrawer')) {
    const lastImportIdx = code.lastIndexOf('import ');
    const endOfLastImport = code.indexOf('\n', lastImportIdx);
    const importCode = '\nimport UniversalQuickBuyDrawer from "@/components/site/shared/UniversalQuickBuyDrawer";\nimport { BoltIcon } from "@heroicons/react/24/solid";';
    code = code.slice(0, endOfLastImport) + importCode + code.slice(endOfLastImport);
  }

  // 2. Add isQuickBuyOpen state hook
  const stateMatch = code.match(/const \[([a-zA-Z0-9_]+),\s*set([a-zA-Z0-9_]+)\]\s*=\s*useState/);
  if (stateMatch) {
    const idx = code.indexOf(stateMatch[0]);
    code = code.slice(0, idx) + 'const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);\n  ' + code.slice(idx);
  }

  // 3. Mount UniversalQuickBuyDrawer right before the last closing </React.Fragment> or </>
  const lastFragmentClose = code.lastIndexOf('</>');
  if (lastFragmentClose !== -1) {
    const drawerMount = '\n      <UniversalQuickBuyDrawer\n        isOpen={isQuickBuyOpen}\n        product={product}\n        storeId={storeFormData?.id || (product as any)?.companyId}\n        onClose={() => setIsQuickBuyOpen(false)}\n      />\n    ';
    code = code.slice(0, lastFragmentClose) + drawerMount + code.slice(lastFragmentClose);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('Successfully injected into:', relPath);
    updatedCount++;
  } else {
    console.log('Could not find closing fragment in:', relPath);
  }
}

console.log('Total ProductCards updated:', updatedCount);
