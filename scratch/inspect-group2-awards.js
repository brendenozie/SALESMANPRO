const fs = require('fs');

const group2Files = [
  'components/site/layouts/EcommerceAccessoriesLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommerceAgrovetLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommerceBabyLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommerceBookLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommerceCakeLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommerceEarphonesLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommerceFlowersLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommerceGroceriesLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommerceHardwareLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommerceHoneyLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommerceLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommerceMeatLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommerceMotorCycleLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommercePeanutsLayout/body/components/AwardsSection/index.tsx',
  'components/site/layouts/EcommercePetsLayout/body/components/AwardsSection/index.tsx'
];

for (const f of group2Files) {
  const c = fs.readFileSync(f, 'utf8');
  const hasLegacyOf = c.includes('A Legacy of') || c.includes('Legacy of');
  const hasCertifiedFor = c.includes('Certified For') || c.includes('Certified for');
  const hasHallOfHeritage = c.includes('HallOfHeritage');
  console.log(f.split('/')[3], '-> legacy:', hasLegacyOf, 'certified:', hasCertifiedFor, 'hallOfHeritage:', hasHallOfHeritage);
}
