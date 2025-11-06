import React, { ChangeEvent, useEffect, useState } from "react";
import imageCompression from "browser-image-compression"; // Import the library
import {
  PlusIcon,
  CheckIcon,
  TrashIcon,
  PhotoIcon,
  ArrowPathIcon, // Added for loading indicator
} from "@heroicons/react/24/outline";
import { HeroSlide } from "@/types/typings";
import { motion } from "framer-motion"; // Added for smooth transitions

export interface HeroSlidesAccordionProps {
  slides: HeroSlide[];
  onUpdateSlide: (index: number, field: keyof HeroSlide, value: string) => void;
  onAddSlide: () => void;
  onRemoveSlide: (index: number) => void;
  onImageUpload?: (index: number, file: File, field: keyof HeroSlide) => void;
}

export default function HeroSlidesAccordion({
  slides,
  onUpdateSlide,
  onAddSlide,
  onRemoveSlide,
  onImageUpload,
}: HeroSlidesAccordionProps) {
  // 1. NEW STATE: Manage compression status for visual feedback
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  
  const allFilled = slides.every((s) => s.imageUrl && s.headline);

  // Ensure there's at least one form ready on initial render
  useEffect(() => {
    if (slides.length === 0) {
      onAddSlide();
    }
  }, [slides, onAddSlide]);

  /**
   * Handles image selection, compression, and passes the
   * compressed file to the correct handler.
   */
  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
    field: "imageUrl" | "productImageUrl" // Be specific on the field
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Start loading state
    setIsCompressing(true);

    // --- Dynamic Image Compression Logic ---
    const IMAGE_MAX_SIZE_MB = 0.48; // ~480KB, to ensure it's under 500KB
    
    // Set max resolution based on the field type
    const maxWidth = field === "imageUrl" ? 1920 : 800; // Background (1920px) vs Product (800px)

    const options = {
      maxSizeMB: IMAGE_MAX_SIZE_MB,
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
    };

    try {
      console.log(
        `[Slide ${index + 1}] Original ${field} size: ${(
          file.size / 1024
        ).toFixed(2)} KB`
      );

      const compressedFile = await imageCompression(file, options);

      console.log(
        `[Slide ${index + 1}] Compressed ${field} size: ${(
          compressedFile.size / 1024
        ).toFixed(2)} KB`
      );

      // --- Prop Handling Logic ---
      if (onImageUpload) {
        // The parent component handles the file upload.
        onImageUpload(index, compressedFile, field);
      } else {
        // Fall back to creating a local preview URL of the compressed file.
        onUpdateSlide(index, field, URL.createObjectURL(compressedFile));
      }
    } catch (error) {
      console.error("Image compression failed:", error);
      alert("Image compression failed. Please try another file.");
    } finally {
      // Stop loading state and clear the input value
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto overflow-hidden">
      {/* 🛑 Visual Feedback Overlay for Compression */}
      {isCompressing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-3"
          >
            <ArrowPathIcon className="w-6 h-6 text-indigo-600 animate-spin" />
            <p className="text-lg font-medium text-gray-800">
              Compressing Image (Max {isCompressing ? "1920" : "N/A"}px)...
            </p>
          </motion.div>
        </div>
      )}
      {/* 🛑 END Visual Feedback Overlay */}

      <details open className="group transition-all">
        <summary className="flex justify-between items-center cursor-pointer px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg rounded-t-xl shadow-lg">
          <span>Hero Slides Configuration</span>
          {slides.length > 0 ? (
            <CheckIcon className="h-6 w-6" />
          ) : (
            <PlusIcon className="h-6 w-6" />
          )}
        </summary>

        <div className="p-6 space-y-6 bg-white border border-gray-200 rounded-b-xl">
          {slides.map((slide, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-inner space-y-5 transition-all"
            >
              <div className="flex justify-between items-center border-b pb-3 mb-3">
                <h3 className="font-bold text-gray-800 text-lg">
                  Slide {idx + 1}
                </h3>
                {slides.length > 1 && (
                  <button
                    onClick={() => onRemoveSlide(idx)}
                    aria-label={`Delete Slide ${idx + 1}`}
                    className="text-red-500 hover:text-red-700 transition p-1 rounded-full hover:bg-red-100"
                    disabled={isCompressing}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-6 lg:flex-row">
                {/* Image Uploads */}
                <div className="w-full lg:w-1/3 space-y-4">
                  {/* Primary Image Upload */}
                  <label 
                    className={`relative block h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 overflow-hidden transition ${
                      isCompressing
                        ? "cursor-not-allowed border-gray-400 opacity-60"
                        : "cursor-pointer border-gray-300 hover:border-indigo-400"
                    }`}
                  >
                    {slide.imageUrl ? (
                      <img
                        src={slide.imageUrl}
                        alt={`Primary Slide ${idx + 1}`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <PhotoIcon className="h-8 w-8 mb-1" />
                        <span className="text-xs text-center font-medium">
                          Background Image (1920px max)
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, idx, "imageUrl")}
                      disabled={isCompressing}
                    />
                  </label>

                  {/* Secondary Image Upload */}
                  <label
                    className={`relative block h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 overflow-hidden transition ${
                      isCompressing
                        ? "cursor-not-allowed border-gray-400 opacity-60"
                        : "cursor-pointer border-gray-300 hover:border-purple-400"
                    }`}
                  >
                    {slide.productImageUrl ? (
                      <img
                        src={slide.productImageUrl}
                        alt={`Secondary Slide ${idx + 1}`}
                        className="absolute inset-0 h-full w-full object-contain p-2"
                      />
                    ) : (
                      <>
                        <PhotoIcon className="h-8 w-8 mb-1" />
                        <span className="text-xs text-center font-medium">
                          Product Image (800px max, optional)
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageChange(e, idx, "productImageUrl")
                      }
                      disabled={isCompressing}
                    />
                  </label>
                </div>

                {/* Slide Text Inputs */}
                <div className="flex-1 space-y-4">
                  <input
                    placeholder="Headline (e.g. Introducing our New Line)"
                    value={slide.headline || ""}
                    onChange={(e) =>
                      onUpdateSlide(idx, "headline", e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    required
                  />
                  <input
                    placeholder="Badge Text (Optional, e.g. Limited Offer!)"
                    value={slide.badgeText || ""}
                    onChange={(e) =>
                      onUpdateSlide(idx, "badgeText", e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                  <textarea
                    rows={3}
                    placeholder="Subline / Description (Optional)"
                    value={slide.subline || ""}
                    onChange={(e) =>
                      onUpdateSlide(idx, "subline", e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      placeholder="CTA Text (Optional, e.g. Shop Now)"
                      value={slide.ctaText || ""}
                      onChange={(e) =>
                        onUpdateSlide(idx, "ctaText", e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                    <input
                      placeholder="CTA Link (Optional, e.g. /products/new)"
                      value={slide.ctaLink || ""}
                      onChange={(e) =>
                        onUpdateSlide(idx, "ctaLink", e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="pt-4">
            <button
              type="button"
              onClick={onAddSlide}
              // Disabled if not all previous slides are filled OR if compression is ongoing
              disabled={!allFilled || isCompressing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Another Slide</span>
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}