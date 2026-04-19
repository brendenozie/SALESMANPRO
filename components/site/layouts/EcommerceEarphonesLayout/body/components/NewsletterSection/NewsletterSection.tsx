'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

export default function NewsletterSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#f97316';

  return (
    <section className="relative py-24 bg-white dark:bg-[#050505] border-y border-black/5 dark:border-white/5 transition-colors duration-300 overflow-hidden">
      {/* Background HUD Graphics */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none select-none">
        <span className="absolute top-1/2 left-0 -translate-y-1/2 text-[30vw] font-black italic uppercase leading-none text-black dark:text-white">
          Join
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
          >
            <SparklesIcon className="w-4 h-4" style={{ color: primary }} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/60">Priority Access</span>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black text-black dark:text-white italic tracking-tighter uppercase leading-[0.8]">
            Sync with the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-black/50 to-transparent dark:from-white dark:via-white/50 dark:to-transparent">Ecosystem.</span>
          </h2>

          <p className="text-black/50 dark:text-white/40 text-sm md:text-base font-medium max-w-lg leading-relaxed">
            Intercept exclusive drops, firmware updates, and elite community rewards. No spam—just raw data.
          </p>

          <form className="w-full max-w-md group" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex items-center p-2 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 focus-within:border-black/30 dark:focus-within:border-white/30 transition-all shadow-sm">
              <EnvelopeIcon className="w-5 h-5 ml-4 text-black/20 dark:text-white/20" />
              <input 
                type="email" 
                placeholder="OPERATOR@DOMAIN.COM"
                className="w-full bg-transparent border-none text-black dark:text-white font-mono text-xs p-4 focus:ring-0 placeholder:text-black/10 dark:placeholder:text-white/10"
              />
              <button 
                type="submit"
                className="bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-xl hover:!bg-[var(--primary)] hover:text-white transition-all active:scale-95 whitespace-nowrap"
                style={{ '--primary': primary } as React.CSSProperties}
              >
                Sync
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: primary }} />
              <span className="font-mono text-[8px] text-black/20 dark:text-white/10 uppercase tracking-widest">Awaiting Input Signal...</span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}