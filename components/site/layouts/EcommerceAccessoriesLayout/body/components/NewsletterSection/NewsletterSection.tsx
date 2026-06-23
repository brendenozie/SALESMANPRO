'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  CheckCircleIcon, 
  FireIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  CheckBadgeIcon,
  BellAlertIcon
} from '@heroicons/react/24/solid';

export default function AutomotiveDispatchSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#EF4444'; // Racing Red
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isHovering, setIsHovering] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300 };
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
      className="relative py-32 md:py-40 px-6 overflow-hidden bg-zinc-50 dark:bg-[#09090b] cursor-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {/* --- AUTOMOTIVE TELEMETRY CURSOR --- */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ translateX: cursorX, translateY: cursorY, left: -24, top: -24 }}
            className="pointer-events-none absolute z-50 flex items-center justify-center mix-blend-difference dark:mix-blend-normal"
          >
            {/* RPM Dial Cursor Design */}
            <div className="relative w-12 h-12 rounded-full border-2 border-white/50 dark:border-zinc-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]" style={{ borderColor: primaryColor }}>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-t-2 border-transparent"
                style={{ borderTopColor: primaryColor }}
              />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="relative bg-white dark:bg-[#0c0c0e] rounded-[2rem] md:rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 md:p-16 lg:p-24 overflow-hidden"
        >
          {/* Background Carbon & Speed Textures */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_11px)]" />
          
          {/* Ambient Redline Glow */}
          <div 
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
            
            {/* Left Content: The Pitch */}
            <div className="lg:col-span-7 space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-white">
                <BellAlertIcon className="w-4 h-4 animate-bounce" style={{ color: primaryColor }} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 dark:text-zinc-400">
                  Pit Crew Dispatch
                </span>
              </div>
              
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-zinc-900 dark:text-white leading-[0.9] tracking-tighter uppercase italic drop-shadow-sm">
                Join The <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-900 dark:from-zinc-400 dark:to-white">
                  Starting Grid
                </span>
              </h2>
              
              <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-xl leading-relaxed uppercase tracking-widest">
                Subscribe to our tuning network for <span className="text-zinc-900 dark:text-white font-black border-b-2 pb-0.5" style={{ borderColor: primaryColor }}>Priority Part Drops</span>, exclusive garage discounts, and performance schematics.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {[
                  'Early Access to OEM Parts', 
                  'VIP Tuning Guides', 
                  'Priority Regional Dispatch', 
                  'Flash Sale Alerts'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-4 group">
                    <div className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:scale-110 transition-transform">
                      <CheckCircleIcon className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content: The Ignition Form */}
            <div className="lg:col-span-5 relative">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 bg-gradient-to-br from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-[2.5rem] opacity-50 blur-xl -z-10" />
              
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    className="p-8 md:p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl relative overflow-hidden group"
                  >
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor }} />

                    <div className="flex gap-2 mb-8">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">
                          <WrenchScrewdriverIcon className="w-3 h-3" />
                          Driver Email Address
                        </label>
                        <div className="relative group/input">
                          <input
                            type="email"
                            required
                            placeholder="DRIVER@GARAGE.COM"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl py-5 px-6 text-zinc-900 dark:text-white font-mono text-sm outline-none transition-all focus:border-transparent focus:ring-2"
                            style={{ '--tw-ring-color': primaryColor } as any}
                          />
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-5 rounded-xl text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {status === 'loading' ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <FireIcon className="w-5 h-5" />
                            Ignite Engine
                          </>
                        )}
                      </motion.button>
                      <p className="text-center text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                        Zero spam. Only high-performance updates.
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-12 md:p-16 rounded-3xl text-center relative overflow-hidden"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_11px)]" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl">
                        <CheckBadgeIcon className="w-12 h-12" style={{ color: primaryColor }} />
                      </div>
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-3 text-white drop-shadow-md">
                        Clear to Race
                      </h3>
                      <p className="font-bold uppercase text-xs tracking-widest text-white/90">
                        Driver registered. Awaiting next drop signal.
                      </p>
                    </div>
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