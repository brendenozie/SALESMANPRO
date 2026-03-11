'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PaperAirplaneIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate API call
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <section className="relative py-24 bg-white dark:bg-black overflow-hidden border-t border-zinc-200 dark:border-white/10 transition-colors duration-500">
      {/* Background HUD Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/5 skew-x-[-15deg] translate-x-20 pointer-events-none" />
      <div className="absolute left-10 top-1/2 -translate-y-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-red-600 to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 overflow-hidden shadow-2xl dark:shadow-none">
          
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
            
            {/* --- Left Column: The Briefing --- */}
            <div className="p-10 md:p-16 flex flex-col justify-center relative bg-white dark:bg-transparent">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-red-600/10 border border-red-600/30">
                  <EnvelopeIcon className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-mono text-xs tracking-[0.4em] text-red-600 dark:text-red-500 uppercase font-black">
                  Transmission_Nexus
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black italic text-zinc-900 dark:text-white uppercase tracking-tighter leading-none mb-6">
                GET THE <span className="text-red-600">INTEL_</span>
              </h2>
              
              <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium mb-10 max-w-md border-l-2 border-zinc-200 dark:border-white/10 pl-6 italic transition-colors">
                Subscribe to receive priority alerts on legendary drops, tactical updates, and exclusive empire rewards.
              </p>

              {/* Subscription Form */}
              <form onSubmit={handleSubmit} className="relative max-w-md">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 group">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ENTER_OPERATOR_EMAIL"
                      className="w-full bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 px-6 py-4 text-zinc-900 dark:text-white font-mono text-sm focus:outline-none focus:border-red-600 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-600 group-focus-within:w-full transition-all duration-500" />
                  </div>
                  
                  <button
                    disabled={status !== 'idle'}
                    className="relative px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-tighter italic hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}
                  >
                    {status === 'loading' ? 'ENCRYPTING...' : 
                     status === 'success' ? 'ACCESS_GRANTED' : 'JOIN_EMPIRE'}
                  </button>
                </div>

                {status === 'success' && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 font-mono text-[10px] text-green-600 dark:text-green-500 flex items-center gap-2 font-bold"
                  >
                    <ShieldCheckIcon className="w-4 h-4" /> SECURE UPLINK ESTABLISHED. CHECK YOUR INBOX.
                  </motion.p>
                )}
              </form>

              <div className="mt-12 flex items-center gap-6 opacity-40 dark:opacity-30 grayscale pointer-events-none hidden md:flex font-bold">
                <span className="font-mono text-[10px] text-zinc-600 dark:text-white uppercase tracking-widest">Protocol: 256-Bit SSL</span>
                <span className="font-mono text-[10px] text-zinc-600 dark:text-white uppercase tracking-widest">Region: Global_Node</span>
              </div>
            </div>

            {/* --- Right Column: The Visual --- */}
            <div className="relative min-h-[300px] lg:min-h-full overflow-hidden bg-zinc-900">
              <img
                src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070" 
                alt="Tactical Background"
                className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
              />
              {/* Gradient overlay adjusts to the left column's background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent dark:from-zinc-900 lg:from-white lg:dark:from-zinc-900" />
              <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay" />
              
              {/* Floating Data Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ 
                    y: [0, -10, 0],
                    rotateX: [0, 5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="p-8 border border-zinc-200/20 dark:border-white/20 bg-white/40 dark:bg-black/40 backdrop-blur-xl scale-75 md:scale-100 shadow-xl dark:shadow-none"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-red-600" />
                      <div className="w-1 h-1 bg-zinc-400 dark:bg-white/20" />
                    </div>
                    <span className="font-mono text-[8px] text-zinc-600 dark:text-white/40 italic font-bold">LIVE_FEED_09</span>
                  </div>
                  <div className="w-48 h-24 bg-red-600/10 dark:bg-red-600/20 flex items-center justify-center border border-red-600/30">
                    <PaperAirplaneIcon className="w-12 h-12 text-red-600 animate-pulse" />
                  </div>
                  <div className="mt-4 font-mono text-[10px] text-red-600 dark:text-red-500 uppercase tracking-tighter font-bold">
                    Awaiting_Operator_Authorization...
                  </div>
                </motion.div>
              </div>

              {/* Scanning Light Effect */}
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600/40 shadow-[0_0_15px_rgba(255,0,60,1)] animate-sweep" />
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes sweep {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .animate-sweep {
          animation: sweep 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </section>
  );
}