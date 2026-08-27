'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons Outline as per codebase preferences
import { 
  PaperAirplaneIcon, 
  BeakerIcon,
  UserIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://127.0.0.1:3000/api';

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Dynamic tenant accent color defaulting to warm honey yellow
  const primary = storeFormData?.themeSettings?.primaryColor || '#F3A852';

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
        throw new Error(errorData?.message || 'Failed to dispatch your message. Please try again.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error('Contact Submission Error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Inquiry failed to send.');
    }
  };

  return (
    <section className="relative py-24 bg-[#FAF9F6] dark:bg-zinc-950 overflow-hidden">
      {/* Decorative "Honey Ring" Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-100 dark:border-zinc-900 rounded-full opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-amber-50 dark:border-zinc-950 rounded-full opacity-30 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto bg-[#3E2723] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row items-stretch"
        >
          {/* Visual Side */}
          <div className="md:w-5/12 relative min-h-[350px] bg-[#2D1B18] flex flex-col justify-between p-12">
            <img 
              src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800" 
              alt="Artisanal Honey" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#3E2723] via-transparent to-transparent md:bg-gradient-to-b" />
            
            <div className="relative z-10">
              <div className="p-3 rounded-2xl mb-6 shadow-xl shadow-amber-900/20 inline-block" style={{ backgroundColor: primary }}>
                <BeakerIcon className="w-8 h-8 text-[#3E2723]" />
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-white font-serif italic text-3xl leading-tight">
                Direct from <br />
                <span style={{ color: primary }}>The Apiary</span>
              </h3>
              <p className="text-stone-400 text-xs mt-3 uppercase tracking-widest font-bold">
                Batch verification & support
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-[#3E2723] relative">
            <AnimatePresence mode="wait">
              {status !== 'success' ? (
                <motion.div
                  key="contact-form-layout"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-8">
                    <span className="font-black text-[10px] uppercase tracking-[0.4em] mb-4 block" style={{ color: primary }}>
                      Inquire Personally
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif italic text-white mb-4">
                      Connect with our Reserve
                    </h2>
                    <p className="text-stone-400 text-sm leading-relaxed max-w-md">
                      Whether you have batch validation questions, corporate gifting ideas, or need assistance, send us a note below.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div 
                      className="relative group rounded-2xl border transition-all duration-300 bg-[#2D1B18]"
                      style={{ borderColor: focusedField === 'name' ? primary : 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-600 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={formData.name}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder-stone-600 focus:outline-none font-medium text-sm"
                      />
                    </div>

                    {/* Email Input */}
                    <div 
                      className="relative group rounded-2xl border transition-all duration-300 bg-[#2D1B18]"
                      style={{ borderColor: focusedField === 'email' ? primary : 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-600 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={formData.email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder-stone-600 focus:outline-none font-medium text-sm"
                      />
                    </div>

                    {/* Message TextArea */}
                    <div 
                      className="relative group rounded-2xl border transition-all duration-300 bg-[#2D1B18]"
                      style={{ borderColor: focusedField === 'message' ? primary : 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <ChatBubbleBottomCenterTextIcon className="absolute left-4 top-5 w-5 h-5 text-stone-600 pointer-events-none" />
                      <textarea
                        required
                        rows={3}
                        placeholder="Your Message"
                        value={formData.message}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder-stone-600 focus:outline-none font-medium text-sm resize-none"
                      />
                    </div>

                    {/* Error Feedback Wrapper */}
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

                    {/* Submit Button */}
                    <button 
                      type="submit"
                      disabled={status === 'submitting'}
                      style={{ backgroundColor: primary }}
                      className="w-full text-[#3E2723] font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-amber-900/20 group disabled:opacity-50"
                    >
                      {status === 'submitting' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#3E2723]/30 border-t-[#3E2723] rounded-full animate-spin" />
                          <span>Dispatching Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Message</span>
                          <PaperAirplaneIcon className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="success-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-12 flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                    <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-serif text-white mb-3">Inquiry Logged</h3>
                  <p className="text-stone-400 text-sm max-w-sm mb-6">
                    Thank you. Your message has been received. Our team will review the details and get back to you within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-white underline transition-colors"
                  >
                    Submit another inquiry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-8 text-[10px] text-stone-500 uppercase tracking-widest font-bold">
              100% Raw • Unfiltered • Hand-Bottled Support Response
            </p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Bee Path */}
      <motion.div 
        animate={{ x: [0, 100, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-10 left-10 opacity-10 pointer-events-none"
      >
        <svg width="100" height="50" viewBox="0 0 100 50">
          <path d="M0 25 C 20 0, 40 50, 60 25 S 100 25, 100 25" stroke="#B8860B" fill="transparent" strokeDasharray="4 4" />
        </svg>
      </motion.div>
    </section>
  );
}