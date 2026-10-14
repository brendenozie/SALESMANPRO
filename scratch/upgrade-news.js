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
import { CalendarIcon } from "@heroicons/react/24/solid";
import { EditableElement } from "@/components/site/EditableElement";

const fallbackNews = [
  {
    title: "Global leaders unite to address industry standards and sustainable future initiatives",
    date: "April 21, 2024",
    img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Cybersecurity experts spotlight emerging cloud defense and architecture paradigms",
    date: "April 20, 2024",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Strategic expansion delivers record milestones and community-first benchmarks",
    date: "April 19, 2024",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Breakthrough material innovations set to transform next-generation manufacturing",
    date: "April 18, 2024",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop"
  },
];

export interface LatestNewsSectionProps {
  news?: any[];
  themeSettings?: Record<string, any> | null;
  storeFormData?: any;
}

export default function LatestNewsSection({ news, themeSettings }: LatestNewsSectionProps = {}) {
  const newsItems = Array.isArray(news) && news.length > 0 ? news : fallbackNews;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Latest News Header */}
      <EditableElement
        targetId="home.news.title"
        componentKey="LatestNewsSection"
        elementKey="title"
        label="News Section Title"
        defaultValue="Latest News"
      >
        <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-100">Latest News</h2>
      </EditableElement>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.slice(0, 3).map((item: any, idx: number) => {
          const imgUrl = item.img || item.imageUrl || item.coverImage || fallbackNews[idx % fallbackNews.length].img;
          const title = item.title || fallbackNews[idx % fallbackNews.length].title;
          const date = item.date || fallbackNews[idx % fallbackNews.length].date;

          return (
            <motion.article
              key={idx}
              className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-md border border-zinc-100 dark:border-zinc-800 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <EditableElement
                targetId={\`home.news.articles.\${idx}.imageUrl\`}
                componentKey="LatestNewsSection"
                elementKey={\`articles.\${idx}.imageUrl\`}
                label={\`Article \${idx + 1} Image\`}
                fieldType="image"
                defaultValue={imgUrl}
              >
                <img src={imgUrl} alt={title} className="w-full h-40 object-cover" />
              </EditableElement>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <EditableElement
                  targetId={\`home.news.articles.\${idx}.title\`}
                  componentKey="LatestNewsSection"
                  elementKey={\`articles.\${idx}.title\`}
                  label={\`Article \${idx + 1} Title\`}
                  defaultValue={title}
                >
                  <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100 leading-snug">{title}</h3>
                </EditableElement>

                <EditableElement
                  targetId={\`home.news.articles.\${idx}.date\`}
                  componentKey="LatestNewsSection"
                  elementKey={\`articles.\${idx}.date\`}
                  label={\`Article \${idx + 1} Date\`}
                  defaultValue={date}
                  inline
                >
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm flex items-center mt-2">
                    <CalendarIcon className="h-4 w-4 mr-1 text-zinc-400" /> {date}
                  </p>
                </EditableElement>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
`;

for (const theme of targetThemes) {
  const p = path.join(layoutsDir, theme, 'body', 'components', 'LatestNewsSection', 'index.tsx');
  fs.writeFileSync(p, newContent, 'utf8');
  console.log('Upgraded:', theme);
}
console.log('Done upgrading', targetThemes.length, 'themes for LatestNewsSection');
