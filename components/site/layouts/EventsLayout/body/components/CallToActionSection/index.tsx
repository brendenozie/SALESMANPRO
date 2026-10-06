"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRightIcon, 
  EnvelopeIcon, 
  UserIcon, 
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon 
} from "@heroicons/react/24/solid";
import { StoreForm } from "@/types/typings";
import { useStoreContext } from "@/contexts/StoreContext";

export default function CallToActionSection() {
  const { storeFormData } = useStoreContext() as { storeFormData : StoreForm };
  const store = storeFormData || {};

  // Extract branding or set fallback colors matching the ambient neon theme
  const primaryColor = store.themeSettings?.primaryColor || "#6366f1"; // Default Indigo-500

  // Pull dynamic CTA text from themeSettings, with sensible fallbacks
  const headline =
    store.themeSettings?.ctaHeadline ||
    "Ready to <span>Host With Us?</span>";
  const subtext =
    store.themeSettings?.ctaSubtext ||
    "Bring your vision to life and connect with your audience. We'll help you make every event extraordinary.";

  // Form State Management
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'error' | 'submitting' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.email || !formData.message) return;
  
      setFormStatus('loading');
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
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.message || 'Failed to dispatch message. Please try again.');
        }
  
        setFormStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } catch (err: any) {
        console.error('Contact Submission Error:', err);
        setFormStatus('error');
        setErrorMessage(err?.message || 'Inquiry delivery failed.');
      }
    };

  const handleReset = () => {
    setFormData({ name: "", email: "", message: "" });
    setFormStatus('idle');
  };

  return (
    <section id="contact" className="relative bg-gray-950 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden">
      
      {/* --- Ambient Decorative Blobs --- */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-2xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-2xl opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        
        {/* --- Headline Section --- */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white mb-6"
        >
          {headline.split(/<span>|<\/span>/g).map((chunk: any, i: any) =>
            i % 2 === 1 ? (
              <span
                key={i}
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
              >
                {chunk}
              </span>
            ) : (
              <React.Fragment key={i}>{chunk}</React.Fragment>
            )
          )}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          {subtext}
        </motion.p>

        {/* --- Contact Form Console --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-xl mx-auto bg-gray-900/95 border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {formStatus !== 'success' ? (
              <motion.div
                key="contact-form-layout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Operator Name Input */}
                  <div className="relative border-b border-gray-800 pb-1 focus-within:border-gray-500 transition-colors">
                    <UserIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input 
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      className="w-full bg-transparent py-3.5 pl-7 text-white placeholder:text-gray-600 focus:outline-none text-sm font-medium"
                    />
                  </div>

                  {/* Email Endpoint Input */}
                  <div className="relative border-b border-gray-800 pb-1 focus-within:border-gray-500 transition-colors">
                    <EnvelopeIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input 
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      className="w-full bg-transparent py-3.5 pl-7 text-white placeholder:text-gray-600 focus:outline-none text-sm font-medium"
                    />
                  </div>

                  {/* Message Detail Input */}
                  <div className="relative border-b border-gray-800 pb-1 focus-within:border-gray-500 transition-colors">
                    <ChatBubbleBottomCenterTextIcon className="absolute left-0 top-3 h-4 w-4 text-gray-500" />
                    <textarea 
                      name="message"
                      required
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your Message or Inquiry details..."
                      className="w-full bg-transparent py-3.5 pl-7 text-white placeholder:text-gray-600 focus:outline-none text-sm font-medium resize-none"
                    />
                  </div>

                  {/* Dynamic Action Trigger Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-75 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {formStatus === 'submitting' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Message
                        <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-8 flex flex-col items-center justify-center space-y-6"
              >
                <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircleIcon className="h-12 w-12 text-emerald-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">Inquiry Received</h3>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
                    We've securely received your transmission. Our operations team will get in touch at <span className="text-white underline underline-offset-4">{formData.email.toLowerCase()}</span> shortly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold uppercase tracking-widest hover:underline transition-colors mt-4"
                  style={{ color: primaryColor }}
                >
                  Send Another Message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}