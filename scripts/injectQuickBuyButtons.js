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
  'FurnitureLayout/body/components/ProductCard'
];

let injectedCTA = 0;

for (const relPath of targetCards) {
  const filePath = path.join('components/site/layouts', relPath, 'index.tsx');
  if (!fs.existsSync(filePath)) continue;

  let code = fs.readFileSync(filePath, 'utf8');
  if (code.includes('setIsQuickBuyOpen(true)')) {
    console.log('Already has CTA trigger:', relPath);
    continue;
  }

  const qbButtonMarkup = `<button type="button" onClick={(e) => { e.stopPropagation(); setIsQuickBuyOpen(true); }} className="w-full mb-2.5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"><BoltIcon className="w-3.5 h-3.5" /><span>Quick Buy (1-Tap)</span></button>\n            `;

  const actionMarkers = [
    '/* Main Display Actions Area Grid Block */',
    '{/* Functional Actions Module: Modal Prioritized */}',
    '{/* Action Buttons */}',
    '{/* Interactive Controls Container */}',
    '<div className="mt-auto">'
  ];

  let replaced = false;
  for (const marker of actionMarkers) {
    if (code.includes(marker)) {
      code = code.replace(marker, marker + '\n            ' + qbButtonMarkup);
      replaced = true;
      break;
    }
  }

  if (!replaced) {
    const animIdx = code.indexOf('<AnimatePresence mode="wait">', code.indexOf('return'));
    if (animIdx !== -1) {
      code = code.slice(0, animIdx) + qbButtonMarkup + code.slice(animIdx);
      replaced = true;
    }
  }

  if (replaced) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('Injected CTA into:', relPath);
    injectedCTA++;
  } else {
    console.log('Could not find injection point for CTA in:', relPath);
  }
}

console.log('Total CTAs injected:', injectedCTA);
