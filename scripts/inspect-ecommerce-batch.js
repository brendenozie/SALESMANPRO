const fs = require('fs');
const path = require('path');

const files = [
  'components/site/layouts/EcommerceAccessoriesLayout/body/EcommerceAccessoriesSite.tsx',
  'components/site/layouts/EcommerceAgrovetLayout/body/EcommerceAgrovetSite.tsx',
  'components/site/layouts/EcommerceBabyLayout/body/EcommerceBabySite.tsx',
  'components/site/layouts/EcommerceBikeLayout/body/EcommerceBikeSite.tsx',
  'components/site/layouts/EcommerceBookLayout/body/EcommerceBookSite.tsx',
  'components/site/layouts/EcommerceCakeLayout/body/EcommerceCakeSite.tsx',
  'components/site/layouts/EcommerceEarphonesLayout/body/EcommerceEarphonesSite.tsx',
  'components/site/layouts/EcommerceFlowersLayout/body/EcommerceFlowersSite.tsx',
  'components/site/layouts/EcommerceGamingLayout/body/EcommerceGamingSite.tsx',
  'components/site/layouts/EcommerceGlassesLayout/body/EcommerceGlassesSite.tsx',
  'components/site/layouts/EcommerceGroceriesLayout/body/EcommerceGroceriesSite.tsx',
  'components/site/layouts/EcommerceHardwareLayout/body/EcommerceHardwareSite.tsx',
  'components/site/layouts/EcommerceHoneyLayout/body/EcommerceHoneySite.tsx',
  'components/site/layouts/EcommerceLayout/body/EcommerceSite.tsx',
  'components/site/layouts/EcommerceMeatLayout/body/EcommerceMeatSite.tsx',
  'components/site/layouts/EcommerceMotorCycleLayout/body/EcommerceMotorCycleSite.tsx',
  'components/site/layouts/EcommercePeanutsLayout/body/EcommercePeanutsSite.tsx',
  'components/site/layouts/EcommercePetsLayout/body/EcommercePetsSite.tsx',
  'components/site/layouts/EcommerceWatchLayout/body/EcommerceWatchSite.tsx',
];

files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.log('MISSING:', f);
    return;
  }
  const content = fs.readFileSync(f, 'utf8');
  const sections = [];
  const regex = /data-editor-section=["']([^"']+)["']\s+data-editor-component=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    sections.push({ sec: match[1], comp: match[2] });
  }
  console.log(`${path.basename(f)} (${sections.length} tagged sections):`);
  sections.forEach(s => console.log(`   - [${s.sec}] -> <${s.comp} />`));
});
