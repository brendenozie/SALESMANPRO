'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  return (
    <section className="py-24 bg-white px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto relative overflow-hidden rounded-[3rem] bg-[#3E2723] p-12 md:p-20 text-center"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 rounded-full bg-[#F3A852] opacity-10 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 rounded-full bg-[#8B4513] opacity-20 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Icon Badge */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F3A852]/10 text-[#F3A852] mb-8"
          >
            <SparklesIcon className="w-8 h-8" />
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
            Join the <span className="text-[#F3A852]">Inner Circle</span>
          </h2>
          
          <p className="text-stone-300 font-medium text-lg mb-10 leading-relaxed">
            Get early access to small-batch roasts, secret recipes, and 15% off your first jar. No spam, just the good stuff.
          </p>

          <form 
            onSubmit={(e) => e.preventDefault()}
            className="relative flex flex-col sm:flex-row gap-3 p-2 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 group focus-within:border-[#F3A852]/50 transition-all duration-300"
          >
            <div className="flex-grow flex items-center px-4">
              <EnvelopeIcon className="w-6 h-6 text-stone-500 mr-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-transparent py-4 text-white placeholder-stone-500 outline-none font-medium"
                required
              />
            </div>
            
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-[#F3A852] hover:bg-[#ffb966] text-[#3E2723] font-black uppercase tracking-widest text-xs rounded-[1.5rem] transition-all duration-300 hover:shadow-[0_0_30px_rgba(243,168,82,0.3)] active:scale-95">
              Secure 15% Off
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Trust Indicator */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-[10px] text-stone-500 uppercase tracking-[0.3em] font-bold"
          >
            Privacy First • Trusted by 10k+ spreaders
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

export default NewsletterSection;