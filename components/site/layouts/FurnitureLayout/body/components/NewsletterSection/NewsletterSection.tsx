'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function NewsletterSection() {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings?.primaryColor || '#18181b';
  
  const [email, setEmail] = useState('');

  return (
    <section className="relative py-32 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 overflow-hidden">
      {/* Background Decor: Soft Glow in Dark, Clean in Light */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-200/50 dark:bg-zinc-900/30 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-10"
        >
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
               <div className="h-[1px] w-8 bg-zinc-300 dark:bg-zinc-800" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-500 block">
                 The Dispatch
               </span>
               <div className="h-[1px] w-8 bg-zinc-300 dark:bg-zinc-800" />
            </div>
            
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-[0.8]">
              Private <br />
              <span className="font-serif italic font-light lowercase text-zinc-400 dark:text-zinc-600">Access</span>
            </h2>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-light max-w-sm mx-auto leading-relaxed">
              Seasonal lookbooks, artisan interviews, and early access to limited edition drops.
            </p>
          </div>

          {/* Minimalist Form */}
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="relative mt-16 max-w-md mx-auto group"
          >
            <div className="relative flex items-center border-b border-zinc-200 dark:border-zinc-800 group-focus-within:border-zinc-900 dark:group-focus-within:border-white transition-colors duration-500 pb-4 px-2">
              <EnvelopeIcon className="w-5 h-5 text-zinc-300 dark:text-zinc-700 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none w-full px-4 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:ring-0 text-xs font-black tracking-[0.3em] uppercase transition-all"
              />
              <button
                type="submit"
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all transform hover:translate-x-1"
              >
                <ArrowRightIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Animated Underline (Atelier Signature) */}
            <div 
              className="absolute bottom-[-1px] left-1/2 h-[1px] bg-zinc-900 dark:bg-white w-0 group-focus-within:w-full group-focus-within:left-0 transition-all duration-700 ease-in-out"
            />
          </form>

          {/* Footnote */}
          <div className="pt-8 space-y-2">
             <p className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest leading-loose">
              By subscribing, you agree to our <a href="#" className="underline decoration-zinc-200 dark:decoration-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</a>.
            </p>
            <p className="text-[10px] font-serif italic text-zinc-300 dark:text-zinc-800">
              No noise. Just design.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Vertical Side Detail */}
      <div className="absolute bottom-12 left-12 hidden lg:block overflow-hidden">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="font-mono text-[9px] text-zinc-300 dark:text-zinc-800 tracking-tighter uppercase [writing-mode:vertical-lr] flex items-center gap-4"
        >
          <span className="w-px h-12 bg-zinc-200 dark:bg-zinc-800" />
          EST. 2026 // ATELIER_DISPATCH
        </motion.div>
      </div>
    </section>
  );
}