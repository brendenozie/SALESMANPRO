'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  question: string;
  answer: string;
  order?: number;
}

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  answerTextColor?: string;
  sectionBgColor?: string;
}

interface FAQsSectionProps {
  faqs?: FAQItem[];
  themeSettings?: ThemeSettings | undefined | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 16,
    },
  },
};

export default function FAQsSection({ faqs, themeSettings }: FAQsSectionProps) {
  const primaryColor = themeSettings?.primaryColor || '#000000';

  const staticFaqs: FAQItem[] = [
    {
      question: "How do I schedule a session?",
      answer: "Booking your session is easy and intuitive! Simply navigate to our 'Services' or 'Book Now' section, choose your preferred service and coach, and select a time slot that fits your schedule. Our system will guide you through the quick confirmation process.",
      order: 1,
    },
    {
      question: "What is your cancellation and rescheduling policy?",
      answer: "We understand that plans can change. You can easily reschedule or cancel your session through your dashboard up to 24 hours before your appointment. For cancellations within 24 hours, please refer to our full policy on the 'Terms & Conditions' page.",
      order: 2,
    },
    {
      question: "Are your coaches certified and experienced?",
      answer: "Absolutely! We pride ourselves on working with only highly qualified and experienced professionals. All our coaches undergo a rigorous vetting process, possess relevant certifications from accredited institutions, and have a proven track record of success in their respective fields.",
      order: 3,
    },
    {
      question: "Which payment methods do you accept?",
      answer: "For your convenience, we accept a variety of secure payment methods, including all major credit/debit cards (Visa, MasterCard, American Express), as well as popular digital wallets and local payment solutions like M-Pesa. Your transactions are always encrypted and secure.",
      order: 4,
    },
  ];

  const faqsData: FAQItem[] =
    Array.isArray(faqs) && faqs.length > 0
      ? [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0))
      : staticFaqs;

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <AnimatePresence>
      <section
        id="faqs"
        className="relative py-24 lg:py-32 px-6 lg:px-8 bg-white text-slate-900 overflow-hidden border-b border-slate-100"
      >
        {/* Minimal Wire Grid Background Sync */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          
          {/* Section Header */}
          <motion.div
            className="text-center mb-20 flex flex-col items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Minimal Inline Badge Tagline */}
            <motion.div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 mb-5"
              variants={itemVariants}
            >
              <SparklesIcon className="w-4 h-4 text-slate-600" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                Information Base
              </p>
            </motion.div>

            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl leading-[1.15] text-slate-900"
              variants={itemVariants}
            >
              Your Questions, Our <span style={{ color: primaryColor }}>Answers</span>
            </motion.h2>

            <motion.p
              className="mt-6 text-slate-500 max-w-2xl text-lg font-normal leading-relaxed"
              variants={itemVariants}
            >
              Find quick answers to the most common questions about our services, booking process, and operational matrix frameworks.
            </motion.p>
          </motion.div>

          {/* Structured Accordion Grid Row Stack */}
          <motion.div
            className="space-y-4 text-left"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {faqsData.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div
                  key={i}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-900"
                  variants={itemVariants}
                >
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between px-6 py-5 sm:px-8 sm:py-6 text-left text-base sm:text-lg font-bold text-slate-900 focus:outline-none gap-4 group"
                  >
                    <span className="tracking-tight leading-snug">{faq.question}</span>
                    <motion.div
                      className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center transition-colors duration-200 group-hover:bg-slate-900 group-hover:border-slate-900"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                      <ChevronDownIcon className="w-3.5 h-3.5 text-slate-600 transition-colors duration-200 group-hover:text-white" strokeWidth={2.5} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                          open: { height: 'auto', opacity: 1 },
                          collapsed: { height: 0, opacity: 0 },
                        }}
                        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                      >
                        <div className="px-6 pb-6 sm:px-8 sm:pb-7 text-sm sm:text-base text-slate-500 font-normal leading-relaxed tracking-normal border-t border-slate-100 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}