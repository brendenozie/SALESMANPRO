'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowRightIcon, 
  EnvelopeIcon, 
  UserIcon, 
  PhoneIcon, 
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

interface CTASectionProps {
  storeSlug: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function CTASection({ storeSlug }: CTASectionProps) {
  const router = useRouter();
  const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';

  // Form State Management
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('submitting');

    // Simulate healthcare secure pipeline submission
    try {
      console.log("Submitting clinical inquiry:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus('success');
    } catch (err) {
      console.error("Submission failed:", err);
      setStatus('idle');
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', phone: '', message: '' });
    setStatus('idle');
  };

  return (
    <section id="contact" className="relative py-28 lg:py-40 bg-slate-950 text-white overflow-hidden">
      
      {/* PREMIUM HIGH-OUTPUT LIGHTING DISK */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] rounded-full blur-[160px] pointer-events-none z-0 opacity-20 dark:opacity-15"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`
        }}
      />
      
      {/* CORE IDENTITY MATRIX BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.05] mix-blend-overlay pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.4) 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }}
      />

      {/* GEOMETRIC ACCENT BARS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-slate-800" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-t from-transparent to-slate-800" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* MICRO TAG OVERLAY */}
          <motion.div variants={itemVariants} className="inline-block mb-6">
            <span 
              className="text-[10px] font-extrabold tracking-widest uppercase px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10"
              style={{ color: primaryColor }}
            >
              Secure Communication Gateway
            </span>
          </motion.div>

          {/* HIGH-IMPACT TYPOGRAPHIC HEADER */}
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]"
            variants={itemVariants}
          >
            Ready to Prioritize <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Your Clinical Well-Being?
            </span>
          </motion.h2>

          {/* BALANCED SUBTEXT */}
          <motion.p
            className="mt-6 text-base sm:text-lg font-medium text-slate-400 max-w-xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Reach out directly to establish secure contact. Our dedicated medical professionals are available to clarify clinical structures and pathing.
          </motion.p>

          {/* COMPACT & INTUITIVE CONTACT CONSOLE */}
          <motion.div
            variants={itemVariants}
            className="mt-12 max-w-xl mx-auto bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-10 text-left shadow-2xl relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {status !== 'success' ? (
                <motion.form
                  key="healthcare-contact-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Name Input Container */}
                  <div className="relative border-b border-slate-800 focus-within:border-slate-500 transition-colors pb-1">
                    <UserIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      className="w-full bg-transparent py-3 pl-7 text-white placeholder:text-slate-600 focus:outline-none text-sm font-medium"
                    />
                  </div>

                  {/* Dual Grid Fields: Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="relative border-b border-slate-800 focus-within:border-slate-500 transition-colors pb-1">
                      <EnvelopeIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        className="w-full bg-transparent py-3 pl-7 text-white placeholder:text-slate-600 focus:outline-none text-sm font-medium"
                      />
                    </div>

                    <div className="relative border-b border-slate-800 focus-within:border-slate-500 transition-colors pb-1">
                      <PhoneIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number (Optional)"
                        className="w-full bg-transparent py-3 pl-7 text-white placeholder:text-slate-600 focus:outline-none text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Clinical Query Input Container */}
                  <div className="relative border-b border-slate-800 focus-within:border-slate-500 transition-colors pb-1">
                    <ChatBubbleBottomCenterTextIcon className="absolute left-0 top-3.5 h-4 w-4 text-slate-500" />
                    <textarea
                      name="message"
                      required
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Describe your inquiry or requested treatment scope..."
                      className="w-full bg-transparent py-3 pl-7 text-white placeholder:text-slate-600 focus:outline-none text-sm font-medium resize-none"
                    />
                  </div>

                  {/* Transmission Submit Trigger */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={status === 'submitting'}
                    className="group relative w-full py-4 text-xs font-extrabold tracking-wider text-white uppercase rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-2 disabled:opacity-80"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {status === 'submitting' ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Submit Secure Inquiry</span>
                        <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="healthcare-success-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8 flex flex-col items-center justify-center space-y-6"
                >
                  <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircleIcon className="h-12 w-12 text-emerald-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Inquiry Transmitted</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                      Your details were verified. Our scheduling team will establish contact within 24 business hours at <span className="text-white underline underline-offset-4">{formData.email.toLowerCase()}</span>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-semibold uppercase tracking-widest hover:text-white transition-colors mt-4"
                    style={{ color: primaryColor }}
                  >
                    Submit Another Inquiry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}