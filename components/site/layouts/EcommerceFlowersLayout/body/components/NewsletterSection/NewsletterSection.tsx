'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  SparklesIcon, 
  PhoneIcon, 
  MapPinIcon, 
  CheckCircleIcon, 
  ArrowRightIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  // Dynamic fallback variables sourced directly from the merchant's store data
  const contactEmail = storeFormData?.contactEmail || 'hello@botanical-atelier.com';
  const contactPhone = storeFormData?.contactPhone || '+254 712 345 678';
  const contactAddress = storeFormData?.address || 'Suite 12, Karen Green Offices, Nairobi, Kenya';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          setFormData({ name: '', email: '', message: '', subject: '' });
        } catch (err: any) {
          console.error('Contact Submission Error:', err);
          setStatus('error');
          setErrorMessage(err?.message || 'Inquiry delivery failed.');
        }
      };

  return (
    <section className="relative py-24 px-6 bg-slate-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#FAF9F6] rounded-[3rem] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.06)] border border-slate-100">
          
          {/* Left Column: Visual & Contact Meta Info */}
          <div className="relative lg:col-span-5 bg-slate-900 text-white min-h-[450px] lg:min-h-[680px] flex flex-col justify-between p-10 lg:p-16 overflow-hidden">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0 opacity-40">
              <img 
                src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1000&auto=format&fit=crop" 
                alt="Botanical Art"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/55 to-slate-950/90 z-10" />

            {/* Brand Header */}
            <div className="relative z-20 space-y-4">
              <div className="flex items-center gap-2 text-rose-300">
                <SparklesIcon className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Atelier</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-serif italic text-white leading-tight">
                Connect <br />
                <span className="text-slate-300 font-normal not-italic">With Us</span>
              </h2>
              <p className="text-slate-400 font-serif italic text-base max-w-xs">
                Inquire about bespoke landscape installations, styling consults, or curated botanical collections.
              </p>
            </div>

            {/* Practical Contact Info Block */}
            <div className="relative z-20 space-y-8 my-10 lg:my-0">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-full backdrop-blur-md">
                  <EnvelopeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">Write to us</p>
                  <a href={`mailto:${contactEmail}`} className="text-sm hover:text-rose-200 transition-colors block mt-0.5 font-serif italic">
                    {contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-full backdrop-blur-md">
                  <PhoneIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">Speak with us</p>
                  <a href={`tel:${contactPhone}`} className="text-sm hover:text-rose-200 transition-colors block mt-0.5">
                    {contactPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-full backdrop-blur-md">
                  <MapPinIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">Our Studio</p>
                  <p className="text-sm text-slate-300 mt-0.5 font-serif italic">
                    {contactAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Brand Label */}
            <div className="relative z-20 pt-6 border-t border-white/10 hidden lg:block">
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                Cultivated and engineered with care.
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Form Stage */}
          <div className="lg:col-span-7 p-8 lg:p-20 flex flex-col justify-center relative">
            {/* Background Decorative Motif */}
            <div className="absolute top-12 right-12 opacity-[0.02] pointer-events-none hidden md:block">
              <EnvelopeIcon className="w-56 h-56 rotate-12 text-slate-900" />
            </div>

            <div className="relative z-10 w-full">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-12 px-4 space-y-6 flex flex-col items-center"
                  >
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                      <CheckCircleIcon className="w-10 h-10" style={{ color: primary }} />
                    </div>
                    <h3 className="text-3xl font-serif italic text-slate-900">Delivered Beautifully</h3>
                    <p className="text-slate-500 font-serif italic max-w-md mx-auto text-base leading-relaxed">
                      Thank you for sending your message. Our studio directors will read over your inquiries and reach back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      style={{ borderColor: primary, color: primary }}
                      className="mt-6 px-8 py-3.5 rounded-full border text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-rose-400">
                        <SparklesIcon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Inquiries</span>
                      </div>
                      <h3 className="text-3xl lg:text-4xl font-serif italic text-slate-900 leading-tight">
                        Write an <span className="text-slate-400">Atelier Epistle</span>
                      </h3>
                      <p className="text-slate-500 font-serif italic text-base">
                        Share your thoughts, timelines, or custom project goals below.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">Your Name</label>
                          <input 
                            type="text" 
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Brenden"
                            className="w-full bg-transparent border-b border-slate-200 py-3 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-900 transition-colors"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">Email Address</label>
                          <input 
                            type="email" 
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="e.g. brenden@domain.com"
                            className="w-full bg-transparent border-b border-slate-200 py-3 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-900 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">Subject</label>
                        <input 
                          type="text" 
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="What project or concept are we exploring?"
                          className="w-full bg-transparent border-b border-slate-200 py-3 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-900 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">Your Message</label>
                        <textarea 
                          name="message"
                          required
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Detail your custom flora visions, dates, or specifications..."
                          className="w-full bg-transparent border-b border-slate-200 py-3 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-900 transition-colors resize-none"
                        />
                      </div>

                      {status === 'error' && (
                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-3 rounded-xl text-xs">
                          <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <div className="pt-4">
                        <button 
                          type="submit"
                          disabled={status === 'submitting'}
                          style={{ backgroundColor: primary }}
                          className="group relative w-full py-5 rounded-full text-white font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg hover:brightness-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {status === 'submitting' ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Sending Message...
                            </span>
                          ) : (
                            <>
                              Send Message
                              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
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