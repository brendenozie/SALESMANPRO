'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Testimonial } from '@/types/typings';
import { ChatBubbleBottomCenterIcon, StarIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

const sampleTestimonials = [
  {
    authorName: 'Johnathon D.',
    quote: 'The organic kibble has been a game changer for my Husky. His energy levels are up and his coat has never looked shinier. Truly premium quality!',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200',
  },
  {
    authorName: 'Alina K.',
    quote: 'I am so happy with the ultra-soft pet bed. My cat took to it immediately! The delivery was lightning fast and the packaging was adorable.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
  },
  {
    authorName: 'Mikey R.',
    quote: 'Fantastic support! I had questions about toy safety and the team provided expert advice 24/7. My pup loves his new indestructible chew toys.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampleTestimonials }: TestimonialsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  const dataToUse = testimonials && testimonials.length > 0 ? testimonials : sampleTestimonials;

  return (
    <section className="relative py-28 bg-[#FAFAFA] dark:bg-zinc-950 overflow-hidden">
      {/* Decorative Warm Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-amber-50/40 dark:from-amber-900/10 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 mb-6"
          >
            <ChatBubbleBottomCenterIcon className="w-4 h-4" style={{ color: primary }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
              Community Love
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-6">
            Trusted by <span className="text-slate-400">Thousands</span> <br /> of Pet Parents.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {dataToUse.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className={`relative bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-zinc-800 transition-all duration-500
                ${idx === 1 ? 'md:mt-12' : ''}`} // Staggered height effect
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-amber-400" />
                ))}
              </div>

              {/* Quote Body */}
              <p className="text-lg font-medium text-slate-700 dark:text-zinc-300 leading-relaxed mb-8 italic">
                "{t.quote}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-50 dark:border-zinc-800">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-zinc-700 shadow-md">
                  <img
                    src={t.avatarUrl || `https://ui-avatars.com/api/?name=${t.authorName}&background=random`}
                    alt={t.authorName || 'Customer Avatar'  }
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {t.authorName}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Verified Buyer
                  </span>
                </div>
              </div>

              {/* Decorative Large Quote Mark */}
              <div 
                className="absolute top-8 right-8 text-[80px] font-serif leading-none opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none"
                style={{ color: primary }}
              >
                ”
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}