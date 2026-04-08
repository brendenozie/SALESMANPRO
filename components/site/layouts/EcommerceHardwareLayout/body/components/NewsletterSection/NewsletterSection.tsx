'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeOpenIcon, 
  CheckCircleIcon, 
  SparklesIcon,
  CpuChipIcon,
  CommandLineIcon,
  BoltIcon
} from '@heroicons/react/24/solid';

export default function NetworkIntegrationSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isHovering, setIsHovering] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 250 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => setStatus('success'), 2000);
  };

  return (
    <section 
      className="relative py-40 px-6 overflow-hidden bg-white dark:bg-[#050505] cursor-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {/* --- TACTICAL HUD CURSOR --- */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ translateX: cursorX, translateY: cursorY, left: -32, top: -32 }}
            className="pointer-events-none absolute z-50 flex items-center justify-center"
          >
            <div className="relative w-16 h-16 border border-amber-500/50 rounded-full flex items-center justify-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-2 bg-amber-500" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-2 bg-amber-500" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px bg-amber-500" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-px bg-amber-500" />
              <CommandLineIcon className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative bg-zinc-900 dark:bg-black border-4 border-zinc-800 p-12 md:p-24 overflow-hidden"
        >
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center relative z-10">
            
            {/* Left Content: The Mission */}
            <div className="lg:col-span-7 space-y-10">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">
                  Network Integration v2.6
                </span>
              </div>
              
              <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase italic">
                Sync with the <br />
                <span className="text-transparent" style={{ WebkitTextStroke: '1px #F59E0B' }}>Core System</span>
              </h2>
              
              <p className="text-xl text-zinc-400 font-bold max-w-xl leading-snug uppercase tracking-tighter">
                Join our technical dispatch for <span className="text-white border-b-2 border-amber-500">Early Hardware Drops</span> and regional industrial updates.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['Direct API Keys', 'Hardware Schematics', 'Regional Scaling', 'Security Patch Logs'].map((item) => (
                  <div key={item} className="flex items-center gap-4 group">
                    <CheckCircleIcon className="w-5 h-5 text-amber-500 group-hover:rotate-90 transition-transform" />
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content: The Terminal */}
            <div className="lg:col-span-5">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.div 
                    key="terminal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8 bg-black border-2 border-zinc-800 shadow-[20px_20px_0px_0px_rgba(39,39,42,1)]"
                  >
                    <div className="flex gap-2 mb-8">
                      <div className="w-3 h-3 rounded-full bg-red-500/20" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Operator Email Address</label>
                        <div className="relative group">
                          <input
                            type="email"
                            required
                            placeholder="ADMIN@SALESMANPRO.NET"
                            className="w-full bg-zinc-900 border-2 border-zinc-800 focus:border-amber-500 py-5 px-6 text-white font-mono text-sm outline-none transition-all"
                          />
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-6 bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all hover:bg-white"
                      >
                        {status === 'loading' ? (
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <BoltIcon className="w-5 h-5" />
                            Initialize Sync
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-16 bg-amber-500 text-black text-center"
                  >
                    <CpuChipIcon className="w-20 h-20 mx-auto mb-6 animate-bounce" />
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Sync Complete</h3>
                    <p className="font-bold uppercase text-xs tracking-widest">Operator access granted. Check comms.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}