const fs = require('fs');
const file = 'components/site/layouts/CompanyPortfolioLayout/body/components/ProgramsCausesSection/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(
  "import React from 'react';",
  "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
);

// 2. ProjectCard image, title, description
const oldCardImg = `        <img
          src={imageUrl}
          alt={project.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out brightness-75 group-hover:grayscale-0 group-hover:brightness-100"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/600x400/27272a/71717a?text=Asset+In+Transit";
          }}
        />`;

const newCardImg = `        <EditableElement
          targetId={\`company-portfolio.home.programs.card\${index}.imageUrl\`}
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
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out brightness-75 group-hover:grayscale-0 group-hover:brightness-100"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://placehold.co/600x400/27272a/71717a?text=Asset+In+Transit";
              }}
            />
          )}
        </EditableElement>`;

content = content.replace(oldCardImg, newCardImg);

const oldCardContent = `        <div>
          <h3 className="text-xl font-bold text-zinc-100 mb-2.5 tracking-tight group-hover:text-white transition-colors">
            {project.name}
          </h3>
          <p className="text-zinc-400 text-sm font-light leading-relaxed line-clamp-4 group-hover:text-zinc-300 transition-colors">
            {project.description}
          </p>
        </div>`;

const newCardContent = `        <div>
          <EditableElement
            targetId={\`company-portfolio.home.programs.card\${index}.name\`}
            componentKey="ProgramsCausesSection"
            elementKey="name"
            label={\`Project #\${index + 1} Name\`}
            type="text"
            defaultValue={project.name}
            inline
          >
            {(val) => (
              <h3 className="text-xl font-bold text-zinc-100 mb-2.5 tracking-tight group-hover:text-white transition-colors">
                {val}
              </h3>
            )}
          </EditableElement>
          <EditableElement
            targetId={\`company-portfolio.home.programs.card\${index}.description\`}
            componentKey="ProgramsCausesSection"
            elementKey="description"
            label={\`Project #\${index + 1} Description\`}
            type="textarea"
            defaultValue={project.description}
            inline
          >
            {(val) => (
              <p className="text-zinc-400 text-sm font-light leading-relaxed line-clamp-4 group-hover:text-zinc-300 transition-colors">
                {val}
              </p>
            )}
          </EditableElement>
        </div>`;

content = content.replace(oldCardContent, newCardContent);

// 3. Header subtitle & title
const oldHeader = `          <div className="max-w-xl">
            <p 
              className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold mb-4"
              dangerouslySetInnerHTML={{ __html: companySubtitle }}
            />
            <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight">
              {companyTitle}
            </h2>
          </div>`;

const newHeader = `          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold mb-4">
              <EditableElement
                targetId="company-portfolio.home.programs.badge"
                componentKey="ProgramsCausesSection"
                elementKey="badge"
                label="Programs Badge"
                type="text"
                defaultValue={companySubtitle}
                inline
              >
                {(val) => <span dangerouslySetInnerHTML={{ __html: String(val) }} />}
              </EditableElement>
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight">
              <EditableElement
                targetId="company-portfolio.home.programs.title"
                componentKey="ProgramsCausesSection"
                elementKey="title"
                label="Programs Title"
                type="text"
                defaultValue={companyTitle}
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </h2>
          </div>`;

content = content.replace(oldHeader, newHeader);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated ProgramsCausesSection');
