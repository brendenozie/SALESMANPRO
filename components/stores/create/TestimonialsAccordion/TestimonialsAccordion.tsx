import React, { ChangeEvent } from 'react';
import {
  UserCircleIcon,
  StarIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export interface Testimonial {
  authorName: string;
  quote: string;
  avatarUrl?: string;
  rating?: number;
  order?: number;
}

export interface TestimonialsAccordionProps {
  testimonials: Testimonial[];
  onUpdateTestimonial: (index: number, field: keyof Testimonial, value: string | number) => void;
  onAddTestimonial: () => void;
  onRemoveTestimonial: (index: number) => void;
}

export default function TestimonialsAccordion({
  testimonials,
  onUpdateTestimonial,
  onAddTestimonial,
  onRemoveTestimonial,
}: TestimonialsAccordionProps) {
  const allFilled = testimonials.every(t => t.authorName && t.quote);
  const visibleTestimonials = testimonials.length > 0 ? testimonials : [{ authorName: '', quote: '' }];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-md">
        <span className="flex items-center gap-2">
          <UserCircleIcon className="h-5 w-5" />
          Customer Testimonials
        </span>
        <span className="text-lg">
          {testimonials.length > 1 ? '✅' : <PlusIcon className="h-5 w-5" />}
        </span>
      </div>

      {/* Form Cards */}
      <div className="mt-6 space-y-6">
        {visibleTestimonials.map((t, idx) => (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-4 space-y-4 shadow-sm hover:shadow-md transition"
          >
            <input
              placeholder="Author name"
              value={t.authorName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdateTestimonial(idx, 'authorName', e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <textarea
              placeholder="Testimonial quote"
              value={t.quote}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                onUpdateTestimonial(idx, 'quote', e.target.value)
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <input
              type="url"
              placeholder="Avatar URL (optional)"
              value={t.avatarUrl || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdateTestimonial(idx, 'avatarUrl', e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                Rating:
                <select
                  value={t.rating || ''}
                  onChange={(e) => onUpdateTestimonial(idx, 'rating', Number(e.target.value))}
                  className="ml-2 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">None</option>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                      {r} Star{r > 1 && 's'}
                    </option>
                  ))}
                </select>
              </label>

              {idx !== 0 && (
                <button
                  type="button"
                  onClick={() => onRemoveTestimonial(idx)}
                  className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm transition"
                >
                  <TrashIcon className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add Button */}
        <button
          type="button"
          onClick={onAddTestimonial}
          disabled={!allFilled}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" />
          Add Another Testimonial
        </button>

        {/* Tips */}
        <p className="text-sm text-gray-500 mt-2">
          Share testimonials from your happy customers to build trust.
        </p>
        <p className="text-sm text-gray-500">
          Example: <code>"Amazing service!"</code>, <code>"Highly recommended."</code>
        </p>
      </div>
    </div>
  );
}
