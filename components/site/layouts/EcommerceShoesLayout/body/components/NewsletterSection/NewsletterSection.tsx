'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  SparklesIcon, 
  ChevronRightIcon, 
  FireIcon,
  UserIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { EditableElement } from '@/contexts/EditableContentContext';

export default function ContactSection() {
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
      const response = await fetch(`/api/conversations/send-to-admin`, {
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
        throw new Error(errorData?.message || 'Failed to dispatch message. Please try again.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      console.error('Contact Form Submission Error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Something went wrong. Please check your connection.');
    }
  };

  const isFocused = focusedField !== null;

  return (
    <section className="relative py-32 bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      {/* --- Kinetic Background --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.05] select-none">
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-around">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: i % 2 === 0 ? -100 : 100 }}
              animate={{ x: i % 2 === 0 ? 100 : -100 }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear", repeatType: "mirror" }}
              className="text-[15vw] font-black italic tracking-tighter text-black dark:text-white whitespace-nowrap leading-none"
            >
              GET IN TOUCH DIRECT RESPONSE TALK TO US CONTACT THE CREW
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="relative bg-zinc-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-white/10 rounded-[3rem] p-8 md:p-20 overflow-hidden shadow-2xl backdrop-blur-3xl transition-all">
          
          {/* Dynamic Glow Orb */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.15, 0.05] 
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px]"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5 mb-8 shadow-sm"
              >
                <SparklesIcon className="w-4 h-4" style={{ color: primaryColor }} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-zinc-300">
                  Direct Response
                </span>
              </motion.div>

              <EditableElement
                targetId="home.newsletter-section.heading"
                componentKey="NewsletterSection"
                elementKey="heading"
                label="Newsletter Heading"
                defaultValue="Drop A Line."
              >
                {(val) => (
                  <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase leading-[0.85] mb-8">
                    {val}
                  </h2>
                )}
              </EditableElement>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 text-gray-400 dark:text-zinc-400 font-bold mb-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+14}`} alt="support agent" className="w-full h-full object-cover grayscale" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest">Support crew online — 24/7 Response</p>
              </div>

              <EditableElement
                targetId="home.newsletter-section.subheading"
                componentKey="NewsletterSection"
                elementKey="subheading"
                label="Newsletter Description"
                type="textarea"
                defaultValue="Have questions about our store collections, orders, or custom partnerships? We answer 100% of messages in under 24 hours."
              >
                {(val) => (
                  <p className="text-gray-500 dark:text-zinc-400 text-lg max-w-sm mx-auto lg:mx-0 leading-relaxed font-medium">
                    {val}
                  </p>
                )}
              </EditableElement>
            </div>

            <div className="relative group">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 md:p-12 text-center shadow-xl relative"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-6">
                      <CheckBadgeIcon className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tight uppercase mb-2">
                      Message Sent
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 font-bold max-w-xs mx-auto leading-relaxed">
                      Your message has been delivered to our inbox. We will reach out to you shortly.
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-8 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-950 dark:hover:text-white transition-colors"
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
                    className={`transition-all duration-500 transform ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}
                  >
                    <div className="relative">
                      <div 
                        className={`absolute -inset-1 rounded-[2rem] blur opacity-20 transition duration-500 ${isFocused ? 'opacity-30' : 'opacity-0'}`} 
                        style={{ backgroundColor: primaryColor }} 
                      />
                      
                      <div className="relative flex flex-col gap-4">
                        {/* Name Input */}
                        <div className="relative flex items-center">
                          <UserIcon className={`absolute left-6 w-6 h-6 transition-colors duration-300 ${focusedField === 'name' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-zinc-600'}`} />
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your Name"
                            className="w-full pl-16 pr-6 py-5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-gray-950 dark:focus:border-white/20 transition-all text-base font-bold shadow-inner"
                          />
                        </div>

                        {/* Email Input */}
                        <div className="relative flex items-center">
                          <EnvelopeIcon className={`absolute left-6 w-6 h-6 transition-colors duration-300 ${focusedField === 'email' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-zinc-600'}`} />
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Your Email Address"
                            className="w-full pl-16 pr-6 py-5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-gray-950 dark:focus:border-white/20 transition-all text-base font-bold shadow-inner"
                          />
                        </div>

                        {/* Phone Input (Optional) */}
                        <div className="relative flex items-center">
                          <PhoneIcon className={`absolute left-6 w-6 h-6 transition-colors duration-300 ${focusedField === 'phone' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-zinc-600'}`} />
                          <input
                            type="tel"
                            value={formData.phone}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Phone Number (Optional)"
                            className="w-full pl-16 pr-6 py-5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-gray-950 dark:focus:border-white/20 transition-all text-base font-bold shadow-inner"
                          />
                        </div>

                        {/* Message Input */}
                        <div className="relative flex items-start">
                          <ChatBubbleBottomCenterTextIcon className={`absolute left-6 top-5 w-6 h-6 transition-colors duration-300 ${focusedField === 'message' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-zinc-600'}`} />
                          <textarea
                            required
                            rows={4}
                            value={formData.message}
                            onFocus={() => setFocusedField('message')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="How can we support you?"
                            className="w-full pl-16 pr-6 py-5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-gray-950 dark:focus:border-white/20 transition-all text-base font-bold shadow-inner resize-none"
                          />
                        </div>

                        {/* Error Handling State banner */}
                        {status === 'error' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold"
                          >
                            <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                            <p className="flex-1">{errorMessage}</p>
                            <button 
                              type="button" 
                              onClick={() => setStatus('idle')}
                              className="underline font-black uppercase text-[10px] tracking-widest ml-2"
                            >
                              Retry
                            </button>
                          </motion.div>
                        )}
                        
                        {/* Submit Button */}
                        <button 
                          type="submit"
                          disabled={status === 'loading'}
                          className="group relative w-full py-5 rounded-2xl text-white font-black uppercase italic tracking-widest flex items-center justify-center gap-3 overflow-hidden transition-all active:scale-95 shadow-xl disabled:opacity-50"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <span className="relative z-10 flex items-center gap-3">
                            {status === 'loading' ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                Send Message
                                <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </span>
                          <div className="absolute inset-0 bg-black/10 dark:bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-center lg:justify-start gap-4">
                      <div className="flex items-center gap-2">
                        <FireIcon className="w-4 h-4 text-orange-500 animate-pulse" />
                        <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Responses in less than 24 hours</span>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Brand Bar */}
        <div className="mt-20 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-40 dark:opacity-20">
          {['Fast Response', 'Direct Slack Integrations', 'Client Support', 'Secure API Systems'].map((label) => (
            <span key={label} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white italic">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}