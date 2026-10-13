const fs = require('fs');
const file = 'components/site/layouts/CompanyPortfolioLayout/body/components/CallToActionSection/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(
  'import React, { useState } from "react";',
  'import React, { useState } from "react";\nimport { EditableElement } from "@/components/site/EditableElement";'
);

// 2. Wrap Tag
const oldTag = `<div className="inline-flex items-center gap-2 border border-zinc-900 bg-zinc-900/20 px-3 py-1.5 rounded-md text-[10px] font-mono tracking-[0.15em] uppercase text-zinc-500 select-none">
              <EnvelopeIcon className="w-3.5 h-3.5" style={{ color: systemAccent }} />
              Get In Touch
            </div>`;

const newTag = `<div className="inline-flex items-center gap-2 border border-zinc-900 bg-zinc-900/20 px-3 py-1.5 rounded-md text-[10px] font-mono tracking-[0.15em] uppercase text-zinc-500 select-none">
              <EnvelopeIcon className="w-3.5 h-3.5" style={{ color: systemAccent }} />
              <EditableElement
                targetId="company-portfolio.home.contact.tag"
                componentKey="CallToActionSection"
                elementKey="tag"
                label="Contact Tag"
                type="text"
                defaultValue="Get In Touch"
                inline
              >
                {(val) => <>{val}</>}
              </EditableElement>
            </div>`;

content = content.replace(oldTag, newTag);

// 3. Wrap Title
const oldTitle = `<h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 tracking-tight uppercase leading-none">
              Let&apos;s Engage <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500">
                Start a Conversation
              </span>
            </h2>`;

const newTitle = `<h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 tracking-tight uppercase leading-none">
              <EditableElement
                targetId="company-portfolio.home.contact.title"
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
            </h2>`;

content = content.replace(oldTitle, newTitle);

// 4. Wrap Description
const oldDesc = `<p className="text-zinc-400 font-light text-sm sm:text-base leading-relaxed text-justify">
              Have a question, or you want to get off the ground? Drop us a message using the form, or book a quick intro call. We would love to learn more about your goals and see how we can help.
            </p>`;

const newDesc = `<EditableElement
              targetId="company-portfolio.home.contact.description"
              componentKey="CallToActionSection"
              elementKey="description"
              label="Contact Description"
              type="textarea"
              defaultValue="Have a question, or you want to get off the ground? Drop us a message using the form, or book a quick intro call. We would love to learn more about your goals and see how we can help."
              inline
            >
              {(val) => (
                <p className="text-zinc-400 font-light text-sm sm:text-base leading-relaxed text-justify">
                  {val}
                </p>
              )}
            </EditableElement>`;

content = content.replace(oldDesc, newDesc);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated CallToActionSection');
