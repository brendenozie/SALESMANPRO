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

function adaptEcomFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('ThemeSectionContainer')) {
    console.log(`Already adapted: ${filePath}`);
    return;
  }

  const lines = content.split('\n');

  // 1. Locate return statement
  let returnLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('return (') || lines[i].trim() === 'return (') {
      returnLineIdx = i;
      break;
    }
  }

  if (returnLineIdx === -1) {
    console.warn(`No return statement found in ${filePath}`);
    return;
  }

  // 2. Locate closing of return
  let endReturnLineIdx = lines.length - 1;
  while (endReturnLineIdx > returnLineIdx && !lines[endReturnLineIdx].includes(');')) {
    endReturnLineIdx--;
  }

  // Find root opening tag after returnLineIdx
  let rootTagLine = returnLineIdx + 1;
  while (rootTagLine < endReturnLineIdx && !lines[rootTagLine].includes('<div')) {
    rootTagLine++;
  }

  const rootDivLine = lines[rootTagLine];

  // The closing </div> is the line immediately preceding endReturnLineIdx (ignoring blank lines)
  let closingDivLineIdx = endReturnLineIdx - 1;
  while (closingDivLineIdx > rootTagLine && lines[closingDivLineIdx].trim() === '') {
    closingDivLineIdx--;
  }

  // 3. Extract all sections inside return block
  const sectionBlocks = [];
  let currentBlock = [];
  let currentSecId = null;
  let currentComp = null;
  let inBlock = false;

  for (let i = rootTagLine + 1; i < closingDivLineIdx; i++) {
    const line = lines[i];
    const secMatch = line.match(/data-editor-section=["']([^"']+)["']/);
    const compMatch = line.match(/data-editor-component=["']([^"']+)["']/);

    if (secMatch && compMatch) {
      if (inBlock && currentBlock.length > 0) {
        sectionBlocks.push({ secId: currentSecId, comp: currentComp, lines: currentBlock });
        currentBlock = [];
      }
      inBlock = true;
      currentSecId = secMatch[1];
      currentComp = compMatch[1];
      currentBlock.push(line);
    } else if (inBlock) {
      currentBlock.push(line);
      if (line.includes('</div>') || line.includes('</div>}')) {
        sectionBlocks.push({ secId: currentSecId, comp: currentComp, lines: currentBlock });
        currentBlock = [];
        inBlock = false;
        currentSecId = null;
        currentComp = null;
      }
    }
  }
  if (inBlock && currentBlock.length > 0) {
    sectionBlocks.push({ secId: currentSecId, comp: currentComp, lines: currentBlock });
  }

  console.log(`${path.basename(filePath)}: extracted ${sectionBlocks.length} sections`);

  // Build renderSection cases
  const cases = sectionBlocks.map(sb => {
    const cleanId = sb.secId.toLowerCase();
    const cleanComp = sb.comp.toLowerCase();
    // Add key={sec.id || idx} to the root tag of the section block
    let block = sb.lines.join('\n');
    // If it starts with conditional like {testimonialsData?.data && <div ...
    let trimmed = block.trim();
    if (trimmed.startsWith('{')) {
      trimmed = trimmed.replace(/^\{\s*([a-zA-Z0-9_?.]+)\s*&&\s*/, '');
      if (trimmed.endsWith('}')) {
        trimmed = trimmed.slice(0, -1).trim();
      }
      block = trimmed.replace(/<div([^>]*)>/, `<div$1 key={sec.id || idx}>`);
    } else {
      block = block.replace(/<div([^>]*)>/, `<div$1 key={sec.id || idx}>`);
    }

    return `    if (key === '${cleanId}' || key.includes('${cleanId}') || key.includes('${cleanComp}')) {
      return (
${block}
      );
    }`;
  }).join('\n\n');

  const renderSectionFn = `  const renderSection = (sec: any, idx: number) => {
    const key = (sec.component || sec.id || sec.type || '').toLowerCase();

${cases}

    return null;
  };`;

  // Extract static fallback lines strictly between rootTagLine and closingDivLineIdx
  const staticFallbackLines = lines.slice(rootTagLine + 1, closingDivLineIdx).join('\n');
  const staticFallback = `  const staticFallback = (
    <>
${staticFallbackLines}
    </>
  );`;

  // Build new code
  // Header: ensure ThemeSectionContainer import
  let newHeader = '';
  let importAdded = false;
  for (let i = 0; i < returnLineIdx; i++) {
    newHeader += lines[i] + '\n';
    if (!importAdded && (lines[i].includes('import React') || lines[i].includes("from 'react';"))) {
      newHeader += "import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n";
      importAdded = true;
    }
  }
  if (!importAdded) {
    newHeader = "import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n" + newHeader;
  }

  const newReturn = `
${renderSectionFn}

${staticFallback}

  return (
${rootDivLine}
      <ThemeSectionContainer
        sections={pageData?.sections}
        renderSection={renderSection}
        staticFallback={staticFallback}
      />
    </div>
  );
}`;

  fs.writeFileSync(filePath, newHeader + newReturn, 'utf8');
  console.log(`✅ Successfully transformed: ${path.basename(filePath)}`);
}

ecomFiles.forEach(adaptEcomFile);
console.log('\nFinished adapting all 18 eCommerce files.');
