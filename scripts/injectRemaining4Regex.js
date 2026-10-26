const fs = require('fs');

function updateWithRegex(filePath, regex, replacement) {
  let c = fs.readFileSync(filePath, 'utf8');
  if (regex.test(c)) {
    c = c.replace(regex, replacement);
    fs.writeFileSync(filePath, c, 'utf8');
    console.log('Updated:', filePath);
  } else {
    console.log('Regex did not match in:', filePath);
  }
}

// 1. EcommerceEarphonesLayout
updateWithRegex(
  'components/site/layouts/EcommerceEarphonesLayout/body/components/ProductCard/index.tsx',
  /(<motion\.button[^>]*onClick=\{handleAddClick\})/g,
  '<motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => { e.stopPropagation(); setIsQuickBuyOpen(true); }} className="w-full mb-2 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xl font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all"><BoltIcon className="w-4 h-4" /><span>Quick Buy (1-Tap)</span></motion.button>\n                  $1'
);

// 2. EcommerceFlowersLayout
updateWithRegex(
  'components/site/layouts/EcommerceFlowersLayout/body/components/ProductCard/index.tsx',
  /(<motion\.button[^>]*onClick=\{handleQuickAction\})/g,
  '<motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => { e.stopPropagation(); setIsQuickBuyOpen(true); }} className="w-full mb-2 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xl font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all"><BoltIcon className="w-4 h-4" /><span>Quick Buy (1-Tap)</span></motion.button>\n                    $1'
);

// 3. EcommerceMotorCycleLayout
updateWithRegex(
  'components/site/layouts/EcommerceMotorCycleLayout/body/components/ProductCard/index.tsx',
  /(<button[^>]*onClick=\{handleOpenSelector\})/g,
  '<button type="button" onClick={(e) => { e.stopPropagation(); setIsQuickBuyOpen(true); }} className="w-full mb-2 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-none flex items-center justify-center gap-1.5 shadow-xl font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all"><BoltIcon className="w-4 h-4" /><span>Quick Buy (1-Tap)</span></button>\n              $1'
);

// 4. EcommerceWatchLayout
updateWithRegex(
  'components/site/layouts/EcommerceWatchLayout/body/components/ProductCard/index.tsx',
  /(<button[^>]*onClick=\{handleAddToBag\})/g,
  '<button type="button" onClick={(e) => { e.stopPropagation(); setIsQuickBuyOpen(true); }} className="w-full mb-2 bg-amber-500 hover:bg-amber-400 text-black py-2.5 rounded-none flex items-center justify-center gap-1.5 shadow-xl font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all"><BoltIcon className="w-4 h-4" /><span>Quick Buy (1-Tap)</span></button>\n                $1'
);
