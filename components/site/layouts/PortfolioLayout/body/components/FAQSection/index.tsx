'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

export default function FAQsSection() {
  const { storeFormData } = useStoreContext();
  const { faqs: dynamicFaqs, themeSettings = {} } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#14B8A6'; // fallback teal
  const borderColorClosed = '#e5e7eb'; // gray-200
  const textColor = '#1f2937'; // slate-800
  const answerTextColor = '#4b5563'; // slate-600

  // Prepare FAQs: use dynamicFaqs sorted by order if available, else fallback static
  const staticFaqs = [
    {
      question: "How do I schedule a session?",
      answer: "You can book your session directly through our platform. Just pick a time that works for you, choose your coach or therapist, and confirm your slot.",
    },
    {
      question: "Can I cancel or reschedule?",
      answer: "Yes, rescheduling or canceling is easy and free up to 24 hours before your appointment.",
    },
    {
      question: "Are your coaches certified?",
      answer: "Absolutely. All our coaches are vetted professionals with certifications and proven experience in their fields.",
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major credit/debit cards, M-Pesa, and secure digital wallets like PayPal and Stripe.",
    },
  ];

  const faqsData: Array<{ question: string; answer: string }> =
    Array.isArray(dynamicFaqs) && dynamicFaqs.length > 0
      ? [...dynamicFaqs]
          .sort((a: any, b: any) => {
            const oa = typeof a.order === 'number' ? a.order : 0;
            const ob = typeof b.order === 'number' ? b.order : 0;
            return oa - ob;
          })
          .map((f: any) => ({
            question: f.question || '',
            answer: f.answer || '',
          }))
      : staticFaqs;

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section
      className="py-20"
      style={{
        background: `linear-gradient(to bottom, white, #f1f5f9)`, // white to slate-50
      }}
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold mb-14"
          style={{ color: textColor }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="space-y-6 text-left">
          {faqsData.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                className="rounded-2xl shadow-md transition-all duration-300 bg-white border"
                style={{
                  borderColor: isOpen ? primaryColor : borderColorClosed,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                viewport={{ once: true }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left text-lg font-semibold focus:outline-none"
                  style={{ color: textColor }}
                >
                  {faq.question}
                  <ChevronDownIcon
                    className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
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
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div
                        className="px-6 pb-6 text-base leading-relaxed"
                        style={{ color: answerTextColor }}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
