import fs from 'fs';

const files = [
  'components/site/layouts/BookingsLayout/body/components/BenefitsSection/index.tsx',
  'components/site/layouts/BookingsLayout/body/components/FeaturesSection/index.tsx',
  'components/site/layouts/DrycleaningBookingsLayout/body/components/BenefitsSection/index.tsx',
  'components/site/layouts/DrycleaningBookingsLayout/body/components/FeaturesSection/index.tsx',
  'components/site/layouts/SalonBookingsLayout/body/components/BenefitsSection/index.tsx',
  'components/site/layouts/SalonBookingsLayout/body/components/FeaturesSection/index.tsx',
  'components/site/layouts/RealEstateLayout/body/components/WhyChooseUs/index.tsx',
];

files.forEach((f) => {
  console.log(`\n=== ${f} ===`);
  const code = fs.readFileSync(f, 'utf8');
  for (const m of code.matchAll(/targetId=\{?["'`]([^"'`]+)["'`]/g)) {
    console.log(' - ' + m[1]);
  }
});
