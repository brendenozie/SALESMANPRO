'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, SwatchIcon, TruckIcon } from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';
import { EditableElement } from '@/contexts/EditableContentContext';

export interface HeroSliderProps {
  coreValues?: ICoreValue[] | null;
  themeSettings?: any;
  config?: any;
  sectionId?: string;
}

const defaultCoreValues = [
  { 
    icon: TruckIcon, 
    title: "White Glove Delivery", 
    desc: "Seamless assembly and precise placement by our specialist team." 
  },
  { 
    icon: SwatchIcon, 
    title: "Sustainable Sourcing", 
    desc: "FSC certified timber and organic textiles designed for longevity." 
  },
  { 
    icon: StarIcon, 
    title: "Lifetime Structural", 
    desc: "A testament to quality: guaranteed integrity on every frame." 
  }
];

export default function USPSlider({ coreValues, themeSettings, config, sectionId }: HeroSliderProps) {
  const primary = themeSettings?.primaryColor || '#ef4444';
  const [scrolled, setScrolled] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const rawItems = (config?.items && Array.isArray(config.items))
    ? config.items
    : (config?.badges && Array.isArray(config.badges))
    ? config.badges
    : (coreValues && Array.isArray(coreValues) && coreValues.length > 0)
    ? coreValues
    : defaultCoreValues;

  const sId = sectionId || "usp";

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 transition-colors duration-500 border-y border-zinc-100 dark:border-zinc-900">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          {rawItems.map((feature: any, i: number) => {
            const fallbackDef = defaultCoreValues[i % defaultCoreValues.length];
            const IconComp = typeof feature.icon === 'function' ? feature.icon : fallbackDef.icon;
            const itemTitle = feature.title || feature.name || fallbackDef.title;
            const itemDesc = feature.desc || feature.description || feature.subtitle || fallbackDef.desc;

            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="flex flex-col items-center text-center group"
              >
                {/* --- Architectural Icon Container --- */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 ease-out" />
                  <div 
                    className="relative p-6 border border-zinc-100 dark:border-zinc-800 rounded-full transition-all duration-500 group-hover:border-transparent"
                    style={{ color: scrolled ? 'inherit' : primary }}
                  >
                    <IconComp 
                      className="w-10 h-10 stroke-[1]" 
                      style={{ color: primary }}
                    />
                  </div>
                  
                  {/* Accent Dot */}
                  <div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: primary }}
                  />
                </div>

                {/* --- Text Content --- */}
                <EditableElement
                  targetId={`furniture.home.${sId}.USPSlider.items-${i}.title`}
                  componentKey="USPSlider"
                  elementKey={`items.${i}.title`}
                  label={`Feature ${i + 1} Title`}
                  defaultValue={itemTitle}
                  type="text"
                >
                  {(val) => (
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-900 dark:text-white mb-4">
                      {val !== undefined && val !== null ? val : itemTitle}
                    </h4>
                  )}
                </EditableElement>

                <EditableElement
                  targetId={`furniture.home.${sId}.USPSlider.items-${i}.desc`}
                  componentKey="USPSlider"
                  elementKey={`items.${i}.desc`}
                  label={`Feature ${i + 1} Description`}
                  defaultValue={itemDesc}
                  type="textarea"
                >
                  {(val) => (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium max-w-[280px]">
                      {val !== undefined && val !== null ? val : itemDesc}
                    </p>
                  )}
                </EditableElement>

                {/* Structural Line */}
                <div className="mt-8 w-8 h-[1px] bg-zinc-100 dark:bg-zinc-900 group-hover:w-16 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-all duration-700" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}