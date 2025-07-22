'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence for exit animations
import { useStoreContext } from '@/contexts/StoreContext';

const defaultFaqs = [
  {
    question: 'How do I book a session?',
    answer: 'Our intuitive booking system allows you to easily browse available services and professionals, select your preferred time, and confirm your appointment in just a few clicks. It’s designed for your convenience!',
  },
  {
    question: 'Are the professionals on your platform certified?',
    answer: 'Absolutely. We rigorously vet all professionals on our platform to ensure they are fully licensed, highly experienced, and adhere to the highest industry standards. Your safety and satisfaction are our top priorities.',
  },
  {
    question: 'What is your cancellation or rescheduling policy?',
    answer: 'We understand plans can change. You can easily manage your bookings directly from your user dashboard, including rescheduling or canceling sessions. Please refer to our detailed policy page for specific timeframes and conditions to avoid any charges.',
  },
  {
    question: 'How secure are my payments?',
    answer: 'We prioritize your financial security. All transactions on our platform are processed through industry-leading, encrypted payment gateways. Your personal and payment information is always protected with the latest security protocols.',
  },
  {
    question: 'Do you offer gift cards?',
    answer: 'Yes! Give the gift of wellness with our customizable digital gift cards. They are perfect for friends, family, or colleagues and can be purchased directly through our website.',
  },
];

export default function FAQsSection() {
  const { storeFormData } = useStoreContext();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = storeFormData?.faqs?.length ? storeFormData.faqs : defaultFaqs;
  const storeName = storeFormData?.name || 'our platform';
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#00A880'; // Consistent primary color

  // Variants for FAQ answer animation
  const answerVariants = {
    open: { opacity: 1, height: 'auto', marginTop: '16px' },
    closed: { opacity: 0, height: 0, marginTop: '0px' },
  };

  return (
    <section id="faq" className="relative py-24 bg-gray-50 text-gray-900 overflow-hidden">
      {/* Subtle background texture/pattern */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url(/images/abstract-bg-light.svg)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />


      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span
            className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm" // Light mode badge
          >
            Common Questions
          </span>

          <h2
            className="text-4xl sm:text-5xl font-extrabold mt-6 text-gray-900 leading-tight" // Darker text, tighter leading
          >
            Your Questions, <span style={{ color: primaryColor }}>Answered</span>
          </h2>

          <p
            className="text-gray-700 mt-4 max-w-xl mx-auto text-lg leading-relaxed" // Darker gray for readability
          >
            We've compiled answers to the most common questions to help you navigate your experience on {storeName} with ease.
          </p>
        </motion.div>

        <div className="space-y-6"> {/* Increased space between FAQ items */}
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 * index }}
              viewport={{ once: true, amount: 0.4 }}
            >
              <div
                className={`cursor-pointer bg-white px-8 py-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-300 transform hover:-translate-y-1 ${
                  openIndex === index ? 'ring-2 ring-emerald-500 shadow-2xl' : '' // Ring on active
                }`}
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 pr-4">{faq.question}</h3> {/* Larger, bolder question */}
                  <motion.svg
                    className={`w-6 h-6 flex-shrink-0 transition-transform duration-300`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: openIndex === index ? 180 : 0 }} // Smooth rotation
                    initial={false} // Prevent initial animation on load
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </div>

                <AnimatePresence> {/* Enable exit animations */}
                  {openIndex === index && (
                    <motion.div
                      variants={answerVariants}
                      initial="closed"
                      animate="open"
                      exit="closed" // Defines exit animation
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="text-gray-700 text-base leading-relaxed" // More readable answer text
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}