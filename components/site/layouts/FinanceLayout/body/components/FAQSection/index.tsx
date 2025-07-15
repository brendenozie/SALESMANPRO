"use client";

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid'; // For expand/collapse icons

// Framer Motion variants (reusing for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Faster stagger for FAQs
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Colors (matching the previous sections)
const darkBackground = "#0A192F";
const cardBackground = "#1B2A41";
const accentColor = "#66B2FF";
const primaryBlue = "#004085";
const secondaryBlue = "#1F77B4";
const textColorLight = "#E0E7FF";
const textColorMuted = "#A7B8D6";

// Interface for an FAQ item
interface FAQItem {
  id: string | number;
  question: string;
  answer: string;
}

// Sample data for FAQs
const sampleFAQs: FAQItem[] = [
  {
    id: 'faq1',
    question: "What types of legal services do you offer?",
    answer: "We offer a comprehensive range of legal services including corporate law, intellectual property, real estate, litigation, and dispute resolution. Our experts are equipped to handle complex cases across various sectors.",
  },
  {
    id: 'faq2',
    question: "How do your financial advisory services work?",
    answer: "Our financial advisory services cover wealth management, investment planning, tax strategy, and estate planning. We work closely with you to understand your financial goals and create tailored strategies for sustainable growth.",
  },
  {
    id: 'faq3',
    question: "What is your typical client engagement process?",
    answer: "Our process begins with an initial consultation to understand your needs, followed by strategic planning, meticulous execution of the agreed-upon strategy, and continuous support with regular reviews to ensure long-term success.",
  },
  {
    id: 'faq4',
    question: "Are your consultations confidential?",
    answer: "Absolutely. All consultations and client interactions are treated with the utmost confidentiality and discretion, adhering to the highest standards of professional ethics and legal privacy regulations.",
  },
  {
    id: 'faq5',
    question: "How do I schedule an initial consultation?",
    answer: "You can easily schedule an initial consultation through our website's contact form, by calling our office directly, or by utilizing our online booking system available on the 'Consultation Packages' page.",
  },
];

interface FAQSectionProps {
  faqs?: FAQItem[]; // Allow faqs to be passed as a prop
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const faqsToDisplay = faqs && faqs.length > 0 ? faqs : sampleFAQs;
  const [openFAQ, setOpenFAQ] = React.useState<number | null>(null); // State to manage open/close of FAQ items

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section
      id="faqs"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden"
      style={{ background: darkBackground }} // Consistent dark background
    >
      {/* Background pattern for visual interest */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <Image
          src="/images/grid-pattern-light.svg" // Subtle grid pattern
          alt="background pattern"
          fill
          className="object-cover"
          style={{ mixBlendMode: "overlay" }}
          loader={({ src, width, quality }) =>
            `${src}?w=${width}&q=${quality || 75}`
          }
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
            Your Questions, Our Answers
          </h2>
          <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Find quick answers to the most common questions about our services and processes.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-6"
        >
          {faqsToDisplay.map((faq, i) => (
            <motion.div
              key={faq.id}
              variants={itemVariants}
              className="bg-gradient-to-br from-[#1B2A41] to-[#122033] rounded-2xl shadow-xl p-6 border border-transparent hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.005] cursor-pointer"
              onClick={() => toggleFAQ(i)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white leading-relaxed pr-4">
                  {faq.question}
                </h3>
                <span className="flex-shrink-0 text-blue-400">
                  {openFAQ === i ? (
                    <MinusIcon className="h-7 w-7 transition-transform duration-300" />
                  ) : (
                    <PlusIcon className="h-7 w-7 transition-transform duration-300" />
                  )}
                </span>
              </div>
              <AnimatePresence>
                {openFAQ === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mt-4 text-blue-100/80 leading-relaxed"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}