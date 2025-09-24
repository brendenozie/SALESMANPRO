"use client";

import React, { useState } from 'react'; // Ensure useState is imported
import { motion, AnimatePresence } from 'framer-motion'; // Ensure AnimatePresence is imported
import Image from 'next/image'; // Not strictly needed for this component, but good to keep if used elsewhere
import {
  ArrowRightIcon,
    ChevronDownIcon, // For accordion open/close
    LightBulbIcon,   // For a helpful tip/CTA
    QuestionMarkCircleIcon, // General FAQ icon
    SparklesIcon // For a touch of magic
} from '@heroicons/react/24/solid';
import { FAQ } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants
const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.9, // Slower for a grand entrance
            ease: "easeOut",
            staggerChildren: 0.1, // Stagger items
            delayChildren: 0.2,
        },
    },
};

const faqItemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: "easeOut",
        },
    },
};

const answerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
        opacity: 1,
        height: "auto",
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        height: 0,
        transition: {
            duration: 0.3,
            ease: "easeIn",
        },
    },
};

// Dummy data for demonstration
// interface FAQItem {
//     id: string;
//     question: string;
//     answer: string;
//     category?: string; // New: for filtering or categorization
// }

const dummyFaqs: FAQ[] = [
    {
        id: 'faq1',
        question: "How do I sign up for a new program?",
        answer: "Signing up is easy! Just navigate to our 'Programs' page, choose your desired plan, and follow the simple steps to create an account and enroll. You'll be ready to start your journey in minutes!",
        // category: "Getting Started",
    },
    {
        id: 'faq2',
        question: "What types of workouts are available?",
        answer: "We offer a diverse range of workouts including HIIT, yoga, strength training, dance fitness, and specialized recovery sessions. Our library is constantly updated with new content to keep things fresh and engaging.",
        // category: "Programs & Workouts",
    },
    {
        id: 'faq3',
        question: "Can I get personalized coaching?",
        answer: "Absolutely! We offer one-on-one coaching sessions with our certified experts. You can schedule a consultation directly from the 'Coaches & Experts' section to discuss your specific goals.",
        // category: "Coaching & Support",
    },
    {
        id: 'faq4',
        question: "Is there a mobile app to track my progress?",
        answer: "Yes, we have a fantastic mobile app available on both iOS and Android! You can download it from the App Store or Google Play to track workouts, monitor nutrition, and connect with the community on the go.",
        // category: "Technical & App",
    },
    {
        id: 'faq5',
        question: "What is your refund policy?",
        answer: "We offer a 30-day money-back guarantee on all our premium programs. If you're not completely satisfied, simply contact our support team within 30 days of purchase for a full refund. Your satisfaction is our priority!",
        // category: "Billing & Subscriptions",
    },
];

// ----------------------------------------------------------------------------
// FaqsSection: Transformed for an engaging, intuitive, captivating, and beautiful design
// ----------------------------------------------------------------------------
export default function FaqsSection({ faqs = dummyFaqs }: { faqs?: FAQ[] }) {
    const [openId, setOpenId] = useState<string | null>(null); // State to manage which FAQ is open

    const toggleFaq = (id: string | null | undefined) => {
        setOpenId(openId === id ? null : id!);
    };

    return (
        <motion.section
            className="relative py-20 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden" // Soft, inviting gradient
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
            {/* Abstract Background Blobs - adds visual depth and movement */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

            <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
                <motion.h2
                    className="mb-14 text-4xl md:text-5xl font-extrabold text-center text-gray-900 leading-tight"
                    // variants={itemVariants}
                >
                    Got Questions? We've Got <span className="text-primary-dark">Answers!</span> 💡
                </motion.h2>

                <div className="space-y-6">
                    {faqs.map((faq,i) => (
                        <motion.div
                            key={faq.id}
                            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-2xl" // Enhanced card styling
                            variants={faqItemVariants}
                            onClick={() => toggleFaq(faq?.id)} // Click handler on the div
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800">{faq.question}</h3>
                                <motion.div
                                    initial={false} // Prevents initial animation on mount
                                    animate={{ rotate: openId === faq.id ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronDownIcon className="h-7 w-7 text-primary-dark" /> {/* Larger, colored icon */}
                                </motion.div>
                            </div>
                            <AnimatePresence>
                                {openId === faq.id && (
                                    <motion.p
                                        key="answer" // Key for AnimatePresence to track
                                        variants={answerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="mt-4 text-lg text-gray-700 leading-relaxed" // More readable text
                                    >
                                        {faq.answer}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Call to action for unresolved questions */}
                <motion.div
                    className="text-center mt-16 p-8 bg-primary-light text-white rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-center gap-6"
                    // variants={itemVariants}
                >
                    <LightBulbIcon className="h-12 w-12 text-white drop-shadow-md" />
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Still Have Questions?</h3>
                        <p className="text-lg opacity-90">Our friendly support team is here to help you!</p>
                    </div>
                    <a
                        href="/contact" // Link to your contact page
                        className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-dark font-semibold rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        Contact Support <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </a>
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
// },
*/