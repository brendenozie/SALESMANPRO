const fs = require('fs');

// 1. HeroSection headline
{
  const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/components/HeroSection/index.tsx';
  let content = fs.readFileSync(file, 'utf8');
  const target = `<motion.h1 
              variants={fadeUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-[1.1] tracking-tight uppercase max-w-4xl transition-colors"
            >
              {currentSlide.headline?.split('\\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line.includes('$') ? (
                    <>
                      <span className="text-zinc-500 font-light italic normal-case tracking-normal block sm:inline">
                        {line.split('$')[1]}
                      </span>
                    </>
                  ) : (
                    line
                  )}
                  <br className="hidden sm:inline" />
                </React.Fragment>
              ))}
            </motion.h1>`;

  const replacement = `<EditableElement
              targetId={\`company-portfolio-light.home.hero.slide\${current}.headline\`}
              componentKey="HeroSlider"
              elementKey="headline"
              label={\`Hero Slide #\${current + 1} Headline\`}
              type="textarea"
              defaultValue={currentSlide.headline || ''}
              inline
            >
              {(val) => (
                <motion.h1 
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-[1.1] tracking-tight uppercase max-w-4xl transition-colors"
                >
                  {val?.split('\\n').map((line: string, i: number) => (
                    <React.Fragment key={i}>
                      {line.includes('$') ? (
                        <>
                          <span className="text-zinc-500 font-light italic normal-case tracking-normal block sm:inline">
                            {line.split('$')[1]}
                          </span>
                        </>
                      ) : (
                        line
                      )}
                      <br className="hidden sm:inline" />
                    </React.Fragment>
                  ))}
                </motion.h1>
              )}
            </EditableElement>`;

  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('HeroSection headline updated');
}

// 2. CoreHighlightsSection
{
  const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/components/CoreHighlightsSection/index.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import React from 'react';",
    "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
  );

  const oldBadge = `<motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold mb-4"
          >
            {companyName} 
          </motion.p>`;

  const newBadge = `<motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold mb-4"
          >
            <EditableElement
              targetId="company-portfolio-light.home.coreHighlights.badge"
              componentKey="CoreHighlightsSection"
              elementKey="badge"
              label="Core Highlights Badge"
              type="text"
              defaultValue={companyName}
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>
          </motion.p>`;

  content = content.replace(oldBadge, newBadge);

  const oldTitle = `<motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1] transition-colors"
          >
            {companyTagline}
          </motion.h2>`;

  const newTitle = `<motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1] transition-colors"
          >
            <EditableElement
              targetId="company-portfolio-light.home.coreHighlights.title"
              componentKey="CoreHighlightsSection"
              elementKey="title"
              label="Core Highlights Title"
              type="text"
              defaultValue={companyTagline}
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>
          </motion.h2>`;

  content = content.replace(oldTitle, newTitle);

  const oldDesc = `<motion.p 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl font-light leading-relaxed transition-colors"
          >
            {companyDescription}
          </motion.p>`;

  const newDesc = `<motion.p 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl font-light leading-relaxed transition-colors"
          >
            <EditableElement
              targetId="company-portfolio-light.home.coreHighlights.description"
              componentKey="CoreHighlightsSection"
              elementKey="description"
              label="Core Highlights Description"
              type="textarea"
              defaultValue={companyDescription}
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>
          </motion.p>`;

  content = content.replace(oldDesc, newDesc);

  content = content.replace(
    `{featuresToRender.map((pillar) => {`,
    `{featuresToRender.map((pillar, idx) => {`
  );

  const oldPillar = `<h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight group-hover:text-amber-500 transition-colors duration-300">
                    {pillar.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-light group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors duration-300">
                    {pillar.description}
                  </p>`;

  const newPillar = `<EditableElement
                    targetId={\`company-portfolio-light.home.coreHighlights.pillar\${idx}.title\`}
                    componentKey="CoreHighlightsSection"
                    elementKey="pillarTitle"
                    label={\`Pillar #\${idx + 1} Title\`}
                    type="text"
                    defaultValue={pillar.title}
                    inline
                  >
                    {(val) => (
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight group-hover:text-amber-500 transition-colors duration-300">
                        {val}
                      </h3>
                    )}
                  </EditableElement>
                  <EditableElement
                    targetId={\`company-portfolio-light.home.coreHighlights.pillar\${idx}.description\`}
                    componentKey="CoreHighlightsSection"
                    elementKey="pillarDescription"
                    label={\`Pillar #\${idx + 1} Description\`}
                    type="textarea"
                    defaultValue={pillar.description}
                    inline
                  >
                    {(val) => (
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-light group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors duration-300">
                        {val}
                      </p>
                    )}
                  </EditableElement>`;

  content = content.replace(oldPillar, newPillar);
  fs.writeFileSync(file, content, 'utf8');
  console.log('CoreHighlightsSection updated');
}

// 3. ServicesSection
{
  const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/components/ServicesSection/index.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { EditableElement, useEditableContent } from '@/components/site/EditableElement';"
  );
  content = content.replace(
    `export default function GreyServicesSection({ services = defaultServices, storeSlug }: GreyServicesSectionProps) {
  const router = useRouter();`,
    `export default function GreyServicesSection({ services = defaultServices, storeSlug }: GreyServicesSectionProps) {
  const router = useRouter();
  const { isEditorMode, isPreviewMode } = useEditableContent();`
  );
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

  const toolbar = `
        {/* Editor Capability / Service Switcher */}
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
`;
  content = content.replace('{/* Header Block */}', toolbar + '        {/* Header Block */}');

  // Header texts
  const oldH2 = `<h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight transition-colors">
            Reliable <span className="text-zinc-500 font-light italic">Enterprise Solutions</span>
          </h2>`;
  const newH2 = `<h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight transition-colors">
            <EditableElement
              targetId="company-portfolio-light.home.services.title"
              componentKey="GreyServicesSection"
              elementKey="title"
              label="Services Title"
              type="text"
              defaultValue="Reliable Enterprise Solutions"
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>
          </h2>`;
  content = content.replace(oldH2, newH2);

  const oldBadge = `Institutional Capabilities`;
  const newBadge = `<EditableElement
              targetId="company-portfolio-light.home.services.badge"
              componentKey="GreyServicesSection"
              elementKey="badge"
              label="Services Badge"
              type="text"
              defaultValue="Institutional Capabilities"
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>`;
  content = content.replace(oldBadge, newBadge);

  const oldDesc = `<p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 font-light leading-relaxed transition-colors">
            We bridge the gap between local operational capacities and global market demands. Our infrastructure ensures that your end-to-end operations are executed safely, efficiently, and in strict compliance with all industry regulations.           
          </p>`;
  const newDesc = `<EditableElement
            targetId="company-portfolio-light.home.services.description"
            componentKey="GreyServicesSection"
            elementKey="description"
            label="Services Description"
            type="textarea"
            defaultValue="We bridge the gap between local operational capacities and global market demands. Our infrastructure ensures that your end-to-end operations are executed safely, efficiently, and in strict compliance with all industry regulations."
            inline
          >
            {(val) => (
              <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 font-light leading-relaxed transition-colors">
                {val}
              </p>
            )}
          </EditableElement>`;
  content = content.replace(oldDesc, newDesc);

  // Active service image
  const oldImg = `<img
                    src={activeService.images?.[0] || activeService.imageUrl}
                    alt={activeService.name}
                    className="object-cover w-full h-full scale-100 transition-transform duration-700 ease-out"
                  />`;
  const newImg = `<EditableElement
                    targetId={\`company-portfolio-light.home.services.service\${activeIndex}.imageUrl\`}
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
                  </EditableElement>`;
  content = content.replace(oldImg, newImg);

  // Active service metric
  content = content.replace(
    `<div className="text-sm font-mono font-bold tracking-tight text-amber-500">{activeService.metric}</div>`,
    `<EditableElement
                      targetId={\`company-portfolio-light.home.services.service\${activeIndex}.metric\`}
                      componentKey="GreyServicesSection"
                      elementKey="metric"
                      label={\`Capability #\${activeIndex + 1} Metric\`}
                      type="text"
                      defaultValue={activeService.metric}
                      inline
                    >
                      {(val) => <div className="text-sm font-mono font-bold tracking-tight text-amber-500">{val}</div>}
                    </EditableElement>`
  );
  content = content.replace(
    `<div className="text-[9px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mt-0.5">{activeService.metricLabel}</div>`,
    `<EditableElement
                      targetId={\`company-portfolio-light.home.services.service\${activeIndex}.metricLabel\`}
                      componentKey="GreyServicesSection"
                      elementKey="metricLabel"
                      label={\`Capability #\${activeIndex + 1} Metric Label\`}
                      type="text"
                      defaultValue={activeService.metricLabel}
                      inline
                    >
                      {(val) => <div className="text-[9px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mt-0.5">{val}</div>}
                    </EditableElement>`
  );

  // Active service name & description
  content = content.replace(
    `<h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight transition-colors">
                      {activeService.name}
                    </h3>`,
    `<EditableElement
                      targetId={\`company-portfolio-light.home.services.service\${activeIndex}.name\`}
                      componentKey="GreyServicesSection"
                      elementKey="name"
                      label={\`Capability #\${activeIndex + 1} Name\`}
                      type="text"
                      defaultValue={activeService.name}
                      inline
                    >
                      {(val) => (
                        <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight transition-colors">
                          {val}
                        </h3>
                      )}
                    </EditableElement>`
  );
  content = content.replace(
    `<p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed transition-colors">
                      {activeService.description}
                    </p>`,
    `<EditableElement
                      targetId={\`company-portfolio-light.home.services.service\${activeIndex}.description\`}
                      componentKey="GreyServicesSection"
                      elementKey="description"
                      label={\`Capability #\${activeIndex + 1} Description\`}
                      type="textarea"
                      defaultValue={activeService.description}
                      inline
                    >
                      {(val) => (
                        <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed transition-colors">
                          {val}
                        </p>
                      )}
                    </EditableElement>`
  );

  // CTA button
  content = content.replace(
    `Initialize Allocation Pipeline`,
    `<EditableElement
                        targetId="company-portfolio-light.home.services.ctaText"
                        componentKey="GreyServicesSection"
                        elementKey="ctaText"
                        label="Services CTA Button"
                        type="text"
                        defaultValue="Initialize Allocation Pipeline"
                        inline
                      >
                        {(val) => <>{val}</>}
                      </EditableElement>`
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('ServicesSection updated');
}

// 4. AboutUsSpotlight
{
  const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/components/AboutUsSpotlight/index.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import React from 'react';",
    "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
  );
  // MetricCard
  content = content.replace(
    `const MetricCard = ({ metric }: { metric: any }) => {`,
    `const MetricCard = ({ metric, index }: { metric: any; index: number }) => {`
  );
  content = content.replace(
    `{metric.value}`,
    `<EditableElement
          targetId={\`company-portfolio-light.home.aboutSpotlight.metric\${index}.value\`}
          componentKey="AboutUsSpotlight"
          elementKey="metricValue"
          label={\`Metric #\${index + 1} Value\`}
          type="text"
          defaultValue={metric.value}
          inline
        >
          {(val) => <>{val}</>}
        </EditableElement>`
  );
  content = content.replace(
    `{metric.label}`,
    `<EditableElement
          targetId={\`company-portfolio-light.home.aboutSpotlight.metric\${index}.label\`}
          componentKey="AboutUsSpotlight"
          elementKey="metricLabel"
          label={\`Metric #\${index + 1} Label\`}
          type="text"
          defaultValue={metric.label}
          inline
        >
          {(val) => <>{val}</>}
        </EditableElement>`
  );
  content = content.replace(
    `<MetricCard key={\`\${metric.id}-\${index}\`} metric={metric} />`,
    `<MetricCard key={\`\${metric.id}-\${index}\`} metric={metric} index={index} />`
  );

  // Image
  const oldImg = `<Image decoding="async"
                src={pagedata.bannerUrl || enterpriseData.profileImageUrl}
                alt="Institutional trading desk operations tracking bulk commodities markets"
                fill
                className="w-full h-full object-cover opacity-90 dark:opacity-80 transform hover:scale-102 transition-all duration-700"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />`;
  const newImg = `<EditableElement
                targetId="company-portfolio-light.home.aboutSpotlight.bannerUrl"
                componentKey="AboutUsSpotlight"
                elementKey="bannerUrl"
                label="About Spotlight Banner Image"
                type="image"
                defaultValue={pagedata.bannerUrl || enterpriseData.profileImageUrl}
              >
                {(resolvedImg) => (
                  <Image decoding="async"
                    src={resolvedImg || enterpriseData.profileImageUrl}
                    alt="Institutional trading desk operations tracking bulk commodities markets"
                    fill
                    className="w-full h-full object-cover opacity-90 dark:opacity-80 transform hover:scale-102 transition-all duration-700"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                )}
              </EditableElement>`;
  content = content.replace(oldImg, newImg);

  // Badge, Title, Description, CTA
  content = content.replace(
    `Corporate Infrastructure`,
    `<EditableElement
                targetId="company-portfolio-light.home.aboutSpotlight.badge"
                componentKey="AboutUsSpotlight"
                elementKey="badge"
                label="About Spotlight Badge"
                type="text"
                defaultValue="Corporate Infrastructure"
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>`
  );
  content = content.replace(
    `<h2 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-[1.15] mb-6 transition-colors">
              Connecting local resources to <span className="text-zinc-500 font-normal italic">global markets</span>.
            </h2>`,
    `<h2 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-[1.15] mb-6 transition-colors">
              <EditableElement
                targetId="company-portfolio-light.home.aboutSpotlight.title"
                componentKey="AboutUsSpotlight"
                elementKey="title"
                label="About Spotlight Title"
                type="text"
                defaultValue="Connecting local resources to global markets."
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </h2>`
  );
  content = content.replace(
    `<p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg font-light leading-relaxed mb-10 text-justify transition-colors">
              {pagedata.description || enterpriseData.profileNarrative}
            </p>`,
    `<EditableElement
              targetId="company-portfolio-light.home.aboutSpotlight.description"
              componentKey="AboutUsSpotlight"
              elementKey="description"
              label="About Spotlight Description"
              type="textarea"
              defaultValue={pagedata.description || enterpriseData.profileNarrative}
              inline
            >
              {(val) => (
                <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg font-light leading-relaxed mb-10 text-justify transition-colors">
                  {val}
                </p>
              )}
            </EditableElement>`
  );
  content = content.replace(
    `Inquire About Availability`,
    `<EditableElement
                  targetId="company-portfolio-light.home.aboutSpotlight.ctaText"
                  componentKey="AboutUsSpotlight"
                  elementKey="ctaText"
                  label="About Spotlight CTA Button"
                  type="text"
                  defaultValue="Inquire About Availability"
                  inline
                >
                  {(val) => <>{val}</>}
                </EditableElement>`
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('AboutUsSpotlight updated');
}

// 5. ProgramsCausesSection
{
  const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/components/ProgramsCausesSection/index.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import React from 'react';",
    "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
  );
  content = content.replace(
    `<img
          src={imageUrl}
          alt={project.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out brightness-90 dark:brightness-75 group-hover:grayscale-0 group-hover:brightness-100"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/600x400/27272a/71717a?text=Asset+In+Transit";
          }}
        />`,
    `<EditableElement
          targetId={\`company-portfolio-light.home.programs.card\${index}.imageUrl\`}
          componentKey="ProgramsCausesSection"
          elementKey="imageUrl"
          label={\`Project #\${index + 1} Image\`}
          type="image"
          defaultValue={imageUrl}
        >
          {(resolvedImg) => (
            <img
              src={resolvedImg || imageUrl}
              alt={project.name}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out brightness-90 dark:brightness-75 group-hover:grayscale-0 group-hover:brightness-100"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://placehold.co/600x400/27272a/71717a?text=Asset+In+Transit";
              }}
            />
          )}
        </EditableElement>`
  );
  content = content.replace(
    `<h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2.5 tracking-tight group-hover:text-amber-500 transition-colors">
            {project.name}
          </h3>`,
    `<EditableElement
            targetId={\`company-portfolio-light.home.programs.card\${index}.name\`}
            componentKey="ProgramsCausesSection"
            elementKey="name"
            label={\`Project #\${index + 1} Name\`}
            type="text"
            defaultValue={project.name}
            inline
          >
            {(val) => (
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2.5 tracking-tight group-hover:text-amber-500 transition-colors">
                {val}
              </h3>
            )}
          </EditableElement>`
  );
  content = content.replace(
    `<p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed line-clamp-4 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors">
            {project.description}
          </p>`,
    `<EditableElement
            targetId={\`company-portfolio-light.home.programs.card\${index}.description\`}
            componentKey="ProgramsCausesSection"
            elementKey="description"
            label={\`Project #\${index + 1} Description\`}
            type="textarea"
            defaultValue={project.description}
            inline
          >
            {(val) => (
              <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed line-clamp-4 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors">
                {val}
              </p>
            )}
          </EditableElement>`
  );
  content = content.replace(
    `<h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight transition-colors">
              {companyTitle}
            </h2>`,
    `<h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight transition-colors">
              <EditableElement
                targetId="company-portfolio-light.home.programs.title"
                componentKey="ProgramsCausesSection"
                elementKey="title"
                label="Programs Title"
                type="text"
                defaultValue={companyTitle}
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </h2>`
  );
  content = content.replace(
    `<p 
              className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold mb-4"
              dangerouslySetInnerHTML={{ __html: companySubtitle }}
            />`,
    `<p className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold mb-4">
              <EditableElement
                targetId="company-portfolio-light.home.programs.badge"
                componentKey="ProgramsCausesSection"
                elementKey="badge"
                label="Programs Badge"
                type="text"
                defaultValue={companySubtitle}
                inline
              >
                {(val) => <span dangerouslySetInnerHTML={{ __html: String(val) }} />}
              </EditableElement>
            </p>`
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('ProgramsCausesSection updated');
}

// 6. ImpactStatsSection
{
  const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/components/ImpactStatsSection/index.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import React from 'react';",
    "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
  );
  content = content.replace(
    `const MetricTile = ({ metric }: { metric: UnifiedMetric }) => {`,
    `const MetricTile = ({ metric, index }: { metric: UnifiedMetric; index: number }) => {`
  );
  content = content.replace(
    `<h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none break-words transition-colors">
          {metric.value}
        </h3>`,
    `<EditableElement
          targetId={\`company-portfolio-light.home.impactStats.metric\${index}.value\`}
          componentKey="ImpactStatsSection"
          elementKey="metricValue"
          label={\`Stat #\${index + 1} Value\`}
          type="text"
          defaultValue={metric.value}
          inline
        >
          {(val) => (
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none break-words transition-colors">
              {val}
            </h3>
          )}
        </EditableElement>`
  );
  content = content.replace(
    `<p className="mt-4 text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-900 pt-4 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors">
        {metric.label}
      </p>`,
    `<EditableElement
        targetId={\`company-portfolio-light.home.impactStats.metric\${index}.label\`}
        componentKey="ImpactStatsSection"
        elementKey="metricLabel"
        label={\`Stat #\${index + 1} Label\`}
        type="text"
        defaultValue={metric.label}
        inline
      >
        {(val) => (
          <p className="mt-4 text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-900 pt-4 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors">
            {val}
          </p>
        )}
      </EditableElement>`
  );
  content = content.replace(
    `<MetricTile key={metric.id} metric={metric} />`,
    `<MetricTile key={metric.id} metric={metric} index={index} />`
  );
  content = content.replace(
    `Audited Capital & Performance`,
    `<EditableElement
                targetId="company-portfolio-light.home.impactStats.badge"
                componentKey="ImpactStatsSection"
                elementKey="badge"
                label="Impact Stats Badge"
                type="text"
                defaultValue="Audited Capital & Performance"
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>`
  );
  content = content.replace(
    `<h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase leading-none transition-colors">
              {sectionTitle}
            </h2>`,
    `<h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase leading-none transition-colors">
              <EditableElement
                targetId="company-portfolio-light.home.impactStats.title"
                componentKey="ImpactStatsSection"
                elementKey="title"
                label="Impact Stats Title"
                type="text"
                defaultValue={sectionTitle}
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </h2>`
  );
  content = content.replace(
    `The success of our network is built on a foundation of speed, safety, and accuracy. By using automated compliance checks and secure, high-tech vaults, we ensure that every transaction is verified and protected. These records provide a clear, transparent view of the reliable operations managed by {firmName}.`,
    `<EditableElement
              targetId="company-portfolio-light.home.impactStats.description"
              componentKey="ImpactStatsSection"
              elementKey="description"
              label="Impact Stats Description"
              type="textarea"
              defaultValue={\`The success of our network is built on a foundation of speed, safety, and accuracy. By using automated compliance checks and secure, high-tech vaults, we ensure that every transaction is verified and protected. These records provide a clear, transparent view of the reliable operations managed by \${firmName}.\`}
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>`
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('ImpactStatsSection updated');
}

// 7. NewsSection
{
  const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/components/NewsSection/index.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import React from 'react';",
    "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
  );
  content = content.replace(
    `Operational Intelligence`,
    `<EditableElement
                targetId="company-portfolio-light.home.news.badge"
                componentKey="NewsSection"
                elementKey="badge"
                label="News Badge"
                type="text"
                defaultValue="Operational Intelligence"
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>`
  );
  content = content.replace(
    `<h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase transition-colors">
              Market Updates & Analysis
            </h2>`,
    `<h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase transition-colors">
              <EditableElement
                targetId="company-portfolio-light.home.news.title"
                componentKey="NewsSection"
                elementKey="title"
                label="News Title"
                type="text"
                defaultValue="Market Updates & Analysis"
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </h2>`
  );
  content = content.replace(
    `<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed transition-colors">
              Real-time dispatches, asset performance adjustments, and regulatory audits compiled straight from our global node terminals.
            </p>`,
    `<EditableElement
              targetId="company-portfolio-light.home.news.description"
              componentKey="NewsSection"
              elementKey="description"
              label="News Description"
              type="textarea"
              defaultValue="Real-time dispatches, asset performance adjustments, and regulatory audits compiled straight from our global node terminals."
              inline
            >
              {(val) => (
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed transition-colors">
                  {val}
                </p>
              )}
            </EditableElement>`
  );
  content = content.replace(
    `{brief.title}`,
    `<EditableElement
                    targetId={\`company-portfolio-light.home.news.card\${brief.id}.title\`}
                    componentKey="NewsSection"
                    elementKey="cardTitle"
                    label="Article Title"
                    type="text"
                    defaultValue={brief.title}
                    inline
                  >
                    {(val) => <>{val}</>}
                  </EditableElement>`
  );
  content = content.replace(
    `{brief.excerpt || 'No supplementary abstract available for selected terminal logs.'}`,
    `<EditableElement
                    targetId={\`company-portfolio-light.home.news.card\${brief.id}.excerpt\`}
                    componentKey="NewsSection"
                    elementKey="cardExcerpt"
                    label="Article Excerpt"
                    type="textarea"
                    defaultValue={brief.excerpt || 'No supplementary abstract available for selected terminal logs.'}
                    inline
                  >
                    {(val) => <>{val}</>}
                  </EditableElement>`
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('NewsSection updated');
}

// 8. TestimonialsNewsSection
{
  const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/components/TestimonialsNewsSection/index.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import React from 'react';",
    "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
  );
  content = content.replace(
    `const VerificationCard = ({ ver, primaryColor }: { ver: typeof mockVerifications[0]; primaryColor: string }) => {`,
    `const VerificationCard = ({ ver, primaryColor, index }: { ver: typeof mockVerifications[0]; primaryColor: string; index: number }) => {`
  );
  content = content.replace(
    `"{ver.quote}"`,
    `<EditableElement
                    targetId={\`company-portfolio-light.home.testimonials.item\${index}.quote\`}
                    componentKey="TestimonialsNewsSection"
                    elementKey="quote"
                    label={\`Testimonial #\${index + 1} Quote\`}
                    type="textarea"
                    defaultValue={ver.quote}
                    inline
                >
                    {(val) => <>"{val}"</>}
                </EditableElement>`
  );
  content = content.replace(
    `<h4 className="font-bold text-zinc-900 dark:text-zinc-200 text-sm tracking-tight truncate transition-colors">{ver.authorName}</h4>`,
    `<EditableElement
                        targetId={\`company-portfolio-light.home.testimonials.item\${index}.authorName\`}
                        componentKey="TestimonialsNewsSection"
                        elementKey="authorName"
                        label={\`Testimonial #\${index + 1} Author Name\`}
                        type="text"
                        defaultValue={ver.authorName}
                        inline
                    >
                        {(val) => <h4 className="font-bold text-zinc-900 dark:text-zinc-200 text-sm tracking-tight truncate transition-colors">{val}</h4>}
                    </EditableElement>`
  );
  content = content.replace(
    `{ver.role}`,
    `<EditableElement
                        targetId={\`company-portfolio-light.home.testimonials.item\${index}.role\`}
                        componentKey="TestimonialsNewsSection"
                        elementKey="role"
                        label={\`Testimonial #\${index + 1} Role\`}
                        type="text"
                        defaultValue={ver.role}
                        inline
                    >
                        {(val) => <>{val}</>}
                    </EditableElement>`
  );
  content = content.replace(
    `<VerificationCard
                                key={ver.id}
                                ver={ver}
                                primaryColor={primaryColor}
                            />`,
    `<VerificationCard
                                key={ver.id}
                                ver={ver}
                                primaryColor={primaryColor}
                                index={index}
                            />`
  );
  content = content.replace(
    `Institutional Validation`,
    `<EditableElement
                            targetId="company-portfolio-light.home.testimonials.badge"
                            componentKey="TestimonialsNewsSection"
                            elementKey="badge"
                            label="Testimonials Badge"
                            type="text"
                            defaultValue="Institutional Validation"
                            inline
                        >
                            {(val) => <>{val}</>}
                        </EditableElement>`
  );
  content = content.replace(
    `<h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase transition-colors">
                        What Our Partners Say
                    </h2>`,
    `<h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase transition-colors">
                        <EditableElement
                            targetId="company-portfolio-light.home.testimonials.title"
                            componentKey="TestimonialsNewsSection"
                            elementKey="title"
                            label="Testimonials Title"
                            type="text"
                            defaultValue="What Our Partners Say"
                            inline
                        >
                            {(val) => <>{val}</>}
                        </EditableElement>
                    </h2>`
  );
  content = content.replace(
    `<p className="text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed transition-colors">
                        We are proud of the trust our partners place in us. Below are verified performance reports and testimonials from the industry leaders we work with every day.
                    </p>`,
    `<EditableElement
                        targetId="company-portfolio-light.home.testimonials.description"
                        componentKey="TestimonialsNewsSection"
                        elementKey="description"
                        label="Testimonials Description"
                        type="textarea"
                        defaultValue="We are proud of the trust our partners place in us. Below are verified performance reports and testimonials from the industry leaders we work with every day."
                        inline
                    >
                        {(val) => (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed transition-colors">
                                {val}
                            </p>
                        )}
                    </EditableElement>`
  );
  content = content.replace(
    `Ready to scale capital throughput safely?`,
    `<EditableElement
                                targetId="company-portfolio-light.home.testimonials.bannerTitle"
                                componentKey="TestimonialsNewsSection"
                                elementKey="bannerTitle"
                                label="Banner Title"
                                type="text"
                                defaultValue="Ready to scale capital throughput safely?"
                                inline
                            >
                                {(val) => <>{val}</>}
                            </EditableElement>`
  );
  content = content.replace(
    `Establish your clearance endpoint today. Coordinate with our clearing desks to isolate liquidity volatility.`,
    `<EditableElement
                                targetId="company-portfolio-light.home.testimonials.bannerSubtitle"
                                componentKey="TestimonialsNewsSection"
                                elementKey="bannerSubtitle"
                                label="Banner Subtitle"
                                type="textarea"
                                defaultValue="Establish your clearance endpoint today. Coordinate with our clearing desks to isolate liquidity volatility."
                                inline
                            >
                                {(val) => <>{val}</>}
                            </EditableElement>`
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('TestimonialsNewsSection updated');
}

// 9. CtaBoldSection
{
  const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/components/CtaBoldSection/index.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import React from 'react';",
    "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
  );
  content = content.replace(
    `Fast-track your operations.`,
    `<EditableElement
              targetId="company-portfolio-light.home.ctaBold.tag"
              componentKey="CtaBoldSection"
              elementKey="tag"
              label="CTA Tag"
              type="text"
              defaultValue="Fast-track your operations."
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>`
  );
  content = content.replace(
    `{ctaTitle}`,
    `<EditableElement
              targetId="company-portfolio-light.home.ctaBold.title"
              componentKey="CtaBoldSection"
              elementKey="title"
              label="CTA Title"
              type="text"
              defaultValue={ctaTitle}
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>`
  );
  content = content.replace(
    `{ctaSubtitle}`,
    `<EditableElement
            targetId="company-portfolio-light.home.ctaBold.subtitle"
            componentKey="CtaBoldSection"
            elementKey="subtitle"
            label="CTA Subtitle"
            type="textarea"
            defaultValue={ctaSubtitle}
            inline
          >
            {(val) => <>{val}</>}
          </EditableElement>`
  );
  content = content.replace(
    `{ctaButtonLabel}`,
    `<EditableElement
                targetId="company-portfolio-light.home.ctaBold.buttonText"
                componentKey="CtaBoldSection"
                elementKey="buttonText"
                label="CTA Button Label"
                type="text"
                defaultValue={ctaButtonLabel}
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>`
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('CtaBoldSection updated');
}

// 10. FAQSection
{
  const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/components/FAQSection/index.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
  );
  content = content.replace(
    `{faq.question}`,
    `<EditableElement
            targetId={\`company-portfolio-light.home.faq.item\${index}.question\`}
            componentKey="FAQSection"
            elementKey="question"
            label={\`FAQ #\${index + 1} Question\`}
            type="text"
            defaultValue={faq.question}
            inline
          >
            {(val) => <>{val}</>}
          </EditableElement>`
  );
  content = content.replace(
    `<p>{faq.answer}</p>`,
    `<EditableElement
              targetId={\`company-portfolio-light.home.faq.item\${index}.answer\`}
              componentKey="FAQSection"
              elementKey="answer"
              label={\`FAQ #\${index + 1} Answer\`}
              type="textarea"
              defaultValue={faq.answer}
              inline
            >
              {(val) => <p>{val}</p>}
            </EditableElement>`
  );
  content = content.replace(
    `Frequently Asked Questions`,
    `<EditableElement
              targetId="company-portfolio-light.home.faq.title"
              componentKey="FAQSection"
              elementKey="title"
              label="FAQ Title"
              type="text"
              defaultValue="Frequently Asked Questions"
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>`
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('FAQSection updated');
}

// 11. CallToActionSection
{
  const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/components/CallToActionSection/index.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    'import React, { useState } from "react";',
    'import React, { useState } from "react";\nimport { EditableElement } from "@/components/site/EditableElement";'
  );
  content = content.replace(
    `Get In Touch`,
    `<EditableElement
                targetId="company-portfolio-light.home.contact.tag"
                componentKey="CallToActionSection"
                elementKey="tag"
                label="Contact Tag"
                type="text"
                defaultValue="Get In Touch"
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>`
  );
  content = content.replace(
    `<h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase leading-none transition-colors">
              Let&apos;s Engage <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-400 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-500">
                Start a Conversation
              </span>
            </h2>`,
    `<h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase leading-none transition-colors">
              <EditableElement
                targetId="company-portfolio-light.home.contact.title"
                componentKey="CallToActionSection"
                elementKey="title"
                label="Contact Title"
                type="text"
                defaultValue="Let's Engage Start a Conversation"
                inline
              >
                {(val) => (
                  <>
                    {val}
                  </>
                )}
              </EditableElement>
            </h2>`
  );
  content = content.replace(
    `<p className="text-zinc-600 dark:text-zinc-400 font-light text-sm sm:text-base leading-relaxed text-justify transition-colors">
              Have a question, or you want to get off the ground? Drop us a message using the form, or book a quick intro call. We would love to learn more about your goals and see how we can help.
            </p>`,
    `<EditableElement
              targetId="company-portfolio-light.home.contact.description"
              componentKey="CallToActionSection"
              elementKey="description"
              label="Contact Description"
              type="textarea"
              defaultValue="Have a question, or you want to get off the ground? Drop us a message using the form, or book a quick intro call. We would love to learn more about your goals and see how we can help."
              inline
            >
              {(val) => (
                <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm sm:text-base leading-relaxed text-justify transition-colors">
                  {val}
                </p>
              )}
            </EditableElement>`
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('CallToActionSection updated');
}

console.log('ALL CompanyPortfolioLight components updated successfully!');
