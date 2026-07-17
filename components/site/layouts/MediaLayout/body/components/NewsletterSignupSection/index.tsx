"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  UserIcon, 
  ChatBubbleBottomCenterTextIcon, 
  CheckCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/solid';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

/**
 * Intuitive, Engaging, and Visually Appealing Contact Us Section
 */
export default function ContactUsForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);

    // Simulate API pipeline integration
    try {
      // await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency
      
      // Real integration example:
      const response = await fetch(`${apiBaseUrl}/conversations/send-to-admin`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
      });
      if (response.ok) { setSubmitted(true); }

      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Variants for section heading
  const headingVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Variants for content description
  const descriptionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6 } },
  };

  // Variants for form / success message
  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 12, delay: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-red-700 to-red-900 text-white overflow-hidden">
      <div className="container mx-auto px-6 text-center max-w-2xl">
        {/* Section Header */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={headingVariants}
        >
          Let's Build Together! 🚀
        </motion.h2>
        <motion.p
          className="mb-10 text-red-100/90 text-lg md:text-xl leading-relaxed"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={descriptionVariants}
        >
          Have questions, ideas, or feedback? Send us a secure line and our specialists will establish contact shortly.
        </motion.p>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success-message"
              className="bg-red-800/80 backdrop-blur-md border border-red-500/30 rounded-3xl py-10 px-8 flex flex-col items-center gap-4 shadow-2xl"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
            >
              <div className="p-3 bg-green-500/20 rounded-full">
                <CheckCircleIcon className="h-12 w-12 text-green-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white">Message Transmitted</h3>
                <p className="text-red-100/80 text-sm max-w-sm">
                  Your communication has been processed. We will respond directly to your provided inbox.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-bold uppercase tracking-wider text-white underline underline-offset-4 opacity-85 hover:opacity-100 transition-opacity"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="contact-form"
              onSubmit={handleSubmit}
              className="space-y-5 text-left bg-red-800/20 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
            >
              {/* Full Name */}
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-200" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Full Name"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-red-600/80 placeholder-red-200/60 text-white text-base focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 shadow-inner border border-transparent hover:border-white/10"
                  aria-label="Your full name"
                />
              </div>

              {/* Email Address */}
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-200" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your Email Address"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-red-600/80 placeholder-red-200/60 text-white text-base focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 shadow-inner border border-transparent hover:border-white/10"
                  aria-label="Your email address"
                />
              </div>

              {/* Message Payload */}
              <div className="relative">
                <ChatBubbleBottomCenterTextIcon className="absolute left-4 top-5 h-5 w-5 text-red-200" />
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="How can we help you?"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-red-600/80 placeholder-red-200/60 text-white text-base focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 shadow-inner border border-transparent hover:border-white/10 resize-none"
                  aria-label="Your message"
                />
              </div>

              {/* Submit Action */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full inline-flex items-center justify-center gap-3 bg-white text-red-700 font-bold py-5 px-8 rounded-2xl shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-6 w-6 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    Send Message
                    <PaperAirplaneIcon className="h-5 w-5 transform -rotate-45" />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}