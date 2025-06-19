'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const faqs = [
  {
    question: 'How do I book a massage session?',
    answer:
      'Simply browse therapists, choose your preferred service, and schedule your session in just a few clicks using our booking system.',
  },
  {
    question: 'Are therapists certified?',
    answer:
      'Yes, all professionals on our platform are vetted, licensed, and meet industry standards for therapeutic massage.',
  },
  {
    question: 'Can I reschedule or cancel a session?',
    answer:
      'Absolutely! You can manage your bookings from your profile, including rescheduling and cancellations within the allowed time frame.',
  },
  {
    question: 'Is payment secure?',
    answer:
      'All transactions are processed through trusted and encrypted payment gateways to ensure your data is safe.',
  },
];

export default function FAQsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-24 bg-gray-950 text-white overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-black to-gray-950" />

      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-rose-100 text-rose-600 text-sm font-medium px-4 py-1.5 rounded-full">
            FAQs
          </span>

          <h2 className="text-4xl font-bold mt-6 text-white">
            Frequently Asked Questions
          </h2>

          <p className="text-gray-300 mt-4 max-w-xl mx-auto">
            We’ve got answers to help you make the most of your wellness experience.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div
                className={`cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 px-6 py-5 rounded-2xl shadow-md hover:shadow-xl transition-all ${
                  openIndex === index ? 'ring-1 ring-rose-500' : ''
                }`}
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                <div
                  className={`mt-3 text-gray-300 text-sm transition-all duration-300 ${
                    openIndex === index ? 'block' : 'hidden'
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
