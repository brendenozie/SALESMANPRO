"use client";

import React, { useState } from "react";
import { ThemeTokens, SectionStyle } from "@/types/website-builder";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqProps {
  content: {
    title?: string;
    subtitle?: string;
    faqs?: FaqItem[];
  };
  styles?: SectionStyle;
  theme: ThemeTokens;
}

export default function FaqSection({
  content,
  styles = {},
  theme,
}: FaqProps) {
  const {
    title = "Frequently Asked Questions",
    subtitle = "Got questions? We've got answers.",
    faqs = [],
  } = content;

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"
      style={{
        backgroundColor: styles.backgroundColor || undefined,
        color: styles.textColor || undefined,
      }}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.id || idx}
              className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="flex items-center justify-between w-full p-5 sm:p-6 text-left font-bold text-base sm:text-lg text-zinc-900 dark:text-white transition hover:text-rose-500"
              >
                <span>{faq.question}</span>
                <ChevronDownIcon
                  className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-rose-500" : "text-zinc-400"
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 pt-4 animate-fadeIn">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
