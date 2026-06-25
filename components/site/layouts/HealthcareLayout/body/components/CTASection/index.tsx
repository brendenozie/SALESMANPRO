// File: components/site/layouts/HealthcareLayout/components/CTASection.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

interface CTASectionProps {
  storeSlug: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function CTASection({ storeSlug }: CTASectionProps) {
  const router = useRouter();
  const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';

  return (
    <section className="relative py-28 lg:py-40 bg-slate-950 text-white overflow-hidden">
      
      {/* PREMIUM HIGH-OUTPUT LIGHTING DISK */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] rounded-full blur-[160px] pointer-events-none z-0 opacity-20 dark:opacity-15"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`
        }}
      />
      
      {/* CORE IDENTITY MATRIX BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.05] mix-blend-overlay pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.4) 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }}
      />

      {/* GEOMETRIC ACCENT BARS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-slate-800" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-t from-transparent to-slate-800" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* MICRO TAG OVERLAY */}
          <motion.div variants={itemVariants} className="inline-block mb-6">
            <span 
              className="text-[10px] font-extrabold tracking-widest uppercase px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10"
              style={{ color: primaryColor }}
            >
              Next Step Deployment
            </span>
          </motion.div>

          {/* HIGH-IMPACT TYPOGRAPHIC HEADER */}
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]"
            variants={itemVariants}
          >
            Ready to Prioritize <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Your Clinical Well-Being?
            </span>
          </motion.h2>

          {/* BALANCED SUBTEXT */}
          <motion.p
            className="mt-6 text-base sm:text-lg font-medium text-slate-400 max-w-xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Reserve your foundational timeline with our healthcare professionals today. We are engineered to support your progression toward optimal systemic vitality.
          </motion.p>

          {/* PREMIUM INTERACTIVE CTAS */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={itemVariants}
          >
            <button
              onClick={() => router.push(`/${storeSlug}/book`)}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-xs font-extrabold tracking-wider text-white uppercase rounded-xl transition-all duration-300 shadow-xl overflow-hidden"
              style={{ backgroundColor: primaryColor }}
            >
              {/* BUTTON LIGHTING OVERLAY */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <span>Initiate Appointment</span>
              <ArrowRightIcon className="w-3.5 h-3.5 ml-2.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => router.push(`/${storeSlug}/contact-form`)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-xs font-extrabold tracking-wider text-slate-300 hover:text-white uppercase rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              Inquire Directly
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}