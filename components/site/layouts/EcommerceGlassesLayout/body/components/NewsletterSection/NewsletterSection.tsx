'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons Outline as per your workspace configurations
import { 
  EnvelopeIcon, 
  ArrowRightIcon, 
  UserIcon, 
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F3A852'; // Defers to brand color or golden fallback

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/conversations/send-to-admin`, {
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
        throw new Error(errorData?.message || 'Failed to deliver message. Please try again.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Inquiry failed to dispatch.');
    }
  };

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 border-t border-gray-50 dark:border-zinc-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-[#0D4C4F] rounded-[3rem] overflow-hidden relative shadow-2xl">
          
          {/* Subtle Background Decorative Asset */}
          <div className="absolute top-0 right-0 p-20 opacity-[0.05] pointer-events-none">
             <EnvelopeIcon className="w-64 h-64 text-white" />
          </div>

          <div className="flex flex-col lg:flex-row items-stretch">
            
            {/* 1. Image Side: The Mood */}
            <div className="lg:w-5/12 relative min-h-[300px] lg:min-h-full">
              <img 
                src="https://images.unsplash.com/photo-1508243529287-e21914733111?q=80&w=1200&auto=format&fit=crop" 
                alt="Bespoke Lifestyle" 
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
                  <span className="h-px w-8" style={{ backgroundColor: primary }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: primary }}>
                    Direct Studio Access
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {status !== 'success' ? (
                    <motion.div
                      key="form-fields-wrapper"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-8">
                        Connect with the <span className="italic font-light">Studio.</span>
                      </h2>

                      <p className="text-white/60 text-sm md:text-base font-light leading-relaxed mb-10 max-w-md">
                        Have custom design questions, commission requests, or need assistance? Our studio team is here to support you.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                        
                        {/* Name Input */}
                        <div className="relative">
                          <UserIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                          <input
                            type="text"
                            required
                            placeholder="YOUR NAME"
                            value={formData.name}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-transparent border-b py-3 pl-8 pr-4 text-white placeholder:text-white/30 focus:outline-none transition-colors font-light tracking-widest text-xs uppercase"
                            style={{ borderBottomColor: focusedField === 'name' ? primary : 'rgba(255, 255, 255, 0.2)' }}
                          />
                        </div>

                        {/* Email Input */}
                        <div className="relative">
                          <EnvelopeIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                          <input
                            type="email"
                            required
                            placeholder="YOUR EMAIL ADDRESS"
                            value={formData.email}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-transparent border-b py-3 pl-8 pr-4 text-white placeholder:text-white/30 focus:outline-none transition-colors font-light tracking-widest text-xs uppercase"
                            style={{ borderBottomColor: focusedField === 'email' ? primary : 'rgba(255, 255, 255, 0.2)' }}
                          />
                        </div>

                        {/* Message Input */}
                        <div className="relative">
                          <ChatBubbleBottomCenterTextIcon className="absolute left-0 top-3 w-4 h-4 text-white/40 pointer-events-none" />
                          <textarea
                            required
                            rows={3}
                            placeholder="HOW CAN WE ASSIST YOU?"
                            value={formData.message}
                            onFocus={() => setFocusedField('message')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full bg-transparent border-b py-3 pl-8 pr-4 text-white placeholder:text-white/30 focus:outline-none transition-colors font-light tracking-widest text-xs uppercase resize-none"
                            style={{ borderBottomColor: focusedField === 'message' ? primary : 'rgba(255, 255, 255, 0.2)' }}
                          />
                        </div>

                        {/* Submission Error Banner */}
                        {status === 'error' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs tracking-wider uppercase font-medium"
                          >
                            <ExclamationCircleIcon className="w-5 h-5 shrink-0 text-rose-400" />
                            <p className="flex-1">{errorMessage}</p>
                            <button
                              type="button"
                              onClick={() => setStatus('idle')}
                              className="underline font-bold hover:text-rose-200 transition-colors"
                            >
                              RETRY
                            </button>
                          </motion.div>
                        )}

                        {/* Action Submit Trigger */}
                        <div className="flex justify-between items-center pt-4">
                          <span className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-medium">
                            Private & Secure Inquiry
                          </span>

                          <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="group flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] transition-colors disabled:opacity-50"
                            style={{ color: primary }}
                          >
                            {status === 'submitting' ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <span>Send Inquiry</span>
                                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="success-container"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center max-w-md"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className="font-serif italic text-2xl text-white">Thank you.</p>
                      <p className="text-white/60 text-sm font-light leading-relaxed mt-2">
                        Your message has reached our desk. A studio representative will reply to your email address shortly.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="text-[9px] uppercase tracking-widest mt-6 hover:underline transition-all"
                        style={{ color: primary }}
                      >
                        Submit another message
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="mt-8 text-[9px] text-white/30 uppercase tracking-[0.2em]">
                  By connecting, you agree to our <span className="text-white/60 hover:text-[#F3A852] cursor-pointer">Privacy Policy</span>.
                </p>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}