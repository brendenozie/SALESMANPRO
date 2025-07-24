'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

// Define the structure of a single FAQ as it comes from StoreForm
export type FAQ = {
  id: string;
  question: string;
  answer: string;
  order: number; // For sorting
};

// Define the relevant parts of StoreForm that FAQSection uses
export type StoreForm = {
  faqs?: FAQ[]; // Array of FAQ objects
  // Add other relevant StoreForm fields if needed
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
const useStoreContext = () => ({
  storeFormData: {
    faqs: [
      {
        id: 'faq1',
        question: 'How do I create an account on Ducun Vijed?',
        answer: 'Signing up is easy! Click on the "Sign Up" button at the top right corner. You can register using your email address, Google, or Facebook account. Follow the prompts to complete your profile.',
        order: 1,
      },
      {
        id: 'faq2',
        question: 'What types of services can I find on your platform?',
        answer: 'Ducun Vijed offers a wide range of local services including beauty & wellness (massages, hair, nails), home services (plumbing, electrical, cleaning), professional services (tutoring, legal advice), pet care, and many more. We are constantly expanding our offerings to meet community needs.',
        order: 2,
      },
      {
        id: 'faq3',
        question: 'How do I book a service with a provider?',
        answer: 'Browse categories or use our search bar to find a service. Click on a listing to view details, available schedules, and provider information. Select your preferred date and time, then proceed to secure payment to confirm your booking.',
        order: 3,
      },
      {
        id: 'faq4',
        question: 'Are service providers on Ducun Vijed verified?',
        answer: 'Yes, absolutely. We prioritize your safety and satisfaction. All service providers undergo a thorough verification process, which includes identity checks, credential verification, and often background checks, depending on the service type.',
        order: 4,
      },
      {
        id: 'faq5',
        question: 'Can I reschedule or cancel a booking?',
        answer: 'You can manage your bookings directly from your user dashboard. Rescheduling and cancellation policies vary by provider, so please review the specific terms on the listing page before booking. Any cancellation fees will be clearly communicated.',
        order: 5,
      },
      {
        id: 'faq6',
        question: 'What if I need to contact customer support?',
        answer: 'Our dedicated support team is here to assist you. You can reach us through the "Contact Us" section on our website, or by emailing support@ducunvijed.com. We aim to respond to all inquiries within 24 hours.',
        order: 6,
      },
      {
        id: 'faq7',
        question: 'How does payment work on Ducun Vijed?',
        answer: 'All payments are processed securely through our platform. You can pay using major credit/debit cards or other integrated payment methods. Your payment details are encrypted and never stored on our servers.',
        order: 7,
      },
    ],
  } as StoreForm,
});

// Static fallback data (matches the structure we'll use for rendering)
const fallbackFaqs = [
  {
    question: 'How do I create an account on Ducun Vijed?',
    answer: 'Signing up is easy! Click on the "Sign Up" button at the top right corner. You can register using your email address, Google, or Facebook account. Follow the prompts to complete your profile.',
  },
  {
    question: 'What types of services can I find on your platform?',
    answer: 'Ducun Vijed offers a wide range of local services including beauty & wellness (massages, hair, nails), home services (plumbing, electrical, cleaning), professional services (tutoring, legal advice), pet care, and many more. We are constantly expanding our offerings to meet community needs.',
  },
  {
    question: 'How do I book a service with a provider?',
    answer: 'Browse categories or use our search bar to find a service. Click on a listing to view details, available schedules, and provider information. Select your preferred date and time, then proceed to secure payment to confirm your booking.',
  },
  {
    question: 'Are service providers on Ducun Vijed verified?',
    answer: 'Yes, absolutely. We prioritize your safety and satisfaction. All service providers undergo a thorough verification process, which includes identity checks, credential verification, and often background checks, depending on the service type.',
  },
  {
    question: 'Can I reschedule or cancel a booking?',
    answer: 'You can manage your bookings directly from your user dashboard. Rescheduling and cancellation policies vary by provider, so please review the specific terms on the listing page before booking. Any cancellation fees will be clearly communicated.',
  },
  {
    question: 'What if I need to contact customer support?',
    answer: 'Our dedicated support team is here to assist you. You can reach us through the "Contact Us" section on our website, or by emailing support@ducunvijed.com. We aim to respond to all inquiries within 24 hours.',
  },
  {
    question: 'How does payment work on Ducun Vijed?',
    answer: 'All payments are processed securely through our platform. You can pay using major credit/debit cards or other integrated payment methods. Your payment details are encrypted and never stored on our servers.',
  },
];

// Main FAQ Section Component
export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Destructure storeFormData from context
  const { storeFormData } = useStoreContext() || {};
  const { faqs: dynamicFaqs } = storeFormData || {};

  // Determine which FAQ data to use: dynamic or fallback
  const faqsToRender = Array.isArray(dynamicFaqs) && dynamicFaqs.length > 0
    ? dynamicFaqs.sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
    : fallbackFaqs; // Use static fallback FAQs

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Framer Motion variants for section and items
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const answerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  return (
    <motion.section
      id="faq-section" // Unique ID for direct linking
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
    >
      <div className="container mx-auto max-w-4xl text-center">
        {/* Subtitle Badge */}
        <motion.span
          className="inline-block bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 shadow-sm"
          variants={itemVariants}
        >
          Your Questions, Answered
        </motion.span>

        {/* Headline */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-12"
          variants={itemVariants}
        >
          Frequently Asked <span className="text-purple-600 dark:text-purple-400">Questions</span>
        </motion.h2>

        {/* FAQ Items */}
        <div className="space-y-6 text-left">
          {faqsToRender.map((q, index) => (
            <motion.div
              key={q.question} // Using question as key, assuming unique questions; ideally use q.id
              variants={itemVariants}
              onClick={() => toggleFAQ(index)}
              className="group bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <QuestionMarkCircleIcon className="inline-block h-6 w-6 mr-2 text-blue-500 dark:text-blue-400" />
                  {q.question}
                </h3>
                <ChevronDownIcon
                  className={`w-6 h-6 ml-2 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </div>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={answerVariants}
                    className="mt-4"
                  >
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                      {q.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
