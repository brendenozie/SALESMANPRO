"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline'; // Icon for expand/collapse
import { useStoreContext } from '@/contexts/StoreContext'; // Import useStoreContext

// Mocking context data for demonstration purposes
const useMockStoreContext = () => ({
  storeFormData: {
    themeSettings: {
      primaryColor: "#fd2121", // Red from your sample
      secondaryColor: "#ffffff", // White from your sample
    },
    faqs: [
      {
        id: 1,
        question: "How do I enroll in a course?",
        answer: "Enrolling is simple! Browse our courses, select your desired program, and click 'Enroll Now'. You'll be guided through a quick registration and payment process.",
      },
      {
        id: 2,
        question: "Are there any prerequisites for courses?",
        answer: "Most introductory courses have no prerequisites. Advanced courses may require prior knowledge or specific certifications, which will be clearly stated in the course description.",
      },
      {
        id: 3,
        question: "What payment methods are accepted?",
        answer: "We accept major credit cards (Visa, MasterCard, American Express), PayPal, and various local payment options. Check our payment page for a full list.",
      },
      {
        id: 4,
        question: "Can I get a refund if I'm not satisfied?",
        answer: "Yes, we offer a 30-day money-back guarantee for most courses. Please review our refund policy for detailed terms and conditions.",
      },
      {
        id: 5,
        question: "Do you offer career support or placement?",
        answer: "While we don't guarantee job placement, many of our courses include career guidance, resume workshops, and networking opportunities to help you succeed.",
      },
    ],
  },
});

// Animation variants for individual FAQ items
const faqItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

// Animation variants for the answer content
const answerVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      opacity: { duration: 0.2 },
      height: { duration: 0.3, ease: "easeInOut" },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      opacity: { duration: 0.2 },
      height: { duration: 0.3, ease: "easeInOut" },
    },
  },
};

// FAQItem Component
type FAQ = {
  id: number;
  question: string;
  answer: string;
};

type FAQItemProps = {
  faq: FAQ;
  primaryColor: string;
  accentColor: string;
};

const FAQItem: React.FC<FAQItemProps> = ({ faq, primaryColor, accentColor }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md mb-4 overflow-hidden border border-gray-100" // Light background, shadow, border
      variants={faqItemVariants}
      whileHover={{ scale: 1.01, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }} // Subtle hover effect
    >
      <button
        className="flex justify-between items-center w-full p-6 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-gray-900 flex-grow">{faq.question}</h3>
        <ChevronDownIcon
          className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={answerVariants}
            className="px-6 pb-6 pt-0"
          >
            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


export default function FAQSection() {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  const { storeFormData } = useMockStoreContext(); // Using mock to ensure consistent defaults and data structure.

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121'; // Your brand's primary color (red)
  const accentColor = "#FFC107"; // A vibrant amber/yellow for highlights

  const faqs = storeFormData?.faqs || [];

  // Animation variants for section title
  const sectionTitleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 10,
        duration: 0.6,
      },
    },
  };

  // Animation variants for the FAQ items container (staggering children)
  const faqContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger each FAQ item
        delayChildren: 0.3, // Delay the start of children animations
      },
    },
  };

  return (
    <motion.section
      className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8" // Light background
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }} // Animate when 20% of the section is in view
      variants={faqContainerVariants} // Apply container variants to the section
    >
      <div className="max-w-3xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-gray-900 leading-tight"
          variants={sectionTitleVariants} // Apply title variants
        >
          Frequently Asked <span style={{ color: primaryColor }}>Questions</span>
        </motion.h2>
        <motion.div> {/* This div will apply the staggerChildren */}
          {faqs.map((faq) => (
            <FAQItem key={faq.id} faq={faq} primaryColor={primaryColor} accentColor={accentColor} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
