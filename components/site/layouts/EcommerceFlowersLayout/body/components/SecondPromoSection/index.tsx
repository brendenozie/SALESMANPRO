'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  // Grab the second promotion (index 1) or provide editorial defaults
  const promotion = promotions?.[1] || {
    title: 'The Weekend Anthology',
    description:
      'A curated selection of our rarest blooms and artisanal vessels, gathered for those who appreciate the finer details of botanical living.',
    bannerUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=2000&auto=format&fit=crop',
    ctaText: 'Explore the Collection',
    ctaLink: '#',
  };

  return (
    <section className="relative py-32 bg-[#F6F5F2] overflow-hidden">
      {/* Subtle Text Texture Background */}
      <div className="absolute top-10 left-10 pointer-events-none opacity-[0.03] select-none">
        <h1 className="text-[15vw] font-serif italic leading-none">Boutique</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* --- Image Block (Left/Order-2 on mobile) --- */}
          <div className="w-full lg:w-1/2 relative order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-[2rem] overflow-hidden z-10 shadow-2xl"
            >
              <img
                src={promotion.bannerUrl || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=2000&auto=format&fit=crop'}
                alt={promotion.title || 'Promotion Banner'}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
              />
            </motion.div>

            {/* Decorative Floating Element */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-8 -right-8 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl z-20 hidden md:block border border-white/50"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-serif italic text-slate-900">40%</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Limited Selection</span>
              </div>
            </motion.div>

            {/* Background Accent Frame */}
            <div 
              className="absolute -top-10 -left-10 w-2/3 h-2/3 rounded-[3rem] opacity-20"
              style={{ backgroundColor: primary }}
            />
          </div>

          {/* --- Text Block --- */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 text-rose-500 mb-6">
                <SparklesIcon className="w-5 h-5" />
                <span className="text-[11px] font-bold uppercase tracking-[0.4em]">Curated Spotlight</span>
              </div>

              <h2 className="text-5xl md:text-7xl font-serif italic text-slate-900 leading-[1.1] mb-8">
                {promotion.title.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? 'text-slate-400' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </h2>

              <p className="text-slate-500 text-lg md:text-xl leading-relaxed mb-12 max-w-lg">
                {promotion.description}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                <a
                  href={promotion.ctaLink || '#'}
                  className="w-full sm:w-auto text-center bg-slate-900 text-white font-bold uppercase tracking-widest text-[12px] py-5 px-12 rounded-full hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  {promotion.ctaText}
                </a>
                
                <button className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-widest text-[11px] group">
                  View Lookbook 
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}