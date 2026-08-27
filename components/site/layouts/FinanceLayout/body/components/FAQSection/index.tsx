"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// --- SYSTEM LIGHTWEIGHT VECTOR ICONS ---
const CustomPlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// --- ANIMATION CONFIGURATIONS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

interface FAQItem {
  id: string | number;
  question: string;
  answer: string;
}

const sampleFAQs: FAQItem[] = [
  {
    id: "faq1",
    question: "What types of legal services do you offer?",
    answer: "We offer a comprehensive range of legal services including corporate law, intellectual property, real estate, litigation, and dispute resolution. Our experts are equipped to handle complex cases across various sectors.",
  },
  {
    id: "faq2",
    question: "How do your financial advisory services work?",
    answer: "Our financial advisory services cover wealth management, investment planning, tax strategy, and estate planning. We work closely with you to understand your financial goals and create tailored strategies for sustainable growth.",
  },
  {
    id: "faq3",
    question: "What is your typical client engagement process?",
    answer: "Our process begins with an initial consultation to understand your needs, followed by strategic planning, meticulous execution of the agreed-upon strategy, and continuous support with regular reviews to ensure long-term success.",
  },
  {
    id: "faq4",
    question: "Are your consultations confidential?",
    answer: "Absolutely. All consultations and client interactions are treated with the utmost confidentiality and discretion, adhering to the highest standards of professional ethics and legal privacy regulations.",
  },
  {
    id: "faq5",
    question: "How do I schedule an initial consultation?",
    answer: "You can easily schedule an initial consultation through our website's contact form, by calling our office directly, or by utilizing our online booking system available on the 'Consultation Packages' page.",
  },
];

interface FAQSectionProps {
  faqs?: FAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const faqsToDisplay = faqs && faqs.length > 0 ? faqs : sampleFAQs;
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <section id="faqs" className="py-24 lg:py-36 bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-600/10">
      
      {/* Background Micro Grid Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[50rem] h-[50rem] bg-indigo-400/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex flex-col items-center text-center mb-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200/60 text-xs font-semibold tracking-wide text-blue-700 uppercase mb-4">
            Inquiry Desk
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-5 leading-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">Questions.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Find precise operational answers regarding our corporate frameworks, consulting terms, and structural processing parameters.
          </p>
        </div>

        {/* --- ACCORDION CORE LOOP --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="space-y-4 w-full"
        >
          {faqsToDisplay.map((faq, i) => {
            const isOpen = openFAQ === i;

            return (
              <motion.div
                key={faq.id}
                variants={itemVariants}
                className={`rounded-2xl border bg-white transition-all duration-300 overflow-hidden cursor-pointer ${
                  isOpen 
                    ? "border-blue-600 shadow-md ring-1 ring-blue-600/20" 
                    : "border-slate-200/80 shadow-sm hover:border-slate-300"
                }`}
                onClick={() => setOpenFAQ(isOpen ? null : i)}
              >
                {/* Accordion Trigger Frame */}
                <div className="flex justify-between items-center p-6 sm:p-8 select-none">
                  <h3 className={`text-base sm:text-lg font-bold transition-colors duration-200 pr-4 ${
                    isOpen ? "text-blue-600" : "text-slate-900"
                  }`}>
                    {faq.question}
                  </h3>
                  
                  <div className={`flex-shrink-0 p-2 rounded-xl transition-colors ${
                    isOpen ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                  }`}>
                    <motion.div
                      animate={{ rotate: isOpen ? 135 : 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center justify-center"
                    >
                      <CustomPlusIcon className="h-4 w-4" />
                    </motion.div>
                  </div>
                </div>
                
                {/* Content Height Extraction Architecture */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: "auto", 
                        opacity: 1,
                        transition: { height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.25, delay: 0.05 } }
                      }}
                      exit={{ 
                        height: 0, 
                        opacity: 0,
                        transition: { height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.15 } }
                      }}
                    >
                      <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 border-t border-slate-50">
                        <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
        
      </div>
    </section>
  );
}