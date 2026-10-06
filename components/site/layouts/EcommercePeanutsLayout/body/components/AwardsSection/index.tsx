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
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=75`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const peanutGold = '#F3A852';
  const darkCocoa = '#3E2723';

  const defaultAwards = [
    { iconUrl: 'https://cdn-icons-png.flaticon.com/512/603/603332.png', name: 'Organic Certified 2026' },
    { iconUrl: 'https://cdn-icons-png.flaticon.com/512/2643/2643719.png', name: 'Premium Roast Master' },
    { iconUrl: 'https://cdn-icons-png.flaticon.com/512/3100/3100109.png', name: 'Pantry Choice Gold' },
    { iconUrl: 'https://cdn-icons-png.flaticon.com/512/10617/10617300.png', name: 'Eco-Friendly Farmed' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-24 bg-[#FAF7F2] overflow-hidden">
      {/* Soft Organic Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F3A852]/5 rounded-full blur-[100px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#8B4513]/5 rounded-full blur-[80px] -ml-48 -mb-48" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className="h-px w-8 bg-[#F3A852]" />
            <span className="font-black text-[10px] uppercase tracking-[0.4em] text-[#8B4513]">
              World_Class_Heritage
            </span>
            <span className="h-px w-8 bg-[#F3A852]" />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-black text-[#3E2723] tracking-tighter leading-tight mb-6">
            RECOGNIZED FOR <br />
            <span className="text-[#F3A852]">PURE EXCELLENCE</span>
          </h2>
          <p className="text-[#3E2723]/60 max-w-lg mx-auto font-medium text-sm">
            From sustainable farming to small-batch roasting, our commitment to quality is verified by the industry's highest standards.
          </p>
        </div>
        
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
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
                className="group relative bg-white rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all duration-500 hover:shadow-[0_20px_50px_rgba(62,39,35,0.08)] border border-stone-100"
              >
                {/* Stamp Circle decoration */}
                <div className="absolute inset-0 m-auto w-32 h-32 border border-[#F3A852]/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-700 ease-out" />
                
                {/* Main Content */}
                <div className="relative z-10">
                  <div className="relative w-16 h-16 mb-6 mx-auto">
                    {src ? (
                      <Image decoding="async"
                        src={src}
                        alt={label}
                        fill
                        className="object-contain transition-all duration-500 brightness-50 group-hover:brightness-100 group-hover:scale-110"
                      />
                    ) : (
                      <StarIcon className="w-full h-full text-[#F3A852]" />
                    )}
                  </div>
                  
                  <h3 className="text-xs font-black text-[#3E2723] uppercase tracking-[0.15em] leading-relaxed max-w-[120px] mx-auto">
                    {label}
                  </h3>
                </div>

                {/* Corner detail */}
                <div className="absolute top-6 right-6 text-[10px] font-black text-[#F3A852]/20 font-mono">
                  0{idx + 1}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Floating Quality Seal */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-10 -right-10 w-32 h-32 opacity-10 hidden xl:block"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-[#3E2723]">
            <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
            <text className="text-[10px] font-black uppercase tracking-[2px]">
              <textPath xlinkHref="#circlePath">The Best Roast in the City • Quality First •</textPath>
            </text>
          </svg>
        </motion.div>

        {/* Bottom Status Ticker */}
        <div className="mt-20 flex items-center justify-center gap-6">
           <span className="h-px flex-1 bg-stone-200 hidden sm:block" />
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#F3A852]" />
              <span className="font-black text-[9px] text-stone-400 uppercase tracking-[0.3em]">
                Authenticity Verified // Batch #2026-A
              </span>
              <div className="w-2 h-2 rounded-full bg-[#F3A852]" />
           </div>
           <span className="h-px flex-1 bg-stone-200 hidden sm:block" />
        </div>
      </div>
    </section>
  );
}