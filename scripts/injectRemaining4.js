const fs = require('fs');

function updateFile(filePath, searchStr, replaceStr) {
  let c = fs.readFileSync(filePath, 'utf8');
  if (c.includes(searchStr)) {
    c = c.replace(searchStr, replaceStr);
    fs.writeFileSync(filePath, c, 'utf8');
    console.log('Updated:', filePath);
  } else {
    console.log('Pattern not found in:', filePath);
  }
}

// 1. EcommerceEarphonesLayout
updateFile(
  'components/site/layouts/EcommerceEarphonesLayout/body/components/ProductCard/index.tsx',
  '<motion.button\n                    initial={{ y: 20, opacity: 0 }}\n                    animate={{ y: 0, opacity: 1 }}\n                    onClick={handleAddClick}',
  '<motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => { e.stopPropagation(); setIsQuickBuyOpen(true); }} className="w-full mb-2 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xl font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all"><BoltIcon className="w-4 h-4" /><span>Quick Buy (1-Tap)</span></motion.button>\n                  <motion.button\n                    initial={{ y: 20, opacity: 0 }}\n                    animate={{ y: 0, opacity: 1 }}\n                    onClick={handleAddClick}'
);

// 2. EcommerceFlowersLayout
updateFile(
  'components/site/layouts/EcommerceFlowersLayout/body/components/ProductCard/index.tsx',
  '<motion.button\n                      initial={{ y: 20, opacity: 0 }}\n                      animate={{ y: 0, opacity: 1 }}\n                      onClick={handleQuickAction}',
  '<motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => { e.stopPropagation(); setIsQuickBuyOpen(true); }} className="w-full mb-2 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xl font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all"><BoltIcon className="w-4 h-4" /><span>Quick Buy (1-Tap)</span></motion.button>\n                    <motion.button\n                      initial={{ y: 20, opacity: 0 }}\n                      animate={{ y: 0, opacity: 1 }}\n                      onClick={handleQuickAction}'
);

// 3. EcommerceMotorCycleLayout
updateFile(
  'components/site/layouts/EcommerceMotorCycleLayout/body/components/ProductCard/index.tsx',
  '<button\n                onClick={handleOpenSelector}\n                className="w-full bg-white text-black py-4',
  '<button type="button" onClick={(e) => { e.stopPropagation(); setIsQuickBuyOpen(true); }} className="w-full mb-2 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-none flex items-center justify-center gap-1.5 shadow-xl font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all"><BoltIcon className="w-4 h-4" /><span>Quick Buy (1-Tap)</span></button>\n              <button\n                onClick={handleOpenSelector}\n                className="w-full bg-white text-black py-4'
);

// 4. EcommerceWatchLayout
updateFile(
  'components/site/layouts/EcommerceWatchLayout/body/components/ProductCard/index.tsx',
  '<button\n                  onClick={handleAddToBag}\n                  className="w-full bg-white text-black py-3',
  '<button type="button" onClick={(e) => { e.stopPropagation(); setIsQuickBuyOpen(true); }} className="w-full mb-2 bg-amber-500 hover:bg-amber-400 text-black py-2.5 rounded-none flex items-center justify-center gap-1.5 shadow-xl font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all"><BoltIcon className="w-4 h-4" /><span>Quick Buy (1-Tap)</span></button>\n                <button\n                  onClick={handleAddToBag}\n                  className="w-full bg-white text-black py-3'
);
