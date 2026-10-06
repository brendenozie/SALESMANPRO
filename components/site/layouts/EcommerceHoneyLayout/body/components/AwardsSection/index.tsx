'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { StarIcon } from '@heroicons/react/24/solid';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.2 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0, 
    transition: { duration: 0.8, ease: [0.21, 1.02, 0.73, 1] } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=75`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  
  // Honey-themed fallback data
  const defaultAwards = [
    { iconUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5', name: 'Superior Taste Award' },
    { iconUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d', name: 'Sustainable Apiary 2026' },
    { iconUrl: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c', name: 'Purity Gold Standard' },
    { iconUrl: 'https://images.unsplash.com/photo-1505933330825-a19309916b56', name: 'Artisan Beekeeper of the Year' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-32 bg-[#FAF9F6] overflow-hidden">
      {/* Soft Ambient Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/40 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-stone-200/30 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section: Sophisticated & Minimal */}
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <span className="text-[#B8860B] font-black text-[10px] uppercase tracking-[0.6em] mb-6">
              The Hall of Excellence
            </span>
            <h2 className="text-4xl md:text-6xl font-serif italic text-[#3E2723] mb-8">
              A Legacy of <span className="text-[#F3A852]">Purity</span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-stone-200" />
              <StarIcon className="w-3 h-3 text-amber-400" />
              <div className="w-12 h-px bg-stone-200" />
            </div>
          </motion.div>
        </div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12"
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
                {/* Award Portrait Frame */}
                <div className="relative mb-8 w-full aspect-[4/5] overflow-hidden rounded-full border border-stone-100 bg-white p-2 transition-all duration-700 hover:shadow-2xl hover:shadow-amber-900/5">
                  <div className="relative h-full w-full rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                    {src ? (
                      <Image decoding="async"
                        src={src}
                        alt={label}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-stone-50">
                        <StarIcon className="w-12 h-12 text-stone-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-amber-900/10 group-hover:opacity-0 transition-opacity duration-500" />
                  </div>
                  
                  {/* Floating Gold Year Tag */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#3E2723] text-white text-[9px] font-black px-4 py-1.5 rounded-full tracking-tighter">
                    EST. 2026
                  </div>
                </div>

                <div className="text-center px-4">
                  <h3 className="text-sm font-bold text-[#3E2723] uppercase tracking-widest leading-relaxed mb-2">
                    {label}
                  </h3>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">
                    Global Recognition
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Decorative Signature */}
        <div className="mt-24 text-center">
            <span className="font-serif italic text-2xl text-stone-300 pointer-events-none select-none">
                Quality Certified by Nature
            </span>
        </div>
      </div>
    </section>
  );
}