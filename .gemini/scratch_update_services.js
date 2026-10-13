const fs = require('fs');
const file = 'components/site/layouts/CompanyPortfolioLayout/body/components/ServicesSection/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { EditableElement, useEditableContent } from '@/components/site/EditableElement';"
);

// 2. Add useEditableContent
content = content.replace(
  `export default function GreyServicesSection({ services = defaultServices, storeSlug }: GreyServicesSectionProps) {
  const router = useRouter();`,
  `export default function GreyServicesSection({ services = defaultServices, storeSlug }: GreyServicesSectionProps) {
  const router = useRouter();
  const { isEditorMode, isPreviewMode } = useEditableContent();`
);

// 3. Update auto-advance interval
content = content.replace(
  `  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % services.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isHovered, services.length]);`,
  `  useEffect(() => {
    if (isHovered || (isEditorMode && !isPreviewMode)) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % services.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isHovered, isEditorMode, isPreviewMode, services.length]);`
);

// 4. Header block & editor toolbar
const oldHeader = `        {/* Header Block */}
        <div className="mb-12 lg:mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-4">
            Institutional Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight leading-tight">
            Reliable <span className="text-zinc-500 font-light italic">Enterprise Solutions</span>
          </h2>
          <p className="mt-4 text-base text-zinc-400 font-light leading-relaxed">
            We bridge the gap between local operational capacities and global market demands. Our infrastructure ensures that your end-to-end operations are executed safely, efficiently, and in strict compliance with all industry regulations.           
          </p>
        </div>`;

const newHeader = `        {/* Editor Capability / Service Switcher */}
        {isEditorMode && !isPreviewMode && services.length > 1 && (
          <div className="mb-6 flex items-center gap-2 bg-zinc-900/90 text-white px-3 py-1.5 rounded-full text-xs font-mono shadow-xl border border-zinc-700 w-fit">
            <span className="text-zinc-400">Edit Capability:</span>
            {services.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                className={\`px-2 py-0.5 rounded \${activeIndex === idx ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}\`}
              >
                #{idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* Header Block */}
        <div className="mb-12 lg:mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-4">
            <EditableElement
              targetId="company-portfolio.home.services.badge"
              componentKey="GreyServicesSection"
              elementKey="badge"
              label="Services Badge"
              type="text"
              defaultValue="Institutional Capabilities"
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight leading-tight">
            <EditableElement
              targetId="company-portfolio.home.services.title"
              componentKey="GreyServicesSection"
              elementKey="title"
              label="Services Title"
              type="text"
              defaultValue="Reliable Enterprise Solutions"
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>
          </h2>
          <EditableElement
            targetId="company-portfolio.home.services.description"
            componentKey="GreyServicesSection"
            elementKey="description"
            label="Services Description"
            type="textarea"
            defaultValue="We bridge the gap between local operational capacities and global market demands. Our infrastructure ensures that your end-to-end operations are executed safely, efficiently, and in strict compliance with all industry regulations."
            inline
          >
            {(val) => (
              <p className="mt-4 text-base text-zinc-400 font-light leading-relaxed">
                {val}
              </p>
            )}
          </EditableElement>
        </div>`;

content = content.replace(oldHeader, newHeader);

// 5. Media Presentation Layer
const oldMedia = `                  <img
                    src={activeService.images?.[0] || activeService.imageUrl}
                    alt={activeService.name}
                    className="object-cover w-full h-full scale-100 transition-transform duration-700 ease-out"
                  />
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" /> */}
                  
                  {/* Dynamic Floating Glass Badge */}
                  <div className="absolute bottom-4 right-4 backdrop-blur-lg bg-zinc-900/70 border border-zinc-700/60 p-3 rounded-xl text-right min-w-[110px]">
                    <div className="text-sm font-mono font-bold tracking-tight text-amber-400">{activeService.metric}</div>
                    <div className="text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5">{activeService.metricLabel}</div>
                  </div>`;

const newMedia = `                  <EditableElement
                    targetId={\`company-portfolio.home.services.service\${activeIndex}.imageUrl\`}
                    componentKey="GreyServicesSection"
                    elementKey="imageUrl"
                    label={\`Capability #\${activeIndex + 1} Image\`}
                    type="image"
                    defaultValue={activeService.images?.[0] || activeService.imageUrl}
                  >
                    {(resolvedImg) => (
                      <img
                        src={resolvedImg || activeService.imageUrl}
                        alt={activeService.name}
                        className="object-cover w-full h-full scale-100 transition-transform duration-700 ease-out"
                      />
                    )}
                  </EditableElement>
                  
                  {/* Dynamic Floating Glass Badge */}
                  <div className="absolute bottom-4 right-4 backdrop-blur-lg bg-zinc-900/70 border border-zinc-700/60 p-3 rounded-xl text-right min-w-[110px]">
                    <EditableElement
                      targetId={\`company-portfolio.home.services.service\${activeIndex}.metric\`}
                      componentKey="GreyServicesSection"
                      elementKey="metric"
                      label={\`Capability #\${activeIndex + 1} Metric\`}
                      type="text"
                      defaultValue={activeService.metric}
                      inline
                    >
                      {(val) => <div className="text-sm font-mono font-bold tracking-tight text-amber-400">{val}</div>}
                    </EditableElement>
                    <EditableElement
                      targetId={\`company-portfolio.home.services.service\${activeIndex}.metricLabel\`}
                      componentKey="GreyServicesSection"
                      elementKey="metricLabel"
                      label={\`Capability #\${activeIndex + 1} Metric Label\`}
                      type="text"
                      defaultValue={activeService.metricLabel}
                      inline
                    >
                      {(val) => <div className="text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5">{val}</div>}
                    </EditableElement>
                  </div>`;

content = content.replace(oldMedia, newMedia);

// 6. Name and Description
const oldNameDesc = `                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {activeService.name}
                    </h3>
                    <p className="mt-3 text-zinc-400 text-sm font-light leading-relaxed">
                      {activeService.description}
                    </p>
                  </div>`;

const newNameDesc = `                  <div>
                    <EditableElement
                      targetId={\`company-portfolio.home.services.service\${activeIndex}.name\`}
                      componentKey="GreyServicesSection"
                      elementKey="name"
                      label={\`Capability #\${activeIndex + 1} Name\`}
                      type="text"
                      defaultValue={activeService.name}
                      inline
                    >
                      {(val) => (
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {val}
                        </h3>
                      )}
                    </EditableElement>
                    <EditableElement
                      targetId={\`company-portfolio.home.services.service\${activeIndex}.description\`}
                      componentKey="GreyServicesSection"
                      elementKey="description"
                      label={\`Capability #\${activeIndex + 1} Description\`}
                      type="textarea"
                      defaultValue={activeService.description}
                      inline
                    >
                      {(val) => (
                        <p className="mt-3 text-zinc-400 text-sm font-light leading-relaxed">
                          {val}
                        </p>
                      )}
                    </EditableElement>
                  </div>`;

content = content.replace(oldNameDesc, newNameDesc);

// 7. CTA button
const oldCta = `Initialize Allocation Pipeline`;
const newCta = `<EditableElement
                        targetId="company-portfolio.home.services.ctaText"
                        componentKey="GreyServicesSection"
                        elementKey="ctaText"
                        label="Services CTA Button"
                        type="text"
                        defaultValue="Initialize Allocation Pipeline"
                        inline
                      >
                        {(val) => <>{val}</>}
                      </EditableElement>`;

content = content.replace(oldCta, newCta);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated ServicesSection');
