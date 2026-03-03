'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-24 bg-white border-t border-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-[#0D4C4F] rounded-[3rem] overflow-hidden relative shadow-2xl">
          
          {/* Subtle Background Element */}
          <div className="absolute top-0 right-0 p-20 opacity-[0.05] pointer-events-none">
             <EnvelopeIcon className="w-64 h-64 text-white" />
          </div>

          <div className="flex flex-col lg:flex-row items-stretch">
            
            {/* 1. Image Side: The Mood */}
            <div className="lg:w-5/12 relative min-h-[300px] lg:min-h-full">
              <img 
                src="https://images.unsplash.com/photo-1508243529287-e21914733111?q=80&w=1200&auto=format&fit=crop" 
                alt="Lifestyle" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D4C4F] via-transparent to-transparent lg:hidden" />
            </div>

            {/* 2. Content Side: The Invitation */}
            <div className="lg:w-7/12 p-10 md:p-20 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-px w-8 bg-[#F3A852]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F3A852]">
                    The Private Circle
                  </span>
                </div>

                <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-8">
                  Join the <span className="italic font-light">Journal.</span>
                </h2>

                <p className="text-white/60 text-base md:text-lg font-light leading-relaxed mb-10 max-w-md">
                  Receive curated perspectives on design, early access to new silhouettes, and exclusive seasonal invitations.
                </p>

                {!subscribed ? (
                  <form onSubmit={handleSubmit} className="relative max-w-md group">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 py-4 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F3A852] transition-colors font-light tracking-wide"
                    />
                    <button
                      type="submit"
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#F3A852] hover:text-white transition-colors"
                    >
                      <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center"
                  >
                    <p className="text-[#F3A852] font-serif italic text-xl">Welcome to the collective.</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">Check your inbox for your first invitation.</p>
                  </motion.div>
                )}

                <p className="mt-8 text-[9px] text-white/30 uppercase tracking-[0.2em]">
                  By subscribing, you agree to our <span className="text-white/60 hover:text-[#F3A852] cursor-pointer">Privacy Policy</span>.
                </p>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}