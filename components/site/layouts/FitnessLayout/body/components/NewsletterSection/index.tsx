"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
    EnvelopeOpenIcon, // For newsletter/email
    SparklesIcon,     // For exclusive content
    GiftIcon,         // For deals/offers
    CheckCircleIcon   // For success state
} from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants (adjusted for this section's context)
const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.9, // Slower for a grand entrance
            ease: "easeOut",
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
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

// ----------------------------------------------------------------------------
// NewsletterSection: collects email subscriptions with enhanced design
// ----------------------------------------------------------------------------
export default function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false); // New loading state

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); // Indicate loading
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // TODO: integrate real subscription API here
        console.log(`Subscribing email: ${email}`);

        setSubscribed(true);
        setLoading(false); // End loading
        setEmail(""); // Clear email field after successful submission
    };

    return (
        <motion.section
            className="relative py-20 px-4 md:px-8 bg-gradient-to-br from-primary-dark to-purple-800 text-white rounded-3xl mx-4 md:mx-8 lg:mx-16 my-20 overflow-hidden shadow-2xl" // More vibrant gradient, larger radius, prominent shadow
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            {/* Background elements for visual interest */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-purple-600 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary-light opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-primary-accent opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 transform -translate-x-1/2 -translate-y-1/2" />


            <div className="max-w-xl mx-auto text-center relative z-10"> {/* Ensure content is above background elements */}
                <motion.div variants={itemVariants}>
                    <EnvelopeOpenIcon className="h-20 w-20 mx-auto mb-6 text-white drop-shadow-lg" /> {/* Larger, more prominent icon */}
                </motion.div>

                <motion.h2
                    className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight drop-shadow-md" // Larger, bolder, with subtle shadow
                    variants={itemVariants}
                >
                    Unlock Exclusive <span className="text-primary-light">Wellness Insights</span>!
                </motion.h2>

                <motion.p
                    className="text-lg md:text-xl text-indigo-100 mb-8 max-w-md mx-auto" // Lighter text for contrast, slightly larger
                    variants={itemVariants}
                >
                    Join our thriving community and get hand-picked tips, special offers, and early access to new programs directly in your inbox.
                </motion.p>

                {subscribed ? (
                    <motion.div
                        className="bg-white text-primary-dark p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <CheckCircleIcon className="h-12 w-12 text-green-500 animate-bounce-in" /> {/* Success icon with animation */}
                        <p className="text-xl font-semibold">Awesome! You're in! 🎉</p>
                        <p className="text-gray-700">Check your inbox for a welcome email. We can't wait to share with you.</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <motion.input
                            type="email"
                            required
                            placeholder="Your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 p-4 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-70 transition-all duration-300 shadow-md" // Larger padding, better placeholder, stronger focus ring
                            whileFocus={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            aria-label="Enter your email address to subscribe"
                            disabled={loading} // Disable input while loading
                        />
                        <motion.button
                            type="submit"
                            className="px-8 py-4 bg-white text-primary-dark rounded-full font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2" // Larger, bolder button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    Subscribe <SparklesIcon className="h-5 w-5" />
                                </>
                            )}
                        </motion.button>
                    </form>
                )}
                <motion.div
                    className="text-sm mt-6 text-indigo-200"
                    variants={itemVariants}
                >
                    We respect your privacy. No spam, ever.
                </motion.div>
            </div>
        </motion.section>
    );
}

// Remember to update your tailwind.config.js with these colors if you haven't already:
/*
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // A nice vibrant indigo
          light: '#818CF8',
          dark: '#4F46E5', // Slightly darker for accents/buttons
          hover: '#4338CA', // Even darker for hover states
          accent: '#A78BFA', // A brighter accent for highlights
        },
      },
    },
  },
  plugins: [],
}

// For the background blobs (optional, but adds a lot):
// Add this to your `tailwind.config.js` under `extend.keyframes` and `extend.animation`
// (You might need to install `tailwindcss-animate` if you haven't, or define these manually)

// In tailwind.config.js plugins array:
// require('tailwindcss-animate'),

// Keyframes:
// blob: {
//   '0%': { transform: 'translate(0px, 0px) scale(1)' },
//   '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
//   '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
//   '100%': { transform: 'translate(0px, 0px) scale(1)' },
// },

// Animation:
// animation: {
//   blob: 'blob 7s infinite cubic-bezier(0.6, 0.01, 0.4, 1)',
//   'bounce-in': 'bounce-in 0.8s ease-out', // For the checkmark
// },
// // New keyframe for bounce-in:
// 'bounce-in': {
//   '0%': { transform: 'scale(0.3)', opacity: '0' },
//   '50%': { transform: 'scale(1.05)', opacity: '1' },
//   '70%': { transform: 'scale(0.9)', opacity: '1' },
//   '100%': { transform: 'scale(1)', opacity: '1' },
// },
*/