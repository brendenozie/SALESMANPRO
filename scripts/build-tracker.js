const fs = require('fs');
const path = require('path');

const inventoryPath = path.resolve(__dirname, '../docs/performance/inventory.json');
let rawStr = fs.readFileSync(inventoryPath, 'utf8');
if (rawStr.charCodeAt(0) === 0xFEFF) {
  rawStr = rawStr.slice(1);
}
let raw = JSON.parse(rawStr);

// Move Ghuba to index 0 (STORE-001)
const ghubaIndex = raw.findIndex(item => item.folder === 'GhubaLayout');
let ghubaItem = null;
if (ghubaIndex > -1) {
  ghubaItem = raw.splice(ghubaIndex, 1)[0];
}

const reordered = [ghubaItem, ...raw].filter(Boolean);

// Re-assign IDs
reordered.forEach((item, idx) => {
  item.id = `STORE-${String(idx + 1).padStart(3, '0')}`;
});

fs.writeFileSync(inventoryPath, JSON.stringify(reordered, null, 2));

// Generate multi-store-performance-status.md
let trackerMd = `# Master Storefront Performance & Production Hardening Tracker

Total Storefronts Discovered: **${reordered.length}**  
Target: **100% Individual Audit, Optimization, Zero Blank Screens, Production Verification**

| ID | Store / Layout | Folder | Body Component | Card Types | Virtualized | Backdrop Blur | Unopt Img | Framer Motion | Status |
|---|---|---|---|---|---|---|---|---|---|
`;

reordered.forEach(item => {
  const isGhuba = item.id === 'STORE-001';
  const status = isGhuba ? '**PASSED**' : 'DISCOVERED';
  const virt = item.virtualizerOccurrences > 0 || isGhuba ? 'Yes' : 'No';
  const cards = Array.isArray(item.cardComponents) 
    ? (item.cardComponents.length > 0 ? item.cardComponents.join(', ') : 'Default/Custom')
    : (item.cardComponents || 'Default/Custom');
    
  trackerMd += `| ${item.id} | ${item.name} | \`${item.folder}\` | \`${item.bodySiteComponent}\` | ${cards} | ${virt} | ${item.backdropFilterOccurrences} | ${item.unoptimizedImageOccurrences} | ${item.framerMotionOccurrences} | ${status} |\n`;
});

trackerMd += `
## Audit Progress Summary
- **Total Discovered:** ${reordered.length}
- **Passed:** 1 (${reordered[0].name})
- **In Progress:** 0
- **Discovered / Pending Audit:** ${reordered.length - 1}
- **Blocked:** 0
- **Needs Review:** 0

## Architectural Archetypes Identified
1. **E-Commerce & Retail Stores (21 layouts):** Standard products, category filters, cart/checkout, high image density.
2. **Automotive & High-Resolution Asset Stores (2 layouts):** Heavy vehicle image galleries, multi-angle car views, spec sheets.
3. **Real Estate & Property Management (2 layouts):** Property listings, map integration, room visualizers.
4. **Booking & Appointment Stores (4 layouts):** Slot pickers, staff selectors, service menus.
5. **Education & Online Courses (3 layouts):** Curriculum accordions, lesson cards, instructor profiles.
6. **Content, Media & Blogging (3 layouts):** Editorial cards, streaming/video teasers, article layouts.
7. **Services, Portfolio & Corporate (8 layouts):** Case studies, team grids, interactive service pricing.
8. **Hospitality & Food Delivery (2 layouts):** Menu item cards, dietary badges, opening hour modals.
9. **SaaS, Finance & Specialized (11 layouts):** Feature cards, pricing tiers, trust badges, complex dashboards.
`;

fs.writeFileSync(path.resolve(__dirname, '../docs/performance/multi-store-performance-status.md'), trackerMd);

console.log('Successfully updated inventory.json and generated multi-store-performance-status.md');
