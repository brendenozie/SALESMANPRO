"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { InboxIcon, PaperAirplaneIcon, CheckCircleIcon } from '@heroicons/react/24/solid'; // Updated icons

const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

/**
 * Intuitive, Engaging, and Visually Appealing Newsletter Signup Section
 * Encourages user subscription with a modern design and clear feedback.
 */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // New state for loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Indicate loading
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    // In a real application, you would integrate with your subscription API here
    // e.g., const response = await fetch(`${apiBaseUrl}/subscribe', { method: 'POST', body: JSON.stringify({ email }) });
    // if (response.ok) { setSubmitted(true); } else { /* handle error */ }
    setSubmitted(true);
    setLoading(false); // Stop loading
    setEmail(''); // Clear email field after submission
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
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10, delay: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-red-700 to-red-900 text-white overflow-hidden"> {/* Changed to red gradient */}
      <div className="container mx-auto px-6 text-center max-w-2xl"> {/* Increased max-width slightly */}
        {/* Section Header */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={headingVariants}
        >
          Never Miss a Beat! 🚀
        </motion.h2>
        <motion.p
          className="mb-10 text-red-100/90 text-lg md:text-xl leading-relaxed" // Larger, softer text
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={descriptionVariants}
        >
          Join our exclusive community for the latest releases, behind-the-scenes insights, and special events delivered straight to your inbox.
        </motion.p>

        <AnimatePresence mode="wait"> {/* Use AnimatePresence for exit animations */}
          {submitted ? (
            <motion.div
              key="success-message" // Unique key for AnimatePresence
              className="bg-red-800 rounded-full py-4 px-8 inline-flex items-center gap-3 text-lg font-semibold shadow-2xl"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
            >
              <CheckCircleIcon className="h-7 w-7 text-green-300" />
              You're in! Welcome to the family.
            </motion.div>
          ) : (
            <motion.form
              key="signup-form" // Unique key for AnimatePresence
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center justify-center gap-5" // Increased gap
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
            >
              <div className="relative w-full sm:flex-1 max-w-sm"> {/* Restricted width slightly */}
                <InboxIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-red-200" /> {/* Larger icon */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your best email address" // More engaging placeholder
                  className="w-full pl-12 pr-6 py-4 rounded-full bg-red-600 placeholder-red-200 text-white text-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 shadow-inner" // Enhanced input style
                  aria-label="Your email address"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }} // More prominent hover shadow
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="inline-flex items-center justify-center gap-3 bg-white text-red-700 font-bold py-4 px-8 rounded-full shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white text-lg disabled:opacity-50 disabled:cursor-not-allowed" // Enhanced button style
                disabled={loading} // Disable during loading
              >
                {loading ? (
                  <svg className="animate-spin h-6 w-6 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    Subscribe Now
                    <PaperAirplaneIcon className="h-6 w-6 transform -rotate-45" /> {/* Dynamic icon */}
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