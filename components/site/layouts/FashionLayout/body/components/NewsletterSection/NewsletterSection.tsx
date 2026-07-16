'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  ArrowRightIcon, 
  CheckBadgeIcon,
  UserIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

const ContactSection = () => {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#ef4444';

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
        throw new Error(errorData?.message || 'Failed to dispatch message.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      console.error('Contact Form Submission Error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="relative py-24 bg-white dark:bg-zinc-950 transition-colors duration-500 overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-20 pointer-events-none">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] blur-[120px] rounded-full"
          style={{ backgroundColor: `${primaryColor}60` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-16 lg:gap-24">
          
          {/* Content Side */}
          <div className="flex-1 space-y-6 text-center lg:text-left lg:sticky lg:top-32">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <EnvelopeIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">
                Direct Line
              </span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
              Get In <br />
              <span className="text-transparent" style={{ WebkitTextStroke: `1px ${primaryColor}` }}>
                Touch
              </span>
            </h2>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
              Have questions about products, ordering, or collaborations? 
              Reach out and our support crew will get back to you within 24 hours.
            </p>
          </div>

          {/* Form Side */}
          <div className="flex-1 w-full max-w-xl">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-10 border border-zinc-100 dark:border-white/10 rounded-[2rem] bg-zinc-50/50 dark:bg-white/5 backdrop-blur-xl text-center shadow-xl dark:shadow-none"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    <CheckBadgeIcon className="w-10 h-10" />
                  </motion.div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-2">
                    Message Sent
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Thank you. We have received your inquiry.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    Submit another inquiry
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  {/* Name Input */}
                  <div className="relative group">
                    <div className="flex items-center gap-4">
                      <UserIcon className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'name' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`} style={{ color: focusedField === 'name' ? primaryColor : '' }} />
                      <input
                        type="text"
                        required
                        placeholder="YOUR FULL NAME"
                        value={formData.name}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-white/10 py-5 text-base font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors uppercase tracking-widest"
                      />
                    </div>
                    {/* Animated Focus Accent Line */}
                    <motion.div 
                      className="h-0.5 mt-[-2px] origin-left"
                      style={{ backgroundColor: primaryColor }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: focusedField === 'name' ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative group">
                    <div className="flex items-center gap-4">
                      <EnvelopeIcon className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`} style={{ color: focusedField === 'email' ? primaryColor : '' }} />
                      <input
                        type="email"
                        required
                        placeholder="ENTER YOUR EMAIL"
                        value={formData.email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-white/10 py-5 text-base font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors uppercase tracking-widest"
                      />
                    </div>
                    {/* Animated Focus Accent Line */}
                    <motion.div 
                      className="h-0.5 mt-[-2px] origin-left"
                      style={{ backgroundColor: primaryColor }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: focusedField === 'email' ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Phone Input (Optional) */}
                  <div className="relative group">
                    <div className="flex items-center gap-4">
                      <PhoneIcon className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'phone' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`} style={{ color: focusedField === 'phone' ? primaryColor : '' }} />
                      <input
                        type="tel"
                        placeholder="PHONE NUMBER (OPTIONAL)"
                        value={formData.phone}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-white/10 py-5 text-base font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors uppercase tracking-widest"
                      />
                    </div>
                    {/* Animated Focus Accent Line */}
                    <motion.div 
                      className="h-0.5 mt-[-2px] origin-left"
                      style={{ backgroundColor: primaryColor }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: focusedField === 'phone' ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Message Area */}
                  <div className="relative group">
                    <div className="flex items-start gap-4">
                      <ChatBubbleBottomCenterTextIcon className={`w-5 h-5 mt-5 transition-colors duration-300 ${focusedField === 'message' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`} style={{ color: focusedField === 'message' ? primaryColor : '' }} />
                      <textarea
                        required
                        rows={4}
                        placeholder="HOW CAN WE ASSIST YOU?"
                        value={formData.message}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-white/10 py-5 text-base font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors uppercase tracking-widest resize-none"
                      />
                    </div>
                    {/* Animated Focus Accent Line */}
                    <motion.div 
                      className="h-0.5 mt-[-2px] origin-left"
                      style={{ backgroundColor: primaryColor }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: focusedField === 'message' ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Error State Block */}
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold"
                    >
                      <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                      <p className="flex-1 uppercase tracking-wider">{errorMessage}</p>
                      <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="underline font-black uppercase text-[10px] tracking-widest ml-2"
                      >
                        Retry
                      </button>
                    </motion.div>
                  )}

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-4">
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="relative flex items-center justify-between gap-6 border-b-2 border-zinc-900 dark:border-white py-3 pr-2 text-base font-black uppercase tracking-widest hover:opacity-80 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {status === 'loading' ? (
                        <div className="w-5 h-5 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Submit Form</span>
                          <ArrowRightIcon className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest max-w-[280px]">
                      By dispatching this form, you agree to our structural Privacy Policy.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;