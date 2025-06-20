'use client';

import React from 'react';
import { QuestionMarkCircleIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

type FAQ = { question: string; answer: string };
type FAQsAccordionProps = {
  faqs: FAQ[];
  onUpdateFAQ: (idx: number, field: 'question' | 'answer', value: string) => void;
  onAddFAQ: () => void;
  onRemoveFAQ: (idx: number) => void;
};

export default function FAQsAccordion({ faqs, onUpdateFAQ, onAddFAQ, onRemoveFAQ }: FAQsAccordionProps) {
  const allFilled = faqs.every(faq => faq.question.trim() && faq.answer.trim());

  return (
    <section className="max-w-3xl mx-auto ">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <QuestionMarkCircleIcon className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
        </div>
        <button
          type="button"
          onClick={onAddFAQ}
          disabled={!allFilled}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 disabled:opacity-50 transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add FAQ
        </button>
      </div>

      {/* FAQ Forms (always visible) */}
      <div className="px-6 py-4 space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <h3 className="text-md font-medium text-gray-800">FAQ #{idx + 1}</h3>
              <button
                type="button"
                onClick={() => onRemoveFAQ(idx)}
                disabled={faqs.length === 1}
                className="text-red-500 hover:text-red-600 focus:outline-none disabled:opacity-50"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex flex-col">
                <label htmlFor={`question-${idx}`} className="text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  id={`question-${idx}`}
                  type="text"
                  value={faq.question}
                  placeholder="e.g. What is your return policy?"
                  onChange={e => onUpdateFAQ(idx, 'question', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor={`answer-${idx}`} className="text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  id={`answer-${idx}`}
                  rows={3}
                  value={faq.answer}
                  placeholder="Type answer here..."
                  onChange={e => onUpdateFAQ(idx, 'answer', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
