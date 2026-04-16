'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function NewsletterSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D9488';
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => setStatus('success'), 1800);
  };

  return (
    <section className="relative py-40 bg-[#FDFDFB] dark:bg-zinc-950 overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          
          {/* Left: Editorial Content */}
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <SparklesIcon className="w-4 h-4 text-zinc-300" />
                <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-400">Exclusive Access</span>
              </div>
              
              <h2 className="text-6xl md:text-8xl font-serif text-zinc-900 dark:text-white leading-[0.85] tracking-tighter">
                The Studio <br />
                <span className="italic text-zinc-400 dark:text-zinc-600">Collective.</span>
              </h2>
              
              <p className="max-w-md font-mono text-[10px] uppercase tracking-widest leading-relaxed text-zinc-500">
                Register for our 2026 Archive Membership to receive priority logistics and a <span className="text-zinc-900 dark:text-white font-bold">15% reduction</span> on your initial acquisition.
              </p>
            </div>

            {/* Technical Benefits Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-8 pt-8 border-t border-zinc-100 dark:border-zinc-900 max-w-xl">
              {[
                { label: 'Priority', detail: 'VIP Logistics' },
                { label: 'Insight', detail: 'Care Protocols' },
                { label: 'Curation', detail: 'Archive Drops' },
                { label: 'Utility', detail: 'Member Pricing' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="font-mono text-[8px] text-zinc-300 dark:text-zinc-800 uppercase tracking-tighter">Code: 00{idx + 1}</p>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-3 h-3 text-zinc-900 dark:text-white" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: High-Performance Registration */}
          <div className="lg:col-span-5 relative">
            <AnimatePresence mode="wait">
              {status !== 'success' ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="group relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-0">
                        <EnvelopeIcon className="w-5 h-5 text-zinc-300 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="IDENTIFY@COLLECTIVE.COM"
                        className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-6 pl-10 pr-4 text-sm font-mono uppercase tracking-widest outline-none focus:border-zinc-900 dark:focus:border-white transition-all placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="group relative w-full overflow-hidden border border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white py-6 transition-all duration-500 hover:bg-transparent"
                    >
                      <div className="relative z-10 flex items-center justify-center gap-3">
                        {status === 'loading' ? (
                          <div className="w-4 h-4 border-2 border-zinc-400 border-t-white dark:border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white dark:text-black group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                              Initialize Membership
                            </span>
                            <ArrowRightIcon className="w-4 h-4 text-white dark:text-black group-hover:text-zinc-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </>
                        )}
                      </div>
                    </button>
                  </form>
                  <p className="mt-8 font-mono text-[7px] text-center uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-800">
                    Secure Protocol / 256-bit Encryption Verified
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-16 border border-zinc-100 dark:border-zinc-900 text-center space-y-8"
                >
                  <div className="inline-flex p-4 rounded-full border border-zinc-100 dark:border-zinc-900">
                    <CheckIcon className="w-8 h-8 text-zinc-900 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif italic text-zinc-900 dark:text-white">Registration Complete</h3>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                      Verification sent to index. 15% Reduction Applied.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Background Architectural Markings */}
      <div className="absolute top-10 right-10 pointer-events-none select-none">
        <span className="font-mono text-[120px] leading-none text-zinc-50 dark:text-zinc-900/30 font-black">
          2026
        </span>
      </div>
    </section>
  );
}