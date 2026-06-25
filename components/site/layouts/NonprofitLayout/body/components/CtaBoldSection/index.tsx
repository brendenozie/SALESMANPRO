"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

export default function CtaBoldSection({storeFormData}: {storeFormData: any}) {
  // const { storeFormData } = useStoreContext();

  // Dynamic branding
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';
  
  // Content mapping
  const ctaTitle = 'Ready to Make a Lasting Impact?';
  const ctaSubtitle = 'Your support helps us build a future filled with hope and opportunities for children and communities worldwide.';
  const ctaButtonLabel = 'Join Us Today';
  const ctaButtonHref = `/${storeFormData?.slug || 'non-profit'}/join`;

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* The 'Content Canvas' Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl p-12 md:p-20 bg-slate-900 overflow-hidden shadow-2xl"
        >
          {/* Subtle Accent Glow */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 opacity-10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" 
            style={{ backgroundColor: primaryColor }}
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6 max-w-2xl">
              {ctaTitle}
            </h2>
            
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              {ctaSubtitle}
            </p>

            <Link
              href={ctaButtonHref}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: primaryColor, color: '#fff' }}
            >
              <span>{ctaButtonLabel}</span>
              <ArrowRightIcon 
                className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                strokeWidth={3} 
              />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}