'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import Image from 'next/image';

const sampletestimonials = [
  {
    authorName: 'Julianne V.',
    quote: 'The modular sofa transformed our living room into a sculptural masterpiece. The texture of the bouclé is simply divine.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
  },
  {
    authorName: 'Marcus Chen',
    quote: 'Architectural integrity meets absolute comfort. It’s rare to find pieces that look like art but feel like home.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
  },
  {
    authorName: 'Elena Rossi',
    quote: 'From the white-glove delivery to the hand-finished oak, every detail screams intentionality. A true investment.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampletestimonials }: TestimonialsSectionProps) {
  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : sampletestimonials;

  return (
    <section className="relative py-32 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Ghost Background Text */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full pointer-events-none opacity-[0.02] select-none">
        <span className="text-[30vw] font-serif italic whitespace-nowrap leading-none">
          the living experience
        </span>
      </div>

      <div className="max-w-[1700px] mx-auto px-6 relative z-10">
        
        {/* Editorial Header */}
        <div className="mb-24 text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-6"
          >
            // Client Perspectives
          </motion.span>
          <h2 className="text-5xl md:text-8xl font-light tracking-tighter text-zinc-900 dark:text-white uppercase leading-[0.8]">
            Living <br />
            <span className="font-serif italic lowercase text-zinc-400">Voices</span>
          </h2>
        </div>

        {/* Masonry-Style Overlap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 items-start">
          {displayTestimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 1, 
                delay: idx * 0.2, 
                ease: [0.21, 1.02, 0.73, 1] 
              }}
              viewport={{ once: true }}
              className={`flex flex-col ${idx === 1 ? 'md:mt-24' : ''}`}
            >
              {/* The Quote Card */}
              <div className="relative p-10 bg-white dark:bg-zinc-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-none border border-zinc-100 dark:border-zinc-800 rounded-sm group hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors duration-500">
                {/* Minimalist Quote Mark */}
                <span className="absolute -top-6 -left-4 text-8xl font-serif text-zinc-100 dark:text-zinc-800 transition-colors group-hover:text-zinc-200 dark:group-hover:text-zinc-700">
                  “
                </span>
                
                <p className="relative z-10 text-xl font-light leading-relaxed text-zinc-800 dark:text-zinc-300 italic">
                  {t.quote}
                </p>

                <div className="mt-10 flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden grayscale">
                    <img 
                      src={t.avatarUrl || 'https://placehold.co/100x100'} 
                      alt={t.authorName || 'Client Avatar'}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                      {t.authorName || 'Anonymous Client'}
                    </h3>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">Verified Resident</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Decorative Element */}
        <div className="mt-32 flex justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-px h-16 bg-zinc-200 dark:bg-zinc-800" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">
                    Trusted by 2,000+ Curated Homes
                </p>
            </div>
        </div>
      </div>
    </section>
  );
}