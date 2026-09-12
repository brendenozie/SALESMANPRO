const fs = require('fs');
const path = require('path');

const targets = [
  'CoursesLayout/body/CoursesSite.tsx',
  'CoursesLayout2/body/CoursesSite2.tsx',
  'CoursesLayout3/body/CoursesSite3.tsx',
  'SecurityLayout/body/SecuritySite.tsx',
  'SecurityLayout2/body/Security2Site.tsx',
  'RealEstateLayout/body/RealEstateSite.tsx',
  'PropertyManagementLayout/body/PropertyManagementSite.tsx',
];

const layoutsDir = path.join(__dirname, '../components/site/layouts');

targets.forEach(relPath => {
  const fullPath = path.join(layoutsDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`NOT FOUND: ${relPath}`);
    // Check if directory exists
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
