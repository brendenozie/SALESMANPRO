'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, SparklesIcon, ChevronRightIcon, FireIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

const NewsletterSection = () => {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#ef4444';
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section className="relative py-32 bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      {/* --- Kinetic Background --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.05] select-none">
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-around">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: i % 2 === 0 ? -100 : 100 }}
              animate={{ x: i % 2 === 0 ? 100 : -100 }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear", repeatType: "mirror" }}
              className="text-[15vw] font-black italic tracking-tighter text-black dark:text-white whitespace-nowrap leading-none"
            >
              MEMBERS ONLY CLUB ACCESS JOIN THE CREW
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="relative bg-zinc-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-white/10 rounded-[3rem] p-8 md:p-20 overflow-hidden shadow-2xl backdrop-blur-3xl transition-all">
          
          {/* Dynamic Glow Orb */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.15, 0.05] 
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px]"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5 mb-8 shadow-sm"
              >
                <SparklesIcon className="w-4 h-4" style={{ color: primaryColor }} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-zinc-300">
                  Exclusive Drop Access
                </span>
              </motion.div>

              <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase leading-[0.85] mb-8">
                The Inner <br />
                <span className="text-transparent" style={{ WebkitTextStroke: `1.5px ${isFocused ? primaryColor : 'currentColor'}` }}>
                  Circle.
                </span>
              </h2>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 text-gray-400 dark:text-zinc-400 font-bold mb-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover grayscale" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest">+12k joined this week</p>
              </div>

              <p className="text-gray-500 dark:text-zinc-400 text-lg max-w-sm mx-auto lg:mx-0 leading-relaxed font-medium">
                Be the first to know about secret restocks and get <span className="text-gray-900 dark:text-white font-black underline decoration-2" style={{ textDecorationColor: primaryColor }}>15% OFF</span> your next order.
              </p>
            </div>

            <div className="relative group">
              <form 
                onSubmit={(e) => e.preventDefault()}
                className={`transition-all duration-500 transform ${isFocused ? 'scale-105' : 'scale-100'}`}
              >
                <div className="relative">
                  <div className={`absolute -inset-1 rounded-[2rem] blur opacity-20 transition duration-500 ${isFocused ? 'opacity-40' : 'opacity-0'}`} style={{ backgroundColor: primaryColor }} />
                  
                  <div className="relative flex flex-col gap-4">
                    <div className="relative flex items-center group/input">
                      <EnvelopeIcon className={`absolute left-6 w-6 h-6 transition-colors duration-300 ${isFocused ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-zinc-600'}`} />
                      <input
                        type="email"
                        value={email}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-16 pr-6 py-6 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-gray-900 dark:focus:border-white/20 transition-all text-lg font-bold shadow-inner"
                      />
                    </div>
                    
                    <button 
                      className="group relative w-full py-6 rounded-2xl text-white font-black uppercase italic tracking-widest flex items-center justify-center gap-3 overflow-hidden transition-all active:scale-95 shadow-xl"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        Claim Access
                        <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-black/10 dark:bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center lg:justify-start gap-4">
                  <div className="flex items-center gap-2">
                    <FireIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Limited slots available</span>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>

        {/* Brand Bar */}
        <div className="mt-20 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-40 dark:opacity-20">
            {['Fast Delivery', 'Eco-Packaging', 'Secure Pay', '24/7 Support'].map((label) => (
              <span key={label} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white italic">
                {label}
              </span>
            ))}
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;