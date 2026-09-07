'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons Outline as per your setup
import { 
  EnvelopeIcon, 
  GlobeAltIcon, 
  BellAlertIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#d97706'; // Defers to active brand color or classic amber

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

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
        throw new Error(errorData?.message || 'Inquiry processing failed.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error('Contact Error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to dispatch your inquiry.');
    }
  };

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative bg-zinc-950 border border-white/5 p-8 md:p-16 text-center rounded-sm"
        >
          {/* Ornamental Corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l" style={{ borderColor: `${primary}80` }} />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r" style={{ borderColor: `${primary}80` }} />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l" style={{ borderColor: `${primary}80` }} />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r" style={{ borderColor: `${primary}80` }} />

          <div className="flex justify-center mb-8">
            <div className="p-4 bg-zinc-900 rounded-full border border-white/5">
              <EnvelopeIcon className="w-8 h-8 stroke-[1]" style={{ color: primary }} />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
            Inquire <span className="italic">Personally</span>
          </h2>
          
          <p className="text-zinc-400 text-sm md:text-base font-light tracking-wide max-w-lg mx-auto mb-12 leading-relaxed">
            Our concierge desk is ready to assist you with private custom commissions, order logistics, or viewing appointments.
          </p>

          <AnimatePresence mode="wait">
            {status !== 'success' ? (
              <motion.form 
                key="form-fields"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="max-w-xl mx-auto space-y-6 text-left"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="relative">
                    <UserIcon className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="NAME"
                      value={formData.name}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-transparent border-b py-4 pl-8 pr-4 text-white text-xs font-light tracking-widest placeholder:text-zinc-700 focus:outline-none transition-colors uppercase"
                      style={{ borderBottomColor: focusedField === 'name' ? primary : 'rgba(39, 39, 42, 1)' }}
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="EMAIL"
                      value={formData.email}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-transparent border-b py-4 pl-8 pr-4 text-white text-xs font-light tracking-widest placeholder:text-zinc-700 focus:outline-none transition-colors uppercase"
                      style={{ borderBottomColor: focusedField === 'email' ? primary : 'rgba(39, 39, 42, 1)' }}
                    />
                  </div>
                </div>

                {/* Message Input */}
                <div className="relative">
                  <ChatBubbleBottomCenterTextIcon className="absolute left-1 top-5 w-4 h-4 text-zinc-600 pointer-events-none" />
                  <textarea
                    required
                    rows={4}
                    placeholder="MESSAGE DETAILS"
                    value={formData.message}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-transparent border-b py-4 pl-8 pr-4 text-white text-xs font-light tracking-widest placeholder:text-zinc-700 focus:outline-none resize-none transition-colors uppercase"
                    style={{ borderBottomColor: focusedField === 'message' ? primary : 'rgba(39, 39, 42, 1)' }}
                  />
                </div>

                {/* Submission Error Banner */}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-sm text-red-500 text-xs tracking-widest uppercase"
                  >
                    <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                    <p className="flex-1">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="underline font-bold hover:text-red-400"
                    >
                      RETRY
                    </button>
                  </motion.div>
                )}

                {/* Submit Action */}
                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={status === 'submitting'}
                    className="group relative overflow-hidden bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3.5 hover:text-white transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {status === 'submitting' ? (
                        <>
                          <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <span>Inquire Now</span>
                        </>
                      )}
                    </span>
                    <div 
                      className="absolute inset-0 -translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" 
                      style={{ backgroundColor: primary }}
                    />
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto py-12 text-center"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border-2"
                  style={{ borderColor: primary }}
                >
                  <CheckIcon className="w-8 h-8" style={{ color: primary }} />
                </div>
                <h3 className="text-xl font-serif text-white mb-2">Inquiry Logged</h3>
                <p className="text-zinc-500 text-sm font-light tracking-wide mb-6">
                  Your private request has been routed directly to our boutique desk. An representative will connect with you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
                >
                  Submit Additional Request
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy/Trust Markers */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4 text-white" />
              <span className="text-[9px] uppercase tracking-widest text-white">Global Access</span>
            </div>
            <div className="flex items-center gap-2">
              <BellAlertIcon className="w-4 h-4 text-white" />
              <span className="text-[9px] uppercase tracking-widest text-white">Priority Alerts</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative background text */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[15vw] font-black text-white/[0.02] uppercase select-none whitespace-nowrap pointer-events-none">
        Privileged Access
      </div>
    </section>
  );
}