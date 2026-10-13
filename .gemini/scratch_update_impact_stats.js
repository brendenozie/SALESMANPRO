const fs = require('fs');
const file = 'components/site/layouts/CompanyPortfolioLayout/body/components/ImpactStatsSection/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(
  "import React from 'react';",
  "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
);

// 2. MetricTile value and label
const oldMetricTile = `const MetricTile = ({ metric }: { metric: UnifiedMetric }) => {
  const IconComponent = metric.Icon;

  return (
    <motion.div
      variants={metricTileVariants}
      className="group relative bg-zinc-900/20 backdrop-blur-sm border border-zinc-900 rounded-xl p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:bg-zinc-900/40 hover:border-zinc-800 w-full"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900/80 text-zinc-500 group-hover:text-amber-500 transition-colors duration-300 shadow-inner">
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="font-mono text-[10px] tracking-widest text-zinc-600 select-none">
            // {metric.order}
          </span>
        </div>

        <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight leading-none break-words">
          {metric.value}
        </h3>
      </div>
      
      <p className="mt-4 text-xs font-medium tracking-wide text-zinc-400 border-t border-zinc-900 pt-4 group-hover:text-zinc-300 transition-colors">
        {metric.label}
      </p>
    </motion.div>
  );
};`;

const newMetricTile = `const MetricTile = ({ metric, index }: { metric: UnifiedMetric; index: number }) => {
  const IconComponent = metric.Icon;

  return (
    <motion.div
      variants={metricTileVariants}
      className="group relative bg-zinc-900/20 backdrop-blur-sm border border-zinc-900 rounded-xl p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:bg-zinc-900/40 hover:border-zinc-800 w-full"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900/80 text-zinc-500 group-hover:text-amber-500 transition-colors duration-300 shadow-inner">
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="font-mono text-[10px] tracking-widest text-zinc-600 select-none">
            // {metric.order}
          </span>
        </div>

        <EditableElement
          targetId={\`company-portfolio.home.impactStats.metric\${index}.value\`}
          componentKey="ImpactStatsSection"
          elementKey="metricValue"
          label={\`Stat #\${index + 1} Value\`}
          type="text"
          defaultValue={metric.value}
          inline
        >
          {(val) => (
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight leading-none break-words">
              {val}
            </h3>
          )}
        </EditableElement>
      </div>
      
      <EditableElement
        targetId={\`company-portfolio.home.impactStats.metric\${index}.label\`}
        componentKey="ImpactStatsSection"
        elementKey="metricLabel"
        label={\`Stat #\${index + 1} Label\`}
        type="text"
        defaultValue={metric.label}
        inline
      >
        {(val) => (
          <p className="mt-4 text-xs font-medium tracking-wide text-zinc-400 border-t border-zinc-900 pt-4 group-hover:text-zinc-300 transition-colors">
            {val}
          </p>
        )}
      </EditableElement>
    </motion.div>
  );
};`;

content = content.replace(oldMetricTile, newMetricTile);

content = content.replace(
  `{finalMetrics.map((metric) => (
              <MetricTile key={metric.id} metric={metric} />
            ))}`,
  `{finalMetrics.map((metric, index) => (
              <MetricTile key={metric.id} metric={metric} index={index} />
            ))}`
);

// 3. Header Block
const oldHeader = `        {/* Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start mb-20">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-500 mb-3">
              Audited Capital & Performance
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight uppercase leading-none">
              {sectionTitle}
            </h2>
          </div>
          
          <div className="lg:col-span-7 lg:border-l lg:border-zinc-900 lg:pl-10">
            <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed text-justify">
              The success of our network is built on a foundation of speed, safety, and accuracy. By using automated compliance checks and secure, high-tech vaults, we ensure that every transaction is verified and protected. These records provide a clear, transparent view of the reliable operations managed by {firmName}.
            </p>
          </div>
        </div>`;

const newHeader = `        {/* Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start mb-20">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-500 mb-3">
              <EditableElement
                targetId="company-portfolio.home.impactStats.badge"
                componentKey="ImpactStatsSection"
                elementKey="badge"
                label="Impact Stats Badge"
                type="text"
                defaultValue="Audited Capital & Performance"
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight uppercase leading-none">
              <EditableElement
                targetId="company-portfolio.home.impactStats.title"
                componentKey="ImpactStatsSection"
                elementKey="title"
                label="Impact Stats Title"
                type="text"
                defaultValue={sectionTitle}
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </h2>
          </div>
          
          <div className="lg:col-span-7 lg:border-l lg:border-zinc-900 lg:pl-10">
            <EditableElement
              targetId="company-portfolio.home.impactStats.description"
              componentKey="ImpactStatsSection"
              elementKey="description"
              label="Impact Stats Description"
              type="textarea"
              defaultValue={\`The success of our network is built on a foundation of speed, safety, and accuracy. By using automated compliance checks and secure, high-tech vaults, we ensure that every transaction is verified and protected. These records provide a clear, transparent view of the reliable operations managed by \${firmName}.\`}
              inline
            >
              {(val) => (
                <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed text-justify">
                  {val}
                </p>
              )}
            </EditableElement>
          </div>
        </div>`;

content = content.replace(oldHeader, newHeader);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated ImpactStatsSection');
