const fs = require('fs');
const file = 'components/site/layouts/CompanyPortfolioLayout/body/components/AboutUsSpotlight/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(
  "import React from 'react';",
  "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
);

// 2. Wrap MetricCard
const oldMetricCard = `const MetricCard = ({ metric }: { metric: any }) => {
  const IconComponent = metric.Icon;
  return (
    <motion.div
      variants={metricItemVariants}
      className="group relative bg-zinc-900/30 border border-zinc-900/80 rounded-2xl p-6 flex flex-col justify-between transition-all duration-500 hover:bg-zinc-900/60 hover:border-zinc-800"
    >
      {/* Absolute Micro Ambient Light Flare on hover */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none" />
      
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-500 group-hover:text-amber-500 transition-colors duration-300">
          <IconComponent className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-mono tracking-widest text-zinc-600 group-hover:text-zinc-500 transition-colors">
          [0{metric.order}]
        </span>
      </div>

      <div className="mt-8">
        <h3 className="text-3xl font-bold text-zinc-100 tracking-tight leading-none">
          {metric.value}
        </h3>
        <p className="text-xs font-medium tracking-wide text-zinc-400 mt-2">
          {metric.label}
        </p>
      </div>
    </motion.div>
  );
};`;

const newMetricCard = `const MetricCard = ({ metric, index }: { metric: any; index: number }) => {
  const IconComponent = metric.Icon;
  return (
    <motion.div
      variants={metricItemVariants}
      className="group relative bg-zinc-900/30 border border-zinc-900/80 rounded-2xl p-6 flex flex-col justify-between transition-all duration-500 hover:bg-zinc-900/60 hover:border-zinc-800"
    >
      {/* Absolute Micro Ambient Light Flare on hover */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none" />
      
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-500 group-hover:text-amber-500 transition-colors duration-300">
          <IconComponent className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-mono tracking-widest text-zinc-600 group-hover:text-zinc-500 transition-colors">
          [0{metric.order}]
        </span>
      </div>

      <div className="mt-8">
        <EditableElement
          targetId={\`company-portfolio.home.aboutSpotlight.metric\${index}.value\`}
          componentKey="AboutUsSpotlight"
          elementKey="metricValue"
          label={\`Metric #\${index + 1} Value\`}
          type="text"
          defaultValue={metric.value}
          inline
        >
          {(val) => (
            <h3 className="text-3xl font-bold text-zinc-100 tracking-tight leading-none">
              {val}
            </h3>
          )}
        </EditableElement>
        <EditableElement
          targetId={\`company-portfolio.home.aboutSpotlight.metric\${index}.label\`}
          componentKey="AboutUsSpotlight"
          elementKey="metricLabel"
          label={\`Metric #\${index + 1} Label\`}
          type="text"
          defaultValue={metric.label}
          inline
        >
          {(val) => (
            <p className="text-xs font-medium tracking-wide text-zinc-400 mt-2">
              {val}
            </p>
          )}
        </EditableElement>
      </div>
    </motion.div>
  );
};`;

content = content.replace(oldMetricCard, newMetricCard);

// 3. Update MetricCard usage to pass index
content = content.replace(
  `<MetricCard key={\`\${metric.id}-\${index}\`} metric={metric} />`,
  `<MetricCard key={\`\${metric.id}-\${index}\`} metric={metric} index={index} />`
);

// 4. Wrap Image
const oldImg = `<Image decoding="async"
                src={pagedata.bannerUrl || enterpriseData.profileImageUrl}
                alt="Institutional trading desk operations tracking bulk commodities markets"
                fill
                className="w-full h-full object-cover opacity-80 transform hover:scale-102 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />`;

const newImg = `<EditableElement
                targetId="company-portfolio.home.aboutSpotlight.bannerUrl"
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
                    className="w-full h-full object-cover opacity-80 transform hover:scale-102 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                )}
              </EditableElement>`;

content = content.replace(oldImg, newImg);

// 5. Wrap Badge, Title, Description, CTA
const oldTextPanel = `<p className="text-xs uppercase tracking-[0.3em] text-amber-500 font-bold mb-3">
              Corporate Infrastructure
            </p>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 tracking-tight leading-[1.15] mb-6">
              Connecting local resources to <span className="text-zinc-500 font-normal italic">global markets</span>.
            </h2>
            
            <p className="text-zinc-400 text-base md:text-lg font-light leading-relaxed mb-10 text-justify">
              {pagedata.description || enterpriseData.profileNarrative}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#trade-desk"
                className="inline-flex items-center gap-2.5 bg-zinc-100 text-zinc-950 font-bold py-3.5 px-7 rounded-xl shadow-lg text-xs tracking-wider uppercase hover:bg-white transition-all duration-300 transform hover:scale-[1.01]"
              >
                Inquire About Availability
                <ArrowUpRightIcon className="w-4 h-4 text-zinc-950" />
              </a>`;

const newTextPanel = `<p className="text-xs uppercase tracking-[0.3em] text-amber-500 font-bold mb-3">
              <EditableElement
                targetId="company-portfolio.home.aboutSpotlight.badge"
                componentKey="AboutUsSpotlight"
                elementKey="badge"
                label="About Spotlight Badge"
                type="text"
                defaultValue="Corporate Infrastructure"
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </p>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 tracking-tight leading-[1.15] mb-6">
              <EditableElement
                targetId="company-portfolio.home.aboutSpotlight.title"
                componentKey="AboutUsSpotlight"
                elementKey="title"
                label="About Spotlight Title"
                type="text"
                defaultValue="Connecting local resources to global markets."
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </h2>
            
            <EditableElement
              targetId="company-portfolio.home.aboutSpotlight.description"
              componentKey="AboutUsSpotlight"
              elementKey="description"
              label="About Spotlight Description"
              type="textarea"
              defaultValue={pagedata.description || enterpriseData.profileNarrative}
              inline
            >
              {(val) => (
                <p className="text-zinc-400 text-base md:text-lg font-light leading-relaxed mb-10 text-justify">
                  {val}
                </p>
              )}
            </EditableElement>

            <div className="flex flex-wrap gap-4">
              <a
                href="#trade-desk"
                className="inline-flex items-center gap-2.5 bg-zinc-100 text-zinc-950 font-bold py-3.5 px-7 rounded-xl shadow-lg text-xs tracking-wider uppercase hover:bg-white transition-all duration-300 transform hover:scale-[1.01]"
              >
                <EditableElement
                  targetId="company-portfolio.home.aboutSpotlight.ctaText"
                  componentKey="AboutUsSpotlight"
                  elementKey="ctaText"
                  label="About Spotlight CTA Button"
                  type="text"
                  defaultValue="Inquire About Availability"
                  inline
                >
                  {(val) => <>{val}</>}
                </EditableElement>
                <ArrowUpRightIcon className="w-4 h-4 text-zinc-950" />
              </a>`;

content = content.replace(oldTextPanel, newTextPanel);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated AboutUsSpotlight');
