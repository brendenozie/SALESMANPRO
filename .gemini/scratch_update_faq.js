const fs = require('fs');
const file = 'components/site/layouts/CompanyPortfolioLayout/body/components/FAQSection/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState } from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
);

// 2. Wrap question & answer in FAQItem
const oldQuestion = `<h3 className="font-bold text-base md:text-lg text-zinc-200 tracking-tight leading-snug group-hover:text-zinc-100 transition-colors">
            {faq.question}
          </h3>`;

const newQuestion = `<EditableElement
            targetId={\`company-portfolio.home.faq.item\${index}.question\`}
            componentKey="FAQSection"
            elementKey="question"
            label={\`FAQ #\${index + 1} Question\`}
            type="text"
            defaultValue={faq.question}
            inline
          >
            {(val) => (
              <h3 className="font-bold text-base md:text-lg text-zinc-200 tracking-tight leading-snug group-hover:text-zinc-100 transition-colors">
                {val}
              </h3>
            )}
          </EditableElement>`;

content = content.replace(oldQuestion, newQuestion);

const oldAnswer = `<p>{faq.answer}</p>`;
const newAnswer = `<EditableElement
              targetId={\`company-portfolio.home.faq.item\${index}.answer\`}
              componentKey="FAQSection"
              elementKey="answer"
              label={\`FAQ #\${index + 1} Answer\`}
              type="textarea"
              defaultValue={faq.answer}
              inline
            >
              {(val) => <p>{val}</p>}
            </EditableElement>`;

content = content.replace(oldAnswer, newAnswer);

// 3. Wrap Title
const oldTitle = `<h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight uppercase">
            Frequently Asked Questions
          </h2>`;

const newTitle = `<h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight uppercase">
            <EditableElement
              targetId="company-portfolio.home.faq.title"
              componentKey="FAQSection"
              elementKey="title"
              label="FAQ Title"
              type="text"
              defaultValue="Frequently Asked Questions"
              inline
            >
              {(val) => <>{val}</>}
            </EditableElement>
          </h2>`;

content = content.replace(oldTitle, newTitle);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated FAQSection');
