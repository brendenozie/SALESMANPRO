import React, { ChangeEvent } from 'react';
import {
  PlusIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

export interface FAQ {
  question: string;
  answer: string;
  order?: number;
}

export interface FAQsAccordionProps {
  faqs: FAQ[];
  onUpdateFAQ: (index: number, field: keyof FAQ, value: string) => void;
  onAddFAQ: () => void;
  onRemoveFAQ: (index: number) => void;
}

export default function FAQsAccordion({
  faqs,
  onUpdateFAQ,
  onAddFAQ,
  onRemoveFAQ,
}: FAQsAccordionProps) {
  const allFilled = faqs.every((faq) => faq.question && faq.answer);
  const visibleFaqs = faqs.length > 0 ? faqs : [{ question: '', answer: '' }];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-md">
        <span className="flex items-center gap-2">
          <QuestionMarkCircleIcon className="h-5 w-5" />
          Frequently Asked Questions
        </span>
        <span className="text-lg">{faqs.length > 1 ? '✅' : <PlusIcon className="h-5 w-5" />}</span>
      </div>

      {/* FAQ Forms */}
      <div className="mt-6 space-y-6">
        {visibleFaqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition"
          >
            <input
              placeholder="Question (e.g. What is your return policy?)"
              value={faq.question}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdateFAQ(idx, 'question', e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Answer"
              value={faq.answer}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                onUpdateFAQ(idx, 'answer', e.target.value)
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {idx !== 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemoveFAQ(idx)}
                  className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition"
                >
                  <TrashIcon className="h-5 w-5" />
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add Another FAQ Button */}
        <button
          type="button"
          onClick={onAddFAQ}
          disabled={!allFilled}
          className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 border border-indigo-500 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" />
          Add Another FAQ
        </button>
      </div>
    </div>
  );
}
