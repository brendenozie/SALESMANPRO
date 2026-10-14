const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components', 'site', 'layouts');

const targetThemes = [
  'EcommerceAccessoriesLayout', 'EcommerceAgrovetLayout', 'EcommerceBabyLayout',
  'EcommerceBikeLayout', 'EcommerceBookLayout', 'EcommerceCakeLayout',
  'EcommerceEarphonesLayout', 'EcommerceFlowersLayout', 'EcommerceGamingLayout',
  'EcommerceGlassesLayout', 'EcommerceGroceriesLayout', 'EcommerceHardwareLayout',
  'EcommerceHoneyLayout', 'EcommerceLayout', 'EcommerceMeatLayout',
  'EcommerceMotorCycleLayout', 'EcommercePeanutsLayout', 'EcommercePetsLayout',
  'EcommerceWatchLayout', 'FashionLayout', 'FurnitureLayout'
];

for (const theme of targetThemes) {
  const p = path.join(layoutsDir, theme, 'body', 'components', 'Trending', 'index.tsx');
  let code = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

  if (!code.includes('EditableElement')) {
    code = 'import { EditableElement } from "@/components/site/EditableElement";\n' + code;
  }

  // 1. Wrap <motion.h2 ...> or <h2 ...> or <p className="...font-bold...">Trending Products</p>
  if (code.includes('<motion.h2')) {
    code = code.replace(/(<motion\.h2[^>]*>[\s\S]*?<\/motion\.h2>)/, (match) => {
      return `<EditableElement targetId="home.trending.title" componentKey="Trending" elementKey="title" label="Trending Section Title" defaultValue="Trending Essentials">${match}</EditableElement>`;
    });
  } else if (code.includes('<h2')) {
    code = code.replace(/(<h2[^>]*>[\s\S]*?<\/h2>)/, (match) => {
      return `<EditableElement targetId="home.trending.title" componentKey="Trending" elementKey="title" label="Trending Section Title" defaultValue="Trending Products">${match}</EditableElement>`;
    });
  } else if (code.includes('Trending Products</p>')) {
    code = code.replace(/(<p[^>]*>Trending Products<\/p>)/, (match) => {
      return `<EditableElement targetId="home.trending.title" componentKey="Trending" elementKey="title" label="Trending Section Title" defaultValue="Trending Products">${match}</EditableElement>`;
    });
  }

  // 2. Wrap CTA text if present
  if (code.includes('See All')) {
    code = code.replace(/(See All)/, (match) => {
      return `<EditableElement targetId="home.trending.ctaText" componentKey="Trending" elementKey="ctaText" label="Trending CTA" defaultValue="See All" inline>${match}</EditableElement>`;
    });
  } else if (code.includes('Discover Full Collection')) {
    code = code.replace(/(Discover Full Collection)/, (match) => {
      return `<EditableElement targetId="home.trending.ctaText" componentKey="Trending" elementKey="ctaText" label="Trending CTA" defaultValue="Discover Full Collection" inline>${match}</EditableElement>`;
    });
  } else if (code.includes('Catalog Dispatch')) {
    code = code.replace(/(Catalog Dispatch)/, (match) => {
      return `<EditableElement targetId="home.trending.ctaText" componentKey="Trending" elementKey="ctaText" label="Trending CTA" defaultValue="Catalog Dispatch" inline>${match}</EditableElement>`;
    });
  }

  fs.writeFileSync(p, code, 'utf8');
  console.log(`Processed ${theme}: contains EditableElement = ${code.includes('EditableElement')}`);
}
