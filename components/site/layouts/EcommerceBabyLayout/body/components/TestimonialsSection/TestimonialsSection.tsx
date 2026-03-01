'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';
// Hero Icons as requested
import {  StarIcon } from '@heroicons/react/24/solid';

const ChatBubbleBottomCenterHeartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.625 12c0-5.621 4.504-10.125 10.125-10.125S23.25 6.379 23.25 12a10.125 10.125 0 01-1.402 5.025l1.263 4.724a0.75 0 01-0.97 0.97l-4.724-1.263A10.125 10.125 0 0112 22.125C6.504 22.125 2.625 18.246 2.625 12zM12 4.875a7.125 7.125 0 100 14.25 7.125 7.125 0 000-14.25zm3.633 2.633a3.375 3.375 0 11-4.766 4.766 3.375 3.375 0_11-4.766-4.766 3.375 3.375 0 014.766-4.766 3.375 3.375 0 014.766 4.766z" clipRule="evenodd" />
  </svg>
);

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
  const primary = storeFormData?.themeSettings?.primaryColor || '#F472B6';

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      {/* Decorative Background "Sun" */}
      <div 
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] opacity-10"
        style={{ backgroundColor: primary }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <div className="flex justify-center mb-6">
            <div 
              className="p-4 rounded-3xl rotate-12 shadow-lg shadow-pink-100"
              style={{ backgroundColor: primary }}
            >
              <ChatBubbleBottomCenterHeartIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Voices from <span style={{ color: primary }}>The Nursery</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Join thousands of happy parents who trust us with their little one's first memories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials?.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group relative pt-12"
            >
              {/* The "Speech Bubble" Card */}
              <div className="relative bg-[#FAF9F6] p-10 rounded-[3rem] transition-all duration-500 group-hover:bg-white group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] group-hover:-translate-y-2 border border-transparent group-hover:border-slate-100">
                
                {/* 5-Star Rating Overlay */}
                <div className="flex gap-1 mb-6 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4" />
                  ))}
                </div>

                <p className="text-lg text-slate-700 font-medium leading-relaxed italic relative z-10">
                  “{t.quote}”
                </p>

                {/* Large Quote Decoration */}
                <span className="absolute top-6 right-10 text-8xl font-serif text-slate-200 pointer-events-none select-none">
                  ”
                </span>
              </div>

              {/* Author Section - Positioned as a "Stamp" */}
              <div className="mt-8 flex items-center gap-4 px-6">
                <div className="relative">
                   <div 
                    className="absolute inset-0 rounded-full scale-110" 
                    style={{ backgroundColor: `${primary}20` }}
                   />
                   <img
                    src={t.avatarUrl || ''}
                    alt={t.authorName || 'Parent'}
                    className="relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-slate-900 leading-none mb-1">
                    {t.authorName}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Verified Parent
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Call to Trust */}
        <div className="mt-20 pt-12 border-t border-slate-50 flex flex-wrap justify-center gap-12 grayscale opacity-30">
           <div className="flex items-center gap-2 font-black text-slate-400 tracking-tighter">
              <span className="text-2xl">4.9/5</span>
              <span className="text-[10px] uppercase leading-none">Average<br/>Rating</span>
           </div>
           <div className="flex items-center gap-2 font-black text-slate-400 tracking-tighter">
              <span className="text-2xl">12k+</span>
              <span className="text-[10px] uppercase leading-none">Happy<br/>Families</span>
           </div>
        </div>
      </div>
    </section>
  );
}