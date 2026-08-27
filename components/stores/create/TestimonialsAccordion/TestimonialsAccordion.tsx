'use client';

import React, { ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  StarIcon as StarOutline,
  PlusIcon,
  TrashIcon,
  LinkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Testimonial } from '@/types/typings';

export interface TestimonialsAccordionProps {
  testimonials: Testimonial[] | null | undefined;
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
  const allFilled = testimonials && testimonials.length > 0 && testimonials.every(t => t.authorName?.trim() && t.quote?.trim());
  const visibleTestimonials = testimonials && testimonials.length > 0 ? testimonials : [{ authorName: '', quote: '' }];

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-8">
      {/* Premium Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white rounded-2xl shadow-xl shadow-emerald-500/10 dark:shadow-none">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl">
            <UserCircleIcon className="h-6 w-6 text-emerald-50" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Customer Testimonials</h2>
            <p className="text-xs text-emerald-100/80 font-medium mt-0.5">Manage and display elite client social proof</p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={onAddTestimonial}
          disabled={!allFilled}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-white/30 ${
            allFilled
              ? 'bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm'
              : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
          }`}
        >
          <PlusIcon className="h-4 w-4 stroke-[2.5]" />
          Add Testimonial
        </button>
      </div>

      {/* Dynamic Animated Content Cards Stack */}
      <div className="mt-6 space-y-5">
        <motion.div layout className="space-y-5">
          <AnimatePresence initial={false}>
            {visibleTestimonials.map((t, idx) => (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="group relative bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md dark:hover:border-zinc-700 transition-all duration-200"
              >
                {/* Individual Row Label & Removal Controls */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                  <span className="text-xs font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <SparklesIcon className="h-3.5 w-3.5 text-emerald-500" />
                    Review Block #{idx + 1}
                  </span>
                  
                  {testimonials && testimonials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveTestimonial(idx)}
                      className="text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                      title="Remove review"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Form Elements Grid */}
                <div className="space-y-4.5">
                  {/* Two Column Layout for Meta Attributes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`author-${idx}`} className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Author Name
                      </label>
                      <input
                        id={`author-${idx}`}
                        type="text"
                        placeholder="e.g. Sarah Jenkins"
                        value={t.authorName || ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          onUpdateTestimonial(idx, 'authorName', e.target.value)
                        }
                        className="w-full text-sm px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor={`avatar-${idx}`} className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" /> Avatar URL <span className="text-zinc-400 dark:text-zinc-600 font-normal">(Optional)</span>
                      </label>
                      <input
                        id={`avatar-${idx}`}
                        type="url"
                        placeholder="e.g. https://domain.com/avatar.jpg"
                        value={t.avatarUrl || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          onUpdateTestimonial(idx, 'avatarUrl', e.target.value)
                        }
                        className="w-full text-sm px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Quote Textarea block */}
                  <div>
                    <label htmlFor={`quote-${idx}`} className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Testimonial Quote
                    </label>
                    <textarea
                      id={`quote-${idx}`}
                      placeholder="What did they say about your work, product, or experience?..."
                      value={t.quote || ""}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        onUpdateTestimonial(idx, 'quote', e.target.value)
                      }
                      rows={3}
                      className="w-full text-sm px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
                    />
                  </div>

                  {/* Star Rating Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        Placement Rating
                      </span>
                      
                      {/* Premium UI Selector instead of standard select block */}
                      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800/60">
                        <button
                          type="button"
                          onClick={() => onUpdateTestimonial(idx, 'rating', 0)}
                          className={`text-2xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                            !t.rating 
                              ? 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-xs font-semibold' 
                              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'
                          }`}
                        >
                          Clear
                        </button>
                        {[1, 2, 3, 4, 5].map((starValue) => {
                          const isSelected = (t.rating || 0) >= starValue;
                          return (
                            <button
                              key={starValue}
                              type="button"
                              onClick={() => onUpdateTestimonial(idx, 'rating', starValue)}
                              className="p-1 rounded-md transition-transform active:scale-90 focus:outline-none"
                            >
                              {isSelected ? (
                                <StarSolid className="w-4 h-4 text-amber-400" />
                              ) : (
                                <StarOutline className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {t.rating ? (
                      <span className="text-xs text-amber-600 dark:text-amber-400/90 font-medium">
                        {t.rating} out of 5 Stars assigned
                      </span>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Informative Help & Documentation Footer Area */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/60 rounded-xl space-y-1.5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            💡 Quick Tips for Compelling Layout Proofing:
          </p>
          <ul className="text-2xs text-zinc-400 dark:text-zinc-500 space-y-1 list-disc pl-4">
            <li>Keep quotes concise (between 2 to 4 sentences converts best).</li>
            <li>Adding high-res avatar paths instantly surges user authenticity index by up to 40%.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}