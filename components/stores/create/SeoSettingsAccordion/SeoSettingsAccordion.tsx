import React, { ChangeEvent, KeyboardEvent, useState } from "react";
import { 
  GlobeAltIcon, 
  SparklesIcon, 
  XMarkIcon, 
  DocumentTextIcon, 
  TagIcon 
} from "@heroicons/react/24/outline";

/**
 * Interface for SEO settings, directly mapping to the Prisma schema model.
 */
export interface SEOSettings {
  id?: string;
  description?: string | null;
  title?: string | null;
  keywords?: string[];
  companyId?: string | null;
}

/**
 * Props for the SeoSettingsAccordion component.
 */
export interface SeoSettingsAccordionProps {
  seo: SEOSettings | null;
  onChange: (updated: SEOSettings) => void;
}

export default function SeoSettingsAccordion({
  seo,
  onChange,
}: SeoSettingsAccordionProps) {
  const [keywordInput, setKeywordInput] = useState("");

  const titleValue = seo?.title || "";
  const descriptionValue = seo?.description || "";
  const keywordsArray = seo?.keywords || [];

  // Recommended constraints for clean SERP rendering
  const OPTIMAL_TITLE_LENGTH = 60;
  const OPTIMAL_DESC_LENGTH = 160;

  const handleSeoChange = (key: keyof SEOSettings, value: any) => {
    onChange({ ...seo, [key]: value });
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().replace(/,$/, "");
    if (trimmed && !keywordsArray.includes(trimmed)) {
      const updatedKeywords = [...keywordsArray, trimmed];
      handleSeoChange("keywords", updatedKeywords);
    }
    setKeywordInput("");
  };

  const handleKeywordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (indexToRemove: number) => {
    const updatedKeywords = keywordsArray.filter((_, idx) => idx !== indexToRemove);
    handleSeoChange("keywords", updatedKeywords);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0 text-gray-900 dark:text-gray-100">
      
      {/* Component Title Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            <GlobeAltIcon className="w-5 h-5 text-indigo-500" />
            SEO Optimization Engine
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Fine-tune how your platform indexes, ranks, and represents itself across search platforms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Editor Control Fields */}
        <div className="lg:col-span-7 space-y-5">
          <section className="p-5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-xs space-y-5">
            
            {/* Title Configuration Box */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="seoTitle" className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <DocumentTextIcon className="w-3.5 h-3.5 text-gray-400" />
                  Meta Page Title
                </label>
                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                  titleValue.length > OPTIMAL_TITLE_LENGTH
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                    : "text-gray-400 dark:text-zinc-500"
                }`}>
                  {titleValue.length}/{OPTIMAL_TITLE_LENGTH} chars
                </span>
              </div>
              <input
                id="seoTitle"
                type="text"
                value={titleValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleSeoChange("title", e.target.value)}
                placeholder="e.g., My Premium Store | Organic Leather Goods"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none text-sm shadow-2xs transition"
              />
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-normal">
                This forms the main clickable title headline within Search Engine Results Pages (SERPs).
              </p>
            </div>

            {/* Meta Description Configuration Box */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="metaDescription" className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <DocumentTextIcon className="w-3.5 h-3.5 text-gray-400" />
                  Meta Description Snippet
                </label>
                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                  descriptionValue.length > OPTIMAL_DESC_LENGTH
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                    : "text-gray-400 dark:text-zinc-500"
                }`}>
                  {descriptionValue.length}/{OPTIMAL_DESC_LENGTH} chars
                </span>
              </div>
              <textarea
                id="metaDescription"
                rows={3}
                value={descriptionValue}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleSeoChange("description", e.target.value)}
                placeholder="e.g., Discover handcrafted, sustainably-sourced organic leather apparel and goods. Enjoy free express shipping and lifetime store warranty on selections..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none text-sm shadow-2xs transition resize-none"
              />
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-normal">
                A brief description summarizing the content of this page to drive target organic click-through ratios.
              </p>
            </div>

            {/* Interactive Keyword Core Tagging Engine */}
            <div className="space-y-1.5">
              <label htmlFor="keywords" className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-gray-400" />
                Target Core Keywords
              </label>
              
              <div className="border border-gray-300 dark:border-zinc-700 rounded-lg p-2 bg-white dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {keywordsArray.map((keyword, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/40 group transition"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(index)}
                        className="text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 rounded transition"
                        aria-label={`Remove keyword ${keyword}`}
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {keywordsArray.length === 0 && (
                    <span className="text-xs text-gray-400 dark:text-zinc-500 italic p-1">
                      No key terms mapped yet...
                    </span>
                  )}
                </div>
                
                <input
                  id="keywords"
                  type="text"
                  value={keywordInput}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  onBlur={handleAddKeyword}
                  placeholder="Type tag and hit Enter or Comma..."
                  className="w-full bg-transparent border-none outline-hidden p-1 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-0 focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-normal">
                Helper search values mapping internal reference indices to crawling index configurations.
              </p>
            </div>

          </section>
        </div>

        {/* Right Column: Live Mockup Preview Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <div className="p-4 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <SparklesIcon className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                Live Google Preview Engine
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
            </div>

            {/* Google Search Desktop Snippet Container Card */}
            <div className="p-4 border border-white dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 shadow-xs space-y-1.5 font-sans">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-gray-200/60 dark:border-zinc-700/60">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-400">G</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-gray-900 dark:text-zinc-200 font-medium truncate leading-tight">
                    Your Site Title Location
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-zinc-400 truncate leading-none">
                    https://yourdomain.com &rsaquo; index
                  </span>
                </div>
              </div>

              {/* Title Headline */}
              <h4 className="text-lg text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-tight break-words">
                {titleValue || "Please enter a meta page title baseline..."}
              </h4>

              {/* Description Snippet Text */}
              <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed break-words">
                {descriptionValue || "Provide a targeted description snippet to review structural metadata card layouts here dynamically..."}
              </p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-950/40 border border-gray-200/60 dark:border-zinc-800/60 rounded-lg p-3 text-[11px] text-gray-500 dark:text-zinc-400 space-y-1">
              <span className="font-semibold block text-gray-700 dark:text-zinc-300">Pro-Tips for Production Success:</span>
              <p>&bull; Maintain title structures below 60 vectors to bypass automated clipping actions.</p>
              <p>&bull; Embed primary high-intent focus keywords within the first 70 characters of descriptions.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}