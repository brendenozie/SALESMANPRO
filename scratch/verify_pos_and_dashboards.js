const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const filesToVerify = [
  'app/admin/[slug]/service-pos/page.tsx',
  'app/admin/[slug]/service-pos/AdminPOSClient.tsx',
  'app/api/admin/dashboard/fitness/[slug]/route.ts',
  'components/admin/FitnessDashboardClient.tsx',
  'components/admin/FinanceDashboardClient.tsx',
  'components/admin/HealthcareDashboardClient.tsx',
  'components/admin/RealEstateDashboardClient.tsx',
  'components/admin/AutomotiveDashboardClient.tsx',
  'components/admin/PortfolioDashboardClient.tsx',
  'components/admin/NonprofitDashboardClient.tsx',
  'components/admin/BookingAppointmentsDashboard.tsx',
  'components/admin/MediaDashboardClient.tsx',
];

console.log('--- VERIFYING SYNTAX & AST PARSING ---');
let hasError = false;

filesToVerify.forEach(relPath => {
  const fullPath = path.resolve('c:/Users/Brenden/Desktop/SalesForce/SalesMan', relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`[NOT FOUND] ${relPath}`);
    hasError = true;
    return;
  }
  const code = fs.readFileSync(fullPath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    fullPath,
    code,
    ts.ScriptTarget.Latest,
    true,
    relPath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  // Check parsing diagnostics
  const diagnostics = sourceFile.parseDiagnostics || [];
  if (diagnostics.length > 0) {
    console.error(`[SYNTAX ERROR] ${relPath}:`);
    diagnostics.forEach(d => {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(d.start);
      console.error(`  Line ${line + 1}:${character + 1} - ${d.messageText}`);
    });
    hasError = true;
  } else {
    console.log(`[PASS] ${relPath}`);
  }
});

if (hasError) {
  process.exit(1);
} else {
  console.log('\nAll files passed AST parsing with 0 errors!');
}
