import React, { useState, ChangeEvent, FormEvent, useEffect, useMemo, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import dynamic from "next/dynamic";
import { useRouter } from 'next/router';
import debounce from "lodash.debounce";
import {
  MapPinIcon,
  ChevronDownIcon,
  InboxIcon,
  PlusIcon,
  CheckIcon,
  TrashIcon,
  ChevronUpIcon, 
  PaintBrushIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { PhoneIcon } from '@heroicons/react/24/solid';

const loaderProp = ({ src, width, quality }) => {
  const params = [`w=${width || 800}`]; // Default width to 800 if not provided
  if (quality) {
    params.push(`q=${quality}`);
  }
  return `${src}?${params.join("&")}`;
};

interface HeroSlide {
  imageUrl: string;
  headline: string;
  subline?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
}

interface HeroSlidesAccordionProps {
  form: { heroSlides?: HeroSlide[] };
  handleArrayChange: (
    field: "heroSlides",
    index: number,
    key: keyof HeroSlide,
    value: string
  ) => void;
  addArrayItem: (field: "heroSlides", item: HeroSlide) => void;
  removeArrayItem: (field: "heroSlides", index: number) => void;
  handleImageUpload?: (
    field: "heroSlides",
    index: number,
    file: File
  ) => void;
}

export const HeroSlidesAccordion: React.FC<HeroSlidesAccordionProps> = ({
  form,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  handleImageUpload,
}) => {
  const slides = form.heroSlides || [];
  const allFilled = slides.every((s) => s.imageUrl && s.headline);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <details className="group">
        <summary className="flex justify-between items-center cursor-pointer px-6 py-4 bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
          <span>Hero Slides</span>
          {slides.length > 0 ? <CheckIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
        </summary>

        <div className="p-6 space-y-6">
          {slides.map((s, i) => (
            <div key={i} className="space-y-4 border-b pb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Slide {i + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeArrayItem("heroSlides", i)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  aria-label="Delete slide"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Image Upload & Preview */}
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex flex-col items-center justify-center w-full sm:w-1/3 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition">
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt={`Slide ${i + 1}`}
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
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (handleImageUpload) {
                          handleImageUpload("heroSlides", i, file);
                        } else {
                          const url = URL.createObjectURL(file);
                          handleArrayChange("heroSlides", i, "imageUrl", url);
                        }
                      }
                    }}
                  />
                </label>

                {/* Text Fields */}
                <div className="flex-1 space-y-3">
                  <input
                    placeholder="Headline"
                    value={s.headline}
                    onChange={(e) =>
                      handleArrayChange(
                        "heroSlides",
                        i,
                        "headline",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                  <input
                    placeholder="Subline (optional)"
                    value={s.subline || ""}
                    onChange={(e) =>
                      handleArrayChange(
                        "heroSlides",
                        i,
                        "subline",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      placeholder="CTA Text (optional)"
                      value={s.ctaText || ""}
                      onChange={(e) =>
                        handleArrayChange(
                          "heroSlides",
                          i,
                          "ctaText",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <input
                      placeholder="CTA Link (optional)"
                      value={s.ctaLink || ""}
                      onChange={(e) =>
                        handleArrayChange(
                          "heroSlides",
                          i,
                          "ctaLink",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Slide Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() =>
                addArrayItem("heroSlides", {
                  imageUrl: "",
                  headline: "",
                  subline: "",
                  ctaText: "",
                  ctaLink: "",
                  order: slides.length,
                })
              }
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
};

export default HeroSlidesAccordion;
