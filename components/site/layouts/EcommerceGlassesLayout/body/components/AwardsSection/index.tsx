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
    transition: { staggerChildren: 0.1 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=75`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const accent = '#F3A852'; // Peanut / Gold accent

  const defaultAwards = [
    { name: 'Excellence in Craftsmanship', organization: 'Artisans Guild 2026' },
    { name: 'Sustainable Design Award', organization: 'Green Optics Forum' },
    { name: 'Customer Choice: Luxury', organization: 'Retailer Monthly' },
    { name: 'Innovation in Lens Tech', organization: 'Global Tech Expo' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-32 bg-[#F9F6F2] overflow-hidden">
      {/* Subtle Background Texture/Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <span className="text-[30vw] font-serif italic text-black leading-none">AWARDS</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header: Editorial Style */}
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="h-px w-8 bg-[#F3A852]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#F3A852]">
              Global Recognition
            </span>
            <span className="h-px w-8 bg-[#F3A852]" />
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-serif text-gray-900 leading-none">
            Our <span className="italic font-light text-gray-400">Distinctions</span>
          </h2>
        </div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl ?? '';
            const label = award?.name;
            const org = award?.organization || "International Recognition";

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group relative bg-white p-10 flex flex-col items-center justify-between min-h-[320px] shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-700 rounded-2xl border border-transparent hover:border-[#F3A852]/10"
              >
                {/* Decorative corner accent */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#F3A852]" />
                </div>

                {/* Award Icon/Logo */}
                <div className="relative w-24 h-24 mb-8">
                  {src ? (
                    <Image decoding="async"
                      src={src}
                      alt={label}
                      fill
                      className="object-contain filter grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FDF8F4] rounded-full">
                        <TrophyIcon className="w-10 h-10 text-[#F3A852]/60 group-hover:text-[#F3A852] transition-colors" />
                    </div>
                  )}
                </div>
                
                <div className="text-center space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest leading-tight px-2">
                    {label}
                  </h3>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                    {org}
                  </p>
                </div>

                {/* Subtle bottom detail */}
                <div className="mt-8 w-6 h-[1px] bg-gray-200 group-hover:w-16 group-hover:bg-[#F3A852] transition-all duration-500" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Verification Text */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-20 flex flex-col items-center gap-4"
        >
           <p className="font-serif italic text-gray-400 text-sm">
             Celebrating a decade of visionary craftsmanship.
           </p>
           <div className="h-12 w-px bg-gradient-to-b from-gray-200 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}