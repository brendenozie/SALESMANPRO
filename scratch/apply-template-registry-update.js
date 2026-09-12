const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'lib', 'website-builder', 'template-registry.ts');
let registryCode = fs.readFileSync(targetFile, 'utf8');

const generatedSections = fs.readFileSync(path.join(__dirname, 'generated-authentic-sections.ts'), 'utf8');

// 1. Insert generated authentic section arrays right before STANDARD_ECOMMERCE_SECTIONS
const insertPoint = 'const STANDARD_ECOMMERCE_SECTIONS: AuthenticSectionDefinition[] = [';
if (!registryCode.includes(insertPoint)) {
  console.error('Could not find insertion point for STANDARD_ECOMMERCE_SECTIONS');
  process.exit(1);
}

if (!registryCode.includes('const DELIVERY_SECTIONS: AuthenticSectionDefinition[] = [')) {
  registryCode = registryCode.replace(insertPoint, `${generatedSections}\n${insertPoint}`);
  console.log('Inserted authentic section arrays before STANDARD_ECOMMERCE_SECTIONS');
} else {
  console.log('Authentic section arrays already present in template-registry.ts');
}

// 2. Map of template IDs to their authentic section array name
const templateSectionMap = {
  'ecommerce-agrovet@v1': 'ECOMMERCE_AGROVET_SECTIONS',
  'ecommerce-meat@v1': 'ECOMMERCE_MEAT_SECTIONS',
  'ecommerce-hardware@v1': 'ECOMMERCE_HARDWARE_SECTIONS',
  'ecommerce-watch@v1': 'ECOMMERCE_WATCH_SECTIONS',
  'ecommerce-flowers@v1': 'ECOMMERCE_FLOWERS_SECTIONS',
  'ecommerce-groceries@v1': 'ECOMMERCE_GROCERIES_SECTIONS',
  'ecommerce-earphones@v1': 'ECOMMERCE_EARPHONES_SECTIONS',
  'ecommerce-glasses@v1': 'ECOMMERCE_GLASSES_SECTIONS',
  'ecommerce-honey@v1': 'ECOMMERCE_HONEY_SECTIONS',
  'ecommerce-peanuts@v1': 'ECOMMERCE_PEANUTS_SECTIONS',
  'ecommerce-baby@v1': 'ECOMMERCE_BABY_SECTIONS',
  'ecommerce-cake@v1': 'ECOMMERCE_CAKE_SECTIONS',
  'ecommerce-pets@v1': 'ECOMMERCE_PETS_SECTIONS',
  'ecommerce-bike@v1': 'ECOMMERCE_BIKE_SECTIONS',
  'ecommerce-motorcycle@v1': 'ECOMMERCE_MOTORCYCLE_SECTIONS',
  'ecommerce-book@v1': 'ECOMMERCE_BOOK_SECTIONS',
  'ecommerce-accessories@v1': 'ECOMMERCE_ACCESSORIES_SECTIONS',
  'fashion@v1': 'FASHION_SECTIONS',
  'furniture@v1': 'FURNITURE_SECTIONS',
  'security@v1': 'SECURITY_SECTIONS',
  'security-2@v1': 'SECURITY2_SECTIONS',
  'consultancy@v1': 'CONSULTANCY_SECTIONS',
  'public-speaking@v1': 'PUBLIC_SPEAKING_SECTIONS',
  'finance@v1': 'FINANCE_SECTIONS',
  'saas@v1': 'SAAS_SECTIONS',
  'marketplace@v1': 'MARKETPLACE_SECTIONS',
  'portfolio@v1': 'PORTFOLIO_SECTIONS',
  'blog@v1': 'BLOG_SECTIONS',
  'media@v1': 'MEDIA_SECTIONS',
  'nonprofit@v1': 'NONPROFIT_SECTIONS',
  'delivery@v1': 'DELIVERY_SECTIONS',
  'directory@v1': 'DIRECTORY_SECTIONS',
  'events@v1': 'EVENTS_SECTIONS',
  'ghuba@v1': 'GHUBA_SECTIONS',
  'default-site@v1': 'DEFAULT_SECTIONS',
};

// Replace authenticSections for each template entry
let replacements = 0;
for (const [tplId, secArray] of Object.entries(templateSectionMap)) {
  // Regex finds the template block and updates authenticSections within it
  const tplRegex = new RegExp(`("${tplId}":\\s*\\{[\\s\\S]*?authenticSections:\\s*)(STANDARD_ECOMMERCE_SECTIONS)(,)`);
  if (tplRegex.test(registryCode)) {
    registryCode = registryCode.replace(tplRegex, `$1${secArray}$3`);
    replacements++;
    console.log(`Replaced authenticSections for ${tplId} -> ${secArray}`);
  } else {
    console.log(`Template ${tplId} was not matched with STANDARD_ECOMMERCE_SECTIONS (might already be updated)`);
  }
}

console.log(`Total template section replacements: ${replacements}`);
fs.writeFileSync(targetFile, registryCode);
console.log('Saved updated template-registry.ts successfully!');
