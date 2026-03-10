'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { EnvelopeIcon, CheckBadgeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function NewsletterSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#6366f1';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#a855f7';
  
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1500);
  };

  return (
    <section className="relative py-20 px-6 bg-white dark:bg-black overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] overflow-hidden shadow-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${primary}e6, ${secondary}e6)`, // 90% opacity
          }}
        >
          {/* Decorative Background Patterns */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="h-full w-full" fill="none" viewBox="0 0 400 400">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 px-8 py-16 md:px-20 md:py-24 flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Text Content */}
            <div className="max-w-xl text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white mb-6"
              >
                <EnvelopeIcon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Join the Inner Circle
                </span>
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-6">
                Early Access <br />
                <span className="text-white/70 italic font-serif font-light">& New Drops.</span>
              </h2>
              <p className="text-white/80 text-lg font-medium max-w-md">
                Be the first to know about limited editions, seasonal sales, and member-only events.
              </p>
            </div>

            {/* Form Section */}
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-3xl p-10 text-center shadow-xl"
                  >
                    <CheckBadgeIcon className="w-16 h-16 mx-auto mb-4" style={{ color: primary }} />
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">You're On The List</h3>
                    <p className="text-slate-500 font-medium">Check your inbox for a special welcome offer.</p>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      Back
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="relative flex flex-col gap-4"
                  >
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-8 py-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium text-lg shadow-inner"
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={status === 'loading'}
                      className="w-full py-6 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                      {status === 'loading' ? (
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Subscribe Now
                          <ArrowRightIcon className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                    
                    <p className="text-center text-[10px] text-white/40 uppercase font-bold tracking-widest">
                      Zero Spam. Unsubscribe anytime.
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