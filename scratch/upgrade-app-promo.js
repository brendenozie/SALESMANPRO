const fs = require('fs');
const path = require('path');
const layouts = ['ConsultancyLayout', 'DeliveryLayout', 'PublicSpeakingLayout'];
for (const layout of layouts) {
  const p = path.resolve('components', 'site', 'layouts', layout, 'body', 'components', 'AppPromoSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (content.startsWith('import { EditableElement }')) {
    content = content.replace('import { EditableElement } from "@/components/site/EditableElement";\n"use client";', '"use client";\nimport { EditableElement } from "@/components/site/EditableElement";');
    fs.writeFileSync(p, content, 'utf8');
    console.log('Fixed use client in', layout);
  }
}
