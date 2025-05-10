import React from 'react';


interface FAQ {
  question: string;
  answer: string;
  order?: number;
}

interface FAQsAccordionProps {
  form: {
    faqs?: FAQ[];
  };
  handleArrayChange: (field: 'faqs', index: number, key: keyof FAQ, value: string) => void;
  addArrayItem: (field: 'faqs', item: FAQ) => void;
  removeArrayItem: (field: 'faqs', index: number) => void;
}

const FAQsAccordion: React.FC<FAQsAccordionProps> = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => {
  const faqs = form.faqs || [];
  const allFilled = faqs.every(f => f.question && f.answer);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => addArrayItem('faqs', { question: '', answer: '', order: faqs.length })}
        disabled={!allFilled}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>FAQs</span>
        <span className="text-xl">{faqs.length > 0 ? '✅' : '+'}</span>
      </button>

      {faqs.length > 0 && (
        <div className="p-6 space-y-6">
          {faqs.map((f, i) => (
            <div key={i} className="space-y-3">
              <input
                placeholder="Question"
                value={f.question}
                onChange={e => handleArrayChange('faqs', i, 'question', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <textarea
                placeholder="Answer"
                value={f.answer}
                onChange={e => handleArrayChange('faqs', i, 'answer', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('faqs', i)}
                className="text-red-500 font-medium focus:outline-none"
                title="Remove FAQ"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('faqs', { question: '', answer: '', order: faqs.length })}
            className="mt-4 w-full text-center text-indigo-600 font-medium hover:underline focus:outline-none"
          >
            Add Another FAQ
          </button>
        </div>
      )}
    </div>
  );
};

export default FAQsAccordion;
