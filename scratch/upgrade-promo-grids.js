const fs = require('fs');
const path = require('path');

const layouts = [
  'EcommerceAccessoriesLayout',
  'EcommerceBabyLayout',
  'EcommerceBookLayout',
  'EcommerceHardwareLayout'
];

for (const layout of layouts) {
  const p = path.resolve('components', 'site', 'layouts', layout, 'body', 'components', 'NewsletterPromoGrid', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');

  if (!content.includes('EditableElement')) {
    content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
  }

  // Center title
  content = content.replace(
    /(\{item\.title\}\s*<\/motion\.div>)/,
    `<EditableElement targetId="home.promogrid.center.title" label="Promo Grid Center Title" defaultValue={item.title} inline>{item.title}</EditableElement>\n                    </motion.div>`
  );

  // Center highlight
  content = content.replace(
    /(<h3[^>]*whitespace-pre-line[^>]*>)\s*\{item\.highlight\}\s*(<\/h3>)/,
    `$1\n                      <EditableElement targetId="home.promogrid.center.highlight" label="Promo Grid Center Highlight" defaultValue={item.highlight} multiline>\n                        {item.highlight}\n                      </EditableElement>\n                    $2`
  );

  // Center subtitle
  content = content.replace(
    /(<p[^>]*tracking-widest[^>]*>)\s*\{item\.subtitle\}\s*(<\/p>)/,
    `$1<EditableElement targetId="home.promogrid.center.subtitle" label="Promo Grid Center Subtitle" defaultValue={item.subtitle} inline>{item.subtitle}</EditableElement>$2`
  );

  // Center button text
  content = content.replace(
    /(<motion\.button[^>]*>\s*)([A-Za-z\s]+)(\s*<[A-Za-z]+Icon)/,
    `$1<EditableElement targetId="home.promogrid.center.buttonText" label="Promo Grid Center Button" defaultValue="$2" inline>$2</EditableElement>$3`
  );

  // Center background Image
  content = content.replace(
    /(<div className="absolute inset-0 z-0">\s*)(<Image[\s\S]*?\/>)/,
    `$1<EditableElement targetId="home.promogrid.center.image" label="Promo Grid Center Image" defaultValue={item.image} isImage>\n                    $2\n                  </EditableElement>`
  );

  // Side card title
  content = content.replace(
    /(<h4[^>]*>)\s*\{item\.title\}\s*(<\/h4>)/,
    `$1\n                        <EditableElement targetId={\`home.promogrid.item.\${item.id}.title\`} label="Promo Item Title" defaultValue={item.title} inline>\n                          {item.title}\n                        </EditableElement>\n                      $2`
  );

  // Side card discount
  content = content.replace(
    /(\{item\.discount\}\s*<\/div>)/,
    `<EditableElement targetId={\`home.promogrid.item.\${item.id}.discount\`} label="Promo Item Discount" defaultValue={item.discount} inline>{item.discount}</EditableElement>\n                     </div>`
  );

  // Side card price
  content = content.replace(
    /(<p[^>]*font-black text-xl[^>]*>)\s*\{item\.price\}\s*(<\/p>)/,
    `$1\n                        <EditableElement targetId={\`home.promogrid.item.\${item.id}.price\`} label="Promo Item Price" defaultValue={item.price} inline>\n                          {item.price}\n                        </EditableElement>\n                      $2`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated NewsletterPromoGrid in', layout);
}
