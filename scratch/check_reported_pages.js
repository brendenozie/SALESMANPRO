const fs = require('fs');
const path = require('path');

const checks = [
  'assignments/page.tsx',
  'exams/page.tsx',
  'exam-categories/page.tsx',
  'grading-report-card/page.tsx',
  'activities/page.tsx',
  'play/page.tsx',
  'school-events/page.tsx',
  'schoolAnnouncements/page.tsx',
  'library-books/page.tsx',
  'library-members/page.tsx',
  'library-issuance-records/page.tsx',
  'library-fines/page.tsx',
  'library-reports/page.tsx',
  'transport-vehicles/page.tsx',
  'transport-drivers/page.tsx',
  'transport-routes/page.tsx',
  'transport-schedules/page.tsx',
  'transport-reports/page.tsx',
  'fee/page.tsx',
  'fee-structure/page.tsx',
  'fee-items/page.tsx',
  'fee-invoices/page.tsx',
  'fee-transactions/page.tsx',
  'fee-expenses/page.tsx',
  'fee-profit-loss/page.tsx',
  'inventory-dashboard/page.tsx',
  'inventory-items/page.tsx',
  'inventory-assets-list/page.tsx',
  'inventory-reports/page.tsx',
  'school-reports/page.tsx'
];

const report = [];

for (const rel of checks) {
  const full = path.join('./app/admin/[slug]', rel);
  if (!fs.existsSync(full)) {
    report.push({ file: rel, exists: false });
    continue;
  }
  const content = fs.readFileSync(full, 'utf8');
  const isEcom = content.includes('get-all-products') || content.includes('agentStock') || content.includes('productsRes');
  const usesMock = /sample|dummy|mock|Alice Smith/i.test(content);
  const fetches = [...content.matchAll(/fetch\([`"']([^`"']+)[`"']/g)].map(m => m[1]);
  report.push({
    file: rel,
    exists: true,
    lines: content.split('\n').length,
    isEcom,
    usesMock,
    fetches
  });
}

console.log(JSON.stringify(report, null, 2));
