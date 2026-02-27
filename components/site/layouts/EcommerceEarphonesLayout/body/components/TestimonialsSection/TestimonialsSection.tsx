'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';
import { ChatBubbleBottomCenterIcon } from '@heroicons/react/24/solid';

const sampletestimonials = [
  {
    authorName: 'Johnathon',
    quote: 'The products exceeded my expectations! The quality is incredible and the style is unmatched. I will definitely be a returning customer.',
    avatarUrl: 'https://placehold.co/100x100/000?text=J',
  },
  {
    authorName: 'Alina',
    quote: 'I am so happy with my purchase. The shoes are comfortable and stylish, and the delivery was incredibly fast. Highly recommended!',
    avatarUrl: 'https://placehold.co/100x100/000?text=A',
  },
  {
    authorName: 'Mikey',
    quote: 'Fantastic experience from start to finish. The customer support was excellent, and the product arrived exactly as described.',
    avatarUrl: 'https://placehold.co/100x100/000?text=M',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampletestimonials }: TestimonialsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#f97316';

  const listToUse = testimonials && testimonials.length > 0 ? testimonials : sampletestimonials;

  return (
    <section className="relative py-32 bg-[#050505] overflow-hidden border-t border-white/5">
      {/* Background HUD Decals */}
      <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none select-none">
        <ChatBubbleBottomCenterIcon className="w-96 h-96 text-white" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Network Feedback</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter italic uppercase leading-[0.8]">
              Trusted by <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/40 to-white/5">The Squad.</span>
            </h2>
          </div>
          <p className="text-white/30 font-mono text-[10px] uppercase tracking-widest max-w-[180px] text-left md:text-right">
            Real-time verified transmissions from our global operators.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {listToUse.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-8 md:p-12 rounded-[2.5rem] bg-white/[0.03] border border-white/5 group hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500
                ${idx === 0 ? 'lg:col-span-7' : idx === 1 ? 'lg:col-span-5' : 'lg:col-span-12'}`}
            >
              {/* Massive Quote Mark Decor */}
              <span className="absolute top-6 right-10 text-8xl font-black italic text-white/[0.03] group-hover:text-white/[0.05] transition-colors pointer-events-none">
                &rdquo;
              </span>

              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 p-1 group-hover:border-primary-color transition-colors" style={{ borderColor: idx % 2 === 0 ? primary : 'rgba(255,255,255,0.1)' }}>
                      <img 
                        src={t.avatarUrl || ''} 
                        alt={t.authorName || ''} 
                        className="w-full h-full rounded-full object-cover grayscale brightness-125"
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-black italic uppercase tracking-widest text-sm">
                        {t.authorName}
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Verified Client</p>
                    </div>
                  </div>

                  <p className="text-xl md:text-2xl font-medium text-white/80 leading-relaxed italic tracking-tight">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                {/* Tactical Footer for the card */}
                <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary-color" style={{ backgroundColor: s <= 4 ? primary : undefined }} />
                    ))}
                  </div>
                  <span className="font-mono text-[8px] text-white/10 uppercase tracking-widest group-hover:text-white/30 transition-colors">
                    REF_ID: #00{idx + 124}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Footer Counter */}
        <div className="mt-20 flex justify-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full border border-white/5 bg-white/[0.02]">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Aggregate Rating</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white italic">4.9</span>
              <span className="text-[10px] font-bold text-white/20">/ 5.0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}