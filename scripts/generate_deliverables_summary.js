const fs = require('fs');
const path = require('path');

// 1. Load results and stats
const matrixResults = JSON.parse(fs.readFileSync('scripts/56_builder_matrix_results.json', 'utf8'));
const storeStats = JSON.parse(fs.readFileSync('scripts/extracted_store_stats.json', 'utf8'));
const regDir = path.resolve('lib/website-builder/registry');
const regFiles = fs.readdirSync(regDir).filter(f => f.endsWith('.ts') && f !== 'aliases.ts' && f !== 'helpers.ts');

// Count total unique sections across registry
let totalSectionsCount = 0;
const uniqueSections = new Set();
matrixResults.forEach(r => {
  totalSectionsCount += r.totalSections;
});

console.log(`Loaded 56 layout matrix results: total evaluated sections = ${totalSectionsCount}`);
console.log(`41 Live stores loaded: ${storeStats.allStores.length}`);
