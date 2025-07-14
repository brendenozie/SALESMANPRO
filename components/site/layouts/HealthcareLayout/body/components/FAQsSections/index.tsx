"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { QuestionMarkCircleIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'; // Importing relevant solid icons

interface FAQ {
  id: string; // Unique ID for each FAQ
  question: string;
  answer: string;
  category?: string; // Optional: for filtering/categorization
}

interface FAQsSectionProps {
  name: string; // Clinic name
  slug: string; // Clinic slug for internal linking (e.g., to a full FAQ page)
  faqs: FAQ[]; // Array of FAQ objects
}

export default function FAQsSection({ name, slug, faqs }: FAQsSectionProps) {
  const router = useRouter();
  const [openFAQId, setOpenFAQId] = useState<string | null>(null); // State to manage one open FAQ at a time
  const [searchTerm, setSearchTerm] = useState('');

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const answerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="bg-gradient-to-br from-white to-sky-50 dark:from-gray-950 dark:to-gray-900 py-20 lg:py-28 relative overflow-hidden">
      {/* Background Gradients/Shapes for Visual Interest */}
      <div className="absolute inset-0 z-0 opacity-10">
        <motion.div
          className="absolute w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl top-1/4 left-1/4 animate-blob-slow"
          initial={{ x: -100, y: -100 }}
          animate={{ x: 0, y: 0 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl bottom-1/4 right-1/4 animate-blob-slow"
          initial={{ x: 100, y: 100 }}
          animate={{ x: 0, y: 0 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 2, repeatType: "reverse" }}
        />
      </div>

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block bg-teal-500/15 text-teal-700 dark:bg-teal-400/20 dark:text-teal-400 uppercase text-sm tracking-widest rounded-full px-4 py-2 mb-4 font-semibold shadow-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Quick Answers
          </motion.span>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight drop-shadow-lg"
          >
            Your <span className="text-indigo-600 dark:text-indigo-400">Questions Answered</span>
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-700 dark:text-gray-300 text-center mt-4 max-w-3xl mx-auto leading-relaxed"
          >
            Find quick solutions to common queries about our services, appointments, and care.
          </motion.p>
        </div>

        {/* Search Bar for FAQs */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ delay: 0.4 }}
          className="relative mb-12"
        >
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-full bg-white dark:bg-gray-800 shadow-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-opacity-50 transition-all duration-200"
            aria-label="Search frequently asked questions"
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 dark:text-gray-500" />
        </motion.div>

        <div className="space-y-6">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, i) => (
              <motion.div
                key={faq.id || i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeIn}
                transition={{ delay: i * 0.08, duration: 0.5 }} // Faster stagger for list items
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden cursor-pointer
                           transform transition-all duration-300 ease-in-out hover:shadow-2xl"
              >
                <div
                  className="flex items-center justify-between p-6 pr-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-3xl"
                  onClick={() => setOpenFAQId(openFAQId === faq.id ? null : faq.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setOpenFAQId(openFAQId === faq.id ? null : faq.id);
                    }
                  }}
                  aria-expanded={openFAQId === faq.id}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed pr-4">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openFAQId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDownIcon className="w-6 h-6 text-teal-500 dark:text-teal-400 flex-shrink-0" />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {openFAQId === faq.id && (
                    <motion.div
                      id={`faq-answer-${faq.id}`}
                      variants={answerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="px-6 pb-6 pt-0 text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700"
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center text-gray-700 dark:text-gray-300"
            >
              <p className="text-lg">No FAQs found matching your search. Please try a different term.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 inline-flex items-center text-teal-600 dark:text-teal-400 font-semibold hover:underline"
              >
                Clear Search
              </button>
            </motion.div>
          )}
        </div>

        {/* Call to action for more questions */}
        <div className="text-center mt-20">
          <motion.button
            className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xl font-semibold rounded-full shadow-lg transition-all duration-300
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
            whileHover={{ scale: 1.05, boxShadow: "0px 12px 30px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${slug}/contact-form`)} // Link to contact form or full support page
            aria-label="Ask a question or contact us directly"
          >
            Still Have Questions? Contact Us
            <QuestionMarkCircleIcon className="w-6 h-6 ml-3" />
          </motion.button>
        </div>
      </div>
      {/* Tailwind CSS keyframes for slow blob animation (add to your global CSS or an inline style tag if necessary) */}
      <style jsx>{`
        @keyframes blob-slow {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(20px, -20px);
          }
          50% {
            transform: translate(-30px, 10px);
          }
          75% {
            transform: translate(10px, 30px);
          }
        }
        .animate-blob-slow {
          animation: blob-slow 20s infinite;
        }
      `}</style>
    </section>
  );
}