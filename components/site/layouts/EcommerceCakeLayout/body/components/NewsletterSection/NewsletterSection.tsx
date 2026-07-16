'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons as per saved preference
import { 
  EnvelopeIcon, 
  SparklesIcon, 
  PaperAirplaneIcon,
  CheckBadgeIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#D97706';
  
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: storeFormData?._id || storeFormData?.id,
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Failed to dispatch message. Please try again.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error('Contact Submission Error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to deliver your inquiry.');
    }
  };

  return (
    <section className="relative py-24 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Organic Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-50/50 dark:bg-zinc-900/20 rounded-[100%] blur-3xl -z-10" />
      
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-8 md:p-16 text-left shadow-2xl"
        >
          {/* Decorative Background Elements */}
          <SparklesIcon className="absolute top-10 left-10 w-12 h-12 text-amber-400/10 animate-pulse pointer-events-none" />
          <EnvelopeIcon className="absolute bottom-10 right-10 w-32 h-32 text-white/5 -rotate-12 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Context & Editorial Copy */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
                Get In Touch
              </span>
              
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                Have a question? <br />
                We are here to <span style={{ color: primary }}>support you</span>.
              </h2>
              
              <p className="text-slate-400 text-base font-medium leading-relaxed">
                Whether you have questions about custom orders, regional deliveries, or platform integration details, send us a note and we'll reply within <span className="text-white font-bold underline decoration-amber-500">24 hours</span>.
              </p>

              {/* Trust badges to fill the whitespace and balance columns */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckBadgeIcon className="w-5 h-5 shrink-0" style={{ color: primary }} />
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Direct Human Support</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckBadgeIcon className="w-5 h-5 shrink-0" style={{ color: primary }} />
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Hassle-free resolutions</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Form Container */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.form 
                    key="contact-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name Input */}
                      <div 
                        className="relative rounded-2xl border-2 transition-all duration-300 bg-white/5 backdrop-blur-md"
                        style={{ borderColor: focusedField === 'name' ? primary : 'rgba(255,255,255,0.1)' }}
                      >
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your Name"
                          className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none font-medium"
                        />
                      </div>

                      {/* Email Input */}
                      <div 
                        className="relative rounded-2xl border-2 transition-all duration-300 bg-white/5 backdrop-blur-md"
                        style={{ borderColor: focusedField === 'email' ? primary : 'rgba(255,255,255,0.1)' }}
                      >
                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Email Address"
                          className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none font-medium"
                        />
                      </div>
                    </div>

                    {/* Message Textarea */}
                    <div 
                      className="relative rounded-2xl border-2 transition-all duration-300 bg-white/5 backdrop-blur-md"
                      style={{ borderColor: focusedField === 'message' ? primary : 'rgba(255,255,255,0.1)' }}
                    >
                      <ChatBubbleBottomCenterTextIcon className="absolute left-4 top-5 w-5 h-5 text-slate-500 pointer-events-none" />
                      <textarea 
                        required
                        rows={4}
                        value={formData.message}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="How can we help you?"
                        className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none font-medium resize-none"
                      />
                    </div>

                    {/* Error Handling Box */}
                    {status === 'error' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-semibold"
                      >
                        <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                        <span className="flex-grow">{errorMessage}</span>
                        <button 
                          type="button" 
                          onClick={() => setStatus('idle')}
                          className="underline hover:text-rose-300 transition-colors"
                        >
                          Dismiss
                        </button>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <button 
                      type="submit"
                      disabled={status === 'submitting'}
                      style={{ backgroundColor: primary }}
                      className="group relative w-full overflow-hidden py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {status === 'submitting' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="relative z-10">Sending...</span>
                        </>
                      ) : (
                        <>
                          <span className="relative z-10">Send Inquiry</span>
                          <PaperAirplaneIcon className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </>
                      )}
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success-screen"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="flex flex-col items-center gap-4 p-12 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 text-center"
                  >
                    <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <CheckBadgeIcon className="w-16 h-16 text-emerald-500" />
                    </div>
                    <h3 className="text-white font-black text-2xl tracking-tight">Message Received!</h3>
                    <p className="text-slate-400 text-base max-w-md">
                      Thanks for reaching out! A member of our support team will get back to you shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="mt-4 px-6 py-2.5 rounded-xl border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-colors"
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