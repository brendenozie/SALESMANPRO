"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PlusIcon,
  MinusIcon, // Using MinusIcon for the 'X' to look more like a collapse
  QuestionMarkCircleIcon, // New icon for FAQ section
  EnvelopeIcon, // For contact us
} from "@heroicons/react/24/outline";
import Link from "next/link"; // For the CTA link

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal (reused for consistency)
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08, // Slightly faster stagger for clarity
      delayChildren: 0.1, // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120, // Slightly more stiff
      damping: 12, // More damping
    },
  },
};

// --- Dummy Data for FAQs (Replace with your actual data) ---
const dummyFaqs = [
  {
    question: "What exactly is your platform and who is it for?",
    answer: "Our platform is a comprehensive SaaS solution designed to streamline [mention your core function, e.g., project management, customer relations, data analytics] for businesses of all sizes, from startups to large enterprises. It helps teams collaborate, automate workflows, and gain valuable insights.",
  },
  {
    question: "How difficult is it to set up and integrate with existing tools?",
    answer: "We've designed our platform for ease of use. Most users can get started within minutes. We offer robust integration options with popular tools through our API and pre-built connectors. Our support team is also available to assist with complex setups.",
  },
  {
    question: "What kind of support can I expect?",
    answer: "We offer multi-channel support including comprehensive documentation, email support, and live chat. Priority support and dedicated account management are available with our higher-tier plans. Our goal is to ensure your success.",
  },
  {
    question: "Is my data secure with your platform?",
    answer: "Absolutely. Data security is our top priority. We employ industry-leading encryption, regular security audits, and adhere to strict data protection regulations (e.g., GDPR, SOC 2 Type II compliant). Your data is always safe with us.",
  },
  {
    question: "Can I try the platform before committing to a plan?",
    answer: "Yes, we offer a [mention duration, e.g., 14-day free trial] that gives you full access to most features, allowing you to explore the platform's capabilities and see how it fits your needs without any commitment. No credit card required to start!",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, including Visa, MasterCard, American Express, and Discover. For annual subscriptions or enterprise plans, we also offer invoicing and bank transfers.",
  },
];

//──────────────────────────────────────────────────────────────────────────────
// EnhancedFAQsSection
//──────────────────────────────────────────────────────────────────────────────
export default function EnhancedFAQsSection({ faqs = [] }: { faqs?: any[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const displayFaqs = faqs.length > 0 ? faqs : dummyFaqs;

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-indigo-700 dark:text-indigo-400 drop-shadow-sm"
            variants={itemVariants}
          >
            Your Questions, Answered.
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Find quick answers to the most common questions about our platform, features, and pricing.
          </motion.p>
        </motion.div>

        {/* Accordion List */}
        <motion.div
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {displayFaqs.map((q, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                variants={itemVariants}
                whileHover={{ translateY: -4, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <motion.button
                  className="w-full flex items-center justify-between p-6 cursor-pointer
                             bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                             transition-all duration-200 ease-in-out"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  // Adding subtle click animation
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="text-xl font-semibold text-left text-gray-900 dark:text-gray-100 pr-4">
                    {q.question}
                  </span>
                  <motion.span
                    initial={false} // Prevents initial animation on mount if already open
                    animate={{ rotate: isOpen ? 45 : 0 }} // Rotate for Plus/Minus effect
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-shrink-0" // Prevents icon from shrinking
                  >
                    {isOpen ? (
                      <MinusIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <PlusIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </motion.span>
                </motion.button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0, paddingBottom: 0 }}
                      animate={{ height: "auto", opacity: 1, paddingBottom: "1.5rem" }} // Add padding bottom
                      exit={{ height: 0, opacity: 0, paddingBottom: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="px-6 pt-4 bg-white dark:bg-gray-900" // Add padding top
                    >
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        {q.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action for More Help */}
        <motion.div
          className="text-center mt-20 p-8 bg-indigo-600 dark:bg-indigo-500 rounded-2xl shadow-xl text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <QuestionMarkCircleIcon className="h-16 w-16 mx-auto mb-4 opacity-70" />
          <motion.h3
            className="text-3xl font-bold mb-4"
            variants={itemVariants}
          >
            Can't find your answer?
          </motion.h3>
          <motion.p
            className="text-lg mb-8 opacity-90 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Our dedicated support team is here to help! Reach out to us directly, and we'll be happy to assist you.
          </motion.p>
          <Link href="/contact" passHref>
            <motion.button
              className="inline-flex items-center gap-3 bg-white text-indigo-700 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-100 transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <EnvelopeIcon className="h-5 w-5" />
              Contact Support
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}