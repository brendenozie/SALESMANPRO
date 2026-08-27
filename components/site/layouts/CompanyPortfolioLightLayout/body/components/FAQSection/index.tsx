"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { FAQ } from '@/types/typings';

// Optimized operational easing curves
const springTransition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
};

const answerVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 16,
    transition: {
      opacity: { duration: 0.25 },
      height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      opacity: { duration: 0.15 },
      height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  },
};

type FAQItemProps = {
  faq: FAQ;
  index: number;
  systemAccent: string;
};

const FAQItem: React.FC<FAQItemProps> = ({ faq, index, systemAccent }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Formatting integers to programmatic indicators (e.g., 01, 02)
  const formatIndex = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <motion.div
      layout="position"
      className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/10 rounded-xl p-5 md:p-6 shadow-sm dark:shadow-none transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 hover:border-zinc-300 dark:hover:border-zinc-800"
    >
      <button
        className="flex justify-between items-start w-full text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-4 min-w-0">
          {/* Monospaced Programmatic Step Identifier */}
          <span 
            className="font-mono text-xs font-bold tracking-wider mt-1 select-none transition-colors duration-300"
            style={{ color: isOpen ? systemAccent : '#71717a' }}
          >
            [{formatIndex(index)}]
          </span>
          <h3 className="font-bold text-base md:text-lg text-zinc-900 dark:text-zinc-200 tracking-tight leading-snug group-hover:text-black dark:group-hover:text-zinc-100 transition-colors">
            {faq.question}
          </h3>
        </div>
        
        {/* Sleek Rotational Indicator Chevron */}
        <div 
          className="ml-4 p-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-zinc-500 transition-all duration-300 flex-shrink-0"
          style={{ 
            borderColor: isOpen ? systemAccent : '', 
            color: isOpen ? systemAccent : '' 
          }}
        >
          <ChevronDownIcon 
            className="w-4 h-4 transition-transform duration-300" 
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={answerVariants}
            className="overflow-hidden text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed border-t border-zinc-100 dark:border-zinc-900/60 pt-4 text-justify pl-0 sm:pl-10 transition-colors"
          >
            <p>{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Institutional system operational fallbacks
const fallbackIntelFaqs: FAQ[] = [
  {
    id: "gt-faq-1",
    question: "What primary core mechanisms drive the automated physical validation architecture?",
    answer: "Our automated validation engine monitors real-time spot positions and supply network layers across global terminals. By executing direct on-chain and ledger audits, the system insulates raw capital deployment from downstream delivery discrepancies.",
    order: 1,
  },
  {
    id: "gt-faq-2",
    question: "How are enterprise-tier clearance endpoints onboarded and bound?",
    answer: "Onboarding requires a multi-stage firmographic risk check through our security division. Once confirmed, endpoint terminals are issued high-velocity encrypted API routes locked to designated liquidity pools under compliance parameters.",
    order: 2,
  },
  {
    id: "gt-faq-3",
    question: "What protective insulation measures apply during periods of extreme market volatility?",
    answer: "During asset anomalies, our clearing desks trigger automated cross-collateral safety brackets. This partitions exposed nodes into siloed liquidity structures, containing risk while preserving underlying throughput networks.",
    order: 3,
  },
  {
    id: "gt-faq-4",
    question: "Are cross-border channel settlements dependent on single sovereign banking grids?",
    answer: "No. Clearings utilize decentralised multi-sovereign processing nodes and localized multi-berth routing. This structural redundancy prevents transaction halts during regional compliance grid locks or unexpected network interruptions.",
    order: 4,
  },
];

export default function FAQSection({ pagedata }: { pagedata: any }) {
  // const { storeFormData } = useStoreContext();

  const systemAccent = pagedata?.themeSettings?.primaryColor || '#F59E0B'; // Amber Core Node

  const faqsToRender = pagedata?.faqs && Array.isArray(pagedata?.faqs) && pagedata.faqs.length > 0
    ? [...pagedata.faqs].sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackIntelFaqs;

  return (
    <section 
      id="faq"
      className="py-24 md:py-36 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans relative overflow-hidden transition-colors duration-300"
    >
      {/* Structural Accent Top Boundary Layer Line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-zinc-200 dark:bg-zinc-900 transition-colors" />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Segment Monospace Tracking Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase transition-colors">
            Frequently Asked Questions
          </h2>
          <div className="w-12 h-[1px] bg-zinc-200 dark:bg-zinc-900 mx-auto mt-6 transition-colors" />
        </div>

        {/* Dynamic Accordion Matrix Stack */}
        <motion.div 
          layout="size"
          className="space-y-4 max-w-3xl mx-auto"
        >
          {faqsToRender.map((faq, index) => (
            <FAQItem 
              key={faq.id} 
              faq={faq} 
              index={index} 
              systemAccent={systemAccent} 
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}