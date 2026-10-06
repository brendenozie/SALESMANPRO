'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { TrophyIcon, StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

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
    transition: { type: "spring", damping: 15, stiffness: 100 } 
  },
};

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  const defaultAwards = [
    { name: 'Top Pet Retailer 2026', subtitle: 'Global Excellence' },
    { name: 'Eco-Friendly Choice', subtitle: 'Sustainable Sourcing' },
    { name: 'Elite Care Certified', subtitle: 'Verified Safety' },
    { name: 'Pet’s Choice Award', subtitle: 'Voted by 10k+ Owners' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-28 bg-[#FAFAFA] overflow-hidden">
      {/* Soft Organic Decorative Backgrounds */}
      <div 
        className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10"
        style={{ backgroundColor: primary }}
      />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header: Centered & Sophisticated */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <StarIcon className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
              Verified Excellence
            </span>
            <StarIcon className="w-5 h-5 text-amber-400" />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
            Trusted by the <br /> 
            <span className="font-serif italic font-light text-slate-400 underline decoration-slate-200 underline-offset-8">Best in Industry.</span>
          </h2>
          <p className="text-slate-500 font-medium">
            Our commitment to pet safety and quality has earned us recognition from leading global organizations.
          </p>
        </div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className="group relative bg-white rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 border border-slate-50"
            >
              {/* Award Icon Container */}
              <div className="relative mb-8">
                <div 
                  className="absolute inset-0 blur-2xl scale-150 opacity-0 group-hover:opacity-20 transition-opacity rounded-full"
                  style={{ backgroundColor: primary }}
                />
                <div className="relative w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors duration-500 overflow-hidden">
                  {award.imageUrl ? (
                    <Image decoding="async"
                      src={award.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000'}
                      alt={award.name}
                      fill
                      className="object-contain p-4 group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <TrophyIcon className="w-10 h-10 text-slate-300 group-hover:text-amber-500 transition-colors duration-500" />
                  )}
                </div>
                
                {/* Micro-Badge */}
                <div className="absolute -bottom-1 -right-1">
                  <CheckBadgeIcon className="w-8 h-8 text-white p-1.5 rounded-full shadow-lg" style={{ backgroundColor: primary }} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                  {award.name}
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {award.subtitle || 'Industry Verified'}
                </p>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrophyIcon className="w-12 h-12 text-slate-900" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Confidence Footer */}
        <div className="mt-20 py-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Official Certification Partners:
          </p>
          <div className="flex flex-wrap justify-center gap-12 items-center">
            {/* These would be small, subtle partner logos */}
            <span className="font-serif italic font-bold text-xl text-slate-300">VetApprove</span>
            <span className="font-serif italic font-bold text-xl text-slate-300">PetGuard</span>
            <span className="font-serif italic font-bold text-xl text-slate-300">SafeSource</span>
            <span className="font-serif italic font-bold text-xl text-slate-300">GlobalPet</span>
          </div>
        </div>
      </div>
    </section>
  );
}