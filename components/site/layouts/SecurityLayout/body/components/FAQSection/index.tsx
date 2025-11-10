'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, QuestionMarkCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline'; // New icons for visual flair
import { useStoreContext } from '@/contexts/StoreContext';

// Type definitions for clarity
interface FAQItem {
  question: string;
  answer: string;
  order?: number; // Optional order for sorting
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

export default function FAQsSection({faqs, themeSettings}:FAQsSectionProps) {

  // Robust theme color fallbacks
  const primaryColor = themeSettings?.primaryColor || '#007bff'; // Vibrant blue
  const secondaryColor = themeSettings?.secondaryColor || '#6c757d'; // Complementary gray
  const sectionBgColor = themeSettings?.sectionBgColor || '#f8f9fa'; // Light gray background for contrast
  const textColor = themeSettings?.textColor || '#1a202c'; // Dark text for headings (tailwind: gray-900)
  const answerTextColor = themeSettings?.answerTextColor || '#4a5568'; // Slightly lighter text for answers (tailwind: gray-700)
  const borderColor = '#e2e8f0'; // Tailwind: gray-200 for borders
  const accentLight = `${primaryColor}20`; // Primary color with 20% opacity for light accents

  // Prepare FAQs: use dynamicFaqs sorted by order if available, else fallback static
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
      answer: "Absolutely! We pride ourselves on working with only highly qualified and experienced professionals. All our coaches undergo a rigorous vetting process, possess relevant certifications from accredited institutions, and have a proven track record of success in their respective fields. Your growth is our priority.",
      order: 3,
    },
    {
      question: "Which payment methods do you accept?",
      answer: "For your convenience, we accept a variety of secure payment methods, including all major credit/debit cards (Visa, MasterCard, American Express), as well as popular digital wallets and local payment solutions like M-Pesa. Your transactions are always encrypted and secure.",
      order: 4,
    },
    {
      question: "Do you offer group coaching or workshops?",
      answer: "Yes, in addition to one-on-one sessions, we regularly host group coaching programs and specialized workshops designed to foster collective learning and skill development. Check our 'Events' or 'Programs' page for upcoming opportunities and details.",
      order: 5,
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
    <section
      id="faqs"
      className="relative py-24 md:py-32 px-6 lg:px-12 overflow-hidden"
      style={{ backgroundColor: sectionBgColor }}
    >
      {/* Background radial gradient at top right */}
      <div
        className="absolute top-0 right-0 w-1/3 h-1/3 opacity-10"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${primaryColor}, transparent 50%)`,
        }}
      />
      {/* Background radial gradient at bottom left */}
      <div
        className="absolute bottom-0 left-0 w-1/3 h-1/3 opacity-10"
        style={{
          background: `radial-gradient(circle at 0% 100%, ${secondaryColor}, transparent 50%)`,
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-gray-900 dark:text-gray-900 drop-shadow-sm" // Ensure dark mode text is visible
            style={{ color: textColor }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Your Questions, Our <span style={{ color: primaryColor }}>Answers</span>
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-700 max-w-2xl mx-auto" // Ensure dark mode text is visible
            style={{ color: answerTextColor }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Find quick answers to the most common questions about our services, booking process, and more.
          </motion.p>
        </div>

        <div className="space-y-6 text-left">
          {faqsData.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                className="rounded-3xl shadow-lg border transition-all duration-300 overflow-hidden"
                style={{
                  backgroundColor: isOpen ? accentLight : '#ffffff', // Light accent color when open, white when closed
                  borderColor: isOpen ? primaryColor : borderColor,
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% in view
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-8 py-6 text-left text-xl font-semibold focus:outline-none"
                  style={{ color: textColor }}
                >
                  <span className="flex items-center gap-4">
                    <QuestionMarkCircleIcon className="w-7 h-7" style={{ color: primaryColor }} />
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDownIcon className="w-6 h-6 text-gray-500" />
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
                        open: { height: 'auto', opacity: 1, paddingTop: '0px', paddingBottom: '24px' }, // Match actual padding in div below
                        collapsed: { height: 0, opacity: 0, paddingTop: '0px', paddingBottom: '0px' },
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }} // Crucial for height animation
                    >
                      <div
                        className="px-8 text-base leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-6" // Added top border and padding
                        style={{ color: answerTextColor }}
                      >
                        <LightBulbIcon className="w-6 h-6 inline-block mr-2 align-middle" style={{ color: secondaryColor }} />
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