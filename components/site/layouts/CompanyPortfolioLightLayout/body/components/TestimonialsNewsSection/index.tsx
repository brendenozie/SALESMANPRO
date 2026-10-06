"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRightIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

// --- INSTITUTIONAL LEDGER CONFIGURATION & MOCK DATA ---

const accentAmber = '#F59E0B'; // System Accent: Amber Node

const mockVerifications = [
  {
    id: 'ver-1',
    authorName: 'Marcus Vance',
    quote: "The company portfolio clearly showcased their expertise and successful projects. It gave me total confidence in their capabilities",
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    role: 'Managing Director, Global Liquidity Pools',
    order: 1,
  },
  {
    id: 'ver-2',
    authorName: 'Hanae Tanaka',
    quote: "AURUM PRECIOUS METALS LIMITED's automated security systems protected our investments during the recent market volatility. Their team handles physical assets with absolute precision.",
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
    role: 'Chief Operations Officer, Pacific Rim Logistics',
    order: 2,
  },
  {
    id: 'ver-3',
    authorName: 'David Sterling',
    quote: "Compliance architectures within their multi-sovereign clearing systems are flawless. They have transformed how we secure cross-border settlement channels under volatility.",
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    role: 'Head of Quantitative Risk, Sovereign Capital',
    order: 3,
  },
];

// --- FRAMER MOTION VARIANTS ---

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

// --- PARTNER VERIFICATION CARD COMPONENT ---

const VerificationCard = ({ ver }: { ver: typeof mockVerifications[0] }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="p-8 rounded-xl border border-zinc-200/80 dark:border-zinc-900 bg-white/80 dark:bg-zinc-900/10 relative group transition-all duration-300 hover:bg-white dark:hover:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-800 flex flex-col justify-between h-full shadow-sm dark:shadow-lg"
    >
      {/* Top Structural Security Node Layout */}
      <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity duration-300 text-zinc-400 dark:text-zinc-600">
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
      </div>

      {/* Quote Body Block */}
      <div className="mb-8 relative z-10">
        <p className="text-zinc-700 dark:text-zinc-300 text-base font-light leading-relaxed tracking-wide text-justify transition-colors">
          "{ver.quote}"
        </p>
      </div>

      {/* Counterparty Institutional Identity Panel */}
      <div className="flex items-center mt-auto pt-6 border-t border-zinc-200/80 dark:border-zinc-900/60 transition-colors">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
          <Image decoding="async"
            src={ver.avatarUrl}
            alt={ver.authorName || 'Asset Counterparty'}
            fill
            sizes="48px"
            className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
          />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-200 text-sm tracking-tight truncate transition-colors">
            {ver.authorName}
          </h4>
          <p className="text-[11px] font-mono mt-0.5 tracking-wider truncate text-zinc-500 dark:text-zinc-500 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors duration-300">
            {ver.role}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN SECTION COMPONENT ---

export default function TestimonialsSection({ pagedata }: { pagedata?: any }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const primaryColor = pagedata?.themeSettings?.primaryColor || accentAmber;
  const allVerifications = pagedata?.testimonials || mockVerifications;
  const verificationsToRender = (allVerifications.length >= 3 
    ? allVerifications.slice(0, 3) 
    : allVerifications)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  return (
    <section id="testimonials" className="py-24 md:py-36 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans relative overflow-hidden transition-colors duration-300">
      
      {/* Structural Accent Top Boundary Border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-zinc-200 dark:bg-zinc-900 transition-colors" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Micro-Tracked Infrastructure Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-600 dark:text-amber-500 mb-3">
            Institutional Validation
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase transition-colors">
            What Our Partners Say
          </h2>
          <div className="w-12 h-[1px] bg-zinc-300 dark:bg-zinc-800 mx-auto my-6 transition-colors" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed transition-colors">
            We are proud of the trust our partners place in us. Below are verified performance reports and testimonials from the industry leaders we work with every day.
          </p>
        </motion.div>

        {/* Ledger Verification Grid Matrix */}
        <div className="relative" ref={ref}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className={`grid grid-cols-1 md:grid-cols-2 ${verificationsToRender.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2 lg:max-w-4xl lg:mx-auto'} gap-6`}
          >
            {verificationsToRender.map((ver: any) => (
              <VerificationCard
                key={ver.id}
                ver={ver}
              />
            ))}
          </motion.div>
        </div>

        {/* Modern Execution CTA Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="p-8 md:p-12 rounded-xl border border-zinc-200/90 dark:border-zinc-900 bg-white/90 dark:bg-zinc-900/20 flex flex-col lg:flex-row items-center justify-between mt-24 text-center lg:text-left shadow-sm dark:shadow-2xl relative transition-colors duration-300"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 max-w-3xl">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-amber-600 dark:text-amber-500 flex-shrink-0 hidden sm:block transition-colors">
              <ShieldCheckIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase transition-colors">
                Ready to scale capital throughput safely?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed transition-colors">
                Establish your clearance endpoint today. Coordinate with our clearing desks to isolate liquidity volatility.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}