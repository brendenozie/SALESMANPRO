const fs = require('fs');
const path = require('path');
const layouts = ['EcommerceAccessoriesLayout', 'EcommerceBabyLayout', 'EcommerceBookLayout', 'EcommerceHardwareLayout'];
for (const layout of layouts) {
  const p = path.resolve('components', 'site', 'layouts', layout, 'body', 'components', 'NewsletterPromoGrid', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/defaultValue="([^"]*?)\s+"/g, 'defaultValue="$1"');
  fs.writeFileSync(p, content, 'utf8');
  console.log('Trimmed in', layout);
}
