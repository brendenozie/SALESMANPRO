'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStore } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/outline';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

const imageLoader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=80`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const store = useStore();
  const primaryColor = store?.storeFormData?.themeSettings?.primaryColor || '#000000';

  const defaultAwards = [
    { iconUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519', name: 'Design Excellence 2026' },
    { iconUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a', name: 'Performance Choice' },
    { iconUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', name: 'Sustainable Innovation' },
    { iconUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2', name: 'Global Footwear Award' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-24 bg-white dark:bg-zinc-950 overflow-hidden border-t border-gray-100 dark:border-zinc-900">
      {/* Background Polish */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50/50 dark:bg-zinc-900/20 -skew-x-12 translate-x-32 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-20 gap-4">
          <div className="max-w-xl">
            <motion.div 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-4"
            >
              <span className="h-px w-10 bg-current" style={{ color: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                Industry_Standard
              </span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter uppercase italic">
              Legacy of <br />
              <span className="text-transparent stroke-text" style={{ WebkitTextStroke: `1px ${primaryColor}` }}>
                Performance.
              </span>
            </h2>
          </div>
          <div className="hidden md:block text-right">
             <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">Est. 2026 / Global</p>
          </div>
        </div>
        
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800"
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
                className="group relative bg-white dark:bg-zinc-950 p-10 flex flex-col items-center text-center transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
              >
                {/* Award Visual */}
                <div className="relative w-24 h-24 mb-8">
                    {src ? (
                      <div className="relative w-full h-full filter grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100 scale-90 group-hover:scale-100">
                         <Image
                            src={src}
                            alt={label}
                            loader={imageLoader}
                            fill
                            className="object-contain"
                          />
                      </div>
                    ) : (
                      <TrophyIcon className="w-full h-full text-gray-200 group-hover:text-primary transition-colors" />
                    )}
                </div>

                <div className="space-y-2">
                    <StarIcon className="w-4 h-4 mx-auto opacity-0 group-hover:opacity-100 transition-opacity mb-2" style={{ color: primaryColor }} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {label}
                    </h3>
                    <p className="text-[9px] font-bold text-gray-300 dark:text-zinc-600 uppercase tracking-tighter">
                      Verified Excellence // Certified
                    </p>
                </div>

                {/* Corner Accent */}
                <div 
                    className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-r-[10px] border-transparent group-hover:border-r-current transition-all" 
                    style={{ color: primaryColor }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Brand Footer Line */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 py-8 border-t border-gray-100 dark:border-zinc-900">
            <div className="flex gap-12">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Quality Control</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white italic">PASSED</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Durability</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white italic">A+ RATING</span>
                </div>
            </div>
            
            <div className="h-10 w-px bg-gray-200 dark:bg-zinc-800 hidden md:block" />
            
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] max-w-sm text-center md:text-right">
                Our footwear is tested in high-stress environments to ensure every pair meets the elite standards of professional athletes worldwide.
            </p>
        </div>
      </div>

      <style jsx>{`
        .stroke-text {
          color: transparent;
        }
      `}</style>
    </section>
  );
}