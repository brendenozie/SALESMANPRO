'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  CheckBadgeIcon, 
  ArrowRightIcon, 
  UserIcon, 
  PhoneIcon, 
  ChatBubbleBottomCenterTextIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#6366f1';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#a855f7';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/conversations/send-to-admin`, {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Failed to send message. Please try again.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      console.error('Contact Form Submission Error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-black overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="relative rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-900"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          {/* Layered High-End Ambient Background Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                x: [0, 20, 0],
                y: [0, -20, 0] 
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -right-20 w-72 h-72 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                x: [0, -30, 0],
                y: [0, 15, 0] 
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute -bottom-20 -left-20 w-64 h-64 sm:w-80 sm:h-80 bg-black/10 rounded-full blur-2xl" 
            />
            
            {/* Fine Geometry Overlay Mesh */}
            <svg className="absolute inset-0 h-full w-full opacity-[0.04] mix-blend-overlay" fill="none" viewBox="0 0 400 400">
              <defs>
                <pattern id="contact-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#contact-grid)" />
            </svg>
          </div>

          <div className="relative z-10 px-6 py-12 sm:p-16 md:px-20 md:py-24 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            
            {/* Typography Content Layer */}
            <div className="max-w-xl text-center lg:text-left flex flex-col items-center lg:items-start">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white mb-4 sm:mb-6 shadow-sm"
              >
                <EnvelopeIcon className="w-3.5 h-3.5 text-white animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.25em]">
                  Let's Connect
                </span>
              </motion.div>
              
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-[1.15] md:leading-[1.05] mb-4">
                Have Questions? <br className="hidden sm:inline" />
                <span className="text-white/80 italic font-serif font-light">Get in Touch.</span>
              </h2>
              <p className="text-white/85 text-sm sm:text-base md:text-lg font-medium max-w-md leading-relaxed">
                Whether you have a question about our storefront services, customized business solutions, or just want to share feedback—we're here to help.
              </p>
            </div>

            {/* Interactive State Management Form Frame */}
            <div className="w-full max-w-lg shrink-0">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white/95 backdrop-blur-xl dark:bg-zinc-900/95 rounded-[2rem] p-8 sm:p-12 text-center shadow-2xl border border-white/20"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-4">
                      <CheckBadgeIcon className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                      Message Received!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-xs mx-auto leading-relaxed">
                      Thank you for reaching out. We have logged your request and our support crew will get back to you shortly.
                    </p>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="w-full flex flex-col gap-4"
                  >
                    {/* Responsive Double Column Grid for Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name Input */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="contact-name" className="text-[9px] font-black uppercase tracking-widest text-white/70 px-1">
                          Full Name
                        </label>
                        <div className="relative flex items-center rounded-2xl bg-black/10 dark:bg-white/10 backdrop-blur-xl border border-white/25 focus-within:ring-2 focus-within:ring-white/40 transition-all shadow-inner">
                          <UserIcon className="absolute left-4 w-5 h-5 text-white/50" />
                          <input
                            id="contact-name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full bg-transparent pl-12 pr-5 py-3.5 rounded-2xl text-white placeholder:text-white/40 focus:outline-none font-medium text-sm"
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="contact-email" className="text-[9px] font-black uppercase tracking-widest text-white/70 px-1">
                          Email Address
                        </label>
                        <div className="relative flex items-center rounded-2xl bg-black/10 dark:bg-white/10 backdrop-blur-xl border border-white/25 focus-within:ring-2 focus-within:ring-white/40 transition-all shadow-inner">
                          <EnvelopeIcon className="absolute left-4 w-5 h-5 text-white/50" />
                          <input
                            id="contact-email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            className="w-full bg-transparent pl-12 pr-5 py-3.5 rounded-2xl text-white placeholder:text-white/40 focus:outline-none font-medium text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-phone" className="text-[9px] font-black uppercase tracking-widest text-white/70 px-1">
                        Phone Number (Optional)
                      </label>
                      <div className="relative flex items-center rounded-2xl bg-black/10 dark:bg-white/10 backdrop-blur-xl border border-white/25 focus-within:ring-2 focus-within:ring-white/40 transition-all shadow-inner">
                        <PhoneIcon className="absolute left-4 w-5 h-5 text-white/50" />
                        <input
                          id="contact-phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+254 700 000 000"
                          className="w-full bg-transparent pl-12 pr-5 py-3.5 rounded-2xl text-white placeholder:text-white/40 focus:outline-none font-medium text-sm"
                        />
                      </div>
                    </div>

                    {/* Message Textarea */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-message" className="text-[9px] font-black uppercase tracking-widest text-white/70 px-1">
                        Message
                      </label>
                      <div className="relative flex items-start rounded-2xl bg-black/10 dark:bg-white/10 backdrop-blur-xl border border-white/25 focus-within:ring-2 focus-within:ring-white/40 transition-all shadow-inner">
                        <ChatBubbleBottomCenterTextIcon className="absolute left-4 top-4 w-5 h-5 text-white/50" />
                        <textarea
                          id="contact-message"
                          required
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Tell us how we can help..."
                          className="w-full bg-transparent pl-12 pr-5 py-3.5 rounded-2xl text-white placeholder:text-white/40 focus:outline-none font-medium text-sm resize-none"
                        />
                      </div>
                    </div>

                    {/* API Submission Error Banner */}
                    {status === 'error' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/20 border border-red-500/30 text-white text-xs font-semibold"
                      >
                        <ExclamationCircleIcon className="w-5 h-5 shrink-0 text-red-200" />
                        <p className="flex-1">{errorMessage}</p>
                        <button 
                          type="button"
                          onClick={() => setStatus('idle')}
                          className="underline hover:text-red-100 font-bold ml-2 uppercase text-[10px]"
                        >
                          Try Again
                        </button>
                      </motion.div>
                    )}

                    {/* Submission Button */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={status === 'loading'}
                      className="w-full mt-2 py-4 px-6 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {status === 'loading' ? (
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Send Message
                          <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}