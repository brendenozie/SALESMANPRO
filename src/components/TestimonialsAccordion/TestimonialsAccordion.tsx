import React from "react";

interface Testimonial {
  author: string;
  quote: string;
  avatarUrl?: string;
  rating?: number;
  order?: number;
}

interface TestimonialsAccordionProps {
  form: {
    testimonials?: Testimonial[];
  };
  handleArrayChange: (field: 'testimonials', index: number, key: keyof Testimonial, value: string | number) => void;
  addArrayItem: (field: 'testimonials', item: Testimonial) => void;
  removeArrayItem: (field: 'testimonials', index: number) => void;
}

const TestimonialsAccordion: React.FC<TestimonialsAccordionProps> = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => {
  const testimonials = form.testimonials || [];
  const allFilled = testimonials.every(t => t.author && t.quote);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => addArrayItem('testimonials', { author: '', quote: '', avatarUrl: '', rating: 0, order: testimonials.length })}
        disabled={!allFilled}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>Testimonials</span>
        <span className="text-xl">{testimonials.length > 0 ? '✅' : '+'}</span>
      </button>

      <div className="p-6 space-y-6">
        {testimonials.map((t, i) => (
          <div key={i} className="space-y-3">
            <input
              placeholder="Author"
              value={t.author}
              onChange={e => handleArrayChange('testimonials', i, 'author', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <textarea
              placeholder="Quote"
              value={t.quote}
              onChange={e => handleArrayChange('testimonials', i, 'quote', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            <button
              type="button"
              onClick={() => removeArrayItem('testimonials', i)}
              className="text-red-500 font-medium focus:outline-none"
              title="Remove Testimonial"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('testimonials', { author: '', quote: '', avatarUrl: '', rating: 0, order: testimonials.length })}
          className="mt-4 w-full text-center text-indigo-600 font-medium hover:underline focus:outline-none"
        >
          Add Another Testimonial
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Add testimonials from your customers. You can add multiple testimonials.
        </p>
        <p className="text-sm text-gray-500">
          Example: <code>"Great service!"</code>, <code>"Loved the product!"</code>
        </p>
      

      </div>
      
    </div>
  );
};

export default TestimonialsAccordion;
