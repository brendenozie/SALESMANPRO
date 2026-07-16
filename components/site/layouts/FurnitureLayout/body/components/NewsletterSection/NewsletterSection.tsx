'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  ArrowRightIcon,
  UserIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export default function AtelierContactSection() {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings?.primaryColor || '#18181b';

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
        throw new Error(errorData?.message || 'Failed to send message. Please try again.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      console.error('Submission Error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Something went wrong. Please check your connection.');
    }
  };

  return (
    <section className="relative py-32 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 overflow-hidden">
      {/* Background Decor: Soft Glow in Dark, Clean in Light */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-200/50 dark:bg-zinc-900/30 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
               <div className="h-[1px] w-8 bg-zinc-300 dark:bg-zinc-800" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-500 block">
                 Get In Touch
               </span>
               <div className="h-[1px] w-8 bg-zinc-300 dark:bg-zinc-800" />
            </div>
            
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-[0.8]">
              Atelier <br />
              <span className="font-serif italic font-light lowercase text-zinc-400 dark:text-zinc-600">Connect</span>
            </h2>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-light max-w-sm mx-auto leading-relaxed">
              Have inquiries about sizing, custom collaborations, or ongoing orders? Write to us directly.
            </p>
          </div>

          {/* Form and Success Transition Wrapper */}
          <div className="max-w-lg mx-auto relative min-h-[350px]">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="py-16 text-center space-y-6"
                >
                  <div className="w-16 h-16 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto">
                    <CheckBadgeIcon className="w-8 h-8 text-zinc-900 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                      Message Dispatched
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                      Your connection with our support desk has been established. Expect an update in under 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors pt-4"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-8 text-left"
                >
                  {/* Name Input */}
                  <div className="relative group">
                    <div className="flex items-center gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800 group-focus-within:border-zinc-400 dark:group-focus-within:border-zinc-600 transition-colors duration-300">
                      <UserIcon className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                      <input
                        type="text"
                        required
                        placeholder="NAME"
                        value={formData.name}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-transparent border-none w-full p-0 text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:ring-0 text-xs font-black tracking-[0.3em] uppercase transition-all"
                      />
                    </div>
                    {/* Atelier Signature Line */}
                    <div 
                      className="absolute bottom-[-1px] left-1/2 h-[1px] w-0 transition-all duration-500 ease-in-out"
                      style={{ 
                        backgroundColor: primary, 
                        width: focusedField === 'name' ? '100%' : '0%', 
                        left: focusedField === 'name' ? '0%' : '50%' 
                      }}
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative group">
                    <div className="flex items-center gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800 group-focus-within:border-zinc-400 dark:group-focus-within:border-zinc-600 transition-colors duration-300">
                      <EnvelopeIcon className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                      <input
                        type="email"
                        required
                        placeholder="EMAIL ADDRESS"
                        value={formData.email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-transparent border-none w-full p-0 text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:ring-0 text-xs font-black tracking-[0.3em] uppercase transition-all"
                      />
                    </div>
                    <div 
                      className="absolute bottom-[-1px] left-1/2 h-[1px] w-0 transition-all duration-500 ease-in-out"
                      style={{ 
                        backgroundColor: primary, 
                        width: focusedField === 'email' ? '100%' : '0%', 
                        left: focusedField === 'email' ? '0%' : '50%' 
                      }}
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="relative group">
                    <div className="flex items-center gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800 group-focus-within:border-zinc-400 dark:group-focus-within:border-zinc-600 transition-colors duration-300">
                      <PhoneIcon className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                      <input
                        type="tel"
                        placeholder="PHONE (OPTIONAL)"
                        value={formData.phone}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-transparent border-none w-full p-0 text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:ring-0 text-xs font-black tracking-[0.3em] uppercase transition-all"
                      />
                    </div>
                    <div 
                      className="absolute bottom-[-1px] left-1/2 h-[1px] w-0 transition-all duration-500 ease-in-out"
                      style={{ 
                        backgroundColor: primary, 
                        width: focusedField === 'phone' ? '100%' : '0%', 
                        left: focusedField === 'phone' ? '0%' : '50%' 
                      }}
                    />
                  </div>

                  {/* Message Input */}
                  <div className="relative group">
                    <div className="flex items-start gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800 group-focus-within:border-zinc-400 dark:group-focus-within:border-zinc-600 transition-colors duration-300">
                      <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0 mt-1" />
                      <textarea
                        required
                        rows={3}
                        placeholder="HOW CAN WE ASSIST YOU?"
                        value={formData.message}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-transparent border-none w-full p-0 text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:ring-0 text-xs font-black tracking-[0.3em] uppercase transition-all resize-none"
                      />
                    </div>
                    <div 
                      className="absolute bottom-[-1px] left-1/2 h-[1px] w-0 transition-all duration-500 ease-in-out"
                      style={{ 
                        backgroundColor: primary, 
                        width: focusedField === 'message' ? '100%' : '0%', 
                        left: focusedField === 'message' ? '0%' : '50%' 
                      }}
                    />
                  </div>

                  {/* Error Flag banner */}
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 border border-red-500/10 bg-red-500/[0.02] text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest"
                    >
                      <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                      <p className="flex-1">{errorMessage}</p>
                      <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="underline ml-2 hover:opacity-75 transition-opacity"
                      >
                        Retry
                      </button>
                    </motion.div>
                  )}

                  {/* Submit Button Block */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-900 dark:text-white group/btn disabled:opacity-50"
                    >
                      {status === 'loading' ? (
                        <div className="w-5 h-5 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Message</span>
                          <ArrowRightIcon className="w-4 h-4 text-zinc-400 group-hover/btn:translate-x-2 transition-transform duration-300" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footnote */}
          <div className="pt-8 space-y-2">
             <p className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest leading-loose">
              By submitting this form, you agree to our <a href="#" className="underline decoration-zinc-200 dark:decoration-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</a>.
            </p>
            <p className="text-[10px] font-serif italic text-zinc-300 dark:text-zinc-800">
              Personalized support. Always on time.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Vertical Side Detail */}
      <div className="absolute bottom-12 left-12 hidden lg:block overflow-hidden">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="font-mono text-[9px] text-zinc-300 dark:text-zinc-800 tracking-tighter uppercase [writing-mode:vertical-lr] flex items-center gap-4"
        >
          <span className="w-px h-12 bg-zinc-200 dark:bg-zinc-800" />
          EST. 2026 // ATELIER_CONNECT
        </motion.div>
      </div>
    </section>
  );
}