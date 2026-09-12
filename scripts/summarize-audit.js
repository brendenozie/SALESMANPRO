const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/complete_forensic_theme_audit.json', 'utf8'));
console.log('Total themes:', data.length);
let totalSections = 0;
let totalInternalComps = 0;
data.forEach(t => {
  const secCount = t.body?.sectionsRendered?.length || 0;
  totalSections += secCount;
  totalInternalComps += t.internalComponentCount;
  console.log(`${t.themeName.padEnd(30)} | Sections: ${String(secCount).padEnd(2)} | Comps: ${String(t.internalComponentCount).padEnd(2)} | Subpages: ${t.subpages.length}`);
});
console.log('---');
console.log('Total Rendered Sections:', totalSections);
console.log('Total Internal Components:', totalInternalComps);
