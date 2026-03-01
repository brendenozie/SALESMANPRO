'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { TrophyIcon } from '@heroicons/react/24/outline';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.2 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=85`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#18181b';

  const defaultAwards = [
    { iconUrl: 'https://images.unsplash.com/photo-1542838686-37a5027588b3', name: 'Vogue Excellence 2026' },
    { iconUrl: 'https://images.unsplash.com/photo-1629910419355-6b2257321598', name: 'Sustainable Label' },
    { iconUrl: 'https://images.unsplash.com/photo-1579201529431-a4773221b033', name: 'Design of the Year' },
    { iconUrl: 'https://images.unsplash.com/photo-1563729571343-98282367c00e', name: 'Artisan Craftsmanship' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-32 bg-white dark:bg-zinc-950 overflow-hidden border-y border-gray-100 dark:border-zinc-900">
      {/* Decorative Brand Watermark */}
      <div className="absolute top-0 right-0 p-10 opacity-[0.03] select-none pointer-events-none hidden lg:block">
        <span className="text-[15rem] font-serif italic leading-none">Prestige</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400 mb-4 block"
          >
            A Legacy of Style
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white tracking-tight leading-tight"
          >
            Recognized for <span className="font-serif italic">Craftsmanship.</span>
          </motion.h2>
        </div>
        
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-zinc-800"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl ?? '';
            const label = award?.name;

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group relative bg-white dark:bg-zinc-950 p-12 flex flex-col items-center justify-center min-h-[280px] transition-colors duration-500 hover:bg-gray-50/50 dark:hover:bg-zinc-900/50"
              >
                {/* Logo Area */}
                <div className="relative w-24 h-24 mb-10 transition-transform duration-700 group-hover:scale-105">
                  {src ? (
                    <Image
                      src={src}
                      alt={label}
                      loader={loader}
                      fill
                      className="object-contain grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <TrophyIcon className="w-full h-full text-gray-200 dark:text-zinc-800" />
                  )}
                </div>
                
                {/* Label Area */}
                <div className="text-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white transition-colors duration-300">
                    {label}
                  </h3>
                  <div 
                    className="mt-4 h-[1px] w-0 group-hover:w-full bg-current mx-auto transition-all duration-500 opacity-20"
                    style={{ color: primaryColor }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Brand Statement Footer */}
        <div className="mt-20 flex flex-col items-center">
          <div className="h-16 w-px bg-gray-200 dark:bg-zinc-800 mb-8" />
          <p className="text-sm text-gray-400 dark:text-zinc-500 font-serif italic text-center max-w-lg leading-relaxed">
            "Fashion is not just about labels. It’s about the soul of the creator and the excellence of the finish."
          </p>
        </div>
      </div>
    </section>
  );
}