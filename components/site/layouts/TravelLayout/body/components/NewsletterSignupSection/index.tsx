"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PaperAirplaneIcon, // For send button
  EnvelopeIcon, // For email input icon
  SparklesIcon, // For a decorative icon
} from "@heroicons/react/24/solid"; // Using solid icons for consistency and visual weight

// --- Shared Utilities (from previous sections for consistency) ---

// Animation variants for consistent staggered reveals across sections
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1, // Delay between child animations
      delayChildren: 0.2,   // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100, // Softer spring for a gentle bounce
      damping: 15,    // More damping for a smoother stop
    },
  },
};


// NewsletterSignup.jsx
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSubscribed(false); // Reset subscribed state

    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
      console.log(`Subscribing email: ${email}`);
      setSubscribed(true);
      setEmail(""); // Clear email field on success
    } catch (err) {
      setError("Failed to subscribe. Please try again later.");
      console.error("Subscription error:", err);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-40 h-40 bg-white opacity-10 rounded-full mix-blend-overlay"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-white opacity-10 rounded-full mix-blend-overlay"
        animate={{ scale: [1, 0.8, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 5 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white opacity-5 rounded-full mix-blend-overlay"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 10 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl mx-auto text-center relative z-10" // Ensure content is above decorative elements
      >
        <SparklesIcon className="h-16 w-16 text-white mx-auto mb-4 drop-shadow-lg" />
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white leading-tight drop-shadow-lg">
          Unlock Exclusive Travel Deals & Insights
        </h2>
        <p className="text-indigo-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Join our community of savvy travelers! Get hand-picked travel inspiration, unbeatable offers, and expert tips delivered straight to your inbox.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white p-2 rounded-full shadow-2xl max-w-xl mx-auto"
        >
          <div className="relative flex-1 w-full sm:w-auto">
            <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            <label htmlFor="email-signup" className="sr-only">
              Email address
            </label>
            <input
              id="email-signup"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              className="w-full pl-12 pr-4 py-3 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border-none bg-transparent"
            />
          </div>
          <motion.button
            type="submit"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-3 font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Subscribe Now <PaperAirplaneIcon className="h-5 w-5 ml-2 transform -rotate-45" />
          </motion.button>
        </form>

        <AnimatePresence>
          {subscribed && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 text-green-200 font-semibold text-lg drop-shadow"
            >
              🎉 You're subscribed! Check your inbox for exciting updates.
            </motion.p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 text-red-200 font-semibold text-lg drop-shadow"
            >
              🚨 {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

