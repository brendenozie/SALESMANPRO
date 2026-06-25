"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ChevronDownIcon, 
  MagnifyingGlassIcon, 
  QuestionMarkCircleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQsSectionProps {
  name: string;
  slug: string;
  faqs: FAQ[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  }
};

const answerVariants = {
  hidden: { opacity: 0, height: 0, transition: { duration: 0.25, ease: "easeInOut" } },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.25, ease: "easeInOut" } }
};

export default function FAQsSection({ name, slug, faqs }: FAQsSectionProps) {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  
  const [openFAQId, setOpenFAQId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="faqs" className="relative py-24 lg:py-36 bg-white dark:bg-slate-950 overflow-hidden">
      
      {/* PREMIUM INDUSTRIAL LIGHTING DISKS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-100/40 dark:bg-slate-900/10 rounded-full blur-[180px] pointer-events-none z-0" />
      
      {/* CORE IDENTITY MATRIX BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.25] dark:opacity-[0.08] mix-blend-overlay pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.3) 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }}
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* --- EXECUTIVE HEADER ARCHITECTURE --- */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 px-3.5 py-1.5 rounded-xl mb-6"
          >
            <span className="text-[10px] font-extrabold tracking-widest uppercase" style={{ color: primaryColor }}>
              Knowledge Base
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6"
          >
            Systematic <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400">Inquiry & Clarity</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed"
          >
            Review architectural and operational parameters regarding clinical deployment, scheduling frameworks, and standard operations at {name}.
          </motion.p>
        </div>

        {/* --- DYNAMIC INTERACTIVE FILTER ENGINE --- */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="relative mb-12 group"
        >
          <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-900/30 rounded-2xl blur-md transition-all duration-300 group-focus-within:blur-lg opacity-40" />
          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.01)] focus-within:border-slate-400 dark:focus-within:border-slate-600 transition-all duration-300">
            <MagnifyingGlassIcon className="absolute left-5 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter inquiries by operational keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-13 pr-12 py-4 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium focus:outline-none"
              aria-label="Filter frequently asked questions"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* --- PREMIUM COMPARTMENTALIZED ACCORDION MATRIX --- */}
        <motion.div 
          className="space-y-4 min-h-[200px]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.02 }}
        >
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, i) => {
              const isOpen = openFAQId === faq.id;
              return (
                <motion.div
                  key={faq.id || i}
                  variants={itemVariants}
                  className="group overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/60 rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.01)] transition-all duration-300"
                  style={{
                    borderColor: isOpen ? primaryColor : undefined,
                    boxShadow: isOpen ? '0 10px 30px -10px rgba(15,23,42,0.04)' : undefined
                  }}
                >
                  <button
                    onClick={() => setOpenFAQId(isOpen ? null : faq.id)}
                    className="flex items-center justify-between w-full p-6 text-left focus:outline-none"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-200 pr-6">
                      {faq.question}
                    </span>
                    <div 
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex-shrink-0 transition-all duration-300"
                      style={{ 
                        backgroundColor: isOpen ? `${primaryColor}10` : undefined,
                        borderColor: isOpen ? `${primaryColor}30` : undefined
                      }}
                    >
                      <ChevronDownIcon 
                        className="w-4 h-4 transition-transform duration-300" 
                        style={{ 
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          color: isOpen ? primaryColor : 'rgb(148, 163, 184)'
                        }}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${faq.id}`}
                        variants={answerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <div className="px-6 pb-6 pt-1 border-t border-slate-100 dark:border-slate-800/40">
                          <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-none">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center"
            >
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                No architectural components found matching "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-xs font-bold hover:underline transition-all"
                style={{ color: primaryColor }}
              >
                Reset Filter Core
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* --- ESCALATION INTEGRATED FOOTER --- */}
        <div className="text-center mt-20">
          <button
            onClick={() => router.push(`/${slug}/contact-form`)}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-extrabold text-white tracking-wider uppercase transition-all duration-300 shadow-md group hover:shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <span>Escalate Direct Inquiry</span>
            <QuestionMarkCircleIcon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
          </button>
        </div>

      </div>
    </section>
  );
}