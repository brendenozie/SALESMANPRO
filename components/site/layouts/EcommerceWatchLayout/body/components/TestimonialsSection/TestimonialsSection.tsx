'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const sampletestimonials = [
  {
    authorName: 'Johnathan V.',
    quote: 'The craftsmanship of the movement is extraordinary. It feels more like an heirloom than a purchase.',
    avatarUrl: 'https://i.pravatar.cc/150?u=1',
  },
  {
    authorName: 'Alina Sterling',
    quote: 'The delivery was as precise as the watch itself. A seamless experience from browsing to unboxing.',
    avatarUrl: 'https://i.pravatar.cc/150?u=2',
  },
  {
    authorName: 'Michael Rossi',
    quote: 'Customer support guided me through the complications of the chronograph with expert knowledge.',
    avatarUrl: 'https://i.pravatar.cc/150?u=3',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampletestimonials }: TestimonialsSectionProps) {
  const { storeFormData } = useStoreContext();
  const accent = '#D4AF37'; // Horology Gold

  const data = testimonials && testimonials.length > 0 ? testimonials : sampletestimonials;

  return (
    <>
      <section className="relative py-32 bg-[#faf9f6] dark:bg-[#050505] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          
          {/* Section Header */}
          <div className="mb-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-4"
            >
              <ChatBubbleLeftIcon className="w-6 h-6 text-zinc-400" />
              <span className="text-[10px] font-bold tracking-[0.5em] text-zinc-400 uppercase">
                Collector Chronicles
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-serif text-zinc-900 dark:text-zinc-100 leading-tight"
            >
              Voices of <span className="italic">True Connoisseurs</span>
            </motion.h2>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {data.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col h-full group"
              >
                {/* Star Rating using Hero Icons */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-3 h-3 text-amber-500/80" />
                  ))}
                </div>

                {/* Quote Area */}
                <div className="relative flex-grow">
                  <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed mb-10">
                    "{testimonial.quote}"
                  </p>
                  {/* Decorative Line */}
                  <div className="w-8 h-[1px] bg-zinc-200 dark:bg-zinc-800 transition-all duration-500 group-hover:w-full group-hover:bg-amber-600/30" />
                </div>

                {/* Author Attribution */}
                <div className="mt-8 flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 shadow-sm">
                    <img
                      src={testimonial.avatarUrl || ''}
                      alt={testimonial.authorName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                      {testimonial.authorName}
                    </h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-tighter">Verified Collector</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Background Graphic - Large Ghosted Quote */}
        <div className="absolute bottom-10 right-10 text-[20rem] font-serif italic text-zinc-900/5 dark:text-white/5 leading-none select-none pointer-events-none">
          ”
        </div>
      </section>
    </>
  );
}