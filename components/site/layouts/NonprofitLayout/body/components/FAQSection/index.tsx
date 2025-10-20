"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, MinusIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'; // Using Plus/Minus for clarity
// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from '@/contexts/StoreContext';
import { FAQ } from '@/types/typings';

// Define types based on your transformCompanyToStoreForm and Prisma schema
// export type FAQ = {
//   id: string; // Changed to string as per schema.txt
//   question: string;
//   answer: string;
//   order: number; // For sorting
// };

// export type ThemeSettings = {
//   primaryColor?: string;
//   secondaryColor?: string;
// };

// export type StoreForm = {
//   name?: string; // For section title
//   faqs?: FAQ[]; // Array of FAQ objects
//   themeSettings?: ThemeSettings;
//   // Add other relevant StoreForm fields if needed for this section
// };

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     name: 'Children\'s Hope Foundation',
//     faqs: [
//       {
//         id: "faq-1",
//         question: "What is your organization's main mission?",
//         answer: "Our main mission is to provide support, education, and medical aid to underprivileged children and communities worldwide, fostering self-sufficiency and hope.",
//         order: 1,
//       },
//       {
//         id: "faq-2",
//         question: "How can I donate?",
//         answer: "You can easily donate through our secure online portal, or by bank transfer. We also accept in-kind donations. Visit our 'Donate' page for more details.",
//         order: 2,
//       },
//       {
//         id: "faq-3",
//         question: "Are my donations tax-deductible?",
//         answer: "Yes, as a registered non-profit organization, all donations are tax-deductible to the fullest extent of the law. You will receive a receipt for your contribution.",
//         order: 3,
//       },
//       {
//         id: "faq-4",
//         question: "How can I volunteer?",
//         answer: "We welcome volunteers! Please visit our 'Volunteer' section to learn about current opportunities and how to apply. Your time and skills can make a significant difference.",
//         order: 4,
//       },
//       {
//         id: "faq-5",
//         question: "What types of programs do you run?",
//         answer: "We run various programs including educational support, medical aid, community development, emergency relief, and clean water initiatives. Details are available on our 'Programs' page.",
//         order: 5,
//       },
//     ],
//     themeSettings: {
//       primaryColor: "#FF5722", // Orange for primary actions
//       secondaryColor: "#FFFFFF", // White for secondary actions/text
//     },
//   } as StoreForm,
// });

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
      opacity: 0,
      height: 0,
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

// FAQItem Component
type FAQItemProps = {
  faq: FAQ;
  primaryColor: string;
};

const FAQItem: React.FC<FAQItemProps> = ({ faq, primaryColor }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="bg-white p-6 rounded-2xl shadow hover:shadow-lg cursor-pointer transition-shadow duration-300 border border-gray-100"
      variants={faqItemVariants}
    >
      <button
        className="flex justify-between items-center w-full text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-lg text-gray-900 flex-grow flex items-center">
          <QuestionMarkCircleIcon className="w-6 h-6 mr-3" style={{ color: primaryColor }} />
          {faq.question}
        </h3>
        {isOpen ? (
          <MinusIcon className="w-6 h-6 ml-4" style={{ color: primaryColor }} />
        ) : (
          <PlusIcon className="w-6 h-6 ml-4" style={{ color: primaryColor }} />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={answerVariants}
            className="mt-3 text-gray-700 leading-relaxed border-t border-gray-100 pt-4"
          >
            <p>{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Static fallback FAQ data
const fallbackFaqs: FAQ[] = [
  {
    id: "fb-faq-1",
    question: "What is your organization's main mission?",
    answer: "Our main mission is to provide support, education, and medical aid to underprivileged children and communities worldwide, fostering self-sufficiency and hope.",
    order: 1,
  },
  {
    id: "fb-faq-2",
    question: "How can I donate?",
    answer: "You can easily donate through our secure online portal, or by bank transfer. We also accept in-kind donations. Visit our 'Donate' page for more details.",
    order: 2,
  },
  {
    id: "fb-faq-3",
    question: "Are my donations tax-deductible?",
    answer: "Yes, as a registered non-profit organization, all donations are tax-deductible to the fullest extent of the law. You will receive a receipt for your contribution.",
    order: 3,
  },
  {
    id: "fb-faq-4",
    question: "How can I volunteer?",
    answer: "We welcome volunteers! Please visit our 'Volunteer' section to learn about current opportunities and how to apply. Your time and skills can make a significant difference.",
    order: 4,
  },
];

export default function FAQSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';

  // Determine which FAQs to render: dynamic or fallback
  const faqsToRender = storeFormData?.faqs && Array.isArray(storeFormData?.faqs) && storeFormData.faqs.length > 0
    ? storeFormData.faqs.sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
    : fallbackFaqs;

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
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <motion.section
      className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={faqContainerVariants}
    >
      <div className="max-w-3xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 leading-tight"
          variants={sectionTitleVariants}
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.div>
          {faqsToRender.map((faq) => (
            <FAQItem key={faq.id} faq={faq} primaryColor={primaryColor} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
