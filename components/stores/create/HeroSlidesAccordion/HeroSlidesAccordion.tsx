import React, { ChangeEvent, useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import {
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeroSlide } from "@/types/typings";
import { motion, AnimatePresence } from "framer-motion";

export interface HeroSlidesAccordionProps {
  slides: HeroSlide[];
  onUpdateSlide: (index: number, field: keyof HeroSlide, value: string) => void;
  onAddSlide: () => void;
  onRemoveSlide: (index: number) => void;
  onImageUpload?: (index: number, file: File, field: keyof HeroSlide) => void;
  onMoveSlide?: (currentIndex: number, newIndex: number) => void; // Optional enhancement for carousel sorting
}

// Track distinct loading contexts locally instead of a global blocker
interface CompressingState {
  index: number;
  field: "imageUrl" | "productImageUrl";
}

export default function HeroSlidesAccordion({
  slides,
  onUpdateSlide,
  onAddSlide,
  onRemoveSlide,
  onImageUpload,
  onMoveSlide,
}: HeroSlidesAccordionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [loadingFields, setLoadingFields] = useState<CompressingState[]>([]);

  const allFilled = slides.every((s) => s.imageUrl && s.headline);

  // Auto-initialize first slide template if empty
  useEffect(() => {
    if (slides.length === 0) {
      onAddSlide();
    }
  }, [slides, onAddSlide]);

  const isFieldCompressing = (index: number, field: "imageUrl" | "productImageUrl") =>
    loadingFields.some((item) => item.index === index && item.field === field);

  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
    field: "imageUrl" | "productImageUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Track specific field loading locally
    setLoadingFields((prev) => [...prev, { index, field }]);

    const IMAGE_MAX_SIZE_MB = 0.48; // ~480KB max threshold
    const maxWidth = field === "imageUrl" ? 1920 : 800;

    const options = {
      maxSizeMB: IMAGE_MAX_SIZE_MB,
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);

      if (onImageUpload) {
        onImageUpload(index, compressedFile, field);
      } else {
        // Safe management of object references to prevent active memory leaks
        const currentUrl = slides[index]?.[field];
        if (currentUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(currentUrl);
        }
        onUpdateSlide(index, field, URL.createObjectURL(compressedFile));
      }
    } catch (error) {
      console.error("Image compression failed:", error);
      alert("Could not process image. Please try adjusting your dimensions or crop factor.");
    } finally {
      setLoadingFields((prev) =>
        prev.filter((item) => !(item.index === index && item.field === field))
      );
      e.target.value = "";
    }
  };

  const handleClearImage = (index: number, field: "imageUrl" | "productImageUrl") => {
    const currentUrl = slides[index]?.[field];
    if (currentUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(currentUrl);
    }
    onUpdateSlide(index, field, "");
  };

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Hero Slides Configuration</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage carousel assets, background configurations, and copy vectors.</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
          {slides.length} {slides.length === 1 ? "Slide" : "Slides"}
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {slides.map((slide, idx) => {
            const isExpanded = expandedIndex === idx;
            const isBgLoading = isFieldCompressing(idx, "imageUrl");
            const isProductLoading = isFieldCompressing(idx, "productImageUrl");

            return (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`border bg-white rounded-xl shadow-sm overflow-hidden transition-colors ${
                  isExpanded ? "border-indigo-200 ring-1 ring-indigo-100" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Accordion Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-white cursor-pointer select-none">
                  <div className="flex items-center space-x-3 flex-1 min-w-0" onClick={() => toggleAccordion(idx)}>
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 text-gray-700 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <span className={`truncate font-medium text-sm transition-colors ${isExpanded ? "text-indigo-600 font-semibold" : "text-gray-700"}`}>
                      {slide.headline || <span className="text-gray-400 italic font-normal">Untitled Slide Blueprint</span>}
                    </span>
                  </div>

                  {/* Header Management Toolbar */}
                  <div className="flex items-center space-x-1.5 ml-4">
                    {onMoveSlide && slides.length > 1 && (
                      <div className="flex items-center border border-gray-200 rounded-lg p-0.5 mr-1 bg-gray-50/50">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => onMoveSlide(idx, idx - 1)}
                          className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:hover:text-gray-400 transition"
                          aria-label="Move slide up"
                        >
                          <ArrowUpIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === slides.length - 1}
                          onClick={() => onMoveSlide(idx, idx + 1)}
                          className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:hover:text-gray-400 transition"
                          aria-label="Move slide down"
                        >
                          <ArrowDownIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {slides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveSlide(idx);
                          if (expandedIndex === idx) setExpandedIndex(Math.max(0, idx - 1));
                        }}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                        aria-label={`Delete slide entry ${idx + 1}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleAccordion(idx)}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition"
                      aria-label="Toggle accordion collapse details"
                    >
                      <ChevronDownIcon className={`h-4 w-4 transform transition-transform duration-200 ${isExpanded ? "rotate-180 text-indigo-500" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Collapsible content pane */}
                <div className={`grid transition-all duration-200 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 border-t border-gray-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="p-5 bg-gray-50/40 space-y-5 lg:space-y-0 lg:flex lg:gap-6">
                      
                      {/* Left Side: Images column */}
                      <div className="w-full lg:w-72 flex flex-row lg:flex-col gap-4 flex-shrink-0">
                        
                        {/* Background Asset Box */}
                        <div className="flex-1 space-y-1">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Background Layer</span>
                          <div className={`relative h-32 border-2 border-dashed rounded-xl overflow-hidden flex flex-col items-center justify-center transition group bg-white ${
                            isBgLoading ? "border-indigo-300" : slide.imageUrl ? "border-gray-200" : "border-gray-300 hover:border-indigo-400 cursor-pointer"
                          }`}>
                            {isBgLoading ? (
                              <div className="flex flex-col items-center justify-center space-y-1.5 text-indigo-500 text-xs">
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                <span className="font-medium">Scaling down...</span>
                              </div>
                            ) : slide.imageUrl ? (
                              <>
                                <img src={slide.imageUrl} alt="Background blueprint frame" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                                  <label className="px-2.5 py-1.5 bg-white text-gray-700 text-xs font-semibold rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition">
                                    Replace
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, idx, "imageUrl")} />
                                  </label>
                                  <button type="button" onClick={() => handleClearImage(idx, "imageUrl")} className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition shadow-sm">
                                    <XMarkIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <label className="w-full h-full flex flex-col items-center justify-center p-3 cursor-pointer text-gray-400 hover:text-indigo-500 transition">
                                <PhotoIcon className="h-6 w-6 mb-1 text-gray-400" />
                                <span className="text-[11px] text-center font-medium leading-tight">Click to upload backdrop (1920px max)</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, idx, "imageUrl")} />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Product Feature Asset Box */}
                        <div className="flex-1 space-y-1">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Foreground (Optional)</span>
                          <div className={`relative h-32 border-2 border-dashed rounded-xl overflow-hidden flex flex-col items-center justify-center transition group bg-white ${
                            isProductLoading ? "border-purple-300" : slide.productImageUrl ? "border-gray-200" : "border-gray-300 hover:border-purple-400 cursor-pointer"
                          }`}>
                            {isProductLoading ? (
                              <div className="flex flex-col items-center justify-center space-y-1.5 text-purple-500 text-xs">
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                <span className="font-medium">Processing PNG...</span>
                              </div>
                            ) : slide.productImageUrl ? (
                              <>
                                <img src={slide.productImageUrl} alt="Product composite preview" className="w-full h-full object-contain p-2" />
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                                  <label className="px-2.5 py-1.5 bg-white text-gray-700 text-xs font-semibold rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition">
                                    Replace
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, idx, "productImageUrl")} />
                                  </label>
                                  <button type="button" onClick={() => handleClearImage(idx, "productImageUrl")} className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition shadow-sm">
                                    <XMarkIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <label className="w-full h-full flex flex-col items-center justify-center p-3 cursor-pointer text-gray-400 hover:text-purple-500 transition">
                                <PhotoIcon className="h-6 w-6 mb-1 text-gray-400" />
                                <span className="text-[11px] text-center font-medium leading-tight">Click to upload vector cutout (800px max)</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, idx, "productImageUrl")} />
                              </label>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Right Side: Copy Vectors Form inputs */}
                      <div className="flex-1 space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Headline Text Blueprint</label>
                          <input
                            type="text"
                            placeholder="e.g., Introducing our Autumn Collection"
                            value={slide.headline || ""}
                            onChange={(e) => onUpdateSlide(idx, "headline", e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-sm transition"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Context Badge / Tag</label>
                            <input
                              type="text"
                              placeholder="e.g., Limited Offer"
                              value={slide.badgeText || ""}
                              onChange={(e) => onUpdateSlide(idx, "badgeText", e.target.value)}
                              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-sm transition"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Action Destination (CTA Link)</label>
                            <input
                              type="text"
                              placeholder="e.g., /catalog/autumn"
                              value={slide.ctaLink || ""}
                              onChange={(e) => onUpdateSlide(idx, "ctaLink", e.target.value)}
                              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-sm transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Action Trigger Copy (CTA Button Text)</label>
                          <input
                            type="text"
                            placeholder="e.g., Explore Collection"
                            value={slide.ctaText || ""}
                            onChange={(e) => onUpdateSlide(idx, "ctaText", e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-sm transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Subline Meta Pitch / Description</label>
                          <textarea
                            rows={2}
                            placeholder="Add brief conceptual text framing your primary product collection..."
                            value={slide.subline || ""}
                            onChange={(e) => onUpdateSlide(idx, "subline", e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-sm transition resize-none"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            onAddSlide();
            // Automatically open the new slide deck window
            setExpandedIndex(slides.length);
          }}
          disabled={!allFilled || loadingFields.length > 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/10 active:scale-[0.99] transition disabled:opacity-40 disabled:pointer-events-none shadow-sm"
        >
          <PlusIcon className="h-4 w-4 stroke-[2.5]" />
          <span>Append Carousel Slide Blueprint</span>
        </button>
      </div>
    </div>
  );
}

// import React, { ChangeEvent, useEffect, useState } from "react";
// import imageCompression from "browser-image-compression"; // Import the library
// import {
//   PlusIcon,
//   CheckIcon,
//   TrashIcon,
//   PhotoIcon,
//   ArrowPathIcon, // Added for loading indicator
// } from "@heroicons/react/24/outline";
// import { HeroSlide } from "@/types/typings";
// import { motion } from "framer-motion"; // Added for smooth transitions

// export interface HeroSlidesAccordionProps {
//   slides: HeroSlide[];
//   onUpdateSlide: (index: number, field: keyof HeroSlide, value: string) => void;
//   onAddSlide: () => void;
//   onRemoveSlide: (index: number) => void;
//   onImageUpload?: (index: number, file: File, field: keyof HeroSlide) => void;
// }

// export default function HeroSlidesAccordion({
//   slides,
//   onUpdateSlide,
//   onAddSlide,
//   onRemoveSlide,
//   onImageUpload,
// }: HeroSlidesAccordionProps) {
//   // 1. NEW STATE: Manage compression status for visual feedback
//   const [isCompressing, setIsCompressing] = useState<boolean>(false);
  
//   const allFilled = slides.every((s) => s.imageUrl && s.headline);

//   // Ensure there's at least one form ready on initial render
//   useEffect(() => {
//     if (slides.length === 0) {
//       onAddSlide();
//     }
//   }, [slides, onAddSlide]);

//   /**
//    * Handles image selection, compression, and passes the
//    * compressed file to the correct handler.
//    */
//   const handleImageChange = async (
//     e: ChangeEvent<HTMLInputElement>,
//     index: number,
//     field: "imageUrl" | "productImageUrl" // Be specific on the field
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Start loading state
//     setIsCompressing(true);

//     // --- Dynamic Image Compression Logic ---
//     const IMAGE_MAX_SIZE_MB = 0.48; // ~480KB, to ensure it's under 500KB
    
//     // Set max resolution based on the field type
//     const maxWidth = field === "imageUrl" ? 1920 : 800; // Background (1920px) vs Product (800px)

//     const options = {
//       maxSizeMB: IMAGE_MAX_SIZE_MB,
//       maxWidthOrHeight: maxWidth,
//       useWebWorker: true,
//     };

//     try {
//       console.log(
//         `[Slide ${index + 1}] Original ${field} size: ${(
//           file.size / 1024
//         ).toFixed(2)} KB`
//       );

//       const compressedFile = await imageCompression(file, options);

//       console.log(
//         `[Slide ${index + 1}] Compressed ${field} size: ${(
//           compressedFile.size / 1024
//         ).toFixed(2)} KB`
//       );

//       // --- Prop Handling Logic ---
//       if (onImageUpload) {
//         // The parent component handles the file upload.
//         onImageUpload(index, compressedFile, field);
//       } else {
//         // Fall back to creating a local preview URL of the compressed file.
//         onUpdateSlide(index, field, URL.createObjectURL(compressedFile));
//       }
//     } catch (error) {
//       console.error("Image compression failed:", error);
//       alert("Image compression failed. Please try another file.");
//     } finally {
//       // Stop loading state and clear the input value
//       setIsCompressing(false);
//       e.target.value = "";
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto overflow-hidden">
//       {/* 🛑 Visual Feedback Overlay for Compression */}
//       {isCompressing && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
//           <motion.div
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             className="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-3"
//           >
//             <ArrowPathIcon className="w-6 h-6 text-indigo-600 animate-spin" />
//             <p className="text-lg font-medium text-gray-800">
//               Compressing Image (Max {isCompressing ? "1920" : "N/A"}px)...
//             </p>
//           </motion.div>
//         </div>
//       )}
//       {/* 🛑 END Visual Feedback Overlay */}

//       <details open className="group transition-all">
//         <summary className="flex justify-between items-center cursor-pointer px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg rounded-t-xl shadow-lg">
//           <span>Hero Slides Configuration</span>
//           {slides.length > 0 ? (
//             <CheckIcon className="h-6 w-6" />
//           ) : (
//             <PlusIcon className="h-6 w-6" />
//           )}
//         </summary>

//         <div className="p-6 space-y-6 bg-white border border-gray-200 rounded-b-xl">
//           {slides.map((slide, idx) => (
//             <motion.div
//               key={idx}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.2 }}
//               className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-inner space-y-5 transition-all"
//             >
//               <div className="flex justify-between items-center border-b pb-3 mb-3">
//                 <h3 className="font-bold text-gray-800 text-lg">
//                   Slide {idx + 1}
//                 </h3>
//                 {slides.length > 1 && (
//                   <button
//                     onClick={() => onRemoveSlide(idx)}
//                     aria-label={`Delete Slide ${idx + 1}`}
//                     className="text-red-500 hover:text-red-700 transition p-1 rounded-full hover:bg-red-100"
//                     disabled={isCompressing}
//                   >
//                     <TrashIcon className="h-5 w-5" />
//                   </button>
//                 )}
//               </div>

//               <div className="flex flex-col gap-6 lg:flex-row">
//                 {/* Image Uploads */}
//                 <div className="w-full lg:w-1/3 space-y-4">
//                   {/* Primary Image Upload */}
//                   <label 
//                     className={`relative block h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 overflow-hidden transition ${
//                       isCompressing
//                         ? "cursor-not-allowed border-gray-400 opacity-60"
//                         : "cursor-pointer border-gray-300 hover:border-indigo-400"
//                     }`}
//                   >
//                     {slide.imageUrl ? (
//                       <img
//                         src={slide.imageUrl}
//                         alt={`Primary Slide ${idx + 1}`}
//                         className="absolute inset-0 h-full w-full object-cover"
//                       />
//                     ) : (
//                       <>
//                         <PhotoIcon className="h-8 w-8 mb-1" />
//                         <span className="text-xs text-center font-medium">
//                           Background Image (1920px max)
//                         </span>
//                       </>
//                     )}
//                     <input
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       onChange={(e) => handleImageChange(e, idx, "imageUrl")}
//                       disabled={isCompressing}
//                     />
//                   </label>

//                   {/* Secondary Image Upload */}
//                   <label
//                     className={`relative block h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 overflow-hidden transition ${
//                       isCompressing
//                         ? "cursor-not-allowed border-gray-400 opacity-60"
//                         : "cursor-pointer border-gray-300 hover:border-purple-400"
//                     }`}
//                   >
//                     {slide.productImageUrl ? (
//                       <img
//                         src={slide.productImageUrl}
//                         alt={`Secondary Slide ${idx + 1}`}
//                         className="absolute inset-0 h-full w-full object-contain p-2"
//                       />
//                     ) : (
//                       <>
//                         <PhotoIcon className="h-8 w-8 mb-1" />
//                         <span className="text-xs text-center font-medium">
//                           Product Image (800px max, optional)
//                         </span>
//                       </>
//                     )}
//                     <input
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       onChange={(e) =>
//                         handleImageChange(e, idx, "productImageUrl")
//                       }
//                       disabled={isCompressing}
//                     />
//                   </label>
//                 </div>

//                 {/* Slide Text Inputs */}
//                 <div className="flex-1 space-y-4">
//                   <input
//                     placeholder="Headline (e.g. Introducing our New Line)"
//                     value={slide.headline || ""}
//                     onChange={(e) =>
//                       onUpdateSlide(idx, "headline", e.target.value)
//                     }
//                     className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
//                     required
//                   />
//                   <input
//                     placeholder="Badge Text (Optional, e.g. Limited Offer!)"
//                     value={slide.badgeText || ""}
//                     onChange={(e) =>
//                       onUpdateSlide(idx, "badgeText", e.target.value)
//                     }
//                     className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
//                   />
//                   <textarea
//                     rows={3}
//                     placeholder="Subline / Description (Optional)"
//                     value={slide.subline || ""}
//                     onChange={(e) =>
//                       onUpdateSlide(idx, "subline", e.target.value)
//                     }
//                     className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
//                   />
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <input
//                       placeholder="CTA Text (Optional, e.g. Shop Now)"
//                       value={slide.ctaText || ""}
//                       onChange={(e) =>
//                         onUpdateSlide(idx, "ctaText", e.target.value)
//                       }
//                       className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
//                     />
//                     <input
//                       placeholder="CTA Link (Optional, e.g. /products/new)"
//                       value={slide.ctaLink || ""}
//                       onChange={(e) =>
//                         onUpdateSlide(idx, "ctaLink", e.target.value)
//                       }
//                       className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           ))}

//           <div className="pt-4">
//             <button
//               type="button"
//               onClick={onAddSlide}
//               // Disabled if not all previous slides are filled OR if compression is ongoing
//               disabled={!allFilled || isCompressing}
//               className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
//             >
//               <PlusIcon className="h-5 w-5" />
//               <span>Add Another Slide</span>
//             </button>
//           </div>
//         </div>
//       </details>
//     </div>
//   );
// }