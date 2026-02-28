'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { StarIcon } from '@heroicons/react/24/solid';

const sampletestimonials = [
  {
    authorName: 'Johnathon D.',
    quote: 'The Roasted Honey Butter exceeded my expectations! The quality is incredible and the texture is unmatched. It has become a breakfast staple in our home.',
    avatarUrl: 'https://i.pravatar.cc/150?u=john',
  },
  {
    authorName: 'Alina K.',
    quote: 'I am so happy with my purchase. The creamy variety is actually creamy, and the delivery was incredibly fast. Highly recommended for real nut butter lovers!',
    avatarUrl: 'https://i.pravatar.cc/150?u=alina',
  },
  {
    authorName: 'Mikey R.',
    quote: 'Fantastic experience from start to finish. The customer support was excellent, and the product arrived exactly as described. Best small-batch find this year!',
    avatarUrl: 'https://i.pravatar.cc/150?u=mikey',
  },
];

export default function TestimonialsSection({ testimonials = sampletestimonials }: { testimonials?: Testimonial[] | null }) {
  return (
    <section className="py-24 bg-[#FAF7F2] relative overflow-hidden">
      {/* Editorial Decorative Background */}
      <div className="absolute top-0 left-0 p-10 opacity-[0.03] select-none pointer-events-none hidden lg:block">
        <h1 className="text-[20rem] font-black leading-none">REAL <br />FEED <br />BACK</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[#8B4513] font-black uppercase tracking-[0.3em] text-[10px]"
          >
            Kind Words
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-[#3E2723] mt-4 tracking-tighter"
          >
            Straight from the <br />
            <span className="text-[#F3A852]">Pantry Community.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {testimonials?.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(62,39,35,0.05)] border border-stone-100 
                ${idx === 1 ? 'md:mt-12' : ''} // Visual staggered effect
              `}
            >
              {/* Large Quote Mark */}
              <span className="absolute top-6 right-8 text-8xl font-serif text-[#F3A852]/10 select-none">“</span>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-[#F3A852]" />
                ))}
              </div>

              <p className="text-[#3E2723] font-medium leading-relaxed mb-8 italic">
                {t.quote}
              </p>

              <div className="flex items-center gap-4 border-t border-stone-50 pt-6">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-stone-100 shadow-inner">
                  <img
                    src={t.avatarUrl || `https://ui-avatars.com/api/?name=${t.authorName}&background=F3A852&color=3E2723`}
                    alt={t.authorName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-black text-[#3E2723] text-sm uppercase tracking-wider">{t.authorName}</h4>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Verified Purveyor</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA for trust */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white border border-stone-200 rounded-full shadow-sm">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img key={i} className="w-8 h-8 rounded-full border-2 border-white bg-stone-100" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
              ))}
            </div>
            <p className="text-xs font-black text-[#3E2723] uppercase tracking-tighter">
              Join <span className="text-[#F3A852]">2,500+</span> happy spreaders
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}