const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components', 'site', 'layouts');

const targetThemes = [
  'EcommerceAccessoriesLayout', 'EcommerceAgrovetLayout', 'EcommerceBabyLayout',
  'EcommerceBookLayout', 'EcommerceCakeLayout', 'EcommerceEarphonesLayout',
  'EcommerceFlowersLayout', 'EcommerceGamingLayout', 'EcommerceGroceriesLayout',
  'EcommerceHardwareLayout', 'EcommerceHoneyLayout', 'EcommerceLayout',
  'EcommerceMeatLayout', 'EcommerceMotorCycleLayout', 'EcommercePeanutsLayout',
  'EcommercePetsLayout'
];

for (const theme of targetThemes) {
  const p = path.join(layoutsDir, theme, 'body', 'components', 'SecondPromoSection', 'index.tsx');
  let code = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

  if (!code.includes('EditableElement')) {
    code = 'import { EditableElement } from "@/components/site/EditableElement";\n' + code;
  }

  const varName = (code.includes('promo.') || code.includes('promo?.') || code.includes('const promo =')) ? 'promo' : 'promotion';

  // 1. Wrap Image
  // Find <Image ... /> or <motion.img ... /> or <img ... /> that uses .bannerUrl
  // Look for regex matching the tag
  const imgRegex = new RegExp(`(<(?:Image|motion\\.img|img)[^>]*?(?:src=\\{${varName}\\.bannerUrl[^}]*\\})[^>]*?\\/?>)`, 's');
  if (imgRegex.test(code)) {
    code = code.replace(imgRegex, (match) => {
      return `<EditableElement targetId="home.secondPromo.imageUrl" componentKey="SecondPromoSection" elementKey="imageUrl" label="Second Promo Image" fieldType="image" defaultValue={${varName}.bannerUrl}>${match}</EditableElement>`;
    });
  }

  // 2. Wrap <h2>
  const h2Regex = new RegExp(`(<h2[^>]*>([\\s\\S]*?<\\/h2>))`);
  if (h2Regex.test(code)) {
    code = code.replace(h2Regex, (match) => {
      return `<EditableElement targetId="home.secondPromo.title" componentKey="SecondPromoSection" elementKey="title" label="Second Promo Title" defaultValue={${varName}.title}>${match}</EditableElement>`;
    });
  }

  // 3. Wrap Description <p>
  const descRegex = new RegExp(`(<p[^>]*>[\\s\\S]*?\\{${varName}\\.description\\}[\\s\\S]*?<\\/p>)`);
  if (descRegex.test(code)) {
    code = code.replace(descRegex, (match) => {
      return `<EditableElement targetId="home.secondPromo.description" componentKey="SecondPromoSection" elementKey="description" label="Second Promo Description" defaultValue={${varName}.description}>${match}</EditableElement>`;
    });
  }

  // 4. Wrap CTA Text
  const ctaRegex = new RegExp(`(\\{${varName}\\.ctaText(?:\\s*\\|\\|\\s*[^}]+)?\\})`);
  if (ctaRegex.test(code)) {
    code = code.replace(ctaRegex, (match) => {
      return `<EditableElement targetId="home.secondPromo.ctaText" componentKey="SecondPromoSection" elementKey="ctaText" label="Second Promo CTA" defaultValue={${varName}.ctaText} inline>${match}</EditableElement>`;
    });
  }

  fs.writeFileSync(p, code, 'utf8');
  console.log(`Processed ${theme}: contains EditableElement = ${code.includes('EditableElement')}`);
}
