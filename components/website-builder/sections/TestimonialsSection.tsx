"use client";

import React from "react";
import { ThemeTokens, SectionStyle } from "@/types/website-builder";
import { StarIcon } from "@heroicons/react/24/solid";

interface TestimonialItem {
  id: string;
  author: string;
  role?: string;
  avatarUrl?: string;
  rating: number;
  quote: string;
}

interface TestimonialsProps {
  content: {
    title?: string;
    subtitle?: string;
    testimonials?: TestimonialItem[];
    layout?: "carousel" | "grid";
  };
  styles?: SectionStyle;
  theme: ThemeTokens;
}

export default function TestimonialsSection({
  content,
  styles = {},
  theme,
}: TestimonialsProps) {
  const {
    title = "What Our Customers Say",
    subtitle = "Genuine feedback from verified shoppers",
    testimonials = [],
  } = content;

  return (
    <section
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      style={{
        backgroundColor: styles.backgroundColor || undefined,
        color: styles.textColor || undefined,
      }}
    >
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
          >
            {/* Stars */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 ${
                    i < (item.rating || 5) ? "text-amber-400" : "text-zinc-200 dark:text-zinc-700"
                  }`}
                />
              ))}
            </div>

            {/* Quote */}
            <p className="text-zinc-700 dark:text-zinc-200 text-sm sm:text-base leading-relaxed italic grow">
              "{item.quote}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt={item.author}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {item.author.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {item.author}
                </h4>
                {item.role && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.role}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
