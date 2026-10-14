const fs = require('fs');
const path = require('path');

// 1. BlogLayout CtaSection
{
  const p = path.resolve('components', 'site', 'layouts', 'BlogLayout', 'body', 'components', 'CtaSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace('"use client";', '"use client";\nimport { EditableElement } from "@/components/site/EditableElement";');
  }

  content = content.replace(
    /(<span className="text-\[10px\] font-mono tracking-widest text-slate-500 uppercase">)\s*Uplink Communication Pipeline\s*(<\/span>)/,
    `$1\n                <EditableElement targetId="home.cta.badgeText" label="CTA Badge" defaultValue="Uplink Communication Pipeline" inline>\n                  Uplink Communication Pipeline\n                </EditableElement>\n              $2`
  );

  content = content.replace(
    /(<h2[^>]*>)\s*Direct Core Connection\s*(<\/h2>)/,
    `$1\n              <EditableElement targetId="home.cta.title" label="CTA Title" defaultValue="Direct Core Connection" inline>\n                Direct Core Connection\n              </EditableElement>\n            $2`
  );

  content = content.replace(
    /(<p className="text-sm text-slate-400 font-normal leading-relaxed mb-6">)\s*Establish a secure link to our engineering and dispatch team\. Transmit configuration logs, integration queries, or general system status updates\.\s*(<\/p>)/,
    `$1\n              <EditableElement targetId="home.cta.description" label="CTA Description" defaultValue="Establish a secure link to our engineering and dispatch team. Transmit configuration logs, integration queries, or general system status updates." multiline>\n                Establish a secure link to our engineering and dispatch team. Transmit configuration logs, integration queries, or general system status updates.\n              </EditableElement>\n            $2`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated BlogLayout CtaSection');
}

// 2. SecurityLayout CtaSection
{
  const p = path.resolve('components', 'site', 'layouts', 'SecurityLayout', 'body', 'components', 'CtaSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
  }

  content = content.replace(
    /(<div className="flex items-center gap-1\.5 text-xs font-black uppercase tracking-widest text-gray-500">\s*<ShieldCheckIcon[^>]*\/>)\s*System Nexus Gateway\s*(<\/div>)/,
    `$1\n                <EditableElement targetId="home.cta.badgeText" label="CTA Badge" defaultValue="System Nexus Gateway" inline>\n                  System Nexus Gateway\n                </EditableElement>\n              $2`
  );

  content = content.replace(
    /(<h2[^>]*>)\s*\{cleanTitleText\}\s*(<\/h2>)/,
    `$1\n              <EditableElement targetId="home.cta.title" label="CTA Title" defaultValue={cleanTitleText} inline>\n                {cleanTitleText}\n              </EditableElement>\n            $2`
  );

  content = content.replace(
    /(<p className="text-xs text-gray-500 leading-relaxed max-w-xl">\s*)\{subtitle\}(\s*<\/p>)/,
    `$1<EditableElement targetId="home.cta.description" label="CTA Subtitle" defaultValue={subtitle} multiline>{subtitle}</EditableElement>$2`
  );

  content = content.replace(
    /<span>\{buttonLabel\}<\/span>/,
    `<EditableElement targetId="home.cta.buttonText" label="CTA Button Label" defaultValue={buttonLabel} inline><span>{buttonLabel}</span></EditableElement>`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated SecurityLayout CtaSection');
}

// 3. Security2Layout CtaSection
{
  const p = path.resolve('components', 'site', 'layouts', 'Security2Layout', 'body', 'components', 'CtaSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
  }

  content = content.replace(
    /(<p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">)\s*DISPATCH \/\/ DEFENSIVE_STAND\s*(<\/p>)/,
    `$1\n                  <EditableElement targetId="home.cta.badgeText" label="CTA Badge" defaultValue="DISPATCH // DEFENSIVE_STAND" inline>\n                    DISPATCH // DEFENSIVE_STAND\n                  </EditableElement>\n                $2`
  );

  content = content.replace(
    /(<h2[^>]*>)\s*\{renderTitle\(title, primaryColor\)\}\s*(<\/h2>)/,
    `$1\n                <EditableElement targetId="home.cta.title" label="CTA Title" defaultValue={title} inline>\n                  {renderTitle(title, primaryColor)}\n                </EditableElement>\n              $2`
  );

  content = content.replace(
    /(<p className="text-xs font-mono text-gray-500 leading-relaxed uppercase border-l border-gray-200 pl-4 mb-10 max-w-2xl">\s*)\{subtitle\}(\s*<\/p>)/,
    `$1<EditableElement targetId="home.cta.description" label="CTA Subtitle" defaultValue={subtitle} multiline>{subtitle}</EditableElement>$2`
  );

  content = content.replace(
    /\{buttonLabel\}(\s*<ArrowRightIcon)/,
    `<EditableElement targetId="home.cta.buttonText" label="CTA Button Label" defaultValue={buttonLabel} inline>{buttonLabel}</EditableElement>$1`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated Security2Layout CtaSection');
}
