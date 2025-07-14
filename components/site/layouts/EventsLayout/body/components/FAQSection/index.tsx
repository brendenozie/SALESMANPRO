"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline'; // Importing specific icon

// Mocking the image loader since Next.js Image is not available (kept for context)
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Framer Motion variants for FAQ items
const faqItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Framer Motion variants for the answer content
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
};

export default function FAQSection({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative bg-gray-950 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden">
      {/* Decorative Background Elements - consistent with other sections */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Questions</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-lg text-gray-300 mb-20 max-w-2xl mx-auto"
        >
          Everything you need to know about using our platform, from event creation to attendee management.
        </motion.p>

        <div className="space-y-6 text-left">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={faqItemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.05 }} // Staggered animation for each FAQ
              className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden
                         hover:border-purple-500 transition-all duration-300 group" // Added group class for icon animation
            >
              <button
                onClick={() => toggle(index)}
                className="flex items-center justify-between w-full text-left text-xl font-semibold p-6
                           text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {faq.question}
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon
                    className="w-7 h-7 text-purple-400 group-hover:text-pink-400 transition-colors duration-300"
                  />
                </motion.span>
              </button>
              <motion.div
                initial="hidden"
                animate={openIndex === index ? "visible" : "hidden"}
                variants={answerVariants}
                className="px-6 pb-6 text-gray-300 leading-relaxed"
              >
                {faq.answer}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}