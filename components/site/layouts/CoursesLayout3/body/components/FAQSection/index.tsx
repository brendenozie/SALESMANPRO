"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'; // Icon for expand/collapse
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

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

// export type StoreForm = {
//   faqs?: FAQ[]; // Array of FAQ objects
//   themeSettings?: ThemeSettings;
//   // Add other relevant StoreForm fields if needed
// };

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     themeSettings: {
//       primaryColor: "#fd2121", // Red from your sample
//       secondaryColor: "#FFC107", // Amber/Yellow for accent
//     },
//     faqs: [
//       {
//         id: "faq-1",
//         question: "How do I enroll in a course?",
//         answer: "Enrolling is simple! Browse our courses, select your desired program, and click 'Enroll Now'. You'll be guided through a quick registration and payment process.",
//         order: 1,
//       },
//       {
//         id: "faq-2",
//         question: "Are there any prerequisites for courses?",
//         answer: "Most introductory courses have no prerequisites. Advanced courses may require prior knowledge or specific certifications, which will be clearly stated in the course description.",
//         order: 2,
//       },
//       {
//         id: "faq-3",
//         question: "What payment methods are accepted?",
//         answer: "We accept major credit cards (Visa, MasterCard, American Express), PayPal, and various local payment options. Check our payment page for a full list.",
//         order: 3,
//       },
//       {
//         id: "faq-4",
//         question: "Can I get a refund if I'm not satisfied?",
//         answer: "Yes, we offer a 30-day money-back guarantee for most courses. Please review our refund policy for detailed terms and conditions.",
//         order: 4,
//       },
//       {
//         id: "faq-5",
//         question: "Do you offer career support or placement?",
//         answer: "While we don't guarantee job placement, many of our courses include career guidance, resume workshops, and networking opportunities to help you succeed.",
//         order: 5,
//       },
//     ],
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
  accentColor: string;
};

const FAQItem: React.FC<FAQItemProps> = ({ faq, primaryColor, accentColor }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md mb-4 overflow-hidden border border-gray-100"
      variants={faqItemVariants}
      whileHover={{ scale: 1.01, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
    >
      <button
        className="flex justify-between items-center w-full p-6 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-gray-900 flex-grow flex items-center">
          <QuestionMarkCircleIcon className="w-6 h-6 mr-3" style={{ color: primaryColor }} /> {/* Dynamic primary color for icon */}
          {faq.question}
        </h3>
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

// Static fallback FAQ data (matches the FAQ type)
const fallbackFaqs: FAQ[] = [
  {
    id: "fb-faq-1",
    question: "What is the admission process?",
    answer: "Our admission process is straightforward. You can apply online through our portal, submit required documents, and attend an interview if necessary. Our admissions team will guide you through each step.",
    order: 1,
  },
  {
    id: "fb-faq-2",
    question: "Do you offer online courses?",
    answer: "Yes, we offer a wide range of online courses designed for flexibility and accessibility. You can learn at your own pace from anywhere in the world.",
    order: 2,
  },
  {
    id: "fb-faq-3",
    question: "What are the class sizes?",
    answer: "We maintain small class sizes to ensure personalized attention and foster a collaborative learning environment. This allows for more direct interaction with instructors.",
    order: 3,
  },
  {
    id: "fb-faq-4",
    question: "Are your programs accredited?",
    answer: "Absolutely. All our academic programs are fully accredited by relevant national and international educational bodies, ensuring the highest standards of quality.",
    order: 4,
  },
  {
    id: "fb-faq-5",
    question: "How can I contact student support?",
    answer: "Our dedicated student support team is available via email, phone, and live chat during business hours. Visit our 'Contact Us' page for details.",
    order: 5,
  },
];

export default function FAQSection({ storeFormData }: any) {
  // const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  // Determine which FAQs to render: dynamic or fallback
  const faqsToRender = storeFormData?.faqs && Array.isArray(storeFormData?.faqs) && storeFormData?.faqs?.length > 0
    ? storeFormData?.faqs?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) // Sort by order
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
          className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-gray-900 leading-tight"
          variants={sectionTitleVariants}
        >
          Frequently Asked <span style={{ color: primaryColor }}>Questions</span>
        </motion.h2>
        <motion.div>
          {faqsToRender.map((faq: any) => (
            <FAQItem key={faq.id} faq={faq} primaryColor={primaryColor} accentColor={accentColor} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
