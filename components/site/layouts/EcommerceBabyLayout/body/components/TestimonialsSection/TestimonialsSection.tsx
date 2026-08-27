'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons as per your preference
import { StarIcon, HeartIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

const sampletestimonials = [
  {
    authorName: 'Sarah Jenkins',
    quote: "The organic swaddles are a game changer! So soft on my newborn's skin. The quality exceeded my expectations and the colors are just beautiful.",
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
  },
  {
    authorName: 'Mark Thompson',
    quote: "Finally a baby shop that cares about sustainability as much as style. The delivery was incredibly fast and the packaging was plastic-free!",
    avatarUrl: 'https://i.pravatar.cc/150?u=mark',
  },
  {
    authorName: 'Elena Rodriguez',
    quote: "Fantastic experience! The customer support team helped me pick the perfect gift set for my sister. It's now her favorite nursery item.",
    avatarUrl: 'https://i.pravatar.cc/150?u=elena',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampletestimonials }: TestimonialsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#FF8FA3';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#70D6FF';

  return (
    <section className="relative py-32 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Decorative Ambiance */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] blur-[140px] opacity-[0.06] rounded-full pointer-events-none"
        style={{ backgroundColor: secondary }}
      />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm"
          >
            <HeartIcon className="w-4 h-4" style={{ color: primary }} />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400">Trusted by Parents</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white leading-[0.95] tracking-tighter">
            Real Stories from <br/>
            <span className="italic" style={{ color: primary }}>The Nursery</span>
          </h2>
          
          <p className="text-xl text-zinc-500 font-medium leading-relaxed">
            There’s nothing more precious than your baby’s comfort. Hear why thousands of families choose us for their first moments.
          </p>
        </div>

        {/* The Staggered Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {testimonials?.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group relative ${index === 1 ? 'md:mt-12' : ''}`} // Staggered visual flow
            >
              {/* The Card */}
              <div className="relative bg-[#FAFAFA] dark:bg-zinc-900 p-12 rounded-[4rem] transition-all duration-700 group-hover:bg-white dark:group-hover:bg-zinc-800 group-hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-transparent group-hover:border-zinc-100 dark:group-hover:border-zinc-700">
                
                {/* Speech Bubble Tail Decoration */}
                <div className="absolute -bottom-4 left-16 w-8 h-8 bg-[#FAFAFA] dark:bg-zinc-900 rotate-45 group-hover:bg-white dark:group-hover:bg-zinc-800 transition-colors" />

                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-amber-400" />
                  ))}
                </div>

                <blockquote className="text-2xl text-zinc-900 dark:text-white font-bold leading-tight tracking-tight mb-8">
                  “{t.quote}”
                </blockquote>

                {/* Card Background Branding */}
                <ChatBubbleLeftRightIcon className="absolute top-10 right-10 w-20 h-20 opacity-[0.03] text-zinc-900 dark:text-white group-hover:opacity-[0.08] transition-opacity" />
              </div>

              {/* The Author "Seal" */}
              <div className="mt-12 flex items-center gap-5 px-8">
                <div className="relative group/avatar">
                   <div 
                    className="absolute inset-0 rounded-full scale-125 blur-md opacity-0 group-hover/avatar:opacity-30 transition-opacity" 
                    style={{ backgroundColor: primary }}
                   />
                   <img
                    src={t.avatarUrl || ''}
                    alt={t.authorName || 'Parent'}
                    className="relative w-16 h-16 rounded-[1.5rem] object-cover border-4 border-white dark:border-zinc-900 shadow-xl group-hover:rotate-6 transition-transform duration-500"
                  />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-black text-zinc-900 dark:text-white leading-none mb-1">
                    {t.authorName}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: secondary }} />
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Verified Parent
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Social Proof Bar */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-32 pt-16 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-12"
        >
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex flex-col items-center md:items-start">
                    <span className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">4.9/5</span>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Average Rating</span>
                </div>
                <div className="h-12 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
                <div className="flex flex-col items-center md:items-start">
                    <span className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter" style={{ color: secondary }}>12K+</span>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Families Served</span>
                </div>
            </div>
            
            <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i + 10}`} className="w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 shadow-lg" alt="User Avatar" />
                ))}
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-950 flex items-center justify-center text-[10px] font-black text-zinc-400">
                    +12k
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
}