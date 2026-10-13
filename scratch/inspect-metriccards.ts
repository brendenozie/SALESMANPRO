import fs from 'fs';
import path from 'path';

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
];

metricFiles.forEach((file) => {
  const code = fs.readFileSync(file, 'utf8');
  console.log(`\n=== ${file} ===`);
  // Find h3 or title rendering in MetricCard
  const cardMatch = code.match(/const MetricCard\s*=\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)return\s*\(([\s\S]*?)\);\s*\};/);
  if (cardMatch) {
    console.log('Found MetricCard component definition');
    const returnBody = cardMatch[2];
    const h3Match = returnBody.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    const pMatch = returnBody.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    console.log('  H3:', h3Match ? h3Match[0].trim() : 'NONE');
    console.log('  P:', pMatch ? pMatch[0].trim() : 'NONE');
  } else {
    console.log('NO MetricCard match!');
  }
});
