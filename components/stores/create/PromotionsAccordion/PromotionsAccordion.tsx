import React, { ChangeEvent, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';



export interface PromotionsAccordionProps {
  promotions: Promotion[];
  onUpdatePromotion: (index: number, field: keyof Promotion, value: string) => void;
  onAddPromotion: () => void;
  onRemovePromotion: (index: number) => void;
  onImageUpload: (index: number, file: File) => void;
}

export default function PromotionsAccordion({
  promotions,
  onUpdatePromotion,
  onAddPromotion,
  onRemovePromotion,
  onImageUpload,
}: PromotionsAccordionProps) {
  const allFilled = promotions.every(
    (promo) => promo.title.trim() && promo.description.trim()
  );

  // Ensure at least one promotion exists on mount
  useEffect(() => {
    if (promotions.length === 0) {
      onAddPromotion();
    }
  }, [promotions, onAddPromotion]);

  return (
    <div className="max-w-3xl mx-auto overflow-hidden">
      <details className="group" open>
        <summary className="flex justify-between items-center cursor-pointer px-6 py-4 bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
          <span>Promotions</span>
          <span className="text-xl">{promotions.length > 0 ? '✅' : '+'}</span>
        </summary>

        <div className="p-6 space-y-6">
          {promotions.map((promo, idx) => (
            <div key={idx} className="space-y-4 border-b pb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Promotion {idx + 1}</h3>
                <button
                  type="button"
                  onClick={() => onRemovePromotion(idx)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  aria-label="Remove promotion"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Title */}
                <input
                  placeholder="Title"
                  value={promo.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onUpdatePromotion(idx, 'title', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />

                {/* Description */}
                <textarea
                  placeholder="Description"
                  value={promo.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    onUpdatePromotion(idx, 'description', e.target.value)
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  required
                />

                {/* Start/End Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={promo.startsAt || ''}
                    onChange={(e) => onUpdatePromotion(idx, 'startsAt', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={promo.endsAt || ''}
                    onChange={(e) => onUpdatePromotion(idx, 'endsAt', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="End Date"
                  />
                </div>

                {/* Banner Image Upload */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Banner Image (optional)
                  </label>
                  <div
                    className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-400 transition"
                    onClick={() => {
                      const input = document.getElementById(`promotion-file-${idx}`);
                      input?.click();
                    }}
                  >
                    {promo.bannerUrl ? (
                      <img
                        src={promo.bannerUrl}
                        alt={`Promotion ${idx + 1} Banner`}
                        className="absolute inset-0 h-full w-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="text-center flex flex-col items-center">
                        <PhotoIcon className="h-8 w-8 text-gray-400 mb-1" />
                        <span className="text-gray-500">Click to upload banner</span>
                      </div>
                    )}
                    <input
                      id={`promotion-file-${idx}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onImageUpload(idx, file);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <button
              type="button"
              onClick={onAddPromotion}
              disabled={!allFilled}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Promotion</span>
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500 space-y-1">
            <p>Add promotional messages or announcements. Each must have a title and description.</p>
            <p>
              Examples: <code>Free Shipping on Orders Over $50</code>, <code>20% Off Your First Order</code>
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
