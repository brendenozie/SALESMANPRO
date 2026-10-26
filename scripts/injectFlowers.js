const fs = require('fs');

const p = 'components/site/layouts/EcommerceFlowersLayout/body/components/ProductCard/index.tsx';
let c = fs.readFileSync(p, 'utf8');

const targetStr = '{isHovered && (';
const qbButton = `{isHovered && (
              <div className="absolute top-4 left-4 z-20">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsQuickBuyOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl font-black text-[9px] uppercase tracking-wider active:scale-95 transition-all"
                >
                  <BoltIcon className="w-3.5 h-3.5" />
                  <span>Quick Buy</span>
                </button>
              </div>`;

if (c.includes(targetStr)) {
  c = c.replace(targetStr, qbButton);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Successfully injected Quick Buy button into Flowers');
} else {
  console.log('Target string not found in Flowers');
}
