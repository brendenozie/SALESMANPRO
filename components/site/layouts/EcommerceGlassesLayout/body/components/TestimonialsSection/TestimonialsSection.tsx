'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';
import { SparklesIcon } from '@heroicons/react/24/solid';

const sampletestimonials = [
  {
    authorName: 'Jonathan Kessler',
    quote: 'The architectural precision of these frames exceeded my expectations. The quality is tangible and the style is unmatched.',
    avatarUrl: 'https://i.pravatar.cc/150?u=jon',
  },
  {
    authorName: 'Alina Vance',
    quote: 'Finally, a brand that understands the balance between clinical excellence and high-fashion aesthetics.',
    avatarUrl: 'https://i.pravatar.cc/150?u=ali',
  },
  {
    authorName: 'Michael Chen',
    quote: 'Fantastic experience from start to finish. The customer support was excellent, and the delivery was incredibly fast.',
    avatarUrl: 'https://i.pravatar.cc/150?u=mike',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampletestimonials }: TestimonialsSectionProps) {
  const { storeFormData } = useStoreContext();
  const accent = '#F3A852'; // Peanut

  const data = testimonials?.length ? testimonials : sampletestimonials;

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header: Centered & Minimalist */}
        <div className="flex flex-col items-center text-center mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-6 bg-[#F3A852]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F3A852]">Voices of Vision</span>
            <span className="h-px w-6 bg-[#F3A852]" />
          </div>
          <h2 className="text-5xl md:text-6xl font-serif text-gray-900">
            Trusted by <span className="italic font-light text-gray-400">Individuals</span>
          </h2>
        </div>

        {/* Layout: Asymmetrical Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Featured Testimonial (Left) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-[#0D4C4F] rounded-[3rem] p-12 md:p-20 relative overflow-hidden"
          >
            <SparklesIcon className="absolute -top-10 -right-10 w-40 h-40 text-white/5" />
            
            <div className="relative z-10">
              <span className="text-[80px] font-serif leading-none text-[#F3A852] absolute -top-10 -left-6 opacity-50">“</span>
              <p className="text-2xl md:text-3xl font-serif text-white leading-relaxed mb-10 italic">
                {data[0].quote}
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-[#F3A852] p-1">
                   <img src={data[0].avatarUrl || 'https://i.pravatar.cc/150?u=default'} alt="" className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h4 className="text-white font-bold tracking-widest uppercase text-xs">{data[0].authorName}</h4>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Verified Collector</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Secondary Testimonials (Right Stack) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {data.slice(1, 3).map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="p-8 rounded-[2rem] bg-[#FDF8F4] border border-[#F3A852]/10 hover:border-[#F3A852]/30 transition-colors group"
              >
                <p className="text-gray-600 font-light leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <img src={t.avatarUrl || 'https://i.pravatar.cc/150?u=default'} alt="" className="w-10 h-10 rounded-full grayscale group-hover:grayscale-0 transition-all" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900">{t.authorName}</h4>
                   </div>
                   <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-[#F3A852]" />
                      ))}
                   </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Bottom Stat/Crawl */}
        <div className="mt-24 flex justify-center">
            <div className="px-8 py-4 rounded-full border border-gray-100 flex items-center gap-6">
                <div className="flex -space-x-2">
                    {data.map((t, i) => (
                        <img key={i} src={t.avatarUrl || 'https://i.pravatar.cc/150?u=default'} className="w-6 h-6 rounded-full border-2 border-white" alt="" />
                    ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Joined by <span className="text-gray-900">4,000+</span> satisfied clients
                </p>
            </div>
        </div>
      </div>
    </section>
  );
}