'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightIcon, 
  MapPinIcon, 
  PhoneIcon,
  ShoppingBagIcon,
  CloudArrowDownIcon,
  UserIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

export default function AgroCTA() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#10b981'; // Fallback to emerald-500

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Failed to dispatch form. Please try again.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      console.error('Agro Contact Submission Error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Inquiry delivery failed.');
    }
  };

  return (
    <section className="relative py-24 px-6 overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-500">
      {/* The "Field" Container */}
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-[#064e3b] rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(6,78,59,0.3)]">
          
          {/* Subtle Abstract Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center">
            
            {/* --- LEFT: Text Content --- */}
            <div className="p-12 md:p-20">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for Harvest?</span>
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.95] tracking-tighter mb-8">
                Your Farm’s <br /> 
                <span className="italic font-serif font-light text-emerald-400">Next Chapter</span> <br /> 
                Starts Here.
              </h2>

              <p className="text-emerald-100/70 text-lg mb-12 max-w-md leading-relaxed font-medium">
                Whether you’re stocking up for the season or need expert veterinary advice, we’re ready to grow with you.
              </p>

              <div className="flex flex-wrap gap-4">
                <a 
                  href="/shop" 
                  className="group flex items-center gap-3 bg-white text-emerald-900 px-8 py-5 rounded-2xl font-black transition-all hover:bg-emerald-400 hover:text-emerald-950 shadow-xl"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  Start Shopping
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                
                <a 
                  href="#direct-portal" 
                  className="flex items-center gap-3 bg-emerald-800/50 text-white border border-emerald-700 px-8 py-5 rounded-2xl font-black hover:bg-emerald-800 transition-all"
                >
                  <PhoneIcon className="w-5 h-5" />
                  Inquire Now
                </a>
              </div>
            </div>

            {/* --- RIGHT: Visual/Interactive App Portal --- */}
            <div id="direct-portal" className="relative h-full min-h-[550px] flex items-center justify-center lg:justify-end py-12 lg:py-0 pr-0 lg:pr-20">
              
              {/* Interactive Phone Frame Container */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative z-20 w-80 md:w-[350px] aspect-[9/16] bg-zinc-950 rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Simulated Dynamic Island/Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-zinc-800 rounded-b-2xl z-30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-zinc-900 mr-2" />
                  <div className="w-10 h-1 bg-zinc-900 rounded-full" />
                </div>

                {/* Phone Header App Space */}
                <div className="px-6 pt-10 pb-4 border-b border-zinc-900/60 flex items-center justify-between text-zinc-500">
                  <span className="text-[10px] font-bold tracking-widest text-emerald-500">PORTAL ACTIVE</span>
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono tracking-tight text-zinc-400">AGRO_LINK_V1</span>
                  </div>
                </div>

                {/* Main Screen Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                  <AnimatePresence mode="wait">
                    {status === 'success' ? (
                      <motion.div
                        key="success-app"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="h-full flex flex-col items-center justify-center text-center space-y-6 py-6"
                      >
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <CheckBadgeIcon className="w-10 h-10" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black uppercase tracking-wider text-white">Inquiry Lodged</h3>
                          <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed max-w-[200px] mx-auto">
                            Thank you! Your direct farm advisory request has been dispatched.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStatus('idle')}
                          className="text-[9px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-400/20 rounded-xl px-4 py-2 hover:bg-emerald-400/10 transition-colors"
                        >
                          New Message
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form-app"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                      >
                        <div className="space-y-1">
                          <h3 className="text-sm font-black uppercase text-white tracking-widest">Connect Directly</h3>
                          <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                            Fill out the mobile dispatch. We will coordinate promptly.
                          </p>
                        </div>

                        {/* Name Field */}
                        <div className="relative flex items-center">
                          <UserIcon className={`absolute left-4 w-4 h-4 transition-colors ${focusedField === 'name' ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          <input
                            type="text"
                            required
                            placeholder="FULL NAME"
                            value={formData.name}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-900 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-emerald-500 transition-all uppercase tracking-wider"
                          />
                        </div>

                        {/* Email Field */}
                        <div className="relative flex items-center">
                          <EnvelopeIcon className={`absolute left-4 w-4 h-4 transition-colors ${focusedField === 'email' ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          <input
                            type="email"
                            required
                            placeholder="EMAIL ADDRESS"
                            value={formData.email}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-zinc-900 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-emerald-500 transition-all uppercase tracking-wider"
                          />
                        </div>

                        {/* Phone Field */}
                        <div className="relative flex items-center">
                          <PhoneIcon className={`absolute left-4 w-4 h-4 transition-colors ${focusedField === 'phone' ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          <input
                            type="tel"
                            placeholder="PHONE NUMBER"
                            value={formData.phone}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-zinc-900 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-emerald-500 transition-all uppercase tracking-wider"
                          />
                        </div>

                        {/* Message Field */}
                        <div className="relative flex items-start">
                          <ChatBubbleBottomCenterTextIcon className={`absolute left-4 top-3.5 w-4 h-4 transition-colors ${focusedField === 'message' ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          <textarea
                            required
                            rows={3}
                            placeholder="YOUR MESSAGE..."
                            value={formData.message}
                            onFocus={() => setFocusedField('message')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full bg-zinc-900 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-emerald-500 transition-all uppercase tracking-wider resize-none"
                          />
                        </div>

                        {/* Inner App Error Status banner */}
                        {status === 'error' && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold"
                          >
                            <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                            <p className="flex-1 uppercase tracking-wide">{errorMessage}</p>
                            <button
                              type="button"
                              onClick={() => setStatus('idle')}
                              className="underline font-black"
                            >
                              Retry
                            </button>
                          </motion.div>
                        )}

                        {/* App Submit Button */}
                        <button
                          type="submit"
                          disabled={status === 'loading'}
                          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-black uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50"
                        >
                          {status === 'loading' ? (
                            <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Send Dispatch</span>
                              <ArrowRightIcon className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>

                {/* Phone Dock Button */}
                <div className="py-4 border-t border-zinc-900/60 flex items-center justify-center">
                  <div className="h-1 w-24 bg-zinc-800 rounded-full" />
                </div>
              </motion.div>

              {/* Backglow for Mobile */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full" />
            </div>

          </div>
        </div>

        {/* --- Trust Badge Footer --- */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 px-12">
           <div className="flex items-center gap-4 group cursor-pointer">
              <div className="p-3 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 group-hover:text-emerald-600 transition-colors">
                <MapPinIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500">Visit our Hub</p>
                <p className="font-bold text-zinc-900 dark:text-white">Main Office, Agriculture House</p>
              </div>
           </div>

           <div className="flex items-center gap-4 group cursor-pointer">
              <div className="p-3 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 group-hover:text-emerald-600 transition-colors">
                <CloudArrowDownIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500">Inventory Sync</p>
                <p className="font-bold text-zinc-900 dark:text-white">Download Our Price Catalog</p>
              </div>
           </div>

           <div className="hidden lg:block">
              <p className="text-zinc-300 dark:text-zinc-800 font-serif italic text-xl">Join 5,000+ farmers nationwide.</p>
           </div>
        </div>
      </div>
    </section>
  );
}