const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components', 'site', 'layouts');

const targetThemes = [
  'EcommerceAccessoriesLayout', 'EcommerceAgrovetLayout', 'EcommerceBabyLayout',
  'EcommerceBookLayout', 'EcommerceCakeLayout', 'EcommerceEarphonesLayout',
  'EcommerceFlowersLayout', 'EcommerceGamingLayout', 'EcommerceGroceriesLayout',
  'EcommerceHardwareLayout', 'EcommerceHoneyLayout', 'EcommerceMeatLayout',
  'EcommerceMotorCycleLayout', 'EcommercePeanutsLayout', 'EcommercePetsLayout'
];

for (const theme of targetThemes) {
  const p = path.join(layoutsDir, theme, 'body', 'components', 'PromoSection', 'index.tsx');
  let code = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

  if (!code.includes('EditableElement')) {
    code = 'import { EditableElement } from "@/components/site/EditableElement";\n' + code;
  }

  // 1. Wrap promotions[0].title
  code = code.replace(/\{promotions\[0\]\.title\}/g, 
    '<EditableElement targetId="home.promo.main.title" componentKey="PromoSection" elementKey="main.title" label="Main Promo Title" defaultValue={promotions[0].title}>{promotions[0].title}</EditableElement>');

  // 2. Wrap promotions[0].description
  code = code.replace(/\{promotions\[0\]\.description\}/g,
    '<EditableElement targetId="home.promo.main.description" componentKey="PromoSection" elementKey="main.description" label="Main Promo Description" defaultValue={promotions[0].description}>{promotions[0].description}</EditableElement>');

  // 3. Wrap promotions[0].ctaText
  code = code.replace(/\{promotions\[0\]\.ctaText(?:\s*\|\|\s*[^}]+)?\}/g, (match) => {
    return `<EditableElement targetId="home.promo.main.ctaText" componentKey="PromoSection" elementKey="main.ctaText" label="Main Promo CTA" defaultValue={promotions[0].ctaText} inline>${match}</EditableElement>`;
  });

  // 4. Wrap promo.title in map
  code = code.replace(/\{promo\.title\}/g,
    '<EditableElement targetId={`home.promo.secondary.${idx}.title`} componentKey="PromoSection" elementKey={`secondary.${idx}.title`} label={`Promo ${idx + 2} Title`} defaultValue={promo.title}>{promo.title}</EditableElement>');

  // 5. Wrap promo.description in map
  code = code.replace(/\{promo\.description\}/g,
    '<EditableElement targetId={`home.promo.secondary.${idx}.description`} componentKey="PromoSection" elementKey={`secondary.${idx}.description`} label={`Promo ${idx + 2} Description`} defaultValue={promo.description}>{promo.description}</EditableElement>');

  // 6. Wrap promo.ctaText in map
  code = code.replace(/\{promo\.ctaText(?:\s*\|\|\s*[^}]+)?\}/g, (match) => {
    return `<EditableElement targetId={\`home.promo.secondary.\${idx}.ctaText\`} componentKey="PromoSection" elementKey={\`secondary.\${idx}.ctaText\`} label={\`Promo \${idx + 2} CTA\`} defaultValue={promo.ctaText} inline>${match}</EditableElement>`;
  });

  // 7. Wrap item.title in map (for bento themes using item and index)
  code = code.replace(/\{item\.title\}/g,
    '<EditableElement targetId={`home.promo.items.${index}.title`} componentKey="PromoSection" elementKey={`items.${index}.title`} label={`Promo ${index + 1} Title`} defaultValue={item.title}>{item.title}</EditableElement>');

  // 8. Wrap item.description in map
  code = code.replace(/\{item\.description\}/g,
    '<EditableElement targetId={`home.promo.items.${index}.description`} componentKey="PromoSection" elementKey={`items.${index}.description`} label={`Promo ${index + 1} Description`} defaultValue={item.description}>{item.description}</EditableElement>');

  // 9. Wrap item.ctaText in map
  code = code.replace(/\{item\.ctaText(?:\s*\|\|\s*[^}]+)?\}/g, (match) => {
    return `<EditableElement targetId={\`home.promo.items.\${index}.ctaText\`} componentKey="PromoSection" elementKey={\`items.\${index}.ctaText\`} label={\`Promo \${index + 1} CTA\`} defaultValue={item.ctaText} inline>${match}</EditableElement>`;
  });

  fs.writeFileSync(p, code, 'utf8');
  console.log(`Processed ${theme}: contains EditableElement = ${code.includes('EditableElement')}`);
}
