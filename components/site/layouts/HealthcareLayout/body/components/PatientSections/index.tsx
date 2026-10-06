"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { StarIcon, ArrowRightIcon, ChatBubbleLeftRightIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

interface PatientSectionProps {
  name: string;
  slug: string;
  testimonials: Array<{
    id: string;
    authorName: string;
    quote: string;
    rating: number;
    service?: string;
    avatarUrl?: string;
  }>;
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  },
};

export default function PatientSection({ name, slug, testimonials }: PatientSectionProps) {
  const router = useRouter();
  const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className="h-3.5 w-3.5 transition-colors duration-300"
        style={{ color: i < rating ? '#fbbf24' : 'rgba(148, 163, 184, 0.2)' }}
      />
    ));
  };

  return (
    <section id="testimonials" className="relative py-24 lg:py-36 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* PREMIUM INDUSTRIAL LIGHTING DISKS */}
      <div className="absolute top-0 left-1/4 -translate-y-36 w-[600px] h-[600px] bg-slate-200/30 dark:bg-slate-900/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-36 w-[500px] h-[500px] bg-teal-500/[0.02] dark:bg-teal-500/[0.01] rounded-full blur-[140px] pointer-events-none" />

      {/* CORE IDENTITY MATRIX BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.25] dark:opacity-[0.1] mix-blend-overlay pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.3) 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* --- EXECUTIVE HEADER ARCHITECTURE --- */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 px-4 py-2 rounded-2xl shadow-sm mb-6"
          >
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} className="w-3.5 h-3.5 text-amber-400" />
              ))}
            </div>
            <div className="w-px h-3 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-wide">Excellent 4.9/5 Score</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6"
          >
            Validated Recovery <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400">Narratives</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed"
          >
            Explore real, documented journeys from active members of our health ecosystem who have optimized their vitality.
          </motion.p>
        </div>

        {/* --- PREMIUM TESTIMONIALS MATRIX --- */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id || i}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="group relative bg-white dark:bg-slate-900 p-8 lg:p-10 rounded-[2.5rem] shadow-[0_4px_25px_rgba(15,23,42,0.01)] border border-slate-200/50 dark:border-slate-800/60 hover:shadow-[0_24px_48px_rgba(15,23,42,0.04)] dark:hover:shadow-[0_24px_48px_rgba(0,0,0,0.25)] flex flex-col h-full transition-all duration-500"
            >
              {/* Architectural Giant Signifier Mark */}
              <span 
                className="absolute top-6 right-10 text-[10rem] font-serif font-black opacity-[0.04] dark:opacity-[0.02] select-none pointer-events-none transition-transform duration-500 group-hover:translate-x-1"
                style={{ color: primaryColor }}
              >
                “
              </span>

              {/* Verified Badge Header Line */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex gap-1">
                  {renderStars(t.rating)}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                  <CheckBadgeIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Verified Case</span>
                </div>
              </div>

              {/* Core Experiential Quote block */}
              <blockquote className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed mb-10 relative z-10 flex-grow">
                “{t.quote}”
              </blockquote>

              {/* Author Segment Border Platform */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/60 relative z-10">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/20 dark:border-slate-800/40 flex-shrink-0">
                  {t.avatarUrl ? (
                    <Image decoding="async" 
                      src={t.avatarUrl} 
                      alt={t.authorName}
                      fill 
                      className="object-cover" 
                      sizes="48px"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center font-black text-sm text-white tracking-wider"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {t.authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    {t.authorName}
                  </div>
                  {t.service && (
                    <div className="text-xs font-semibold mt-0.5 truncate text-slate-400 dark:text-slate-500">
                      Care Unit: <span className="font-bold" style={{ color: primaryColor }}>{t.service}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* --- INTEGRATED PLATFORM FOOTER CTA --- */}
        <div className="mt-20 text-center">
          <button
            onClick={() => router.push(`/${slug}/reviews`)}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 font-bold text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgba(15,23,42,0.01)] hover:shadow-xl transition-all duration-300 group"
          >
            <span>Read All Clinical Success Stories</span>
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-current transition-colors" />
          </button>
        </div>

      </div>
    </section>
  );
}