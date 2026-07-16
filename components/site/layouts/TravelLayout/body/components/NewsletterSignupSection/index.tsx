"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PaperAirplaneIcon, // For send button
  EnvelopeIcon, // For email input icon
  SparklesIcon, // For a decorative icon
  UserIcon, // For name input icon
  MapIcon, // For destination/interest icon
  CheckCircleIcon, // For success state icon
} from "@heroicons/react/24/solid";

// --- Shared Utilities ---

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

export default function ContactUsPage() {
  const [formData, setFormData] = useState({ name: "", email: "", interest: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true);

    const { name, email, message } = formData;

    if (!name || !email || !message) {
      setError("Please complete all required fields.");
      setLoading(false);
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      // Simulate API Submission Flow
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
      console.log("Submitting contact message:", formData);
      
      setSubmitted(true);
      setFormData({ name: "", email: "", interest: "", message: "" });
    } catch (err) {
      setError("Failed to transmit message. Please try again later.");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden min-h-screen flex items-center">
      {/* Decorative Background Elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-40 h-40 bg-white opacity-10 rounded-full mix-blend-overlay pointer-events-none"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-white opacity-10 rounded-full mix-blend-overlay pointer-events-none"
        animate={{ scale: [1, 0.8, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 5 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white opacity-5 rounded-full mix-blend-overlay pointer-events-none"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 10 }}
      />

      <div className="max-w-3xl mx-auto w-full relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="text-center"
        >
          {/* Header Layout Block */}
          <motion.div variants={itemVariants} className="flex justify-center mb-4">
            <SparklesIcon className="h-16 w-16 text-white drop-shadow-lg" />
          </motion.div>

          <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-extrabold mb-4 text-white leading-tight drop-shadow-lg"
          >
            Start Your Next Adventure
          </motion.h2>

          <motion.p 
            variants={itemVariants}
            className="text-indigo-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Reach out with queries, design customization requests, or destination consulting. Our advisors will map out solutions tailored to your coordinates.
          </motion.p>

          {/* Form / Success Interactive Panel */}
          <motion.div
            variants={itemVariants}
            className="bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 text-left shadow-2xl border border-white/20 relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Full Name"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-slate-800 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                      />
                    </div>

                    {/* Email Address */}
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Email Address"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-slate-800 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Destination / Interest */}
                  <div className="relative">
                    <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                    <input
                      type="text"
                      name="interest"
                      value={formData.interest}
                      onChange={handleInputChange}
                      placeholder="Destination or Theme of Interest (e.g. Kyoto, Safari) - Optional"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-slate-800 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>

                  {/* Inquiry Message */}
                  <div className="relative">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Tell us about your travel plans or ask a question..."
                      className="w-full p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-slate-800 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-4 font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <>
                          Send Message 
                          <PaperAirplaneIcon className="h-4 w-4 ml-1 transform -rotate-45" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success-screen"
                  className="py-10 flex flex-col items-center justify-center text-center space-y-5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 bg-green-50 rounded-full border border-green-200 text-green-600">
                    <CheckCircleIcon className="h-12 w-12" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">Message Dispatched!</h3>
                    <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                      We have compiled your coordinates. An explorer advisory specialist will trace back to you in less than 24 business hours.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 transition-colors pt-2"
                  >
                    Submit Another Inquiry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl text-center"
                >
                  🚨 {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}