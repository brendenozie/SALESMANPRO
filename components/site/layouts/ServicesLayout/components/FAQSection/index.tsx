"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline'; // Using ChevronDown for a modern toggle icon
import { useStoreContext } from '@/contexts/StoreContext';

export default function FAQSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">Fetching common questions...</p>
      </div>
    );
  }

  const { faqs, themeSettings } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || '#0d9488'; // teal-600 fallback
  const secondaryColor = themeSettings?.secondaryColor || '#f97316'; // orange-500 fallback

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) {
    return null; // Don't render the section if no FAQs are available
  }

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section id="faq" className="bg-white dark:bg-gray-950 py-16 lg:py-24 px-4 relative overflow-hidden">
      {/* Background blobs for visual interest */}
      <div
        className="absolute top-0 -left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-alt animation-delay-0"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-alt animation-delay-2000"
        style={{ backgroundColor: secondaryColor }}
      />

      <motion.div
        className="max-w-4xl mx-auto text-center relative z-10"
        initial="hidden"
        whileInView="visible"
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 text-gray-900 dark:text-gray-100" variants={itemVariants}>
          Frequently Asked <span className="bg-clip-text text-transparent" style={{ backgroundColor: primaryColor }}>Questions</span>
        </motion.h2>
        <motion.p className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto" variants={itemVariants}>
          Find quick answers to the most common questions about our services.
        </motion.p>

        <div className="space-y-6 text-left">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-md dark:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden" // Added overflow-hidden for AnimatePresence
              variants={itemVariants}
            >
              <button
                className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-900 dark:text-gray-100 group"
                onClick={() => toggle(index)}
                aria-expanded={openIndex === index ? 'true' : 'false'}
              >
                <span>{faq.question}</span>
                <motion.span
                  className="flex-shrink-0 ml-4 transition-transform duration-300"
                  initial={false} // Prevent initial animation on render
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  style={{ color: primaryColor }} // Apply primary color to the icon
                >
                  <ChevronDownIcon className="w-7 h-7" /> {/* Larger, modern chevron icon */}
                </motion.span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: "auto", marginTop: "16px" }, // mt-4 for spacing
                      collapsed: { opacity: 0, height: 0, marginTop: "0px" }
                    }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }} // Smoother custom ease
                  >
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}