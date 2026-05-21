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
  VideoCameraIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  HashtagIcon,
  PaintBrushIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

// Update the interface to perfectly match your Prisma schema backend structures
export interface BannerSlide {
  id?: string;
  type?: string | null; // e.g. "video" | "image" | "Hero" | "Promo" | "Feature"
  imageUrl?: string | null;
  productImageUrl?: string | null;
  headline?: string | null;
  subline?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  videoLink?: string | null;
  badgeText?: string | null;
  price?: string | null;
  endsAt?: string | Date | null;
  stats?: Record<string, any> | null | undefined; // MongoDB JSON mapping
  order?: number;
  iconKey?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
}

export interface HeroSlidesAccordionProps {
  slides: BannerSlide[];
  onUpdateSlide: (index: number, field: keyof BannerSlide, value: any) => void;
  onAddSlide: () => void;
  onRemoveSlide: (index: number) => void;
  onImageUpload?: (index: number, file: File, field: "imageUrl" | "productImageUrl") => void;
  onMoveSlide?: (currentIndex: number, newIndex: number) => void;
}

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

  // Track dynamic custom stats input state per slide
  const [statKeys, setStatKeys] = useState<Record<number, { key: string; val: string }>>({});

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

    setLoadingFields((prev) => [...prev, { index, field }]);

    const IMAGE_MAX_SIZE_MB = 0.48;
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
        const currentUrl = slides[index]?.[field];
        if (currentUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(currentUrl);
        }
        onUpdateSlide(index, field, URL.createObjectURL(compressedFile));
      }
    } catch (error) {
      console.error("Image compression failed:", error);
      alert("Could not process image. Please try adjusting your dimensions.");
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

  // Safe mutations for the Prisma nested JSON Stats block
  const handleAddStatObject = (idx: number) => {
    const key = statKeys[idx]?.key?.trim();
    const val = statKeys[idx]?.val?.trim();
    if (!key || !val) return;

    const currentStats = slides[idx]?.stats || {};
    const updatedStats = { ...currentStats, [key]: isNaN(Number(val)) ? val : Number(val) };
    
    onUpdateSlide(idx, "stats", updatedStats);
    setStatKeys((prev) => ({ ...prev, [idx]: { key: "", val: "" } }));
  };

  const handleRemoveStatObject = (idx: number, keyToRemove: string) => {
    const currentStats = { ...(slides[idx]?.stats || {}) };
    delete currentStats[keyToRemove];
    onUpdateSlide(idx, "stats", Object.keys(currentStats).length ? currentStats : null);
  };

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0 text-gray-900 dark:text-gray-100">
      
      {/* Dashboard Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">
            Banner Display Systems
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Configure mixed-media layouts, background values, schedules, and dynamic metric vectors.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/50 shadow-2xs self-start sm:self-auto">
          {slides.length} {slides.length === 1 ? "Active Banner" : "Active Banners"}
        </span>
      </div>

      {/* Accordion Target Stack Wrapper */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {slides.map((slide, idx) => {
            const isExpanded = expandedIndex === idx;
            const isBgLoading = isFieldCompressing(idx, "imageUrl");
            const isProductLoading = isFieldCompressing(idx, "productImageUrl");

            // Format date strictly for HTML input injection safety
            let rawDateString = "";
            if (slide.endsAt) {
              const d = typeof slide.endsAt === "string" ? new Date(slide.endsAt) : slide.endsAt;
              if (!isNaN(d.getTime())) {
                rawDateString = d.toISOString().slice(0, 16);
              }
            }

            return (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                className={`border rounded-xl shadow-xs overflow-hidden transition-all duration-200 ${
                  isExpanded
                    ? "border-indigo-300 dark:border-indigo-500/40 bg-white dark:bg-zinc-900 ring-4 ring-indigo-500/5 dark:ring-indigo-500/5"
                    : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-gray-300 dark:hover:border-zinc-700"
                }`}
              >
                {/* Accordion Row Structural Header */}
                <div 
                  onClick={() => toggleAccordion(idx)}
                  className="flex items-center justify-between px-4 sm:px-5 py-4 cursor-pointer select-none bg-white dark:bg-zinc-900"
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold transition-all ${
                      isExpanded 
                        ? "bg-indigo-600 text-white" 
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`truncate text-sm transition-colors duration-150 ${
                        isExpanded 
                          ? "text-indigo-600 dark:text-indigo-400 font-semibold" 
                          : "text-gray-700 dark:text-zinc-300 font-medium"
                      }`}>
                        {slide.headline || (
                          <span className="text-gray-400 dark:text-zinc-500 italic font-normal">
                            Unconfigured Banner Blueprint
                          </span>
                        )}
                      </span>
                      {slide.type && (
                        <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">
                          Type: {slide.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operational Controls & Sorters */}
                  <div className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
                    {onMoveSlide && slides.length > 1 && (
                      <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-lg p-0.5 bg-gray-50/50 dark:bg-zinc-900/50">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => onMoveSlide(idx, idx - 1)}
                          className="p-1 rounded text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 disabled:opacity-20 transition"
                          aria-label="Move slide up"
                        >
                          <ArrowUpIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === slides.length - 1}
                          onClick={() => onMoveSlide(idx, idx + 1)}
                          className="p-1 rounded text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 disabled:opacity-20 transition"
                          aria-label="Move slide down"
                        >
                          <ArrowDownIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onRemoveSlide(idx);
                        if (expandedIndex === idx) setExpandedIndex(Math.max(0, idx - 1));
                      }}
                      className="text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition"
                      aria-label={`Delete slide ${idx + 1}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleAccordion(idx)}
                      className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 p-1.5 rounded-lg transition"
                      aria-label="Toggle collapse panel"
                    >
                      <ChevronDownIcon className={`h-4 w-4 transform transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-indigo-500 dark:text-indigo-400" : ""
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Smooth Expansion Content Container */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="border-t border-gray-100 dark:border-zinc-800 bg-gray-50/40 dark:bg-zinc-900/15"
                    >
                      <div className="p-4 sm:p-5 space-y-6">
                        
                        {/* FIRST ROW: Media Layout Engine & Structural Properties */}
                        <div className="flex flex-col lg:flex-row gap-5">
                          
                          {/* Left Graphic Uploaders Column */}
                          <div className="w-full lg:w-64 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 flex-shrink-0">
                            
                            {/* Background Image dropzone */}
                            <div className="space-y-1.5">
                              <span className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                                Background Asset Layer
                              </span>
                              <div className={`relative h-32 border-2 border-dashed rounded-xl overflow-hidden flex flex-col items-center justify-center transition group bg-white dark:bg-zinc-900 ${
                                isBgLoading 
                                  ? "border-indigo-400 dark:border-indigo-500" 
                                  : slide.imageUrl 
                                  ? "border-gray-200 dark:border-zinc-800" 
                                  : "border-gray-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer"
                              }`}>
                                {isBgLoading ? (
                                  <div className="flex flex-col items-center justify-center space-y-1.5 text-indigo-500 dark:text-indigo-400 text-xs">
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                    <span className="font-medium">Scaling Down...</span>
                                  </div>
                                ) : slide.imageUrl ? (
                                  <>
                                    <img src={slide.imageUrl} alt="Banner canvas canvas preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center space-x-2 backdrop-blur-xs">
                                      <label className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 text-xs font-semibold rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 transition">
                                        Replace
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, idx, "imageUrl")} />
                                      </label>
                                      <button type="button" onClick={() => handleClearImage(idx, "imageUrl")} className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm">
                                        <XMarkIcon className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <label className="w-full h-full flex flex-col items-center justify-center p-3 cursor-pointer text-gray-400 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition">
                                    <PhotoIcon className="h-6 w-6 mb-1" />
                                    <span className="text-[11px] text-center font-medium leading-snug max-w-[160px]">
                                      Upload Canvas background
                                    </span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, idx, "imageUrl")} />
                                  </label>
                                )}
                              </div>
                            </div>

                            {/* Product Foreground Image dropzone */}
                            <div className="space-y-1.5">
                              <span className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                                Product Cutout Layer
                              </span>
                              <div className={`relative h-32 border-2 border-dashed rounded-xl overflow-hidden flex flex-col items-center justify-center transition group bg-white dark:bg-zinc-900 ${
                                isProductLoading 
                                  ? "border-purple-400 dark:border-purple-500" 
                                  : slide.productImageUrl 
                                  ? "border-gray-200 dark:border-zinc-800" 
                                  : "border-gray-300 dark:border-zinc-700 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer"
                              }`}>
                                {isProductLoading ? (
                                  <div className="flex flex-col items-center justify-center space-y-1.5 text-purple-500 dark:text-purple-400 text-xs">
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                    <span className="font-medium">Processing PNG...</span>
                                  </div>
                                ) : slide.productImageUrl ? (
                                  <>
                                    <img src={slide.productImageUrl} alt="Product float layer preview" className="w-full h-full object-contain p-2" />
                                    <div className="absolute inset-0 bg-black/50 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center space-x-2 backdrop-blur-xs">
                                      <label className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 text-xs font-semibold rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 transition">
                                        Replace
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, idx, "productImageUrl")} />
                                      </label>
                                      <button type="button" onClick={() => handleClearImage(idx, "productImageUrl")} className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm">
                                        <XMarkIcon className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <label className="w-full h-full flex flex-col items-center justify-center p-3 cursor-pointer text-gray-400 dark:text-zinc-500 hover:text-purple-500 dark:hover:text-purple-400 transition">
                                    <PhotoIcon className="h-6 w-6 mb-1" />
                                    <span className="text-[11px] text-center font-medium leading-snug max-w-[160px]">
                                      Upload PNG Overlay
                                    </span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, idx, "productImageUrl")} />
                                  </label>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* Primary Copy Text Fields Matrix Column */}
                          <div className="flex-1 space-y-4">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                                  Headline Template text
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Save up to 40% off retail value"
                                  value={slide.headline || ""}
                                  onChange={(e) => onUpdateSlide(idx, "headline", e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none text-sm shadow-2xs transition"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                                  Banner Display Type
                                </label>
                                <select
                                  value={slide.type || "image"}
                                  onChange={(e) => onUpdateSlide(idx, "type", e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none text-sm shadow-2xs transition"
                                >
                                  <option value="image">Standard Image</option>
                                  <option value="video">Embedded Video Stream</option>
                                  <option value="Hero">Primary Hero Showcase</option>
                                  <option value="Promo">Flash Promotional Spot</option>
                                  <option value="Feature">Product Feature Highlighting</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                  <TagIcon className="w-3 h-3 text-gray-400" /> Badge / Flash Label
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Clearance Spot"
                                  value={slide.badgeText || ""}
                                  onChange={(e) => onUpdateSlide(idx, "badgeText", e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none text-sm shadow-2xs transition"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                  <CurrencyDollarIcon className="w-3.5 h-3.5 text-gray-400" /> Display Pricing Tag
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., From $19.99/mo"
                                  value={slide.price || ""}
                                  onChange={(e) => onUpdateSlide(idx, "price", e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none text-sm shadow-2xs transition"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                                Subline Description Pitch
                              </label>
                              <textarea
                                rows={2}
                                placeholder="Provide crisp layout subtext highlighting the core offer specifications..."
                                value={slide.subline || ""}
                                onChange={(e) => onUpdateSlide(idx, "subline", e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none text-sm shadow-2xs transition resize-none"
                              />
                            </div>

                          </div>
                        </div>

                        {/* SECOND ROW: Interactive Actions & Link Routing Matrices */}
                        <div className="bg-gray-100/50 dark:bg-zinc-950/30 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border border-gray-200/60 dark:border-zinc-800/60">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                              CTA Button Copy
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Shop Now"
                              value={slide.ctaText || ""}
                              onChange={(e) => onUpdateSlide(idx, "ctaText", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-xs shadow-3xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                              CTA Target Endpoint Link
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., /promo/clearance"
                              value={slide.ctaLink || ""}
                              onChange={(e) => onUpdateSlide(idx, "ctaLink", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-xs shadow-3xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <VideoCameraIcon className="w-3.5 h-3.5 text-gray-400" /> Dynamic Video URL
                            </label>
                            <input
                              type="text"
                              disabled={slide.type !== "video"}
                              placeholder={slide.type === "video" ? "e.g., HLS stream or mp4 link" : "Change Type to video above"}
                              value={slide.videoLink || ""}
                              onChange={(e) => onUpdateSlide(idx, "videoLink", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-xs shadow-3xs disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-zinc-800/50"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" /> Campaign Expiration (endsAt)
                            </label>
                            <input
                              type="datetime-local"
                              value={rawDateString}
                              onChange={(e) => onUpdateSlide(idx, "endsAt", e.target.value ? new Date(e.target.value) : null)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 text-xs shadow-3xs"
                            />
                          </div>
                        </div>

                        {/* THIRD ROW: Custom Styling Mechanics & Dynamic Icon Keys */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-3 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl">
                            <span className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                              <PaintBrushIcon className="w-3.5 h-3.5" /> Styling Vector Core Override
                            </span>
                            
                            <div className="grid grid-cols-2 gap-3.5">
                              <div>
                                <label className="block text-[11px] text-gray-500 dark:text-zinc-400 mb-1">Canvas Background</label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="color" 
                                    value={slide.backgroundColor || "#ffffff"} 
                                    onChange={(e) => onUpdateSlide(idx, "backgroundColor", e.target.value)}
                                    className="w-7 h-7 rounded-md overflow-hidden border border-gray-300 dark:border-zinc-700 cursor-pointer bg-transparent"
                                  />
                                  <input 
                                    type="text"
                                    placeholder="#ffffff"
                                    value={slide.backgroundColor || ""}
                                    onChange={(e) => onUpdateSlide(idx, "backgroundColor", e.target.value)}
                                    className="flex-1 px-2.5 py-1 text-xs border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[11px] text-gray-500 dark:text-zinc-400 mb-1">Typography Ink</label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="color" 
                                    value={slide.textColor || "#000000"} 
                                    onChange={(e) => onUpdateSlide(idx, "textColor", e.target.value)}
                                    className="w-7 h-7 rounded-md overflow-hidden border border-gray-300 dark:border-zinc-700 cursor-pointer bg-transparent"
                                  />
                                  <input 
                                    type="text"
                                    placeholder="#000000"
                                    value={slide.textColor || ""}
                                    onChange={(e) => onUpdateSlide(idx, "textColor", e.target.value)}
                                    className="flex-1 px-2.5 py-1 text-xs border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] text-gray-500 dark:text-zinc-400 mb-1">Dynamic Icon Key string</label>
                              <input
                                type="text"
                                placeholder="e.g., laundry, delivery, rocket, spark"
                                value={slide.iconKey || ""}
                                onChange={(e) => onUpdateSlide(idx, "iconKey", e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-xs shadow-3xs"
                              />
                            </div>
                          </div>

                          {/* Dynamic MongoDB JSON Map Object Builder */}
                          <div className="space-y-2 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl flex flex-col justify-between">
                            <div>
                              <span className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                                <HashtagIcon className="w-3.5 h-3.5" /> Dynamic JSON Statistics Mapping
                              </span>

                              {/* Render any existing Key Values from Prisma JSON Block */}
                              {slide.stats && Object.keys(slide.stats).length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto mb-3 p-1 rounded-lg bg-gray-50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-800">
                                  {Object.entries(slide.stats).map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-1 text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100/60 dark:border-indigo-900/40 px-2 py-0.5 rounded-md">
                                      <span>{k}: <strong className="font-semibold">{String(v)}</strong></span>
                                      <button 
                                        type="button" 
                                        onClick={() => handleRemoveStatObject(idx, k)}
                                        className="text-indigo-400 hover:text-red-500 transition ml-0.5"
                                      >
                                        <XMarkIcon className="w-3 h-3 stroke-[2.5]" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-gray-400 dark:text-zinc-500 italic mb-3">
                                  No metadata analytics attributes assigned yet.
                                </p>
                              )}
                            </div>

                            {/* Inputs to cleanly append properties to the model JSON state */}
                            <div className="flex items-center gap-2 mt-auto">
                              <input
                                type="text"
                                placeholder="Key (e.g. users)"
                                value={statKeys[idx]?.key || ""}
                                onChange={(e) => setStatKeys(p => ({ ...p, [idx]: { ...p[idx], key: e.target.value } }))}
                                className="w-1/2 px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                              />
                              <input
                                type="text"
                                placeholder="Value (e.g. 500)"
                                value={statKeys[idx]?.val || ""}
                                onChange={(e) => setStatKeys(p => ({ ...p, [idx]: { ...p[idx], val: e.target.value } }))}
                                className="w-1/2 px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddStatObject(idx)}
                                className="px-3 py-1.5 bg-indigo-600 dark:bg-indigo-500 text-white font-medium text-xs rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Primary Operation Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            onAddSlide();
            setExpandedIndex(slides.length);
          }}
          disabled={loadingFields.length > 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-zinc-200 focus:ring-4 focus:ring-gray-950/10 dark:focus:ring-white/10 active:scale-[0.99] transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm"
        >
          <PlusIcon className="h-4 w-4 stroke-[2.5]" />
          <span>Append New Carousel Banner Blueprint</span>
        </button>
      </div>
    </div>
  );
}