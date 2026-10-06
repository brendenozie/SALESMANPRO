'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { StarIcon } from '@heroicons/react/24/outline';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.21, 1.02, 0.73, 1] } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=75`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings?.primaryColor || '#18181b';

  // Furniture & Design themed fallback data
  const defaultAwards = [
    { iconUrl: 'https://images.unsplash.com/photo-1634088637126-fb423d61a0ce', name: 'AD100 Recognition' },
    { iconUrl: 'https://images.unsplash.com/photo-1616489953149-847d0669680c', name: 'European Design Masters' },
    { iconUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca', name: 'Sustainability Merit 2026' },
    { iconUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7eaa511', name: 'Architizer A+ Award' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-32 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Structural Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-zinc-50 dark:bg-zinc-900/30 -z-10 translate-x-1/4 skew-x-12" />

      <div className="max-w-[1700px] mx-auto px-6 relative z-10">
        {/* Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-10">
          <div className="max-w-3xl space-y-6">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block"
            >
              // Established Excellence
            </motion.span>
            <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-zinc-900 dark:text-white uppercase leading-[0.85]">
              Industry <br />
              <span className="font-serif italic lowercase text-zinc-400 ml-12">Accolades</span>
            </h2>
          </div>
          <div className="lg:max-w-xs border-l border-zinc-200 dark:border-zinc-800 pl-8">
            <p className="text-zinc-500 text-xs font-medium leading-relaxed uppercase tracking-wider">
              Our commitment to architectural precision and sustainable luxury has been recognized by the world's most prestigious design councils.
            </p>
          </div>
        </div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl ?? '';
            const label = award?.name;

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group relative aspect-square border-zinc-100 dark:border-zinc-900 border-[0.5px] p-12 flex flex-col items-center justify-center transition-colors duration-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              >
                {/* Index Number */}
                <span className="absolute top-6 left-6 text-[10px] font-mono text-zinc-300 dark:text-zinc-700">
                  REF_0{idx + 1}
                </span>

                {/* Award Visual */}
                <div className="relative w-full aspect-square mb-8">
                  {src ? (
                    <Image decoding="async"
                      src={src}
                      alt={label}
                      fill
                      className="object-contain grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                       <StarIcon className="w-12 h-12 text-zinc-200 dark:text-zinc-800 group-hover:text-zinc-400 transition-colors" />
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <div className="text-center overflow-hidden">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-500">
                    {label}
                  </h3>
                </div>

                {/* Vertical Border Decoration */}
                <div className="absolute right-0 top-1/4 h-1/2 w-px bg-zinc-100 dark:bg-zinc-900" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer Signature */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-10 gap-6">
           <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              ))}
           </div>
           <p className="font-serif italic text-zinc-400 text-sm">
             A legacy of form, function, and international merit.
           </p>
           <div className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
             Verified Archive 2026
           </div>
        </div>
      </div>
    </section>
  );
}