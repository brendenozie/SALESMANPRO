import React, { ChangeEvent } from 'react';

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
  const allFilled = faqs.every(faq => faq.question && faq.answer);

  return (
    <div className="max-w-3xl mx-auto overflow-hidden">
      <button
        type="button"
        onClick={onAddFAQ}
        disabled={!allFilled}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>FAQs</span>
        <span className="text-xl">{faqs.length > 0 ? '✅' : '+'}</span>
      </button>

      <div className="p-6 space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="space-y-3">
            <input
              placeholder="Question"
              value={faq.question}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateFAQ(idx, 'question', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <textarea
              placeholder="Answer"
              value={faq.answer}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onUpdateFAQ(idx, 'answer', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            <button
              type="button"
              onClick={() => onRemoveFAQ(idx)}
              className="text-red-500 font-medium focus:outline-none"
              title="Remove FAQ"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddFAQ}
          className="mt-4 w-full text-center text-indigo-600 font-medium hover:underline focus:outline-none"
        >
          Add Another FAQ
        </button>
      </div>
    </div>
  );
}