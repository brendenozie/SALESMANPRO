const fs = require('fs');
const path = require('path');

const ecomFiles = [
  'components/site/layouts/EcommerceAccessoriesLayout/body/EcommerceAccessoriesSite.tsx',
  'components/site/layouts/EcommerceAgrovetLayout/body/EcommerceAgrovetSite.tsx',
  'components/site/layouts/EcommerceBabyLayout/body/EcommerceBabySite.tsx',
  'components/site/layouts/EcommerceBikeLayout/body/EcommerceBikeSite.tsx',
  'components/site/layouts/EcommerceBookLayout/body/EcommerceBookSite.tsx',
  'components/site/layouts/EcommerceCakeLayout/body/EcommerceCakeSite.tsx',
  'components/site/layouts/EcommerceEarphonesLayout/body/EcommerceEarphonesSite.tsx',
  'components/site/layouts/EcommerceFlowersLayout/body/EcommerceFlowersSite.tsx',
  'components/site/layouts/EcommerceGlassesLayout/body/EcommerceGlassesSite.tsx',
  'components/site/layouts/EcommerceGroceriesLayout/body/EcommerceGroceriesSite.tsx',
  'components/site/layouts/EcommerceHardwareLayout/body/EcommerceHardwareSite.tsx',
  'components/site/layouts/EcommerceHoneyLayout/body/EcommerceHoneySite.tsx',
  'components/site/layouts/EcommerceLayout/body/EcommerceSite.tsx',
  'components/site/layouts/EcommerceMeatLayout/body/EcommerceMeatSite.tsx',
  'components/site/layouts/EcommerceMotorCycleLayout/body/EcommerceMotorCycleSite.tsx',
  'components/site/layouts/EcommercePeanutsLayout/body/EcommercePeanutsSite.tsx',
  'components/site/layouts/EcommercePetsLayout/body/EcommercePetsSite.tsx',
  'components/site/layouts/EcommerceWatchLayout/body/EcommerceWatchSite.tsx',
];

function adaptFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already adapted
  if (content.includes('ThemeSectionContainer')) {
    console.log(`Already adapted: ${filePath}`);
    return;
  }

  // 1. Ensure ThemeSectionContainer import
  const importStatement = "import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n";
  if (!content.includes('ThemeSectionContainer')) {
    if (content.includes("import React")) {
      content = content.replace(/(import React[^\n]*\n)/, `$1${importStatement}`);
    } else {
      content = `import React from 'react';\n${importStatement}` + content;
    }
  }

  // 2. Extract sections marked with data-editor-section and data-editor-component
  // In these eCommerce files, sections are typically:
  // <div id="section-..." data-editor-section="..." data-editor-component="...">\n  <Component ... />\n</div>
  // Or wrapped in <section> ... </section>

  // We find the main return statement of the export default function
  const returnMatch = content.match(/return\s*\(\s*<div([^>]*)>([\s\S]*?)<\/div>\s*\);\s*\}/);
  if (!returnMatch) {
    console.warn(`Could not match return pattern in ${filePath}`);
    return;
  }

  const rootDivProps = returnMatch[1];
  const innerJsx = returnMatch[2];

  // Parse all tagged section blocks inside innerJsx
  // Regex looking for data-editor-section blocks
  const blockRegex = /(?:<section[^>]*>[\s\n]*)?(<div[^>]*data-editor-section=["']([^"']+)["'][^>]*data-editor-component=["']([^"']+)["'][^>]*>[\s\S]*?<\/div>)(?:[\s\n]*<\/section>)?/g;

  const cases = [];
  let m;
  while ((m = blockRegex.exec(innerJsx)) !== null) {
    const fullBlock = m[0].trim();
    const secId = m[2];
    const compName = m[3];
    cases.push({ secId, compName, fullBlock });
  }

  if (cases.length === 0) {
    console.warn(`No section cases found in ${filePath}`);
    return;
  }

  // Build renderSection function
  const renderSectionCases = cases.map(c => {
    // Add key and sec.id bindings if not present
    let block = c.fullBlock;
    const cleanId = c.secId.toLowerCase();
    return `    if (key === '${cleanId}' || key.includes('${cleanId}') || key.includes('${c.compName.toLowerCase()}')) {
      return (
        <div key={sec.id || idx}>
          ${block}
        </div>
      );
    }`;
  }).join('\n\n');

  const renderSectionFn = `  const renderSection = (sec: any, idx: number) => {
    const key = (sec.component || sec.id || sec.type || '').toLowerCase();

${renderSectionCases}

    return null;
  };

  const staticFallback = (
    <>
${innerJsx}
    </>
  );`;

  const newReturn = `
${renderSectionFn}

  return (
    <div${rootDivProps}>
      <ThemeSectionContainer
        sections={pageData?.sections}
        renderSection={renderSection}
        staticFallback={staticFallback}
      />
    </div>
  );
}`;

  content = content.replace(/return\s*\(\s*<div[^>]*>[\s\S]*?<\/div>\s*\);\s*\}/, newReturn);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Successfully adapted: ${path.basename(filePath)} (${cases.length} sections)`);
}

ecomFiles.forEach(adaptFile);
