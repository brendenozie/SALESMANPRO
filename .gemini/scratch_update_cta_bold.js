const fs = require('fs');
const file = 'components/site/layouts/CompanyPortfolioLayout/body/components/CtaBoldSection/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(
  "import React from 'react';",
  "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
);

// 2. Wrap Tag
const oldTag = `<div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-950 px-3 py-1 rounded-md text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 mb-8 select-none">
            <CpuChipIcon className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            Fast-track your operations.
          </div>`;

const newTag = `<div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-950 px-3 py-1 rounded-md text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 mb-8 select-none">
            <CpuChipIcon className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            <EditableElement
              targetId="company-portfolio.home.ctaBold.tag"
              componentKey="CtaBoldSection"
              elementKey="tag"
              label="CTA Tag"
              type="text"
              defaultValue="Fast-track your operations."
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>
          </div>`;

content = content.replace(oldTag, newTag);

// 3. Wrap Title
const oldTitle = `<motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight uppercase text-zinc-100 max-w-3xl mx-auto leading-tight"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {ctaTitle}
          </motion.h2>`;

const newTitle = `<motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight uppercase text-zinc-100 max-w-3xl mx-auto leading-tight"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <EditableElement
              targetId="company-portfolio.home.ctaBold.title"
              componentKey="CtaBoldSection"
              elementKey="title"
              label="CTA Title"
              type="text"
              defaultValue={ctaTitle}
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>
          </motion.h2>`;

content = content.replace(oldTitle, newTitle);

// 4. Wrap Subtitle
const oldSubtitle = `<motion.p 
            className="text-sm md:text-base text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {ctaSubtitle}
          </motion.p>`;

const newSubtitle = `<EditableElement
            targetId="company-portfolio.home.ctaBold.subtitle"
            componentKey="CtaBoldSection"
            elementKey="subtitle"
            label="CTA Subtitle"
            type="textarea"
            defaultValue={ctaSubtitle}
            inline
          >
            {(val) => (
              <motion.p 
                className="text-sm md:text-base text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed mb-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {val}
              </motion.p>
            )}
          </EditableElement>`;

content = content.replace(oldSubtitle, newSubtitle);

// 5. Wrap Button
const oldBtn = `<Link
              href={ctaButtonHref}
              className="inline-flex items-center gap-3 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 hover:text-white font-bold py-4 px-10 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 shadow-md group"
            >
              {ctaButtonLabel}
              
            </Link>`;

const newBtn = `<Link
              href={ctaButtonHref}
              className="inline-flex items-center gap-3 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 hover:text-white font-bold py-4 px-10 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 shadow-md group"
            >
              <EditableElement
                targetId="company-portfolio.home.ctaBold.buttonText"
                componentKey="CtaBoldSection"
                elementKey="buttonText"
                label="CTA Button Label"
                type="text"
                defaultValue={ctaButtonLabel}
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </Link>`;

content = content.replace(oldBtn, newBtn);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated CtaBoldSection');
