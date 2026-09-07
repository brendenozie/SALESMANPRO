"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from "@/contexts/StoreContext";
import { 
  EnvelopeIcon, 
  UserIcon, 
  ChatBubbleBottomCenterTextIcon, 
  AdjustmentsHorizontalIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';

interface ContactSectionProps {
  themeSettings?: Record<string, any> | null;
}

const CLASSIFICATION_OPTIONS = [
  { id: 'general', code: 'GEN', label: 'General Inquiry' },
  { id: 'technical', code: 'TECH', label: 'Technical Spec' },
  { id: 'partnership', code: 'PTNR', label: 'Integration' }
];

const ContactSection = ({ themeSettings }: ContactSectionProps) => {
  const { storeFormData } = useStoreContext() || {};
  
  // Theme Parameter Resolution
  const primaryColor = themeSettings?.primaryColor || storeFormData?.themeSettings?.primaryColor || "#f97316";

  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [activeClass, setActiveClass] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  
     const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);
            const formattedContent = `NEW INQUIRY\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
    
            try {
                const res = await fetch(`${apiBaseUrl}/conversations/send-to-admin`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ companyId: storeFormData?.id, content: formattedContent }),
                });
                if (!res.ok) throw new Error("API Error");
                setSubmitStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } catch (error) {
                setSubmitStatus('error');
            } finally {
                setIsSubmitting(false);
            }
        };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setActiveClass('general');
    setStatus('idle');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
  };

  return (
    <section className="w-full bg-slate-950 py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-900 font-sans relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="bg-slate-950 border border-slate-900 rounded-lg p-8 lg:p-12 flex flex-col lg:flex-row lg:items-start justify-between gap-12 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
          variants={containerVariants}
        >
          {/* Left Column: Technical Context Frame */}
          <div className="max-w-xl lg:sticky lg:top-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                Uplink Communication Pipeline
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase mb-4">
              Direct Core Connection
            </h2>
            <p className="text-sm text-slate-400 font-normal leading-relaxed mb-6">
              Establish a secure link to our engineering and dispatch team. Transmit configuration logs, integration queries, or general system status updates.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-900">
              <div>
                <span className="block text-[9px] font-mono uppercase text-slate-600">SLA Response Latency</span>
                <span className="text-xs font-mono text-slate-300 font-bold uppercase">&lt; 12 Hours Direct</span>
              </div>
              <div>
                <span className="block text-[9px] font-mono uppercase text-slate-600">Routing Protocol</span>
                <span className="text-xs font-mono text-slate-300 font-bold uppercase">ECC-256 Encrypted</span>
              </div>
            </div>
          </div>

          {/* Right Column: Terminal Entry Form */}
          <div className="w-full lg:max-w-2xl relative min-h-[340px]">
            <AnimatePresence mode="wait">
              {status !== 'success' ? (
                <motion.form 
                  key="contact-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSubmit} 
                  className="space-y-5 w-full"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name Input */}
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Operator Name"
                        className="w-full h-11 pl-10 pr-4 rounded bg-slate-950 text-slate-200 text-xs border border-slate-800 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                        required
                      />
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Node Address"
                        className="w-full h-11 pl-10 pr-4 rounded bg-slate-950 text-slate-200 text-xs border border-slate-800 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Tactile Technical Classification Selectors */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-slate-500">
                      <AdjustmentsHorizontalIcon className="h-3 w-3" />
                      Transmission Objective Class
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {CLASSIFICATION_OPTIONS.map((opt) => {
                        const isSelected = activeClass === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setActiveClass(opt.id)}
                            className="py-2.5 px-3 rounded border font-mono text-[9px] uppercase tracking-wider transition-all duration-150 text-left relative overflow-hidden"
                            style={{
                              borderColor: isSelected ? primaryColor : '#1e293b', // slate-800
                              backgroundColor: isSelected ? `${primaryColor}0d` : 'transparent',
                            }}
                          >
                            <span 
                              className="block font-bold transition-colors"
                              style={{ color: isSelected ? '#ffffff' : '#64748b' }}
                            >
                              [{opt.code}] {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Payload Input */}
                  <div className="relative">
                    <ChatBubbleBottomCenterTextIcon className="absolute left-3.5 top-4 h-4 w-4 text-slate-500 pointer-events-none" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Enter transmission payload specs / query details..."
                      rows={4}
                      className="w-full pl-10 pr-4 py-3.5 rounded bg-slate-950 text-slate-200 text-xs border border-slate-800 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-colors resize-none"
                      required
                    />
                  </div>

                  {/* Submit Frame */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-11 rounded text-xs font-semibold text-slate-950 uppercase tracking-wider transition-all duration-150 active:scale-[0.99] select-none text-center flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {status === 'loading' ? (
                      <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    ) : (
                      'Transmit Payload Link'
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success-screen"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full border border-slate-900 bg-slate-950/40 rounded-lg p-8 text-center flex flex-col items-center justify-center space-y-6"
                >
                  <div className="p-3 rounded-full bg-slate-900 border border-slate-800">
                    <CheckCircleIcon className="h-10 w-10" style={{ color: primaryColor }} />
                  </div>
                  
                  <div className="space-y-2 max-w-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Transmission Synchronized</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-mono uppercase">
                      Payload packet received at route hub. A team member will interface with you at <span className="text-slate-300 font-bold underline underline-offset-4">{formData.email}</span> shortly.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[10px] font-mono uppercase tracking-widest hover:opacity-85 underline underline-offset-4 transition-all"
                    style={{ color: primaryColor }}
                  >
                    Establish New Transmission Track
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;