"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightIcon, 
  EnvelopeIcon, 
  UserIcon, 
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

interface CtaBoldSectionProps {
  storeFormData: any;
}

const IMPACT_CHANNELS = [
  { id: 'join', label: 'Join as Member' },
  { id: 'partner', label: 'Partnership' },
  { id: 'general', label: 'General Inquiry' }
];

export default function CtaBoldSection({ storeFormData }: CtaBoldSectionProps) {
  // Dynamic branding with robust fallbacks
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';

  // Contact Form States
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [activeChannel, setActiveChannel] = useState('join');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('submitting');

    // Simulate reliable API/webhook dispatch sequence
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('success');
    } catch (err) {
      console.error("Submission pipeline failed:", err);
      setStatus('idle');
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setActiveChannel('join');
    setStatus('idle');
  };

  return (
    <section className="py-24 md:py-32 bg-white dark:bg-zinc-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* The 'Content Canvas' Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[2rem] bg-slate-900 overflow-hidden shadow-2xl border border-slate-800"
        >
          {/* Subtle Dynamic Accent Glow */}
          <div 
            className="absolute top-0 right-0 w-80 h-80 opacity-[0.12] blur-[130px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" 
            style={{ backgroundColor: primaryColor }}
          />

          <div className="relative z-10 grid lg:grid-cols-12 gap-12 p-8 md:p-16 lg:p-20 items-center">
            
            {/* Left Column: Bold Mission Framing (6 Columns) */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <HeartIcon className="w-4 h-4" style={{ color: primaryColor }} />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  Connect & Collaborate
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1] max-w-xl">
                Ready to Make a <br />
                <span className="italic font-light text-slate-400">Lasting Impact?</span>
              </h2>
              
              <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-md">
                Your voice and support help us build clean, transparent, and high-performance solutions for children and communities worldwide. Let's sync up.
              </p>

              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap gap-6 items-center">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  System Hub Node: <span className="text-slate-300 font-bold">{storeFormData?.name || 'GHUBA-NETWORK'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Dispatch Terminal (6 Columns) */}
            <div className="lg:col-span-6 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 md:p-10 min-h-[460px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.div
                    key="dispatch-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Direct Terminal Uplink</h3>
                      <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-1">
                        Transmit your telemetry coordinates below.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      
                      {/* Form Row: Name & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative border-b border-slate-800 pb-1 focus-within:border-white transition-colors">
                          <UserIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                          <input 
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Operator Name"
                            className="w-full bg-transparent py-3 pl-7 text-white placeholder:text-slate-700 focus:outline-none text-xs uppercase tracking-wider font-mono"
                          />
                        </div>

                        <div className="relative border-b border-slate-800 pb-1 focus-within:border-white transition-colors">
                          <EnvelopeIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                          <input 
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email Endpoint"
                            className="w-full bg-transparent py-3 pl-7 text-white placeholder:text-slate-700 focus:outline-none text-xs uppercase tracking-wider font-mono"
                          />
                        </div>
                      </div>

                      {/* Select Channel Segment */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                          Transmission Routing Track
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {IMPACT_CHANNELS.map((channel) => {
                            const isSelected = activeChannel === channel.id;
                            return (
                              <button
                                key={channel.id}
                                type="button"
                                onClick={() => setActiveChannel(channel.id)}
                                className="py-2 px-1 border text-[9px] font-mono uppercase tracking-wider text-center transition-all"
                                style={{
                                  borderColor: isSelected ? primaryColor : '#334155', // slate-700
                                  color: isSelected ? '#ffffff' : '#64748b', // slate-500
                                  backgroundColor: isSelected ? `${primaryColor}15` : 'transparent'
                                }}
                              >
                                {channel.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Message Input */}
                      <div className="relative border-b border-slate-800 pb-1 focus-within:border-white transition-colors">
                        <ChatBubbleBottomCenterTextIcon className="absolute left-0 top-3 h-4 w-4 text-slate-600" />
                        <textarea 
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Transmission Payload Details..."
                          className="w-full bg-transparent py-3 pl-7 text-white placeholder:text-slate-700 focus:outline-none text-xs uppercase tracking-wider font-mono resize-none"
                        />
                      </div>

                      {/* Dynamic Button Frame */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 text-white disabled:opacity-75"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {status === 'submitting' ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Transmit Uplink
                            <ArrowRightIcon className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>

                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-screen"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="text-center flex flex-col items-center justify-center space-y-6"
                  >
                    <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircleIcon className="h-10 w-10 text-emerald-400" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white">Transmission Verified</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-mono uppercase">
                        Connection successfully locked. Our routing node will reach you at <span className="text-white underline underline-offset-4">{formData.email.toLowerCase()}</span> within 12 hours.
                      </p>
                    </div>

                    {/* Metadata Diagnostic Panel */}
                    <div className="w-full bg-slate-900/50 border border-slate-800 p-4 text-left font-mono text-[9px] text-slate-400 space-y-1.5">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Routing Ticket Metadata</p>
                      <p><span className="text-white/60">OPERATOR:</span> {formData.name.toUpperCase()}</p>
                      <p><span className="text-white/60">CHANNEL_ID:</span> {activeChannel.toUpperCase()}</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[10px] font-mono uppercase tracking-widest text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
                    >
                      Initialize New Session
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