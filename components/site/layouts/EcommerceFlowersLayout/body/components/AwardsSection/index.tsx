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
    transition: { duration: 0.8, ease: "easeOut" } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=75`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  const defaultAwards = [
    { iconUrl: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e', name: 'Artisan Floral Guild 2026' },
    { iconUrl: 'https://images.unsplash.com/photo-1544650030-3c698e1f33c9', name: 'Sustainable Growth Award' },
    { iconUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946', name: 'Creative Excellence' },
    { iconUrl: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5', name: 'Boutique of the Year' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-32 bg-[#FAF9F6] overflow-hidden border-t border-slate-100">
      {/* Subtle Texture/Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span className="w-12 h-px bg-slate-200" />
            <span className="font-bold text-[10px] tracking-[0.5em] text-slate-400 uppercase">
              Established Excellence
            </span>
            <span className="w-12 h-px bg-slate-200" />
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-serif italic text-slate-900 leading-tight">
            Our Commitment to <br />
            <span className="text-slate-400">Floral Artistry</span>
          </h2>
        </div>
        
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8"
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
                className="group flex flex-col items-center"
              >
                {/* Award Badge Container */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8 transition-transform duration-700 group-hover:scale-105">
                  <div className="absolute inset-0 border border-slate-200 rounded-full group-hover:border-slate-900 transition-colors duration-500" />
                  
                  <div className="absolute inset-2 overflow-hidden rounded-full bg-white flex items-center justify-center">
                    {src ? (
                      <Image decoding="async"
                        src={src}
                        alt={label}
                        fill
                        className="object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                      />
                    ) : (
                      <StarIcon className="w-8 h-8 text-slate-200 group-hover:text-amber-500 transition-colors" />
                    )}
                  </div>
                </div>
                
                <div className="text-center max-w-[150px]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 transition-colors duration-300">
                    {label}
                  </h3>
                  <div className="mt-2 w-0 group-hover:w-full h-px bg-slate-900 mx-auto transition-all duration-500 opacity-20" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Ticker/Status Line */}
        <div className="mt-24 flex items-center justify-center gap-8 text-slate-300">
           <p className="text-[11px] uppercase tracking-[0.3em] flex items-center gap-2">
             <span className="h-1 w-1 rounded-full bg-slate-200" /> Fully Certified
           </p>
           <p className="text-[11px] uppercase tracking-[0.3em] flex items-center gap-2">
             <span className="h-1 w-1 rounded-full bg-slate-200" /> Award Winning Design
           </p>
        </div>
      </div>
    </section>
  );
}