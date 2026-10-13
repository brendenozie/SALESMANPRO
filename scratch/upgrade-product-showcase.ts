import fs from 'fs';
import path from 'path';

const layouts = [
  'EcommerceAccessoriesLayout',
  'EcommerceBabyLayout',
  'EcommerceBookLayout',
  'EcommerceHardwareLayout',
];

layouts.forEach((layout) => {
  const filePath = path.resolve(`components/site/layouts/${layout}/body/components/ProductShowcaseGrid/index.tsx`);
  if (!fs.existsSync(filePath)) {
    console.log(`Not found: ${filePath}`);
    return;
  }

  let code = fs.readFileSync(filePath, 'utf8');

  // Add import if not present
  if (!code.includes('EditableElement')) {
    code = code.replace(
      /import React/g,
      `import { EditableElement } from '@/components/site/EditableElement';\nimport React`
    );
  }

  // Upgrade column.label and column.title
  // Pattern 1: EcommerceAccessoriesLayout
  // <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500">
  //   {column.label}
  // </span>
  // <h3 ...>{column.title}</h3>

  code = code.replace(
    /(<span[^>]*class(?:Name)?=["'][^"']*uppercase[^"']*["'][^>]*>)\s*\{column\.label\}\s*(<\/span>)/g,
    `$1\n                    <EditableElement targetId={\`home.showcase.\${column.flag}.label\`} label="Showcase Column Label" inline>\n                      <span>{column.label}</span>\n                    </EditableElement>\n                  $2`
  );

  code = code.replace(
    /(<h3[^>]*class(?:Name)?=["'][^"']*["'][^>]*>)\s*\{column\.title\}\s*(<\/h3>)/g,
    `$1\n                    <EditableElement targetId={\`home.showcase.\${column.flag}.title\`} label="Showcase Column Title" inline>\n                      <span>{column.title}</span>\n                    </EditableElement>\n                  $2`
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`Updated: ${layout}`);
});
