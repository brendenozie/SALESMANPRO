'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { EnvelopeIcon, CheckBadgeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function NewsletterSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#6366f1';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#a855f7';
  
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    // Simulate high-fidelity API transmission
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1200);
  };

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-black overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="relative rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-900"
          style={{ 
            // Integrated clean CSS variables to protect against short/malformed hex colors
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          {/* Layered High-End Ambient Background Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                x: [0, 20, 0],
                y: [0, -20, 0] 
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -right-20 w-72 h-72 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                x: [0, -30, 0],
                y: [0, 15, 0] 
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute -bottom-20 -left-20 w-64 h-64 sm:w-80 sm:h-80 bg-black/10 rounded-full blur-2xl" 
            />
            
            {/* Fine Geometry Overlay Mesh */}
            <svg className="absolute inset-0 h-full w-full opacity-[0.04] mix-blend-overlay" fill="none" viewBox="0 0 400 400">
              <defs>
                <pattern id="newsletter-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#newsletter-grid)" />
            </svg>
          </div>

          <div className="relative z-10 px-6 py-12 sm:p-16 md:px-20 md:py-24 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
            
            {/* Typography Content Layer */}
            <div className="max-w-xl text-center lg:text-left flex flex-col items-center lg:items-start">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white mb-4 sm:mb-6 shadow-sm"
              >
                <EnvelopeIcon className="w-3.5 h-3.5 text-white animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.25em]">
                  Join the Inner Circle
                </span>
              </motion.div>
              
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-[1.15] md:leading-[1.05] mb-4">
                Early Access <br className="hidden sm:inline" />
                <span className="text-white/80 italic font-serif font-light">& New Drops.</span>
              </h2>
              <p className="text-white/85 text-sm sm:text-base md:text-lg font-medium max-w-md leading-relaxed">
                Be the first to know about limited editions, seasonal collections, and member-only drops.
              </p>
            </div>

            {/* Interactive State Management Frame */}
            <div className="w-full max-w-md shrink-0">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white/95 backdrop-blur-xl dark:bg-zinc-900/95 rounded-[2rem] p-8 sm:p-10 text-center shadow-2xl border border-white/20"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-4">
                      <CheckBadgeIcon className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">
                      You're On The List
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-xs mx-auto">
                      Check your inbox shortly to unlock your exclusive introductory welcome offer.
                    </p>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Subscribe another email
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="w-full flex flex-col gap-3"
                  >
                    {/* PREMIUM UI TRANSFORMATION: 
                        Merged text field and action button into a unified responsive capsule block */}
                    <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-1.5 sm:p-2 rounded-2xl sm:rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-xl border border-white/25 focus-within:ring-2 focus-within:ring-white/40 transition-all shadow-inner">
                      <label htmlFor="newsletter-email" className="sr-only">Email Address</label>
                      <input
                        id="newsletter-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full flex-1 bg-transparent px-5 py-3.5 sm:py-2.5 rounded-xl sm:rounded-full text-white placeholder:text-white/50 focus:outline-none font-medium text-base sm:text-sm"
                      />
                      
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={status === 'loading'}
                        className="sm:shrink-0 py-4 sm:py-3 px-6 rounded-xl sm:rounded-full bg-white text-slate-900 font-black text-[11px] uppercase tracking-wider shadow-md flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        {status === 'loading' ? (
                          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            Subscribe
                            <ArrowRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                          </>
                        )}
                      </motion.button>
                    </div>
                    
                    <p className="text-center lg:text-left text-[9px] text-white/50 uppercase font-bold tracking-widest px-2">
                      Zero Spam. Unsubscribe at any time.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}