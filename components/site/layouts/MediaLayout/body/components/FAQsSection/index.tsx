"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircleIcon, MinusCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid'; // Icons for open/close state

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQsSectionProps {
  faqs: FAQItem[];
}

/**
 * Intuitive, Engaging, and Visually Appealing FAQs Section
 * Provides answers to common questions with an interactive accordion design.
 */
export default function FAQsSection({ faqs }: FAQsSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Variants for section heading
  const headingVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Variants for individual FAQ items
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1, // Staggered appearance
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    }),
    hover: { scale: 1.01, boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }, // Subtle lift on hover
  };

  const answerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <section className="py-20 bg-gradient-to-br from-black to-gray-950 text-white overflow-hidden"> {/* Consistent dark gradient */}
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl"> {/* Increased max-width */}
        {/* Section Header */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-16 relative z-10 tracking-tight"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={headingVariants}
        >
          Your Burning Questions, Answered 🔥
          <span className="block w-40 h-1 bg-red-600 mx-auto mt-4 rounded-full"></span>
        </motion.h2>

        {/* FAQs Accordion */}
        <div className="space-y-6"> {/* Increased space between items */}
          {faqs.map((q, i) => (
            <motion.div
              key={q.id || i} // Use unique ID if available, fallback to index
              className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden" // Darker background, border, shadow
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, amount: 0.1 }}
              custom={i} // Pass index as custom prop for staggered animation
            >
              <button
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400 group"
                onClick={() => toggleFAQ(i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${q.id || i}`}
              >
                <div className="inline-flex items-center text-xl font-semibold text-white group-hover:text-red-400 transition-colors duration-200">
                  <QuestionMarkCircleIcon className="h-6 w-6 mr-3 text-red-500 group-hover:text-red-400 transition-colors duration-200" />
                  {q.question}
                </div>
                <motion.span
                  animate={{ rotate: openIndex === i ? 180 : 0 }} // Rotate icon
                  transition={{ duration: 0.3 }}
                >
                  {openIndex === i ? (
                    <MinusCircleIcon className="h-7 w-7 text-red-500" />
                  ) : (
                    <PlusCircleIcon className="h-7 w-7 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
                  )}
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    id={`faq-answer-${q.id || i}`}
                    variants={answerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="px-6 pb-6 pt-0 text-gray-300 leading-relaxed"
                  >
                    {q.answer}
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