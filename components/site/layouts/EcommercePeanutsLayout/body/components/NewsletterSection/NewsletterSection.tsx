'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons Outline exclusively
import { 
  EnvelopeIcon, 
  SparklesIcon, 
  ArrowRightIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://127.0.0.1:3000/api';

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F3A852';

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
        throw new Error(errorData?.message || 'Something went wrong. Please try again.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to deliver your inquiry.');
    }
  };

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto relative overflow-hidden rounded-[3rem] bg-[#3E2723] p-12 md:p-20 text-center shadow-2xl"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse" style={{ backgroundColor: primary }} />
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 rounded-full bg-[#8B4513] opacity-20 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Icon Badge */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8 bg-white/5 border border-white/10"
          >
            <SparklesIcon className="w-8 h-8" style={{ color: primary }} />
          </motion.div>

          <AnimatePresence mode="wait">
            {status !== 'success' ? (
              <motion.div
                key="contact-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
                  Inquire <span style={{ color: primary }}>Personally</span>
                </h2>
                
                <p className="text-stone-300 font-medium text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                  Have inquiries about our seasonal batches, specialized orders, or custom reservations? Drop our curators a note.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto text-left">
                  
                  {/* Name Input */}
                  <div 
                    className="relative flex items-center px-4 bg-white/5 backdrop-blur-md rounded-2xl border transition-all duration-300"
                    style={{ borderColor: focusedField === 'name' ? primary : 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <UserIcon className="w-5 h-5 text-stone-500 mr-3 shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={formData.name}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-transparent py-4 text-white placeholder-stone-500 outline-none font-medium text-sm"
                    />
                  </div>

                  {/* Email Input */}
                  <div 
                    className="relative flex items-center px-4 bg-white/5 backdrop-blur-md rounded-2xl border transition-all duration-300"
                    style={{ borderColor: focusedField === 'email' ? primary : 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <EnvelopeIcon className="w-5 h-5 text-stone-500 mr-3 shrink-0" />
                    <input
                      type="email"
                      required
                      placeholder="Your Email"
                      value={formData.email}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-transparent py-4 text-white placeholder-stone-500 outline-none font-medium text-sm"
                    />
                  </div>

                  {/* Message Input */}
                  <div 
                    className="relative flex items-start px-4 py-3 bg-white/5 backdrop-blur-md rounded-2xl border transition-all duration-300"
                    style={{ borderColor: focusedField === 'message' ? primary : 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-stone-500 mr-3 mt-1 shrink-0" />
                    <textarea
                      required
                      rows={3}
                      placeholder="How can we help you?"
                      value={formData.message}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-transparent py-1 text-white placeholder-stone-500 outline-none font-medium text-sm resize-none"
                    />
                  </div>

                  {/* Error Notification Block */}
                  {status === 'error' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold uppercase tracking-wider"
                    >
                      <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                      <span className="flex-grow">{errorMessage}</span>
                      <button 
                        type="button" 
                        onClick={() => setStatus('idle')}
                        className="underline hover:text-rose-300 transition-colors"
                      >
                        Retry
                      </button>
                    </motion.div>
                  )}

                  {/* Submit Trigger */}
                  <button 
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full flex items-center justify-center gap-2 py-4 text-[#3E2723] font-black uppercase tracking-widest text-xs rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(243,168,82,0.3)] active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: primary }}
                  >
                    {status === 'submitting' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#3E2723]/30 border-t-[#3E2723] rounded-full animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">Message Received!</h3>
                <p className="text-stone-300 font-medium text-base max-w-sm mb-8">
                  Your inquiry has been successfully transmitted. Our support desk will reach out to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-white underline transition-colors"
                >
                  Submit another message
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust Indicator */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-[10px] text-stone-500 uppercase tracking-[0.3em] font-bold"
          >
            Privacy First • Trusted Support Desk
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}