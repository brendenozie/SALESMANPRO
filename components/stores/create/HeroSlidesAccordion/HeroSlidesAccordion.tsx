import React, { ChangeEvent, useEffect } from "react";
import imageCompression from "browser-image-compression"; // Import the library
import {
  PlusIcon,
  CheckIcon,
  TrashIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { HeroSlide } from "@/types/typings";

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

    // --- Image Compression Logic ---
    const IMAGE_MAX_SIZE_MB = 0.48; // ~480KB, to ensure it's under 500KB
    const options = {
      maxSizeMB: IMAGE_MAX_SIZE_MB,
      maxWidthOrHeight: 1920,
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
        // Pass it the *compressed* file.
        onImageUpload(index, compressedFile, field);
      } else {
        // No upload handler provided.
        // Fall back to creating a local preview URL of the compressed file.
        onUpdateSlide(index, field, URL.createObjectURL(compressedFile));
      }
    } catch (error) {
      console.error("Image compression failed:", error);
      alert("Image compression failed. Please try another file.");
    } finally {
      // Clear the input value to allow re-selection of the same file
      e.target.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto overflow-hidden ">
      <details open className="group transition-all">
        <summary className="flex justify-between items-center cursor-pointer px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg">
          <span>Hero Slides</span>
          {slides.length > 0 ? (
            <CheckIcon className="h-6 w-6" />
          ) : (
            <PlusIcon className="h-6 w-6" />
          )}
        </summary>

        <div className="p-6 space-y-6 transition-all duration-300">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm space-y-5 transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-lg">
                  Slide {idx + 1}
                </h3>
                {slides.length > 1 && (
                  <button
                    onClick={() => onRemoveSlide(idx)}
                    aria-label={`Delete Slide ${idx + 1}`}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-6 sm:flex-row">
                {/* Image Uploads */}
                <div className="w-full sm:w-1/3 space-y-4">
                  {/* Primary Image Upload */}
                  <label className="relative block h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 transition cursor-pointer overflow-hidden">
                    {slide.imageUrl ? (
                      <img
                        src={slide.imageUrl}
                        alt={`Primary Slide ${idx + 1}`}
                        className="absolute inset-0 h-full w-full object-cover rounded-xl"
                      />
                    ) : (
                      <>
                        <PhotoIcon className="h-8 w-8 mb-1" />
                        <span className="text-xs text-center">
                          Upload Background Image
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      // Use the new handler
                      onChange={(e) => handleImageChange(e, idx, "imageUrl")}
                    />
                  </label>

                  {/* Secondary Image Upload */}
                  <label className="relative block h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 transition cursor-pointer overflow-hidden">
                    {slide.productImageUrl ? (
                      <img
                        src={slide.productImageUrl}
                        alt={`Secondary Slide ${idx + 1}`}
                        className="absolute inset-0 h-full w-full object-cover rounded-xl"
                      />
                    ) : (
                      <>
                        <PhotoIcon className="h-8 w-8 mb-1" />
                        <span className="text-xs text-center">
                          Upload Product Image
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      // Use the new handler
                      onChange={(e) =>
                        handleImageChange(e, idx, "productImageUrl")
                      }
                    />
                  </label>
                </div>

                {/* Slide Text Inputs */}
                <div className="flex-1 space-y-4">
                  <input
                    placeholder="Headline"
                    value={slide.headline || ""}
                    onChange={(e) =>
                      onUpdateSlide(idx, "headline", e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    required
                  />
                  <input
                    placeholder="Badge Text (optional)"
                    value={slide.badgeText || ""}
                    onChange={(e) =>
                      onUpdateSlide(idx, "badgeText", e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                  <input
                    placeholder="Subline (optional)"
                    value={slide.subline || ""}
                    onChange={(e) =>
                      onUpdateSlide(idx, "subline", e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      placeholder="CTA Text (optional)"
                      value={slide.ctaText || ""}
                      onChange={(e) =>
                        onUpdateSlide(idx, "ctaText", e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                    <input
                      placeholder="CTA Link (optional)"
                      value={slide.ctaLink || ""}
                      onChange={(e) =>
                        onUpdateSlide(idx, "ctaLink", e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
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