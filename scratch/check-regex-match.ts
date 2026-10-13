import fs from 'fs';

const metricFiles = [
  'components/site/layouts/EcommerceAccessoriesLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceBabyLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceBookLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceCakeLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceEarphonesLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceFlowersLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceGamingLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceGroceriesLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceHardwareLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceHoneyLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceMotorCycleLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommercePeanutsLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommercePetsLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceAgrovetLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceMeatLayout/body/components/MetricsSection/index.tsx',
];

metricFiles.forEach((file) => {
  const code = fs.readFileSync(file, 'utf8');
  const h3Match = code.match(/<h3([^>]*)>\s*\{title\}\s*<\/h3>/);
  const pMatch = code.match(/<p([^>]*)>\s*\{description\}\s*<\/p>/);
  console.log(`${file}:`);
  console.log('  H3 match:', !!h3Match);
  console.log('  P match:', !!pMatch);
});
