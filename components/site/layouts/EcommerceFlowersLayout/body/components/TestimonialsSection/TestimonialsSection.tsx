'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';

const sampletestimonials = [
  {
    authorName: 'Eleanor Vance',
    quote: 'The arrangement arrived with such poise and freshness. It transformed my morning light into something truly cinematic.',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
  },
  {
    authorName: 'Julian Thorne',
    quote: 'Rarely do you find a boutique that treats floral design with the same reverence as fine art. Simply unparalleled.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
  },
  {
    authorName: 'Miriam Hayes',
    quote: 'Fast delivery, yes—but more importantly, the stems were hand-wrapped with a level of care I haven’t seen in years.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampletestimonials }: TestimonialsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  const items = testimonials?.length ? testimonials : sampletestimonials;

  return (
    <section className="py-32 bg-[#FAF9F6] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header: Centered & Poetic */}
        <div className="text-center mb-24 space-y-4">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-rose-400 text-[10px] font-black uppercase tracking-[0.5em]"
          >
            Client Chronicles
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-serif italic text-slate-900">
            Kind Words <span className="text-slate-400">from our</span> Patrons
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {items.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Decorative Large Quote Mark */}
              <span className="absolute -top-10 -left-4 text-8xl font-serif italic text-slate-100 select-none group-hover:text-rose-50 transition-colors duration-500">
                &ldquo;
              </span>

              <div className="relative z-10 flex flex-col items-center">
                {/* Profile Image with Organic Mask */}
                <div className="relative w-20 h-20 mb-8">
                  <div 
                    className="absolute inset-0 rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-1000 opacity-20"
                    style={{ backgroundColor: primary }}
                  />
                  <img
                    src={t.avatarUrl || `https://ui-avatars.com/api/?name=${t.authorName}&background=random`}
                    alt={t.authorName || 'User'}
                    className="relative z-10 w-full h-full object-cover rounded-full p-1 bg-white shadow-xl"
                  />
                </div>

                {/* Content */}
                <div className="text-center space-y-4">
                  <p className="text-slate-600 font-serif italic text-lg leading-relaxed px-4">
                    {t.quote}
                  </p>
                  
                  <div className="flex flex-col items-center">
                    <span className="h-px w-8 bg-slate-200 mb-4 group-hover:w-12 transition-all duration-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">
                      {t.authorName}
                    </h3>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">
                      Verified Collector
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}