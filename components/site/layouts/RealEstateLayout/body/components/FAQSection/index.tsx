"use client";

import React, { useState } from 'react'; // Ensure useState is imported
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence for smooth exit animations
import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid'; // New icons for better visuals

// Custom loader is not directly used in this component, but keeping it for context
const customLoader = ({ src, width, quality }:any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal of FAQ items
const faqItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
    },
  },
};

// Animation variants for the answer content
const answerVariants = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: "auto",
    transition: {
      opacity: { duration: 0.2, delay: 0.1 },
      height: { duration: 0.3, ease: "easeInOut" },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      opacity: { duration: 0.2 },
      height: { duration: 0.3, ease: "easeInOut" },
    },
  },
};

//──────────────────────────────────────────────────────────────────────────────
// FAQSection
//──────────────────────────────────────────────────────────────────────────────
export default function FAQSection({ faqs }: any) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Handle empty FAQs array gracefully
  if (!faqs || faqs.length === 0) {
    return (
      <section className="bg-gradient-to-t from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 sm:py-24 text-center text-gray-700 dark:text-gray-300">
        <p className="text-xl">No frequently asked questions available at the moment.</p>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-t from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-20 sm:py-28 relative overflow-hidden">
      {/* Background shapes for visual interest */}
      <div className="absolute top-1/4 -left-16 w-48 h-48 bg-emerald-200/15 dark:bg-emerald-800/15 rounded-full filter blur-3xl opacity-60 z-0"></div>
      <div className="absolute bottom-1/3 -right-16 w-64 h-64 bg-amber-200/15 dark:bg-amber-800/15 rounded-full filter blur-3xl opacity-60 z-0"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 text-center mb-16 relative"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Frequently Asked <span className="text-emerald-600 dark:text-teal-400">Questions</span>
          <span className="block w-36 h-1 bg-amber-500 mx-auto mt-4 rounded-full" /> {/* Accent line */}
        </motion.h2>

        <div className="space-y-6"> {/* Increased space-y for better visual separation */}
          {faqs.map((q: any, idx: number) => (
            <motion.div
              key={q.question || idx} // Use question as key, fallback to idx
              variants={faqItemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-gray-850 rounded-3xl shadow-xl overflow-hidden
                         border border-gray-100 dark:border-gray-800" /* Added subtle border */
            >
              <motion.button
                type="button"
                className="flex justify-between items-center w-full text-left px-7 py-5 text-xl font-semibold text-gray-900 dark:text-gray-50
                           hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                onClick={() => toggle(idx)}
                aria-expanded={openIndex === idx}
                aria-controls={`faq-content-${idx}`}
                id={`faq-button-${idx}`}
              >
                <span className="flex items-center">
                  <QuestionMarkCircleIcon className="w-6 h-6 text-emerald-500 dark:text-teal-400 mr-3 flex-shrink-0" />
                  {q.question}
                </span>
                <motion.span
                  className="ml-2 flex-shrink-0"
                  animate={{ rotate: openIndex === idx ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </motion.span>
              </motion.button>

              <AnimatePresence> {/* Ensures exit animation plays */}
                {openIndex === idx && (
                  <motion.div
                    id={`faq-content-${idx}`}
                    className="px-7 pb-6 text-gray-700 dark:text-gray-300 text-lg leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4"
                    variants={answerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <p>{q.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}