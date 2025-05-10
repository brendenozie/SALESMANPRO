import React from 'react';

interface Promotion {
  title: string;
  details: string;
  order?: number;
}

interface PromotionsAccordionProps {
  form: {
    promotions?: Promotion[];
  };
  handleArrayChange: (field: 'promotions', index: number, key: keyof Promotion, value: string) => void;
  addArrayItem: (field: 'promotions', item: Promotion) => void;
  removeArrayItem: (field: 'promotions', index: number) => void;
}

const PromotionsAccordion: React.FC<PromotionsAccordionProps> = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => {
  const promotions = form.promotions || [];
  const allFilled = promotions.every(p => p.title && p.details);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => addArrayItem('promotions', { title: '', details: '', order: promotions.length })}
        disabled={!allFilled}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>Promotions</span>
        <span className="text-xl">{promotions.length > 0 ? '✅' : '+'}</span>
      </button>

      {promotions.length > 0 && (
        <div className="p-6 space-y-6">
          {promotions.map((p, i) => (
            <div key={i} className="space-y-3">
              <input
                placeholder="Title"
                value={p.title}
                onChange={e => handleArrayChange('promotions', i, 'title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <textarea
                placeholder="Details"
                value={p.details}
                onChange={e => handleArrayChange('promotions', i, 'details', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('promotions', i)}
                className="text-red-500 font-medium focus:outline-none"
                title="Remove Promotion"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('promotions', { title: '', details: '', order: promotions.length })}
            className="mt-4 w-full text-center text-indigo-600 font-medium hover:underline focus:outline-none"
          >
            Add Another Promotion
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Add promotional messages or announcements. You can add multiple promotions.
          </p>
          <p className="text-sm text-gray-500">
            Example: <code>Free Shipping on Orders Over $50</code>, <code>20% Off Your First Order</code>
          </p>
        </div>
      )}
    </div>
  );
};

export default PromotionsAccordion;
