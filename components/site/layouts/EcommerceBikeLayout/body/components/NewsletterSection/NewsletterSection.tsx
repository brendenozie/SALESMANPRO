'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeIcon, GlobeAltIcon, BellAlertIcon } from '@heroicons/react/24/outline';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('submitting');

    try {
      // Simulate API uplink delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Transmission failed:", error);
      setStatus('idle');
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
          className="relative bg-zinc-950 border border-white/5 p-12 md:p-20 text-center rounded-sm"
        >
          {/* Ornamental Corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-amber-600/50" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-amber-600/50" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-amber-600/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-amber-600/50" />

          <div className="flex justify-center mb-8">
            <div className="p-4 bg-zinc-900 rounded-full border border-white/5">
              <EnvelopeIcon className="w-8 h-8 text-amber-600 stroke-[1]" />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
            Inquire with the <span className="italic">Atelier</span>
          </h2>
          
          <p className="text-zinc-400 text-sm md:text-base font-light tracking-wide max-w-lg mx-auto mb-12 leading-relaxed">
            For bespoke commissions, private gallery viewings, or collection pricing, transmit your details securely below. 
          </p>

          <div className="max-w-xl mx-auto">
            <AnimatePresence mode="wait">
              {status !== 'success' ? (
                <motion.form 
                  key="contact-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6 text-left"
                >
                  {/* Name and Email Inputs Stacked on Mobile, Split on Desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="IDENTIFIER / NAME"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white font-light text-xs tracking-widest placeholder:text-zinc-700 focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="EMAIL ADDRESS"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white font-light text-xs tracking-widest placeholder:text-zinc-700 focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="relative">
                    <textarea
                      name="message"
                      rows={3}
                      required
                      placeholder="MESSAGE / REQUEST"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-zinc-800 py-3 text-white font-light text-xs tracking-widest placeholder:text-zinc-700 focus:outline-none focus:border-amber-600 transition-colors resize-none"
                    />
                  </div>

                  {/* Centered Submit Action */}
                  <div className="pt-6 flex justify-center">
                    <button 
                      type="submit"
                      disabled={status === 'submitting'}
                      className="bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-10 py-4 hover:bg-amber-600 hover:text-white transition-all disabled:opacity-50"
                    >
                      {status === 'submitting' ? 'Transmitting...' : 'Send Inquiry'}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="success-message"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="py-6 text-center space-y-6"
                >
                  <p className="text-zinc-300 text-sm font-light tracking-wide max-w-sm mx-auto leading-relaxed">
                    Thank you. Your message has been routed to our concierge department. We will establish connection shortly.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-[9px] uppercase tracking-[0.2em] text-amber-600 hover:text-white transition-colors underline underline-offset-4"
                  >
                    Send Another Transmission
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trust Markers */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4 text-white" />
              <span className="text-[9px] uppercase tracking-widest text-white">Global Access</span>
            </div>
            <div className="flex items-center gap-2">
              <BellAlertIcon className="w-4 h-4 text-white" />
              <span className="text-[9px] uppercase tracking-widest text-white">Priority Response</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative background text */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[15vw] font-black text-white/[0.01] uppercase select-none whitespace-nowrap pointer-events-none">
        Privileged Access
      </div>
    </section>
  );
}