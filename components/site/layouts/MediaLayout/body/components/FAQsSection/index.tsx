'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircleIcon, MinusCircleIcon, QuestionMarkCircleIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQsSectionProps {
  faqs?: FAQItem[];
  title?: string;
  subtitle?: string;
}

// --- Mock Data (Fallbacks) ---
const fallbackFAQs: FAQItem[] = [
    {
        id: 'q1',
        question: 'What is the implementation timeline for new customers?',
        answer: 'Our standard implementation timeline ranges from 4 to 6 weeks, depending on the complexity of your existing infrastructure and data migration needs. This includes initial setup, data synchronization, staff training, and a two-week stabilization period.',
    },
    {
        id: 'q2',
        question: 'Do you offer a free trial or demonstration?',
        answer: 'Yes, we offer a comprehensive 14-day free trial that includes full access to all Professional tier features. We also provide personalized, one-on-one demonstrations tailored to your specific business requirements. Contact our sales team to schedule yours.',
    },
    {
        id: 'q3',
        question: 'How is customer support structured and accessed?',
        answer: 'Our support is tiered. Standard plans include 24/7 email support with a 4-hour response SLA. Premium plans include dedicated account managers, priority phone support, and a guaranteed 1-hour response SLA for critical issues.',
    },
    {
        id: 'q4',
        question: 'Can your platform integrate with existing CRM systems?',
        answer: 'Absolutely. Our platform utilizes a robust API layer designed for seamless integration with major CRM platforms like Salesforce, HubSpot, and Microsoft Dynamics, as well as several custom internal systems via webhooks.',
    }
];

/**
 * Transformed FAQs Section: Unified Indigo/Corporate Theme
 */
export default function FAQsSection({ faqs, title, subtitle }: FAQsSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const displayFAQs = (faqs && faqs.length > 0) ? faqs : fallbackFAQs;

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
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1, // Staggered appearance
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    }),
    hover: { 
        backgroundColor: "rgba(99, 102, 241, 0.05)", // Indigo-50 in light mode, Darker in dark mode
        scale: 1.005, 
        transition: { duration: 0.2 } 
    }, 
  };

  const answerVariants = {
    hidden: { opacity: 0, height: 0, paddingBottom: 0 },
    visible: { opacity: 1, height: "auto", paddingBottom: "1.5rem", transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    // Updated background to match the established theme (Light gray/Dark gray)
    <section id="faq-section" className="py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
            {/* Section Header - Styled for Corporate/Editorial Theme */}
            <motion.div
                className="text-center mb-16 max-w-4xl mx-auto"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={headingVariants}
            >
                <div className="flex items-center justify-center gap-2 mb-3">
                    <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-sm">
                        Q & A
                    </span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                    {title || "Frequently Asked Questions"}
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    {subtitle || "Everything you need to know about our products and services. If you can't find an answer, please contact us."}
                </p>
            </motion.div>


            {/* FAQs Accordion */}
            <div className="space-y-4 max-w-3xl mx-auto">
                {displayFAQs.map((q, i) => (
                    <motion.div
                        key={q.id || i}
                        // Updated card styling for Indigo theme
                        className={`rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-200 ${openIndex === i ? 'bg-indigo-50 dark:bg-gray-900 border-indigo-300 dark:border-indigo-700' : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        variants={itemVariants}
                        initial="hidden"
                        whileInView="visible"
                        whileHover="hover"
                        viewport={{ once: true, amount: 0.1 }}
                        custom={i}
                    >
                        <button
                            className="w-full flex justify-between items-center p-5 md:p-6 text-left focus:outline-none group"
                            onClick={() => toggleFAQ(i)}
                            aria-expanded={openIndex === i}
                            aria-controls={`faq-answer-${q.id || i}`}
                        >
                            <div className="inline-flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                                <QuestionMarkCircleIcon className={`h-6 w-6 mr-3 transition-colors duration-200 ${openIndex === i ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'}`} />
                                {q.question}
                            </div>
                            <motion.span
                                animate={{ rotate: openIndex === i ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="ml-4 flex-shrink-0"
                            >
                                {openIndex === i ? (
                                    <MinusCircleIcon className="h-6 w-6 text-indigo-600" />
                                ) : (
                                    <PlusCircleIcon className="h-6 w-6 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
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
                                    className="px-5 md:px-6 text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base border-t border-indigo-200 dark:border-indigo-800"
                                >
                                    <div className='pt-4'>
                                        {q.answer}
                                    </div>
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