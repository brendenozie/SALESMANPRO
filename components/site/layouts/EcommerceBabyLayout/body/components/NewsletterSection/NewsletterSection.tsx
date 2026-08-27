'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons as requested
import { 
  CheckCircleIcon, 
  SparklesIcon,
  GiftIcon,
  FaceSmileIcon,
  HeartIcon,
  UserIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';

export default function ContactSection({ className }: { className?: string }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F472B6';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/conversations/send-to-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: storeFormData?._id || storeFormData?.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.message || 'Failed to dispatch message. Please try again.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error('Contact Submission Error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Inquiry delivery failed.');
    }
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
            className="pointer-events-none absolute z-50 flex items-center justify-center hidden md:flex"
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
            <div className="lg:col-span-6 space-y-8 text-left">
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
                We are here to <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 italic" style={{ color: primary }}>support</span>
                  <motion.svg 
                    viewBox="0 0 100 20" 
                    className="absolute -bottom-2 left-0 w-full h-4 opacity-30"
                    style={{ color: primary }}
                  >
                    <path d="M0 10 Q 25 20 50 10 T 100 10" fill="none" stroke="currentColor" strokeWidth="4" />
                  </motion.svg>
                </span> you.
              </h2>
              
              <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-lg leading-relaxed">
                Have questions about sizing, nursery delivery, or custom gift designs? Send us a note and we will reply within <span className="text-zinc-900 dark:text-white font-black underline decoration-pink-300">24 HOURS</span>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['24/7 Parent Support', 'Hassle-Free Returns', 'Personalized Advice', 'Friendly Care Team'].map((item) => (
                  <div key={item} className="flex items-center gap-3 group">
                    <div className="p-1 rounded-full bg-zinc-50 dark:bg-zinc-800 group-hover:scale-110 transition-transform">
                      <CheckCircleIcon className="w-5 h-5" style={{ color: primary }} />
                    </div>
                    <span className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Contact Form */}
            <div className="lg:col-span-6 relative">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.div 
                    key="form-container"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name Field */}
                      <div 
                        className="relative group cursor-text transition-all duration-300 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border-2"
                        style={{ 
                          borderColor: focusedField === 'name' ? primary : 'transparent'
                        }}
                      >
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
                          <UserIcon 
                            className="h-5 w-5 transition-colors" 
                            style={{ color: focusedField === 'name' ? primary : '#D1D5DB' }}
                          />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="YOUR NAME"
                          value={formData.name}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-transparent py-5 pl-16 pr-8 text-zinc-900 dark:text-white font-bold text-sm placeholder:text-zinc-300 dark:placeholder:text-zinc-600 outline-none uppercase tracking-wider"
                        />
                      </div>

                      {/* Email Field */}
                      <div 
                        className="relative group cursor-text transition-all duration-300 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border-2"
                        style={{ 
                          borderColor: focusedField === 'email' ? primary : 'transparent'
                        }}
                      >
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
                          <EnvelopeIcon 
                            className="h-5 w-5 transition-colors" 
                            style={{ color: focusedField === 'email' ? primary : '#D1D5DB' }}
                          />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="EMAIL ADDRESS"
                          value={formData.email}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-transparent py-5 pl-16 pr-8 text-zinc-900 dark:text-white font-bold text-sm placeholder:text-zinc-300 dark:placeholder:text-zinc-600 outline-none uppercase tracking-wider"
                        />
                      </div>

                      {/* Message Field */}
                      <div 
                        className="relative group cursor-text transition-all duration-300 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border-2"
                        style={{ 
                          borderColor: focusedField === 'message' ? primary : 'transparent'
                        }}
                      >
                        <div className="absolute left-6 top-5 flex items-center pointer-events-none z-10">
                          <ChatBubbleBottomCenterTextIcon 
                            className="h-5 w-5 transition-colors" 
                            style={{ color: focusedField === 'message' ? primary : '#D1D5DB' }}
                          />
                        </div>
                        <textarea
                          required
                          rows={4}
                          placeholder="HOW CAN WE HELP YOU?"
                          value={formData.message}
                          onFocus={() => setFocusedField('message')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full bg-transparent py-5 pl-16 pr-8 text-zinc-900 dark:text-white font-bold text-sm placeholder:text-zinc-300 dark:placeholder:text-zinc-600 outline-none resize-none uppercase tracking-wider"
                        />
                      </div>

                      {/* Error Banner inside app layout */}
                      {status === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold"
                        >
                          <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                          <p className="flex-1 uppercase tracking-wider">{errorMessage}</p>
                          <button
                            type="button"
                            onClick={() => setStatus('idle')}
                            className="underline font-black hover:text-red-400"
                          >
                            RETRY
                          </button>
                        </motion.div>
                      )}

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === 'loading'}
                        className="relative w-full py-6 rounded-[2.5rem] text-white font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 overflow-hidden group/btn disabled:opacity-60"
                        style={{ backgroundColor: primary }}
                      >
                        {status === 'loading' ? (
                          <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <HeartIcon className="w-6 h-6 group-hover/btn:animate-ping" />
                            Send Message
                          </>
                        )}
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                      </motion.button>
                    </form>
                    <p className="mt-6 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Your details are safe. We never sell your data.
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
                    <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Message Sent!</h3>
                    <p className="text-zinc-400 font-medium">Thank you. One of our specialists will be in touch shortly.</p>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="mt-6 text-xs font-black uppercase tracking-widest text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded-2xl px-6 py-3 transition-colors"
                    >
                      Send another message
                    </button>
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