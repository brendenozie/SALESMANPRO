'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons as requested
import { 
  EnvelopeOpenIcon, 
  CheckCircleIcon, 
  SparklesIcon,
  GiftIcon,
  FaceSmileIcon,
  HeartIcon
} from '@heroicons/react/24/solid';

export default function NewsletterSection({className}: {className?: string}) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F472B6';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isHovering, setIsHovering] = useState(false);
  
  // Cursor Tracking Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth Spring Physics
  const springConfig = { damping: 25, stiffness: 200 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Background Parallax Effect
  const bgX = useTransform(mouseX, [0, 1000], [5, -5]);
  const bgY = useTransform(mouseY, [0, 1000], [5, -5]);

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
      className={`relative py-28 px-6 overflow-hidden cursor-none ${className || ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {/* --- CUSTOM INTERACTIVE CURSOR --- */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              translateX: cursorX,
              translateY: cursorY,
              left: -24,
              top: -24,
            }}
            className="pointer-events-none absolute z-50 flex items-center justify-center"
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/50 backdrop-blur-sm"
              style={{ backgroundColor: `${primary}CC` }}
            >
              <FaceSmileIcon className="w-6 h-6 text-white animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Ambient Background */}
      <motion.div 
        style={{ x: bgX, y: bgY }}
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
      >
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ backgroundColor: primary }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ backgroundColor: secondary }} />
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-[5rem] p-10 md:p-20 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.08)] border border-white dark:border-zinc-800 overflow-hidden"
        >
          {/* Decorative Corner Elements */}
          <div className="absolute -top-10 -right-10 opacity-[0.03] dark:opacity-[0.05] -rotate-12 group">
            <GiftIcon className="w-64 h-64" style={{ color: primary }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Side: Editorial Content */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i + 40}`} className="w-8 h-8 rounded-full border-2 border-white" alt="avatar" />
                  ))}
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  Joined by 12,000+ Parents
                </span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white leading-none tracking-tighter">
                Every little bit of <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 italic" style={{ color: primary }}>love</span>
                  <motion.svg 
                    viewBox="0 0 100 20" 
                    className="absolute -bottom-2 left-0 w-full h-4 opacity-30"
                    style={{ color: primary }}
                  >
                    <path d="M0 10 Q 25 20 50 10 T 100 10" fill="none" stroke="currentColor" strokeWidth="4" />
                  </motion.svg>
                </span> helps.
              </h2>
              
              <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-lg leading-relaxed">
                Join our village today and take <span className="text-zinc-900 dark:text-white font-black underline decoration-pink-300">15% OFF</span> your first nursery essential.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Early VIP Access', 'Weekly Care Tips', 'Birthday Surprises', 'Exclusive Drops'].map((item) => (
                  <div key={item} className="flex items-center gap-3 group">
                    <div className="p-1 rounded-full bg-zinc-50 dark:bg-zinc-800 group-hover:scale-110 transition-transform">
                      <CheckCircleIcon className="w-5 h-5" style={{ color: primary }} />
                    </div>
                    <span className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: High-Engagement Form */}
            <div className="lg:col-span-5 relative">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.div 
                    key="form-container"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative group cursor-text">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
                          <EnvelopeOpenIcon className="h-6 w-6 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="hello@newmama.com"
                          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-zinc-200 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 rounded-[2.5rem] py-6 pl-16 pr-8 text-zinc-900 dark:text-white font-bold text-lg placeholder:text-zinc-300 dark:placeholder:text-zinc-600 outline-none transition-all shadow-inner"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === 'loading'}
                        className="relative w-full py-6 rounded-[2.5rem] text-white font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 overflow-hidden group/btn"
                        style={{ backgroundColor: primary }}
                      >
                        {status === 'loading' ? (
                          <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <HeartIcon className="w-6 h-6 group-hover/btn:animate-ping" />
                            Join the Village
                          </>
                        )}
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                      </motion.button>
                    </form>
                    <p className="mt-6 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      No spam, just soft things. Unsubscribe anytime.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, rotate: -5 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    className="text-center py-16 px-8 bg-zinc-900 rounded-[4rem] border border-zinc-800 shadow-3xl"
                  >
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ type: "spring", bounce: 0.6 }}
                      className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20"
                    >
                      <SparklesIcon className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">Welcome Home!</h3>
                    <p className="text-zinc-400 font-medium">Check your inbox for your 15% discount code.</p>
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