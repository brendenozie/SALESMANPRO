"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { FAQ } from '@/types/typings';

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

// --- MICRO-INTERACTION VARIANTS ---

const answerVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      opacity: { duration: 0.25 },
      height: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      opacity: { duration: 0.15 },
      height: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
    },
  },
};

// --- ACCORDION ROW ---

type FAQRowProps = {
  faq: FAQ;
  primaryColor: string;
  isOpen: boolean;
  onToggle: () => void;
};

const FAQRow: React.FC<FAQRowProps> = ({ faq, primaryColor, isOpen, onToggle }) => {
  return (
    <div className="border-b border-slate-200 py-6 last:border-none">
      <button
        className="flex justify-between items-start w-full text-left focus:outline-none group"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h3 className="font-bold text-slate-900 text-lg tracking-tight pr-8 transition-colors group-hover:text-slate-600">
          {faq.question}
        </h3>
        <div 
          className="flex-shrink-0 mt-1 w-5 h-5 flex items-center justify-center transition-transform duration-300"
          style={{ color: isOpen ? primaryColor : '#64748b' }}
        >
          {isOpen ? (
            <MinusIcon className="w-4 h-4" strokeWidth={3} />
          ) : (
            <PlusIcon className="w-4 h-4" strokeWidth={3} />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={answerVariants}
            className="overflow-hidden"
          >
            <div className="pt-4 pb-2 pr-12 text-slate-600 text-base leading-relaxed max-w-2xl">
              <p>{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN FAQ SECTION ---

export default function FAQSection({storeFormData}: {storeFormData: any}) {
  // const { storeFormData } = useStoreContext();
  const [openId, setOpenId] = useState<string | null>(null);

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';

  const faqsToRender = storeFormData?.faqs && Array.isArray(storeFormData?.faqs) && storeFormData.faqs.length > 0
    ? [...storeFormData.faqs].sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackFaqs;

  return (
    <section id="faq" className="py-24 md:py-32 bg-white border-b border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Asymmetric 12-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Sticky Left Structural Block */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
            <span className="text-xs uppercase tracking-widest font-black text-slate-500 block mb-3">
              Clear Clarifications
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-6">
              Frequently Asked Questions.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Can't find the answers you're looking for? Reach out to our operational field office directly through our secure interface.
            </p>
          </div>

          {/* Right Accordion Panel */}
          <div className="lg:col-span-7 border-t border-slate-900 lg:border-t-2 pt-2">
            {faqsToRender.map((faq) => (
              <FAQRow
                key={faq.id}
                faq={faq}
                primaryColor={primaryColor}
                isOpen={openId === faq.id}
                onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}