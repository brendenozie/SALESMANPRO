'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const sampletestimonials = [
  {
    authorName: 'Johnathon',
    quote: 'The products exceeded my expectations! The quality is incredible and the style is unmatched. I will definitely be a returning customer.',
    avatarUrl: 'https://i.pravatar.cc/150?u=john',
  },
  {
    authorName: 'Alina',
    quote: 'I am so happy with my purchase. The shoes are comfortable and stylish, and the delivery was incredibly fast. Highly recommended!',
    avatarUrl: 'https://i.pravatar.cc/150?u=alina',
  },
  {
    authorName: 'Mikey',
    quote: 'Fantastic experience from start to finish. The customer support was excellent, and the product arrived exactly as described. Love my new shoes!',
    avatarUrl: 'https://i.pravatar.cc/150?u=mikey',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampletestimonials }: TestimonialsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#6366f1';

  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : sampletestimonials;

  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800"
          >
            <ChatBubbleLeftIcon className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Community Voices
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter"
          >
            Loved by <span className="italic font-serif font-light" style={{ color: primary }}>Thousands</span>.
          </motion.h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {displayTestimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="relative flex flex-col p-10 bg-slate-50 dark:bg-gray-900/50 rounded-[3rem] border border-slate-100 dark:border-gray-800/50 group hover:bg-white dark:hover:bg-gray-900 hover:shadow-2xl transition-all duration-500"
            >
              {/* Star Rating */}
              <div className="flex gap-0.5 mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4" style={{ color: primary }} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-lg md:text-xl font-medium text-slate-700 dark:text-gray-300 leading-relaxed mb-10 italic">
                “{t.quote}”
              </p>

              {/* Author Info */}
              <div className="mt-auto flex items-center gap-4">
                <div className="relative w-12 h-12 overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                  <img
                    src={t.avatarUrl || `https://ui-avatars.com/api/?name=${t.authorName}&background=random`}
                    alt={t.authorName || 'Customer Avatar'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {t.authorName}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                    Verified Customer
                  </span>
                </div>
              </div>

              {/* Floating Decoration */}
              <div 
                className="absolute top-10 right-10 opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ color: primary }}
              >
                <ChatBubbleLeftIcon className="w-12 h-12" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust Signal */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 flex flex-col items-center justify-center gap-4"
        >
          <div className="flex -space-x-3">
             {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-slate-200 overflow-hidden">
                 <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
               </div>
             ))}
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Join 50,000+ Happy Shoppers
          </p>
        </motion.div>
      </div>
    </section>
  );
}