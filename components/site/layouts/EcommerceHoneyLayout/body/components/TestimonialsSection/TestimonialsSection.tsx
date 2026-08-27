'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';

const sampletestimonials = [
  {
    authorName: 'Julianne V.',
    quote: 'The Wildflower Reserve is unlike anything I’ve tasted. It’s thick, floral, and clearly harvested with immense care. A staple in my morning ritual.',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200',
  },
  {
    authorName: 'Marcus Chen',
    quote: 'I bought the gift set for my clients, and the feedback was incredible. The packaging feels like a luxury jewelry box, and the honey is pure gold.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200',
  },
  {
    authorName: 'Elena Rossi',
    quote: 'Shipping was surprisingly fast to Europe, and everything arrived perfectly. The texture is so creamy; you can tell it’s never been flash-heated.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampletestimonials }: TestimonialsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#3E2723';

  return (
    <section className="relative py-32 bg-[#FAF9F6] overflow-hidden">
      {/* Background Decorative Element: A subtle "Drip" shape */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#F3A852]/5 rounded-l-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[#B8860B] font-black text-[10px] uppercase tracking-[0.5em] block mb-4"
          >
            The Collector's Circle
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#3E2723]">
            Shared <span className="text-[#F3A852]">Experiences</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start">
          {testimonials?.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              viewport={{ once: true }}
              className={`relative p-10 bg-white rounded-2xl shadow-[0_10px_40px_rgba(62,39,35,0.03)] border border-stone-100 ${
                index === 1 ? 'md:mt-12' : '' // Staggered effect for visual interest
              }`}
            >
              {/* Decorative Wax Seal Quote Mark */}
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#F3A852] rounded-full flex items-center justify-center shadow-lg shadow-amber-900/10">
                <span className="text-white font-serif text-2xl leading-none mt-2">“</span>
              </div>

              <div className="flex flex-col h-full">
                <p className="text-[#3E2723]/80 font-medium italic leading-relaxed mb-8 text-lg">
                  {testimonial.quote}
                </p>
                
                <div className="flex items-center gap-4 mt-auto border-t border-stone-50 pt-6">
                  <div className="relative w-12 h-12">
                    <img
                      src={testimonial.avatarUrl || `https://ui-avatars.com/api/?name=${testimonial.authorName}&background=F3A852&color=fff`}
                      alt={testimonial.authorName || ``}
                      className="rounded-full w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 ring-2 ring-stone-100 ring-offset-2"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#3E2723] uppercase tracking-widest">
                      {testimonial.authorName}
                    </h4>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">Verified Enthusiast</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Closing Sentiment */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-24 flex flex-col items-center gap-4"
        >
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#F3A852] fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">
                4.9/5 Based on 1,200+ Honey Lovers
            </p>
        </motion.div>
      </div>
    </section>
  );
}