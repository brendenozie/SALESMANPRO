"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  name?: string;
  slug?: string;
  ctaSection?: {
    title?: string;
    subtitle?: string;
    buttonLabel?: string;
    buttonHref?: string;
  };
  themeSettings?: ThemeSettings;
};

export default function CtaBoldSection({ pagedata }: { pagedata: any }) {
  // Institutional system colors mapped to premium dark specs
  const systemAccent = pagedata?.themeSettings?.primaryColor || '#F59E0B'; // Amber Node Accent
  const organizationSlug = pagedata?.slug || 'grey-trading';
  const { storeFormData } = useStoreContext();

  const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  // Transformed corporate copy matrix with definitive rollbacks
  const ctaTitle = 'Optimize Your Cash Flow & Trade Speed';
  const ctaSubtitle = `Open a dedicated account with us to move your goods and capital more efficiently. You will gain direct access to the ${pagedata?.name || 'Trading Limited'} global network, backed by our automated security and risk-management systems.`;
  const ctaButtonLabel = 'Request a Connection';
  const ctaButtonHref = `/companyprofile/services`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formattedContent = `NEW INQUIRY\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;

    try {
      const res = await fetch(`${apiBaseUrl}/conversations/send-to-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: storeFormData?.id, content: formattedContent }),
      });
      if (!res.ok) throw new Error("API Error");
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-28 md:py-40 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans relative overflow-hidden transition-colors duration-300"
    >
      {/* Structural Accent Top-Line Border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-zinc-200 dark:bg-zinc-900 transition-colors" />

      {/* Cybernetic Grid Sub-Layer Background Elements */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02] pointer-events-none select-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Ambient Radial Vignette Blur */}
      <div 
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-15 dark:opacity-10 blur-[120px] rounded-full pointer-events-none"
        style={{ background: systemAccent }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="border border-zinc-200/90 dark:border-zinc-900 bg-white/80 dark:bg-zinc-900/10 rounded-2xl p-8 md:p-16 backdrop-blur-md relative overflow-hidden shadow-xl dark:shadow-2xl text-center transition-colors duration-300">
          
          {/* Micro Terminal Operational Status Tag */}
          <div className="inline-flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 px-3 py-1 rounded-md text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-700 dark:text-zinc-400 mb-8 select-none transition-colors">
            <CpuChipIcon className="w-3.5 h-3.5 animate-pulse text-amber-600 dark:text-amber-500" />
            Fast-track your operations.
          </div>

          {/* High-Fidelity Non-Overlapping Header Scales */}
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight uppercase text-zinc-900 dark:text-zinc-100 max-w-3xl mx-auto leading-tight transition-colors"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {ctaTitle}
          </motion.h2>

          <div className="w-12 h-[1px] bg-zinc-300 dark:bg-zinc-800 mx-auto my-6 transition-colors" />

          {/* Context Copy Structure */}
          <motion.p 
            className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed mb-10 transition-colors"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {ctaSubtitle}
          </motion.p>

          {/* Premium Industrial Rectilinear Call-To-Action Element */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={ctaButtonHref}
              className="inline-flex items-center gap-3 border border-zinc-300 dark:border-zinc-800 bg-zinc-900 dark:bg-zinc-900/40 hover:bg-zinc-800 dark:hover:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 text-white dark:text-zinc-200 dark:hover:text-white font-bold py-4 px-10 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 shadow-md group"
            >
              {ctaButtonLabel}
              <ArrowRightIcon className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>

          {/* Bottom Tracking Feed Mock Decorator */}
          <div className="absolute bottom-4 right-6 font-mono text-[9px] tracking-widest text-zinc-400 dark:text-zinc-800 hidden md:block select-none transition-colors">
            SECURE_CHANNEL_AUTH_REQUIRED_//
          </div>
        </div>
      </div>
    </section>
  );
}