import React, { ChangeEvent } from 'react';
import { PlusIcon, CheckIcon, TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";

export interface HeroSlide {
  imageUrl: string;
  headline: string;
  subline?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
}

export interface HeroSlidesAccordionProps {
  slides: HeroSlide[];
  onUpdateSlide: (index: number, field: keyof HeroSlide, value: string) => void;
  onAddSlide: () => void;
  onRemoveSlide: (index: number) => void;
  onImageUpload?: (index: number, file: File) => void;
}

export default function HeroSlidesAccordion({
  slides,
  onUpdateSlide,
  onAddSlide,
  onRemoveSlide,
  onImageUpload,
}: HeroSlidesAccordionProps) {
  const allFilled = slides.every(s => s.imageUrl && s.headline);

  return (
    <div className="max-w-3xl mx-auto overflow-hidden">
      <details className="group">
        <summary className="flex justify-between items-center cursor-pointer px-6 py-4 bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
          <span>Hero Slides</span>
          {slides.length > 0 ? <CheckIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
        </summary>

        <div className="p-6 space-y-6">
          {slides.map((slide, idx) => (
            <div key={idx} className="space-y-4 border-b pb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Slide {idx + 1}</h3>
                <button
                  type="button"
                  onClick={() => onRemoveSlide(idx)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  aria-label="Delete slide"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex flex-col items-center justify-center w-full sm:w-1/3 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition">
                  {slide.imageUrl ? (
                    <img
                      src={slide.imageUrl}
                      alt={`Slide ${idx + 1}`}
                      className="object-cover h-full w-full rounded-md"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <PhotoIcon className="h-8 w-8 mb-2" />
                      <span>Upload Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (onImageUpload) onImageUpload(idx, file);
                        else onUpdateSlide(idx, 'imageUrl', URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>

                <div className="flex-1 space-y-3">
                  <input
                    placeholder="Headline"
                    value={slide.headline}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateSlide(idx, 'headline', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                  <input
                    placeholder="Subline (optional)"
                    value={slide.subline || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateSlide(idx, 'subline', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      placeholder="CTA Text (optional)"
                      value={slide.ctaText || ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateSlide(idx, 'ctaText', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <input
                      placeholder="CTA Link (optional)"
                      value={slide.ctaLink || ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateSlide(idx, 'ctaLink', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <button
              type="button"
              onClick={onAddSlide}
              disabled={!allFilled}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Slide</span>
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}