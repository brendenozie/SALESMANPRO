'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { useStore } from '@/contexts/StoreContext';
import { StarIcon } from '@heroicons/react/24/solid';

const sampletestimonials = [
  {
    authorName: 'Jonathan V.',
    quote: 'The drape of the fabric and the attention to stitching is something you usually only find in bespoke tailoring. A total revelation for my wardrobe.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop',
  },
  {
    authorName: 'Alina K.',
    quote: 'Finally, a brand that understands sustainable luxury. The delivery was seamless, and the packaging felt like receiving a gift from a friend.',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop',
  },
  {
    authorName: 'Michael R.',
    quote: 'Modern, sharp, and timeless. I wore the linen blazer to a gallery opening and haven’t stopped receiving compliments since.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const store = useStore();
  const primaryColor = store?.storeFormData?.themeSettings?.primaryColor || '#18181b';
  const data = testimonials && testimonials.length > 0 ? testimonials : sampletestimonials;

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-20 gap-6">
          <div className="max-w-xl">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-5xl md:text-7xl font-light text-gray-900 dark:text-white leading-[0.85] tracking-tighter uppercase"
            >
              Voices of <br />
              <span className="font-serif italic lowercase pl-4 md:pl-12">the collective.</span>
            </motion.h2>
          </div>
          <p className="text-gray-400 dark:text-zinc-500 font-medium uppercase tracking-[0.2em] text-[10px]">
            Verified Global Impressions // 2026
          </p>
        </div>

        {/* Staggered Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {data.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              viewport={{ once: true }}
              className={`flex flex-col ${index % 2 !== 0 ? 'md:mt-16' : ''}`} // Stagger effect
            >
              {/* Star Rating - Subtle */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-3 h-3" style={{ color: primaryColor }} />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="relative mb-10">
                <span className="absolute -top-6 -left-4 text-8xl font-serif italic opacity-[0.08] dark:opacity-[0.15] pointer-events-none text-gray-400">
                  &ldquo;
                </span>
                <p className="text-xl md:text-2xl font-light text-gray-800 dark:text-zinc-200 leading-snug italic font-serif">
                  {testimonial.quote}
                </p>
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-4 mt-auto pt-8 border-t border-gray-100 dark:border-zinc-900">
                <div className="relative w-12 h-12 grayscale hover:grayscale-0 transition-all duration-500 cursor-crosshair">
                  <img
                    src={testimonial.avatarUrl || ''}
                    alt={testimonial.authorName || 'User'}
                    className="rounded-full w-full h-full object-cover border border-gray-200 dark:border-zinc-800"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">
                    {testimonial.authorName}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-tighter">
                    Verified Purchase
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Footer Decoration */}
        <div className="mt-32 flex justify-center">
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            className="h-px w-32 bg-gray-200 dark:bg-zinc-800" 
          />
        </div>
      </div>
    </section>
  );
}