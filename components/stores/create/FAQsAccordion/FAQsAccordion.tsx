'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QuestionMarkCircleIcon, 
  PlusIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

type FAQ = { question: string; answer: string };

type FAQsAccordionProps = {
  faqs: FAQ[];
  onUpdateFAQ: (idx: number, field: 'question' | 'answer', value: string) => void;
  onAddFAQ: () => void;
  onRemoveFAQ: (idx: number) => void;
};

export default function FAQsAccordion({ 
  faqs, 
  onUpdateFAQ, 
  onAddFAQ, 
  onRemoveFAQ 
}: FAQsAccordionProps) {
  const allFilled = faqs.every(faq => faq.question.trim() && faq.answer.trim());

  return (
    <section className="max-w-3xl mx-auto w-full border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden shadow-sm transition-colors duration-200">
      {/* Dynamic Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
            <QuestionMarkCircleIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-md font-semibold text-zinc-800 dark:text-zinc-100">Configure FAQs</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Create clear question and answer structures</p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={onAddFAQ}
          disabled={!allFilled}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
            allFilled
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/10'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          <PlusIcon className="h-4 w-4" />
          Add FAQ Item
        </button>
      </div>

      {/* Accordion Editable Content Area */}
      <div className="p-5 sm:p-6 space-y-4">
        <motion.div layout className="space-y-4">
          <AnimatePresence initial={false}>
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="group relative bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 sm:p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
              >
                {/* Individual Card Controls Header */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                    Question Block #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveFAQ(idx)}
                    disabled={faqs.length === 1}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-0 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-150"
                    title="Delete item"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Form Elements layout */}
                <div className="space-y-4">
                  <div>
                    <label 
                      htmlFor={`question-${idx}`} 
                      className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5"
                    >
                      Question Context
                    </label>
                    <input
                      id={`question-${idx}`}
                      type="text"
                      value={faq.question}
                      placeholder="e.g., What forms of payment do you accept?"
                      onChange={e => onUpdateFAQ(idx, 'question', e.target.value)}
                      className="w-full text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor={`answer-${idx}`} 
                      className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5"
                    >
                      Detailed Answer
                    </label>
                    <textarea
                      id={`answer-${idx}`}
                      rows={3}
                      value={faq.answer}
                      placeholder="Provide a comprehensive and precise breakdown..."
                      onChange={e => onUpdateFAQ(idx, 'answer', e.target.value)}
                      className="w-full text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Dynamic Warning Notification */}
        {!allFilled && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center pt-2">
            Please fill out all fields on active blocks to generate additional FAQ sections.
          </p>
        )}
      </div>
    </section>
  );
}