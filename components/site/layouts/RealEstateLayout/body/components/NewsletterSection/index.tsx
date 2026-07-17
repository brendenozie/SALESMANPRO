"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

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

export default function ContactSection() {
  const { storeFormData } = useStoreContext() || {};
  const { themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#000000';
  
  const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.message || 'Failed to dispatch message. Please try again.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error('Contact Submission Error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Inquiry delivery failed.');
    }
  };

  return (
    <motion.section
      className="contact relative py-20 sm:py-28 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-gray-900 dark:to-black overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Decorative Background Shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 dark:bg-white/[0.02] rounded-full mix-blend-overlay animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 dark:bg-white/[0.02] rounded-full mix-blend-overlay animate-blob animation-delay-4000" />
      <div className="absolute top-1/4 left-[30%] w-48 h-48 bg-white/5 dark:bg-white/[0.02] rounded-full mix-blend-overlay animate-blob" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          {/* Title */}
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-lg"
            variants={textVariants}
          >
            Get in <span className="text-amber-300 dark:text-amber-400">Touch!</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-lg sm:text-xl text-indigo-100 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
            variants={textVariants}
            transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
          >
            Have questions about a listing, market trends, or looking to partner up? Drop us a message below and we will get right back to you.
          </motion.p>
        </div>

        {/* Contact Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6 max-w-xl mx-auto bg-white/10 dark:bg-gray-800/40 p-6 sm:p-10 rounded-3xl backdrop-blur-md shadow-2xl border border-white/10"
          variants={formVariants}
        >
          {/* Row for Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-indigo-100 dark:text-gray-300 mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                disabled={status === 'loading'}
                className="w-full p-4 rounded-xl bg-white/90 dark:bg-gray-800/90 border-2 border-transparent
                           text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                           focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-transparent
                           transition duration-300 ease-in-out shadow-inner disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-indigo-100 dark:text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                disabled={status === 'loading'}
                className="w-full p-4 rounded-xl bg-white/90 dark:bg-gray-800/90 border-2 border-transparent
                           text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                           focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-transparent
                           transition duration-300 ease-in-out shadow-inner disabled:opacity-50"
              />
            </div>
          </div>

          {/* Message Area */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-indigo-100 dark:text-gray-300 mb-2">Your Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="How can we help you?"
              rows={4}
              required
              disabled={status === 'loading'}
              className="w-full p-4 rounded-xl bg-white/90 dark:bg-gray-800/90 border-2 border-transparent
                         text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-transparent
                         transition duration-300 ease-in-out shadow-inner resize-none disabled:opacity-50"
            />
          </div>

          {/* Messages Alerts */}
          {status === 'success' && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-sm font-medium">
              Thank you! Your message has been sent successfully.
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-200 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={status === 'loading'}
            whileHover={status !== 'loading' ? { scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" } : {}}
            whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
            className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold uppercase py-4 px-10 rounded-xl
                       shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/70
                       transition duration-300 ease-in-out transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Sending Message...' : 'Send Message'}
          </motion.button>
        </motion.form>
      </div>
    </motion.section>
  );
}