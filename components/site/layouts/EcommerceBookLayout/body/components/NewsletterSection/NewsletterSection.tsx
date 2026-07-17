'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  CheckIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const SUBJECT_OPTIONS = [
  { id: 'commission', label: 'Custom Commission' },
  { id: 'press', label: 'Press & Editorial' },
  { id: 'collaboration', label: 'Collaboration' },
  { id: 'general', label: 'General Inquiry' }
];

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D9488';
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'commission',
    message: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://127.0.0.1:3000/api';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) return;
    
        setStatus('loading');
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
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.message || 'Failed to dispatch message. Please try again.');
          }
    
          setStatus('success');
          setFormData({ name: '', email: '', message: '', subject: 'commission' });
        } catch (err: any) {
          console.error('Contact Submission Error:', err);
          setStatus('error');
          setErrorMessage(err?.message || 'Inquiry delivery failed.');
        }
      };

  const resetForm = () => {
    setFormData({ name: '', email: '', subject: 'commission', message: '' });
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <section className="relative py-40 bg-[#FDFDFB] dark:bg-zinc-950 overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          
          {/* Left Column: Editorial Content (5/12 columns for visual balance) */}
          <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <SparklesIcon className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-400">Direct Line</span>
              </div>
              
              <h2 className="text-6xl md:text-8xl font-serif text-zinc-900 dark:text-white leading-[0.85] tracking-tighter">
                The Studio <br />
                <span className="italic text-zinc-400 dark:text-zinc-600">Collective.</span>
              </h2>
              
              <p className="max-w-md font-mono text-[10px] uppercase tracking-widest leading-relaxed text-zinc-500">
                Initiate a custom acquisition, request technical specs, or establish a regional alignment. Our typical response sequence executes within 24 operational hours.
              </p>
            </div>

            {/* Technical Metadata / Details Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-8 pt-8 border-t border-zinc-100 dark:border-zinc-900 max-w-xl">
              {[
                { label: 'Latency', detail: '< 24hr Dispatch' },
                { label: 'Security', detail: 'End-to-End Crypt' },
                { label: 'Coverage', detail: 'Global Logistics' },
                { label: 'Assurance', detail: 'Verified Identity' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="font-mono text-[8px] text-zinc-300 dark:text-zinc-800 uppercase tracking-tighter">System: 00{idx + 1}</p>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-3 h-3 text-zinc-900 dark:text-white" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: High-Performance Contact Interface (7/12 columns) */}
          <div className="lg:col-span-7 relative w-full">
            <AnimatePresence mode="wait">
              {status !== 'success' ? (
                <motion.div 
                  key="contact-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <form onSubmit={handleSubmit} className="space-y-10">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Name Field */}
                      <div className="group relative">
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center">
                          <UserIcon className="w-5 h-5 text-zinc-300 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="SIGNATURE / FULL NAME"
                          className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-6 pl-10 pr-4 text-xs font-mono uppercase tracking-widest outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:border-zinc-900 dark:focus:border-white"
                          style={{ caretColor: primary }}
                        />
                      </div>

                      {/* Email Field */}
                      <div className="group relative">
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center">
                          <EnvelopeIcon className="w-5 h-5 text-zinc-300 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="IDENTIFY@COLLECTIVE.COM"
                          className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-6 pl-10 pr-4 text-xs font-mono uppercase tracking-widest outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:border-zinc-900 dark:focus:border-white"
                          style={{ caretColor: primary }}
                        />
                      </div>
                    </div>

                    {/* Subject / Intent Selector */}
                    <div className="space-y-4">
                      <label className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-400 flex items-center gap-2">
                        <TagIcon className="w-3 h-3" />
                        Select Transmission Objective
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SUBJECT_OPTIONS.map((opt) => {
                          const isSelected = formData.subject === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, subject: opt.id }))}
                              className="px-4 py-3 border font-mono text-[9px] uppercase tracking-widest transition-all duration-300"
                              style={{ 
                                borderColor: isSelected ? primary : '#e4e4e7', // Tailwind zinc-200 / customized dark-border
                                color: isSelected ? '#ffffff' : '#a1a1aa', // Zinc-400 for inactive
                                backgroundColor: isSelected ? primary : 'transparent'
                              }}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Message Payload Field */}
                    <div className="group relative">
                      <div className="absolute top-6 left-0 flex items-center">
                        <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-zinc-300 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                      </div>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="ENTER DISPATCH PAYLOAD / TRANSMISSION SPECIFICS..."
                        className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-6 pl-10 pr-4 text-xs font-mono uppercase tracking-widest outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:border-zinc-900 dark:focus:border-white resize-none"
                        style={{ caretColor: primary }}
                      />
                    </div>

                    {/* Submit Sequence Action */}
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="group relative w-full overflow-hidden border py-6 transition-all duration-500 hover:bg-transparent"
                      style={{ 
                        backgroundColor: primary,
                        borderColor: primary
                      }}
                    >
                      <div className="relative z-10 flex items-center justify-center gap-3">
                        {status === 'loading' ? (
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                              Transmit System Payload
                            </span>
                            <ArrowRightIcon className="w-4 h-4 text-white group-hover:text-zinc-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </>
                        )}
                      </div>
                    </button>
                  </form>
                  
                  <p className="mt-8 font-mono text-[7px] text-center uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-800">
                    Secure Protocol / 256-bit Encryption Verified
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-16 border text-center space-y-8"
                  style={{ borderColor: `${primary}30` }}
                >
                  <div 
                    className="inline-flex p-4 rounded-full border"
                    style={{ borderColor: `${primary}50` }}
                  >
                    <CheckIcon className="w-8 h-8" style={{ color: primary }} />
                  </div>
                  
                  <div className="space-y-4 max-w-sm mx-auto">
                    <h3 className="text-2xl font-serif italic text-zinc-900 dark:text-white">Transmission Complete</h3>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 leading-relaxed">
                      Your route sequence has successfully synchronized. A physical operator will interface with you at <span className="text-zinc-850 dark:text-zinc-100 font-bold underline underline-offset-4">{formData.email}</span> shortly.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="font-mono text-[9px] uppercase tracking-[0.2em] hover:opacity-80 underline underline-offset-4 transition-opacity"
                    style={{ color: primary }}
                  >
                    Transmit New Message Vector
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Background Architectural Markings */}
      <div className="absolute top-10 right-10 pointer-events-none select-none">
        <span className="font-mono text-[120px] leading-none text-zinc-50 dark:text-zinc-900/30 font-black">
          2026
        </span>
      </div>
    </section>
  );
}