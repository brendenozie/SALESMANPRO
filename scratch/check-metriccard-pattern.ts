import fs from 'fs';

interface Profile {
  layout: string;
  componentName: string;
  category: string;
  filePath: string;
}

const audit: Profile[] = JSON.parse(fs.readFileSync('scratch/comprehensive-component-audit.json', 'utf8'));
const fv = audit.filter((c) => c.category === 'features_values' && c.currentEditabilityStatus !== 'CANONICAL_ITEMS');
const custom = fv.filter((c) => !fs.readFileSync(c.filePath, 'utf8').includes('UniversalFeaturesSection'));

const metricCards: string[] = [];
const others: string[] = [];

custom.forEach((c) => {
  const code = fs.readFileSync(c.filePath, 'utf8');
  if (code.includes('const MetricCard =') || code.includes('function MetricCard(')) {
    metricCards.push(c.filePath);
  } else {
    others.push(c.filePath);
  }
});

console.log(`MetricCard pattern count: ${metricCards.length}`);
console.log(`Other patterns count: ${others.length}`);

console.log('\n--- METRIC CARD COMPONENTS ---');
metricCards.forEach((p) => console.log(' - ' + p));

console.log('\n--- OTHER COMPONENTS ---');
others.forEach((p) => console.log(' - ' + p));
