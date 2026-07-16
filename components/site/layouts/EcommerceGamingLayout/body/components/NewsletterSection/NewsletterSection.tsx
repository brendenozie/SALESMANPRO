'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using only standard Hero Icons Outline
import { 
  EnvelopeIcon, 
  PaperAirplaneIcon, 
  ShieldCheckIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#dc2626'; // Red-600 default fallback

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
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Uplink transmission disrupted. Try again.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error('Contact transmission failure:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Uplink signal lost.');
    }
  };

  return (
    <section className="relative py-24 bg-white dark:bg-black overflow-hidden border-t border-zinc-200 dark:border-white/10 transition-colors duration-500">
      {/* Background HUD Elements */}
      <div 
        className="absolute top-0 right-0 w-1/3 h-full skew-x-[-15deg] translate-x-20 pointer-events-none opacity-5" 
        style={{ backgroundColor: primary }} 
      />
      <div 
        className="absolute left-10 top-1/2 -translate-y-1/2 w-1 h-32 opacity-50"
        style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${primary}, transparent)` }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 overflow-hidden shadow-2xl dark:shadow-none">
          
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
            
            {/* --- Left Column: The Briefing --- */}
            <div className="p-10 md:p-16 flex flex-col justify-center relative bg-white dark:bg-transparent">
              <div className="flex items-center gap-3 mb-8">
                <div 
                  className="p-2 border"
                  style={{ 
                    backgroundColor: `${primary}10`, // 10% opacity
                    borderColor: `${primary}30`
                  }}
                >
                  <EnvelopeIcon className="w-5 h-5" style={{ color: primary }} />
                </div>
                <span 
                  className="font-mono text-xs tracking-[0.4em] uppercase font-black"
                  style={{ color: primary }}
                >
                  Transmission_Nexus
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black italic text-zinc-900 dark:text-white uppercase tracking-tighter leading-none mb-6">
                INITIATE <span style={{ color: primary }}>UPLINK_</span>
              </h2>
              
              <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium mb-10 max-w-md border-l-2 border-zinc-200 dark:border-white/10 pl-6 italic transition-colors">
                Open a secure line with our control unit. Submit custom requests, operations queries, or network feedback.
              </p>

              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    
                    {/* Name Input */}
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-600">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="ENTER_OPERATOR_NAME"
                        value={formData.name}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-zinc-100 dark:bg-black border px-12 py-4 text-zinc-900 dark:text-white font-mono text-sm focus:outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                        style={{ borderColor: focusedField === 'name' ? primary : 'rgba(255, 255, 255, 0.1)' }}
                      />
                      <div 
                        className="absolute bottom-0 left-0 h-[2px] transition-all duration-500" 
                        style={{ 
                          backgroundColor: primary, 
                          width: focusedField === 'name' ? '100%' : '0%' 
                        }}
                      />
                    </div>

                    {/* Email Input */}
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-600">
                        <EnvelopeIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="ENTER_OPERATOR_EMAIL"
                        value={formData.email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-zinc-100 dark:bg-black border px-12 py-4 text-zinc-900 dark:text-white font-mono text-sm focus:outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                        style={{ borderColor: focusedField === 'email' ? primary : 'rgba(255, 255, 255, 0.1)' }}
                      />
                      <div 
                        className="absolute bottom-0 left-0 h-[2px] transition-all duration-500" 
                        style={{ 
                          backgroundColor: primary, 
                          width: focusedField === 'email' ? '100%' : '0%' 
                        }}
                      />
                    </div>

                    {/* Message Input */}
                    <div className="relative group">
                      <div className="absolute left-4 top-5 pointer-events-none text-zinc-400 dark:text-zinc-600">
                        <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                      </div>
                      <textarea
                        required
                        rows={4}
                        placeholder="ENTER_TRANSMISSION_PAYLOAD"
                        value={formData.message}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-zinc-100 dark:bg-black border px-12 py-4 text-zinc-900 dark:text-white font-mono text-sm focus:outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700 resize-none"
                        style={{ borderColor: focusedField === 'message' ? primary : 'rgba(255, 255, 255, 0.1)' }}
                      />
                      <div 
                        className="absolute bottom-0 left-0 h-[2px] transition-all duration-500" 
                        style={{ 
                          backgroundColor: primary, 
                          width: focusedField === 'message' ? '100%' : '0%' 
                        }}
                      />
                    </div>

                    {/* Operational Error Message */}
                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-red-600/10 border border-red-600/20 text-red-600 dark:text-red-500 font-mono text-xs font-bold"
                      >
                        <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                        <span className="flex-1 uppercase">{errorMessage}</span>
                        <button
                          type="button"
                          onClick={() => setStatus('idle')}
                          className="underline hover:text-red-400"
                        >
                          RETRY
                        </button>
                      </motion.div>
                    )}

                    {/* Submission CTA */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4">
                      <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.25em]">
                        SECURE_CHANNEL // SSL_256
                      </span>

                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="relative px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-tighter italic hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}
                      >
                        {status === 'submitting' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>ENCRYPTING...</span>
                          </>
                        ) : (
                          'DISPATCH_SIGNAL'
                        )}
                      </button>
                    </div>

                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 border border-green-600/20 bg-green-500/5 max-w-md font-mono"
                  >
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-black tracking-tighter mb-4 text-sm">
                      <ShieldCheckIcon className="w-5 h-5" />
                      <span>SECURE UPLINK ESTABLISHED</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed mb-6 uppercase">
                      Transmission successfully delivered to network command. Monitoring response metrics. Expect operator callback shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="text-[10px] font-black uppercase underline tracking-wider hover:text-zinc-900 dark:hover:text-white"
                      style={{ color: primary }}
                    >
                      OPEN_NEW_TRANSMISSION_
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-12 flex items-center gap-6 opacity-40 dark:opacity-30 grayscale pointer-events-none hidden md:flex font-bold">
                <span className="font-mono text-[10px] text-zinc-600 dark:text-white uppercase tracking-widest">Protocol: 256-Bit SSL</span>
                <span className="font-mono text-[10px] text-zinc-600 dark:text-white uppercase tracking-widest">Region: Global_Node</span>
              </div>
            </div>

            {/* --- Right Column: The Visual --- */}
            <div className="relative min-h-[300px] lg:min-h-full overflow-hidden bg-zinc-900">
              <img
                src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070" 
                alt="Tactical Hardware Layer"
                className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent dark:from-zinc-900 lg:from-white lg:dark:from-zinc-900" />
              <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay" />
              
              {/* Floating Data Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ 
                    y: [0, -10, 0],
                    rotateX: [0, 5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="p-8 border border-zinc-200/20 dark:border-white/20 bg-white/40 dark:bg-black/40 backdrop-blur-xl scale-75 md:scale-100 shadow-xl dark:shadow-none"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
                      <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-white/20 rounded-full" />
                    </div>
                    <span className="font-mono text-[8px] text-zinc-600 dark:text-white/40 italic font-bold">LIVE_FEED_09</span>
                  </div>
                  <div className="w-48 h-24 bg-red-600/10 dark:bg-red-600/20 flex items-center justify-center border border-red-600/30" style={{ borderColor: `${primary}30` }}>
                    <PaperAirplaneIcon 
                      className={`w-12 h-12 transition-transform duration-500 ${status === 'submitting' ? 'animate-bounce' : 'animate-pulse'}`} 
                      style={{ color: primary }} 
                    />
                  </div>
                  <div className="mt-4 font-mono text-[10px] uppercase tracking-tighter font-bold" style={{ color: primary }}>
                    {status === 'idle' && 'Awaiting_Operator_Authorization...'}
                    {status === 'submitting' && 'Encrypting_Signal_Packets...'}
                    {status === 'success' && 'Transmission_Secure_And_Delivered.'}
                    {status === 'error' && 'Signal_Interrupted_Retry_Required.'}
                  </div>
                </motion.div>
              </div>

              {/* Scanning Light Sweep Effect */}
              <div 
                className="absolute top-0 left-0 w-1 h-full shadow-[0_0_15px_rgba(255,0,60,1)] animate-sweep" 
                style={{ backgroundColor: primary, boxShadow: `0 0 15px ${primary}` }}
              />
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes sweep {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .animate-sweep {
          animation: sweep 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </section>
  );
}