const fs = require('fs');
const file = 'components/site/layouts/CompanyPortfolioLayout/body/components/NewsSection/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(
  "import React from 'react';",
  "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
);

// 2. Wrap Header
const oldHeader = `          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-500 mb-3">Operational Intelligence</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight uppercase">
              Market Updates & Analysis
            </h2>
            <p className="mt-4 text-sm text-zinc-400 font-light leading-relaxed">
              Real-time dispatches, asset performance adjustments, and regulatory audits compiled straight from our global node terminals.
            </p>
          </div>`;

const newHeader = `          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-500 mb-3">
              <EditableElement
                targetId="company-portfolio.home.news.badge"
                componentKey="NewsSection"
                elementKey="badge"
                label="News Badge"
                type="text"
                defaultValue="Operational Intelligence"
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight uppercase">
              <EditableElement
                targetId="company-portfolio.home.news.title"
                componentKey="NewsSection"
                elementKey="title"
                label="News Title"
                type="text"
                defaultValue="Market Updates & Analysis"
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </h2>
            <EditableElement
              targetId="company-portfolio.home.news.description"
              componentKey="NewsSection"
              elementKey="description"
              label="News Description"
              type="textarea"
              defaultValue="Real-time dispatches, asset performance adjustments, and regulatory audits compiled straight from our global node terminals."
              inline
            >
              {(val) => (
                <p className="mt-4 text-sm text-zinc-400 font-light leading-relaxed">
                  {val}
                </p>
              )}
            </EditableElement>
          </div>`;

content = content.replace(oldHeader, newHeader);

// 3. Wrap Card title & excerpt
const oldBrief = `                  {/* Clean Non-Overlapping Heading Scale */}
                  <h3 className="font-extrabold text-lg sm:text-xl text-zinc-100 tracking-tight leading-snug line-clamp-2 group-hover:text-amber-500 transition-colors duration-300">
                    {brief.title}
                  </h3>
                  
                  {/* Text Body Block */}
                  <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed line-clamp-3 text-justify">
                    {brief.excerpt || 'No supplementary abstract available for selected terminal logs.'}
                  </p>`;

const newBrief = `                  {/* Clean Non-Overlapping Heading Scale */}
                  <EditableElement
                    targetId={\`company-portfolio.home.news.card\${brief.id}.title\`}
                    componentKey="NewsSection"
                    elementKey="cardTitle"
                    label="Article Title"
                    type="text"
                    defaultValue={brief.title}
                    inline
                  >
                    {(val) => (
                      <h3 className="font-extrabold text-lg sm:text-xl text-zinc-100 tracking-tight leading-snug line-clamp-2 group-hover:text-amber-500 transition-colors duration-300">
                        {val}
                      </h3>
                    )}
                  </EditableElement>
                  
                  {/* Text Body Block */}
                  <EditableElement
                    targetId={\`company-portfolio.home.news.card\${brief.id}.excerpt\`}
                    componentKey="NewsSection"
                    elementKey="cardExcerpt"
                    label="Article Excerpt"
                    type="textarea"
                    defaultValue={brief.excerpt || 'No supplementary abstract available for selected terminal logs.'}
                    inline
                  >
                    {(val) => (
                      <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed line-clamp-3 text-justify">
                        {val}
                      </p>
                    )}
                  </EditableElement>`;

content = content.replace(oldBrief, newBrief);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated NewsSection');
