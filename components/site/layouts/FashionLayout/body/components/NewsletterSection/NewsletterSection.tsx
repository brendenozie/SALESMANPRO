'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  ArrowRightIcon, 
  CheckBadgeIcon 
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#ef4444';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="relative py-24 bg-white dark:bg-zinc-950 transition-colors duration-500 overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-20 pointer-events-none">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] blur-[120px] rounded-full"
          style={{ backgroundColor: `${primaryColor}60` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          
          {/* Content Side */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <EnvelopeIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">
                Inner Circle
              </span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
              Get Priority <br />
              <span className="text-transparent" style={{ WebkitTextStroke: `1px ${primaryColor}` }}>
                Access
              </span>
            </h2>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
              Join our private list for early drop alerts, member-only pricing, 
              and exclusive invitations to the seasonal vault.
            </p>
          </div>

          {/* Form Side */}
          <div className="flex-1 w-full max-w-xl">
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleSubmit}
                  className="relative group"
                >
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      required
                      placeholder="ENTER YOUR EMAIL"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-white/10 py-6 text-lg font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors uppercase tracking-widest"
                    />
                    <button
                      type="submit"
                      className="absolute right-0 p-4 text-zinc-900 dark:text-white hover:scale-110 transition-transform"
                      aria-label="Subscribe"
                    >
                      <ArrowRightIcon className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Animated Accent Underline */}
                  <motion.div 
                    className="h-0.5 mt-[-2px] origin-left"
                    style={{ backgroundColor: primaryColor }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1, ease: "circOut" }}
                  />
                  
                  <p className="mt-4 text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                    By joining, you agree to our Privacy Policy & Terms.
                  </p>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-10 border border-zinc-100 dark:border-white/10 rounded-[2rem] bg-zinc-50/50 dark:bg-white/5 backdrop-blur-xl text-center shadow-xl dark:shadow-none"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    <CheckBadgeIcon className="w-10 h-10" />
                  </motion.div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-2">
                    Member Confirmed
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    The vault doors are now open for you.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Newsletter;