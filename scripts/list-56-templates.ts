import { getAllTemplates } from '../lib/website-builder/template-registry';
import { categoryHeaderFooterLayoutMap } from '../components/site/layouts/categoryHeaderFooterLayoutMap';
import { siteComponentNameMap } from '../components/site/layouts/siteBodyComponentMap';

const all = getAllTemplates();
console.log(`Total templates: ${all.length}`);

const rows = all.map((t, index) => {
  const shell = categoryHeaderFooterLayoutMap[t.id];
  const body = siteComponentNameMap[shell];
  return {
    index: index + 1,
    id: t.id,
    name: t.name,
    category: t.category,
    variant: t.variant,
    shell,
    body
  };
});

console.table(rows);
