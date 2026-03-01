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
    <section className="relative py-32 bg-zinc-950 overflow-hidden">
      {/* Architectural Background Detail */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-zinc-900/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 block">
              // The Dispatch
            </span>
            <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-white uppercase leading-none">
              Private <br />
              <span className="font-serif italic lowercase text-zinc-400">Access</span>
            </h2>
            <p className="text-zinc-500 text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
              Join our collective for seasonal lookbooks, artisan interviews, and early access to limited edition drops.
            </p>
          </div>

          {/* Form */}
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="relative mt-12 max-w-md mx-auto group"
          >
            <div className="relative flex items-center border-b border-zinc-800 group-focus-within:border-white transition-colors duration-500 pb-4">
              <EnvelopeIcon className="w-5 h-5 text-zinc-600 group-focus-within:text-white transition-colors" />
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none w-full px-4 py-2 text-white placeholder:text-zinc-700 focus:ring-0 text-xs font-black tracking-[0.2em] uppercase"
              />
              <button
                type="submit"
                className="p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <ArrowRightIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Animated Underline */}
            <motion.div 
              className="absolute bottom-0 left-0 h-px bg-white w-0 group-focus-within:w-full transition-all duration-700"
            />
          </form>

          {/* Policy Note */}
          <p className="text-[9px] text-zinc-700 uppercase tracking-widest pt-4">
            By subscribing, you agree to our <a href="#" className="underline hover:text-zinc-500 transition-colors">Privacy Policy</a>. <br />
            No noise. Just design.
          </p>
        </motion.div>
      </div>

      {/* Side Decorative Numbers */}
      <div className="absolute bottom-10 left-10 hidden lg:block">
        <span className="font-mono text-[10px] text-zinc-800 tracking-tighter uppercase [writing-mode:vertical-lr]">
          est. 2026 // collective_access
        </span>
      </div>
    </section>
  );
}