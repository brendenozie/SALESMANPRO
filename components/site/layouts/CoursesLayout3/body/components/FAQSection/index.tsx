"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { FAQ } from '@/types/typings';
import { EditableElement } from '@/components/site/EditableElement';

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

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
  index?: number;
};

const FAQItem: React.FC<FAQItemProps> = ({ faq, primaryColor, accentColor, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md mb-4 overflow-hidden border border-gray-100"
      variants={faqItemVariants}
      whileHover={{ scale: 1.01, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
    >
      <button
        type="button"
        className="flex justify-between items-center w-full p-6 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-gray-900 flex-grow flex items-center">
          <QuestionMarkCircleIcon className="w-6 h-6 mr-3 shrink-0" style={{ color: primaryColor }} />
          <EditableElement targetId={`courses3.home.faq.faq${index ?? 0}.question`} fieldType="text" label={`FAQ Question ${index !== undefined ? index + 1 : ''}`}>
            <span>{faq.question}</span>
          </EditableElement>
        </h3>
        <ChevronDownIcon
          className={`w-6 h-6 text-gray-500 transition-transform duration-300 shrink-0 ${
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
            <EditableElement targetId={`courses3.home.faq.faq${index ?? 0}.answer`} fieldType="textarea" label={`FAQ Answer ${index !== undefined ? index + 1 : ''}`}>
              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
            </EditableElement>
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

export default function FAQSection({ storeFormData: propStoreFormData }: any = {}) {
  const contextStore = useStoreContext();
  const storeFormData = propStoreFormData || contextStore?.storeFormData;

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  // Determine which FAQs to render: dynamic or fallback
  const faqsToRender = storeFormData?.faqs && Array.isArray(storeFormData?.faqs) && storeFormData?.faqs?.length > 0
    ? storeFormData?.faqs?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
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
        <motion.div variants={sectionTitleVariants} className="text-center mb-12">
          <EditableElement targetId="courses3.home.faq.title" fieldType="text" label="FAQ Title">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Frequently Asked <span style={{ color: primaryColor }}>Questions</span>
            </h2>
          </EditableElement>
        </motion.div>
        <motion.div>
          {faqsToRender.map((faq: any, idx: number) => (
            <FAQItem key={faq.id || idx} index={idx} faq={faq} primaryColor={primaryColor} accentColor={accentColor} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
