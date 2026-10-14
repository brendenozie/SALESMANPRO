const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components', 'site', 'layouts');

const targetThemes = [
  'BlogLayout', 'DirectoryLayout', 'EcommerceAccessoriesLayout', 'EcommerceAgrovetLayout',
  'EcommerceBabyLayout', 'EcommerceBikeLayout', 'EcommerceBookLayout',
  'EcommerceCakeLayout', 'EcommerceEarphonesLayout', 'EcommerceFlowersLayout',
  'EcommerceGamingLayout', 'EcommerceGlassesLayout', 'EcommerceGroceriesLayout',
  'EcommerceHardwareLayout', 'EcommerceHoneyLayout', 'EcommerceLayout',
  'EcommerceMeatLayout', 'EcommerceMotorCycleLayout', 'EcommercePeanutsLayout',
  'EcommercePetsLayout', 'EcommerceWatchLayout', 'FashionLayout', 'FurnitureLayout'
];

const newContent = `"use client";

import React from "react";
import { EditableElement } from "@/components/site/EditableElement";

const fallbackFeatures = [
  {
    title: "Signature Experience for Ultimate Relaxation",
    description: "Experience curated treatments that relieve tension, soothe the senses, and restore balance.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
    button: true,
  },
  {
    title: "Targeted Therapy for Physical Recovery",
    description: "Specialized focus techniques designed to alleviate stress, reduce stiffness, and boost vitality.",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Thermal Comfort & Deep Well-Being",
    description: "Heated elements and targeted pressure points strategically placed to revitalize natural circulation.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Botanical Aromatherapy Essentials",
    description: "Pure organic botanical infusions combined with restorative sensory rituals for lasting calm.",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop",
  },
];

export interface MessagesSectionProps {
  features?: any[];
  themeSettings?: Record<string, any> | null;
  storeFormData?: any;
}

export default function MassageFeatures({ features: propFeatures }: MessagesSectionProps = {}) {
  const features = Array.isArray(propFeatures) && propFeatures.length > 0 ? propFeatures : fallbackFeatures;

  return (
    <section className="bg-[#f8f1eb] dark:bg-zinc-950 py-16 px-6 lg:px-20 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="mb-12 max-w-3xl mx-auto text-center">
          <EditableElement
            targetId="home.messages.badge"
            componentKey="MessagesSection"
            elementKey="badge"
            label="Messages Section Badge"
            defaultValue="Services & Solutions"
            inline
          >
            <span className="inline-block bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide border border-green-200 dark:border-green-800">
              Services & Solutions
            </span>
          </EditableElement>

          <EditableElement
            targetId="home.messages.title"
            componentKey="MessagesSection"
            elementKey="title"
            label="Messages Section Title"
            defaultValue="Explore Our Innovative Client Features"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Explore Our Innovative Client Features
            </h2>
          </EditableElement>

          <EditableElement
            targetId="home.messages.description"
            componentKey="MessagesSection"
            elementKey="description"
            label="Messages Section Description"
            defaultValue="Our platform simplifies the workflow experience with seamless scheduling, easy management, and personalized service delivery."
          >
            <p className="mt-4 text-gray-700 dark:text-gray-300 text-lg">
              Our platform simplifies the workflow experience with seamless scheduling, easy management, and personalized service delivery.
            </p>
          </EditableElement>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.slice(0, 4).map((feat: any, i: number) => {
            const title = feat.title || fallbackFeatures[i % fallbackFeatures.length].title;
            const description = feat.description || fallbackFeatures[i % fallbackFeatures.length].description;
            const image = feat.image || feat.imageUrl || fallbackFeatures[i % fallbackFeatures.length].image;
            const button = feat.button ?? (i === 0);

            return (
              <div
                key={i}
                className="relative flex flex-col rounded-3xl bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-zinc-200/80 dark:border-zinc-800"
                style={{ minHeight: "420px" }}
              >
                <div className="relative h-64 w-full overflow-hidden rounded-t-3xl">
                  <EditableElement
                    targetId={\`home.messages.features.\${i}.imageUrl\`}
                    componentKey="MessagesSection"
                    elementKey={\`features.\${i}.imageUrl\`}
                    label={\`Feature \${i + 1} Image\`}
                    fieldType="image"
                    defaultValue={image}
                  >
                    <img
                      src={image}
                      alt={title}
                      className="object-cover w-full h-full transform transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </EditableElement>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <EditableElement
                    targetId={\`home.messages.features.\${i}.title\`}
                    componentKey="MessagesSection"
                    elementKey={\`features.\${i}.title\`}
                    label={\`Feature \${i + 1} Title\`}
                    defaultValue={title}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
                  </EditableElement>

                  <EditableElement
                    targetId={\`home.messages.features.\${i}.description\`}
                    componentKey="MessagesSection"
                    elementKey={\`features.\${i}.description\`}
                    label={\`Feature \${i + 1} Description\`}
                    defaultValue={description}
                  >
                    <p className="text-gray-700 dark:text-gray-300 flex-grow text-sm leading-relaxed">{description}</p>
                  </EditableElement>

                  {button && (
                    <EditableElement
                      targetId={\`home.messages.features.\${i}.ctaText\`}
                      componentKey="MessagesSection"
                      elementKey={\`features.\${i}.ctaText\`}
                      label={\`Feature \${i + 1} CTA\`}
                      defaultValue="Explore More →"
                      inline
                    >
                      <button
                        type="button"
                        className="mt-6 inline-block self-start bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-full shadow-md transition-colors duration-300 text-sm"
                      >
                        Explore More &rarr;
                      </button>
                    </EditableElement>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
`;

for (const theme of targetThemes) {
  const p = path.join(layoutsDir, theme, 'body', 'components', 'MessagesSection', 'index.tsx');
  fs.writeFileSync(p, newContent, 'utf8');
  console.log('Upgraded:', theme);
}
console.log('Done upgrading', targetThemes.length, 'themes for MessagesSection');
