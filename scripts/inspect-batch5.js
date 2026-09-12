const fs = require('fs');
const path = require('path');

const targets = [
  'FitnessLayout/body/FitnessSite.tsx',
  'HealthcareLayout/body/HealthCareSite.tsx',
  'BlogLayout/body/BlogSite.tsx',
  'MediaLayout/body/MediaSite.tsx',
  'NonprofitLayout/body/NonProfitSite.tsx',
  'EventsLayout/body/EventsSite.tsx',
  'DirectoryLayout/body/DirectorySite.tsx',
  'FinanceLayout/body/FinanceSite.tsx',
  'TravelLayout/body/TravelSite.tsx',
  'GhubaLayout/body/GhubaSite.tsx',
];

const layoutsDir = path.join(__dirname, '../components/site/layouts');

targets.forEach(relPath => {
  const fullPath = path.join(layoutsDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`NOT FOUND: ${relPath}`);
    const dir = path.dirname(fullPath);
    if (fs.existsSync(dir)) {
      console.log(`  Dir contents of ${dir}:`, fs.readdirSync(dir));
    } else {
      console.log(`  Parent layout dir not found: ${dir}`);
    }
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const sectionMatches = [...content.matchAll(/data-(?:editor|builder|section)-section="([^"]+)"/g)].map(m => m[1]);
  const sectionNames = [...content.matchAll(/data-section-name="([^"]+)"/g)].map(m => m[1]);
  const all = Array.from(new Set([...sectionMatches, ...sectionNames]));
  console.log(`${relPath} (${all.length} tagged sections):`, all);
});
