'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { ChatBubbleBottomCenterIcon, StarIcon } from '@heroicons/react/24/solid';

const sampletestimonials = [
  {
    authorName: 'JOHNATHON_X',
    quote: 'Tactical gear quality is unmatched. The delivery speed was faster than a low-orbit drop. Highly recommended for any serious operator.',
    avatarUrl: 'https://placehold.co/100x100/111/FFF?text=J',
  },
  {
    authorName: 'ALINA_CORE',
    quote: 'The interface is intuitive and the product arrival was strictly on schedule. The armor-weave fabric exceeded all field testing parameters.',
    avatarUrl: 'https://placehold.co/100x100/111/FFF?text=A',
  },
  {
    authorName: 'MIKEY_SQUAD',
    quote: 'Excellent customer intel. Support was online 24/7 to help with my loadout customization. This is the new gold standard for the empire.',
    avatarUrl: 'https://placehold.co/100x100/111/FFF?text=M',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampletestimonials }: TestimonialsSectionProps) {
  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : sampletestimonials;

  return (
    <section className="relative py-24 bg-black overflow-hidden border-t border-white/5">
      {/* Background HUD Graphics */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(90deg, #FF003C 1px, transparent 1px), linear-gradient(#FF003C 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-1 border border-red-600/30 bg-red-600/5 mb-6"
          >
            <ChatBubbleBottomCenterIcon className="w-4 h-4 text-red-600" />
            <span className="font-mono text-[10px] tracking-[0.4em] text-red-500 uppercase font-black">
              Field_Intelligence
            </span>
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter text-center">
            OPERATOR <span className="text-red-600">FEEDBACK</span>
          </h2>
          <div className="h-1 w-24 bg-red-600 mt-4 skew-x-[-20deg]" />
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayTestimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative p-8 bg-zinc-900/50 border border-white/5 hover:border-red-600/50 transition-all duration-500 flex flex-col"
            >
              {/* Card HUD Elements */}
              <div className="absolute top-0 right-0 p-2 font-mono text-[8px] text-white/10 group-hover:text-red-600/30 transition-colors">
                LOG_ID: 00{index + 1}
              </div>
              
              {/* Star Rating HUD */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-3 h-3 text-red-600 drop-shadow-[0_0_5px_rgba(255,0,60,0.5)]" />
                ))}
              </div>

              {/* Quote Text */}
              <blockquote className="relative mb-10">
                <span className="absolute -top-4 -left-4 text-6xl text-white/[0.03] font-serif leading-none group-hover:text-red-600/10 transition-colors">“</span>
                <p className="relative z-10 text-zinc-400 text-lg font-medium leading-relaxed italic group-hover:text-zinc-200 transition-colors">
                  {t.quote}
                </p>
              </blockquote>

              {/* Author Info Pane */}
              <div className="mt-auto flex items-center gap-4 pt-6 border-t border-white/5">
                <div className="relative w-12 h-12 overflow-hidden bg-black border border-white/10 group-hover:border-red-600 transition-colors">
                  <img
                    src={t.avatarUrl || 'https://placehold.co/100x100/111/FFF?text=User'}
                    alt={t.authorName || 'operator'}
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                  />
                  <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay" />
                </div>
                
                <div className="text-left">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest group-hover:text-red-500 transition-colors">
                    {t.authorName}
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-600 uppercase">
                    Verified_Citizen
                  </p>
                </div>
              </div>

              {/* Corner Reticle decoration */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/5 group-hover:border-red-600 transition-all" />
            </motion.div>
          ))}
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-20 flex items-center justify-between py-4 border-b border-white/5 font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
          <span>Signal: Encrypted</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Uplink_Stable
            </span>
            <span>Latency: 14ms</span>
          </div>
        </div>
      </div>
    </section>
  );
}