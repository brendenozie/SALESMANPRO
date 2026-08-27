'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Testimonial } from '@/types/typings';

const staticTestimonials: any[] = [
  {
    authorName: "Sarah L.",
    text: "Working with our team has been a game-changer for my business. Their insights and strategies are incredibly practical and have led to tangible growth. The service is seamless, and their dedication is truly inspiring!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&fit=crop",
    company: "Founder, InnovateCorp",
  },
  {
    authorName: "James K.",
    text: "From the very first discovery call, I knew I was in capable hands. The personalized coaching sessions helped me overcome my biggest challenges and achieve goals I thought were out of reach. Absolutely top-tier support!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&h=150&fit=crop",
    company: "CEO, GrowthPath Solutions",
  },
  {
    authorName: "Aisha R.",
    text: "I was hesitant at first, but our team exceeded all my expectations. Their unique approach transformed my understanding of leadership, and the results speak for themselves. Highly recommend for anyone serious about growth.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&h=150&fit=crop",
    company: "Director, FutureMakers Inc.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 16,
    },
  },
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}&w=${width}&q=${quality || 75}`;
};

interface TestimonialsSectionProps {
  themeSettings: Record<string, any> | undefined | null;
  testimonials: Testimonial[] | undefined | null;
  name: string | undefined | null;
}

export default function TestimonialsSection({ themeSettings, testimonials, name }: TestimonialsSectionProps) {
  const primaryColor = themeSettings?.primaryColor || '#000000';

  const testimonialsData = Array.isArray(testimonials) && testimonials.length > 0
    ? testimonials.map((t, idx) => ({
        authorName: t.authorName || 'Anonymous',
        text: t.quote || '',
        rating: typeof t.rating === 'number' ? Math.max(0, Math.min(5, t.rating)) : 5,
        image: t.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&h=150&fit=crop&sig=${idx}`,
        company: '',
      }))
    : staticTestimonials.map(t => ({
        ...t,
        text: t.text.replace('[Your Company Name/Name]', name || 'our team'),
      }));

  return (
    <AnimatePresence>
      <section
        id="testimonials"
        className="relative py-24 lg:py-32 px-6 lg:px-8 bg-white text-slate-900 overflow-hidden border-b border-slate-100"
      >
        {/* Minimal Wire Grid Background Sync */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header Layout */}
          <motion.div
            className="text-center mb-20 flex flex-col items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Minimal Inline Badge Tagline */}
            <motion.div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 mb-5"
              variants={itemVariants}
            >
              <SparklesIcon className="w-4 h-4 text-slate-600" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                Client Verification Nodes
              </p>
            </motion.div>

            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl leading-[1.15] text-slate-900"
              variants={itemVariants}
            >
              What Our Clients <span style={{ color: primaryColor }}>Love</span> About {name || 'Us'}
            </motion.h2>

            <motion.p
              className="mt-6 text-slate-500 max-w-2xl text-lg font-normal leading-relaxed"
              variants={itemVariants}
            >
              Don't just take our word for it. Hear directly from those who have experienced our structural difference.
            </motion.p>
          </motion.div>

          {/* Core Content Grid Matrix Layout */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {testimonialsData.map((t, index) => (
              <motion.div
                key={index}
                className="group flex flex-col bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 justify-between items-start transition-all duration-200 hover:border-slate-900 hover:shadow-xl"
                variants={itemVariants}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="w-full flex flex-col h-full justify-between">
                  
                  {/* Quote Node Segment */}
                  <div className="mb-8">
                    {/* High-Contrast Star Verification Row */}
                    <div className="flex gap-0.5 mb-5 text-slate-900">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${i < t.rating ? 'text-slate-900' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>

                    <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed tracking-tight">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>

                  {/* Structural Identity Frame */}
                  <div className="flex items-center gap-4 pt-6 border-t border-slate-100 w-full">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                      <Image
                        src={t.image}
                        loader={imageLoader}
                        alt={`${t.authorName} Avatar`}
                        fill
                        sizes="44px"
                        className="object-cover object-center"
                      />
                    </div>

                    <div className="flex flex-col text-left min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">
                        {t.authorName}
                      </p>
                      {t.company && (
                        <p className="text-xs text-slate-400 font-normal truncate mt-0.5">
                          {t.company}
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}