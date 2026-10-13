const fs = require('fs');
const file = 'components/site/layouts/CompanyPortfolioLayout/body/components/CoreHighlightsSection/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add EditableElement import
content = content.replace(
  "import React from 'react';",
  "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
);

// 2. Wrap companyName (badge)
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
              targetId="company-portfolio.home.coreHighlights.badge"
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

// 3. Wrap companyTagline (title)
const oldTitle = `<motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.1]"
          >
            {companyTagline}
          </motion.h2>`;

const newTitle = `<motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.1]"
          >
            <EditableElement
              targetId="company-portfolio.home.coreHighlights.title"
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

// 4. Wrap companyDescription
const oldDesc = `<motion.p 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-3xl font-light leading-relaxed"
          >
            {companyDescription}
          </motion.p>`;

const newDesc = `<motion.p 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-3xl font-light leading-relaxed"
          >
            <EditableElement
              targetId="company-portfolio.home.coreHighlights.description"
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

// 5. Wrap pillar title & description inside featuresToRender.map
content = content.replace(
  `{featuresToRender.map((pillar) => {`,
  `{featuresToRender.map((pillar, idx) => {`
);

const oldPillarContent = `<h3 className="text-xl font-bold text-zinc-100 mb-3 tracking-tight group-hover:text-white transition-colors duration-300">
                    {pillar.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-light group-hover:text-zinc-300 transition-colors duration-300">
                    {pillar.description}
                  </p>`;

const newPillarContent = `<EditableElement
                    targetId={\`company-portfolio.home.coreHighlights.pillar\${idx}.title\`}
                    componentKey="CoreHighlightsSection"
                    elementKey="pillarTitle"
                    label={\`Pillar #\${idx + 1} Title\`}
                    type="text"
                    defaultValue={pillar.title}
                    inline
                  >
                    {(val) => (
                      <h3 className="text-xl font-bold text-zinc-100 mb-3 tracking-tight group-hover:text-white transition-colors duration-300">
                        {val}
                      </h3>
                    )}
                  </EditableElement>
                  <EditableElement
                    targetId={\`company-portfolio.home.coreHighlights.pillar\${idx}.description\`}
                    componentKey="CoreHighlightsSection"
                    elementKey="pillarDescription"
                    label={\`Pillar #\${idx + 1} Description\`}
                    type="textarea"
                    defaultValue={pillar.description}
                    inline
                  >
                    {(val) => (
                      <p className="text-zinc-400 text-sm leading-relaxed font-light group-hover:text-zinc-300 transition-colors duration-300">
                        {val}
                      </p>
                    )}
                  </EditableElement>`;

content = content.replace(oldPillarContent, newPillarContent);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated CoreHighlightsSection');
