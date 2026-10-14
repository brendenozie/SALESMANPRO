const fs = require('fs');
const path = require('path');

// 1. AutomotiveLayout AwardsSection - missing closing </div>
{
  const p = path.resolve('components', 'site', 'layouts', 'AutomotiveLayout', 'body', 'components', 'AwardsSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  // At the bottom of the section:
  //           <div className="flex gap-2">
  //             {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-red-600" />)}
  //           </div>
  //       </div>
  //     </section>
  // Needs one more </div> to close <div className="max-w-7xl mx-auto px-6 relative z-10">
  content = content.replace(
    /(\s*<div className="flex gap-2">\s*\{\[1, 2, 3\]\.map\(i => <div key=\{i\} className="w-1 h-1 bg-red-600" \/>\)\}\s*<\/div>\s*<\/div>)(\s*<\/section>)/,
    `$1\n        </div>$2`
  );
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed AutomotiveLayout AwardsSection closing div');
}

// 2. EcommerceBabyLayout SecondPromoSection
{
  const p = path.resolve('components', 'site', 'layouts', 'EcommerceBabyLayout', 'body', 'components', 'SecondPromoSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  // Remove misplaced opening tag before Valid Until
  content = content.replace(
    /<EditableElement targetId="home\.secondPromo\.description"[^>]*><p className="text-\[10px\] font-black text-zinc-400 uppercase tracking-widest">Valid Until<\/p>/,
    `<p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Valid Until</p>`
  );
  // Properly wrap {promo.description}
  content = content.replace(
    /<p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">\s*\{promo\.description\}\s*<\/p><\/EditableElement>/,
    `<EditableElement targetId="home.secondPromo.description" componentKey="SecondPromoSection" elementKey="description" label="Second Promo Description" defaultValue={promo.description}>
                  <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    {promo.description}
                  </p>
                </EditableElement>`
  );
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed EcommerceBabyLayout SecondPromoSection');
}

// 3. EcommerceHardwareLayout SecondPromoSection
{
  const p = path.resolve('components', 'site', 'layouts', 'EcommerceHardwareLayout', 'body', 'components', 'SecondPromoSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  // Remove misplaced opening tag before System Status
  content = content.replace(
    /<EditableElement targetId="home\.secondPromo\.description"[^>]*><p className="text-\[10px\] font-black uppercase tracking-\[0\.4em\] opacity-60">System Status<\/p>/,
    `<p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">System Status</p>`
  );
  // Properly wrap {promo.description}
  content = content.replace(
    /<p className="text-xl text-zinc-600 dark:text-zinc-400 font-bold leading-relaxed border-l-8 border-zinc-200 dark:border-zinc-800 pl-8">\s*\{promo\.description\}\s*<\/p><\/EditableElement>/,
    `<EditableElement targetId="home.secondPromo.description" componentKey="SecondPromoSection" elementKey="description" label="Second Promo Description" defaultValue={promo.description}>
                  <p className="text-xl text-zinc-600 dark:text-zinc-400 font-bold leading-relaxed border-l-8 border-zinc-200 dark:border-zinc-800 pl-8">
                    {promo.description}
                  </p>
                </EditableElement>`
  );
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed EcommerceHardwareLayout SecondPromoSection');
}

// 4. EcommerceLayout SecondPromoSection
{
  const p = path.resolve('components', 'site', 'layouts', 'EcommerceLayout', 'body', 'components', 'SecondPromoSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  // Remove misplaced opening tag before Ends in
  content = content.replace(
    /<EditableElement targetId="home\.secondPromo\.description"[^>]*><p className="text-\[10px\] font-black uppercase tracking-widest text-slate-400">Ends in<\/p>/,
    `<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ends in</p>`
  );
  // Properly wrap {promo.description}
  content = content.replace(
    /<p className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed mb-10 max-w-lg">\s*\{promo\.description\}\s*<\/p><\/EditableElement>/,
    `<EditableElement targetId="home.secondPromo.description" componentKey="SecondPromoSection" elementKey="description" label="Second Promo Description" defaultValue={promo.description}>
                <p className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed mb-10 max-w-lg">
                  {promo.description}
                </p>
              </EditableElement>`
  );
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed EcommerceLayout SecondPromoSection');
}

// 5. EcommerceMotorCycleLayout SecondPromoSection
{
  const p = path.resolve('components', 'site', 'layouts', 'EcommerceMotorCycleLayout', 'body', 'components', 'SecondPromoSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  // Remove misplaced opening tag before The Renegade 1200
  content = content.replace(
    /<EditableElement targetId="home\.secondPromo\.description"[^>]*><p className="text-white font-black italic uppercase text-xl">The Renegade 1200<\/p>/,
    `<p className="text-white font-black italic uppercase text-xl">The Renegade 1200</p>`
  );
  // Properly wrap {promotion.description}
  content = content.replace(
    /<p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-lg mb-12">\s*\{promotion\.description\}\s*<\/p><\/EditableElement>/,
    `<EditableElement targetId="home.secondPromo.description" componentKey="SecondPromoSection" elementKey="description" label="Second Promo Description" defaultValue={promotion.description}>
              <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-lg mb-12">
                {promotion.description}
              </p>
            </EditableElement>`
  );
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed EcommerceMotorCycleLayout SecondPromoSection');
}
