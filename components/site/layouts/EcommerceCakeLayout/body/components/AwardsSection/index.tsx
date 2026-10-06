'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
// Using Hero Icons as per saved preferences
import { 
  TrophyIcon, 
  AcademicCapIcon, 
  SparklesIcon, 
  StarIcon 
} from '@heroicons/react/24/outline';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.2 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=75`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#D97706';

  const defaultAwards = [
    { name: 'Artisan of the Year 2026', icon: <TrophyIcon className="w-10 h-10" /> },
    { name: '5-Star Pastry Excellence', icon: <StarIcon className="w-10 h-10" /> },
    { name: 'Pastry Masterclass Certified', icon: <AcademicCapIcon className="w-10 h-10" /> },
    { name: 'Eco-Friendly Bakery Award', icon: <SparklesIcon className="w-10 h-10" /> },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-32 bg-[#FAF9F6] overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-amber-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-rose-100/30 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Boutique Header */}
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="h-px w-12 bg-amber-200" />
            <span className="text-xs font-black uppercase tracking-[0.4em] text-amber-600/60">
              Our Accolades
            </span>
            <div className="h-px w-12 bg-amber-200" />
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6">
            A TRADITION OF <br/>
            <span className="italic font-serif font-light text-amber-700">Sweet Success</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-lg mx-auto italic">
            Recognized by world-class pâtissiers for our commitment to artisan quality and flavor innovation.
          </p>
        </div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl ?? '';
            const label = award?.name;

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -12 }}
                className="group relative bg-white border border-amber-100 p-10 flex flex-col items-center text-center rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                {/* Award Icon/Image Slot */}
                <div className="relative z-10 w-24 h-24 mb-8 flex items-center justify-center">
                  {/* Glowing background behind icon */}
                  <div className="absolute inset-0 bg-amber-50 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500" />
                  
                  <div className="relative z-20">
                    {src ? (
                      <div className="relative w-20 h-20">
                        <Image decoding="async"
                          src={src}
                          alt={label}
                          fill
                          className="object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div style={{ color: primaryColor }} className="opacity-80 group-hover:opacity-100 transition-opacity">
                         {award.icon}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-tight mb-2">
                    {label}
                  </h3>
                  <div className="w-8 h-[2px] bg-amber-200 mx-auto group-hover:w-16 transition-all duration-500" />
                </div>

                {/* Corner Decorative Elements */}
                <div className="absolute top-6 left-6 w-2 h-2 border-t-2 border-l-2 border-amber-200 opacity-0 group-hover:opacity-100 transition-all" />
                <div className="absolute bottom-6 right-6 w-2 h-2 border-b-2 border-r-2 border-amber-200 opacity-0 group-hover:opacity-100 transition-all" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer Stamp */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 flex flex-col items-center"
        >
          <div className="px-6 py-2 rounded-full border border-slate-200 bg-white shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Verified Artisan Quality 2026
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}