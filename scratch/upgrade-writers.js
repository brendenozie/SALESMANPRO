const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components', 'site', 'layouts');

const targetThemes = [
  'DirectoryLayout', 'EcommerceAccessoriesLayout', 'EcommerceAgrovetLayout',
  'EcommerceBabyLayout', 'EcommerceBikeLayout', 'EcommerceBookLayout',
  'EcommerceCakeLayout', 'EcommerceEarphonesLayout', 'EcommerceFlowersLayout',
  'EcommerceGamingLayout', 'EcommerceGlassesLayout', 'EcommerceGroceriesLayout',
  'EcommerceHardwareLayout', 'EcommerceHoneyLayout', 'EcommerceLayout',
  'EcommerceMeatLayout', 'EcommerceMotorCycleLayout', 'EcommercePeanutsLayout',
  'EcommercePetsLayout', 'EcommerceWatchLayout', 'FashionLayout', 'FurnitureLayout'
];

const newContent = `"use client";

import React from "react";
import { motion } from "framer-motion";
import { EditableElement } from "@/components/site/EditableElement";

const fallbackWriters = [
  {
    name: "Kristin Watson",
    role: "Senior Editorial Writer",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Marvin Roy",
    role: "Investigative Journalist",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Leslie Aria",
    role: "Lead Publisher & Curator",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Hawkins Alex",
    role: "Technical Content Strategist",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop"
  },
];

export interface StaffWritersSectionProps {
  writers?: any[];
  themeSettings?: Record<string, any> | null;
  storeFormData?: any;
}

export default function StaffWritersSection({ writers, themeSettings }: StaffWritersSectionProps = {}) {
  const writerList = Array.isArray(writers) && writers.length > 0 ? writers : fallbackWriters;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <EditableElement
          targetId="home.writers.title"
          componentKey="StaffWritersSection"
          elementKey="title"
          label="Writers Section Title"
          defaultValue="Staff Writers"
        >
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Staff Writers</h2>
        </EditableElement>

        <EditableElement
          targetId="home.writers.ctaText"
          componentKey="StaffWritersSection"
          elementKey="ctaText"
          label="Writers Section CTA"
          defaultValue="View All →"
          inline
        >
          <a href="/writers" className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors">
            View All &rarr;
          </a>
        </EditableElement>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {writerList.slice(0, 4).map((writer: any, idx: number) => {
          const imgUrl = writer.img || writer.imageUrl || writer.avatar || fallbackWriters[idx % fallbackWriters.length].img;
          const name = writer.name || fallbackWriters[idx % fallbackWriters.length].name;
          const role = writer.role || fallbackWriters[idx % fallbackWriters.length].role;

          return (
            <motion.div
              key={idx}
              className="text-center p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <EditableElement
                targetId={\`home.writers.writers.\${idx}.imageUrl\`}
                componentKey="StaffWritersSection"
                elementKey={\`writers.\${idx}.imageUrl\`}
                label={\`Writer \${idx + 1} Image\`}
                fieldType="image"
                defaultValue={imgUrl}
              >
                <img src={imgUrl} alt={name} className="mx-auto h-32 w-32 rounded-full object-cover shadow-sm ring-2 ring-zinc-100 dark:ring-zinc-800" />
              </EditableElement>

              <EditableElement
                targetId={\`home.writers.writers.\${idx}.name\`}
                componentKey="StaffWritersSection"
                elementKey={\`writers.\${idx}.name\`}
                label={\`Writer \${idx + 1} Name\`}
                defaultValue={name}
              >
                <h4 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-100 text-base">{name}</h4>
              </EditableElement>

              <EditableElement
                targetId={\`home.writers.writers.\${idx}.role\`}
                componentKey="StaffWritersSection"
                elementKey={\`writers.\${idx}.role\`}
                label={\`Writer \${idx + 1} Role\`}
                defaultValue={role}
                inline
              >
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{role}</p>
              </EditableElement>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
`;

for (const theme of targetThemes) {
  const p = path.join(layoutsDir, theme, 'body', 'components', 'StaffWritersSection', 'index.tsx');
  fs.writeFileSync(p, newContent, 'utf8');
  console.log('Upgraded:', theme);
}
console.log('Done upgrading', targetThemes.length, 'themes for StaffWritersSection');
