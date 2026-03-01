'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons as requested
import { 
  EnvelopeOpenIcon, 
  CheckCircleIcon, 
  SparklesIcon,
  GiftIcon,
  FaceSmileIcon // Using as a "Baby" placeholder icon
} from '@heroicons/react/24/solid';

export default function NewsletterSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F472B6';
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isHovering, setIsHovering] = useState(false);
  
  // Cursor Tracking Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth Spring Physics for the "Floating" feel
  const springConfig = { damping: 20, stiffness: 150 };
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
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <section 
      className="relative py-20 px-6 overflow-hidden cursor-none" // Hide default cursor
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {/* --- CUSTOM FLOATING CURSOR --- */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              translateX: cursorX,
              translateY: cursorY,
              left: -20,
              top: -20,
            }}
            className="pointer-events-none absolute z-50 flex items-center justify-center"
          >
            {/* The "Bubble" around the icon */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
              style={{ backgroundColor: primary }}
            >
              <FaceSmileIcon className="w-6 h-6 text-white animate-bounce" />
            </div>
            {/* Trail Effect */}
            <div className="absolute inset-0 bg-pink-200 rounded-full blur-xl opacity-30 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Soft Background "Cloud" */}
      <div 
        className="absolute inset-0 z-0 opacity-5"
        style={{ 
          background: `radial-gradient(circle at 70% 50%, ${primary}, transparent 70%)` 
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <div 
          className="relative bg-white rounded-[4rem] p-8 md:p-16 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden"
        >
          {/* Decorative Corner Icon */}
          <div className="absolute -top-6 -right-6 opacity-10 rotate-12">
            <GiftIcon className="w-32 h-32" style={{ color: primary }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            
            {/* Left Side: Content */}
            <div className="lg:col-span-3 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100">
                <SparklesIcon className="w-4 h-4" style={{ color: primary }} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Member Benefits
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1]">
                Every little bit of <span style={{ color: primary }}>love</span> helps.
              </h2>
              
              <p className="text-lg text-slate-500 font-medium max-w-md">
                Sign up for <span className="text-slate-900 font-bold">15% off</span> your first order.
              </p>

              <ul className="space-y-3">
                {['Early Access to Sales', 'New Arrival Alerts', 'Parenting Tips'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-400">
                    <CheckCircleIcon className="w-5 h-5" style={{ color: primary }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Side: Interactive Form */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="relative group cursor-text"> {/* Return cursor for inputs */}
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <EnvelopeOpenIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="mama@example.com"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-100 focus:bg-white rounded-[2rem] py-5 pl-14 pr-6 text-slate-900 font-medium placeholder:text-slate-300 outline-none transition-all shadow-inner"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full py-5 rounded-[2rem] text-white font-black text-lg shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-3 cursor-pointer"
                      style={{ backgroundColor: primary }}
                    >
                      {status === 'loading' ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Join the Village</>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 px-6 bg-emerald-50 rounded-[3rem] border border-emerald-100"
                  >
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100">
                      <CheckCircleIcon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-emerald-900 mb-2">You're in!</h3>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}