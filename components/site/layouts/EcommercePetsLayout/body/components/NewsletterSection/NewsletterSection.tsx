'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons Outline as per your codebase layout
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  SparklesIcon, 
  PaperAirplaneIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';
  
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
      console.error('Submission error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to dispatch your inquiry.');
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-6">
        <div className="relative rounded-[3.5rem] overflow-hidden bg-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
          
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-32 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Visual Side */}
            <div className="relative h-64 lg:h-auto min-h-[400px]">
              <Image
                src="https://images.unsplash.com/photo-1521791136368-1a46827d0af1?q=80&w=1200"
                alt="Support community"
                loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent lg:hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              
              {/* Floating Support Quality Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center overflow-hidden">
                      <Image 
                        src={`https://i.pravatar.cc/100?img=${i + 6}`}
                        loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
                        alt="customer support member" 
                        width={32} 
                        height={32} 
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-white uppercase tracking-widest">
                  Avg Response: Under 2 Hours
                </p>
              </motion.div>
            </div>

            {/* Form Side */}
            <div className="p-10 lg:p-20 flex flex-col justify-center relative z-10">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.div
                    key="form-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <SparklesIcon className="w-6 h-6 animate-pulse" style={{ color: primary }} />
                      <span className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Customer Care</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-6">
                      Have a Question? <br />
                      Let's <span style={{ color: primary }}>Get In Touch</span>.
                    </h2>
                    
                    <p className="text-slate-400 text-base mb-10 max-w-md leading-relaxed">
                      Send us a quick message below. Our specialized assistance team will reach back out to you shortly.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                      
                      {/* Name Input */}
                      <div 
                        className="relative rounded-2xl border-2 transition-all duration-300 bg-slate-800"
                        style={{ borderColor: focusedField === 'name' ? primary : 'rgba(51, 65, 85, 1)' }}
                      >
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={formData.name}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder-slate-500 outline-none font-medium"
                        />
                      </div>

                      {/* Email Input */}
                      <div 
                        className="relative rounded-2xl border-2 transition-all duration-300 bg-slate-800"
                        style={{ borderColor: focusedField === 'email' ? primary : 'rgba(51, 65, 85, 1)' }}
                      >
                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                        <input
                          type="email"
                          required
                          placeholder="Your Email"
                          value={formData.email}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder-slate-500 outline-none font-medium"
                        />
                      </div>

                      {/* Message Textarea */}
                      <div 
                        className="relative rounded-2xl border-2 transition-all duration-300 bg-slate-800"
                        style={{ borderColor: focusedField === 'message' ? primary : 'rgba(51, 65, 85, 1)' }}
                      >
                        <ChatBubbleBottomCenterTextIcon className="absolute left-4 top-5 w-5 h-5 text-slate-500 pointer-events-none" />
                        <textarea
                          required
                          rows={4}
                          placeholder="How can we help you?"
                          value={formData.message}
                          onFocus={() => setFocusedField('message')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder-slate-500 outline-none resize-none font-medium"
                        />
                      </div>

                      {/* Submission Failure Box */}
                      {status === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold"
                        >
                          <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                          <p className="flex-1 uppercase tracking-wider">{errorMessage}</p>
                          <button
                            type="button"
                            onClick={() => setStatus('idle')}
                            className="underline font-black hover:text-rose-300 transition-colors"
                          >
                            RETRY
                          </button>
                        </motion.div>
                      )}

                      {/* Action Button */}
                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="group w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 shadow-lg relative overflow-hidden"
                        style={{ backgroundColor: primary }}
                      >
                        {status === 'submitting' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending Message...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <PaperAirplaneIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </>
                        )}
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      </button>
                    </form>
                    
                    <p className="mt-6 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      Your information is protected. We respond to every inquiry.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="success-view"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-10"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                      <CheckCircleIcon className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">Message Sent!</h3>
                    <p className="text-slate-400 mb-6">Thank you. Your inquiry has been routed to our support center.</p>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="px-6 py-3 rounded-xl text-white text-xs font-bold uppercase tracking-wider border border-slate-700 hover:bg-slate-800 transition-colors"
                    >
                      Send another message
                    </button>
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