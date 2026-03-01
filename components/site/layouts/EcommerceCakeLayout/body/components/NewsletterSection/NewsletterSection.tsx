'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons as per saved preference
import { 
  EnvelopeIcon, 
  SparklesIcon, 
  PaperAirplaneIcon,
  CheckBadgeIcon 
} from '@heroicons/react/24/outline';

export default function NewsletterSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#D97706';
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Organic Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-50/50 dark:bg-zinc-900/50 rounded-[100%] blur-3xl -z-10" />
      
      <div className="max-w-5xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-12 md:p-20 text-center shadow-2xl"
        >
          {/* Decorative Sparkles */}
          <SparklesIcon className="absolute top-10 left-10 w-12 h-12 text-amber-400/20 animate-pulse" />
          <EnvelopeIcon className="absolute bottom-10 right-10 w-20 h-20 text-white/5 -rotate-12" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6">
                The Tasting Club
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-6">
                Get the <span style={{ color: primary }}>Secret Recipes</span> <br/>
                & Sweet Updates.
              </h2>
              <p className="text-slate-400 text-lg font-medium mb-10 italic">
                Join our inner circle and receive weekly treats, artisan tips, and exclusive early access to our seasonal collections.
              </p>
            </motion.div>

            {!subscribed ? (
              <motion.form 
                onSubmit={handleSubscribe}
                className="relative flex flex-col sm:flex-row gap-4 p-2 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10"
              >
                <div className="relative flex-grow">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="email" 
                    required
                    placeholder="Enter your email address..."
                    className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none font-medium"
                  />
                </div>
                <button 
                  type="submit"
                  style={{ backgroundColor: primary }}
                  className="group relative overflow-hidden px-8 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                  <span className="relative z-10">Join the Club</span>
                  <PaperAirplaneIcon className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </motion.form>
            ) : (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4 p-8 bg-amber-500/10 rounded-3xl border border-amber-500/20"
              >
                <CheckBadgeIcon className="w-12 h-12 text-amber-500" />
                <h3 className="text-white font-black text-xl">You're on the list!</h3>
                <p className="text-slate-400 text-sm">Check your inbox for a sweet welcome surprise.</p>
              </motion.div>
            )}

            <p className="mt-8 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              No Spam. Just Sugar. Unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}