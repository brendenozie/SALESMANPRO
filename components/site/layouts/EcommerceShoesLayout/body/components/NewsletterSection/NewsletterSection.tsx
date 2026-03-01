'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useStore } from '@/contexts/StoreContext';

const NewsletterSection = () => {
  const store = useStore();
  const primaryColor = store?.storeFormData?.themeSettings?.primaryColor || '#ef4444';
  const [email, setEmail] = useState('');

  return (
    <section className="relative py-24 bg-zinc-950 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 right-10 text-[12rem] font-black italic tracking-tighter leading-none select-none text-white">
          JOIN THE <br /> CREW.
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
          
          {/* Accent Glow */}
          <div 
            className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[100px] opacity-20"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="flex-grow text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
            >
              <SparklesIcon className="w-4 h-4" style={{ color: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Priority Drop Alerts
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-6">
              Don't Miss <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
                The Next Drop.
              </span>
            </h2>
            
            <p className="text-zinc-400 text-lg max-w-sm mx-auto lg:mx-0 font-medium">
              Get 15% off your first order and exclusive access to limited-edition releases.
            </p>
          </div>

          <div className="w-full lg:w-auto flex-shrink-0">
            <form 
              onSubmit={(e) => e.preventDefault()}
              className="relative max-w-md mx-auto lg:mx-0 w-full"
            >
              <div className="group relative flex items-center transition-all duration-300">
                <EnvelopeIcon className="absolute left-4 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-32 py-5 bg-zinc-950 border border-white/10 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-all font-medium"
                />
                <button 
                  className="absolute right-2 px-6 py-3 rounded-xl text-white font-black uppercase italic tracking-tighter text-sm flex items-center gap-2 group/btn transition-transform active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  Join
                  <ChevronRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Security Badge */}
              <p className="mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center lg:text-left">
                No Spam. Just Heat. // Secure Subscription
              </p>
            </form>
          </div>
        </div>

        {/* Brand Loyalty Stats */}
        <div className="mt-12 flex justify-center gap-8 md:gap-16 opacity-30 grayscale invert dark:invert-0">
            <span className="text-xs font-black italic tracking-widest text-white uppercase">Fast Delivery</span>
            <span className="text-xs font-black italic tracking-widest text-white uppercase underline decoration-2" style={{ textDecorationColor: primaryColor }}>Elite Rewards</span>
            <span className="text-xs font-black italic tracking-widest text-white uppercase">Secure Checkout</span>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;