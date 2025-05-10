import React from 'react';

const PromotionsAccordion = ({ form, handleArrayChange, addArrayItem, removeArrayItem }: any) => {
  const promotions = form.promotions || [];
  const allFilled = promotions.every((p : any) => p.title && p.details);

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
          {promotions.map(({p, i} : any) => (
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
