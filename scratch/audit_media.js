const fs = require('fs');
const path = require('path');

const adminPaths = [
  'categories', 'media-content', 'blogs', 'media-gallery', 'media-videos',
  'media-schedule', 'media-users', 'consumers', 'salesleads', 'whatsapp-inbox',
  'whatsapp-conversations', 'whatsapp-templates', 'whatsapp-settings',
  'ai-images', 'ai-videos', 'ai-media-library', 'ai-settings',
  'media-featured-picks', 'companyPaymentsDashboard', 'media-sponsors', 'media-analytics'
];

console.log('=== ADMIN PATH AUDIT ===');
adminPaths.forEach(ap => {
  const dir = path.join('app/admin/[slug]', ap);
  if (!fs.existsSync(dir)) {
    console.log(`❌ ${ap}: Directory NOT found`);
    return;
  }

  const pageFile = path.join(dir, 'page.tsx');
  let pageSummary = 'No page.tsx';
  if (fs.existsSync(pageFile)) {
    const content = fs.readFileSync(pageFile, 'utf8');
    const hasPrisma = content.includes('prisma.');
    const hasFetch = content.includes('fetch(');
    pageSummary = `Page: ${content.split('\n').length} lines (prisma: ${hasPrisma}, fetch: ${hasFetch})`;
  }

  const clientFiles = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'page.tsx');
  let clientDetails = [];
  clientFiles.forEach(cf => {
    const cContent = fs.readFileSync(path.join(dir, cf), 'utf8');
    const fetchMatches = cContent.match(/fetch\(['"`]([^'"`]+)['"`]/g) || [];
    const endpoints = fetchMatches.map(m => m.replace(/fetch\(['"`]/, '').replace(/['"`]/, ''));
    const hasMock = /mock|dummy|sample/i.test(cContent);
    const usesState = cContent.includes('useState');
    clientDetails.push(`${cf} [${cContent.split('\n').length}L, fetches: ${endpoints.length ? endpoints.join(', ') : 'none'}, mock: ${hasMock}]`);
  });

  console.log(`\n📌 /admin/{slug}/${ap}:`);
  console.log(`   ${pageSummary}`);
  clientDetails.forEach(cd => console.log(`   - ${cd}`));
});
