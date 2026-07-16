"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  UserIcon, 
  ChatBubbleBottomCenterTextIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

// Animation variants for text elements
const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

// Animation variants for form elements
const formVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export default function ContactFormSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('submitting');

    // Simulate API routing dispatch
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus('success');
    } catch (err) {
      console.error("Submission failed:", err);
      setStatus('idle');
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setStatus('idle');
  };

  return (
    <motion.section
      className="contact relative py-20 sm:py-28 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-gray-900 dark:to-black overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Background Shapes/Graphics for visual interest */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 dark:bg-white/[0.02] rounded-full mix-blend-overlay animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 dark:bg-white/[0.02] rounded-full mix-blend-overlay animate-blob animation-delay-4000 pointer-events-none" />
      <div className="absolute top-1/4 left-[30%] w-48 h-48 bg-white/5 dark:bg-white/[0.02] rounded-full mix-blend-overlay animate-blob pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Dynamic Context Headline */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-lg"
          variants={textVariants}
        >
          Let's Start a <span className="text-amber-300 dark:text-amber-400">Conversation!</span>
        </motion.h2>

        {/* Subtitle Description */}
        <motion.p
          className="text-lg sm:text-xl text-indigo-100 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          variants={textVariants}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        >
          Have questions about listings, market insights, or customized pipelines? Fill out the form below to establish a direct connection with our specialists.
        </motion.p>

        {/* Form Outer Shell */}
        <motion.div 
          variants={formVariants} 
          className="max-w-xl mx-auto bg-white/10 dark:bg-gray-800/40 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/20 dark:border-gray-800"
        >
          <AnimatePresence mode="wait">
            {status !== 'success' ? (
              <motion.form
                key="contact-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5 text-left"
              >
                {/* Operator Name Field */}
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-200 dark:text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="w-full p-4 pl-12 rounded-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-transparent
                               text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                               focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-transparent
                               transition duration-300 ease-in-out shadow-inner"
                  />
                </div>

                {/* Email Endpoint Field */}
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-200 dark:text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your Email Address"
                    className="w-full p-4 pl-12 rounded-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-transparent
                               text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                               focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-transparent
                               transition duration-300 ease-in-out shadow-inner"
                  />
                </div>

                {/* Message Field */}
                <div className="relative">
                  <ChatBubbleBottomCenterTextIcon className="absolute left-4 top-5 h-5 w-5 text-indigo-200 dark:text-gray-400" />
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="How can we help you today?"
                    className="w-full p-4 pl-12 rounded-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-transparent
                               text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                               focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-transparent
                               transition duration-300 ease-in-out shadow-inner resize-none"
                  />
                </div>

                {/* Submit Trigger */}
                <motion.button
                  type="submit"
                  disabled={status === 'submitting'}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold uppercase py-5 rounded-2xl
                             shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/70
                             transition duration-300 ease-in-out flex items-center justify-center gap-2"
                >
                  {status === 'submitting' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Send Message"
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6 flex flex-col items-center justify-center space-y-6"
              >
                <div className="p-4 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                  <CheckCircleIcon className="h-12 w-12 text-emerald-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-white">Transmission Received</h3>
                  <p className="text-sm text-indigo-100 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
                    Thank you, <span className="font-bold text-white">{formData.name}</span>! Your request was compiled successfully. Our dispatchers will reach out to <span className="underline decoration-amber-400 underline-offset-4 text-white font-medium">{formData.email.toLowerCase()}</span> shortly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold uppercase tracking-wider text-amber-300 dark:text-amber-400 hover:text-white underline decoration-amber-300/40 underline-offset-4 transition-colors pt-2"
                >
                  Initialize New Transmission
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Visual privacy guarantee text */}
        <motion.p
          className="mt-8 text-sm text-indigo-200 dark:text-gray-400"
          variants={formVariants}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
        >
          We respect your private endpoints. No unsolicited spam, ever.
        </motion.p>
      </div>
    </motion.section>
  );
}