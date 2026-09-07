"use client";

import React from "react";
import Link from "next/link";
import { ThemeTokens, SectionStyle } from "@/types/website-builder";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface ImageWithTextProps {
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    imagePosition?: "left" | "right";
    buttonText?: string;
    buttonUrl?: string;
    founderQuote?: string;
    founderName?: string;
    stats?: { label: string; value: string }[];
  };
  styles?: SectionStyle;
  theme: ThemeTokens;
}

export default function ImageWithTextSection({
  content,
  styles = {},
  theme,
}: ImageWithTextProps) {
  const {
    title = "Crafted with Passion & Precision",
    subtitle = "Our Story",
    description = "We connect quality products with exceptional customer experiences across the region.",
    imageUrl = "https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=1200&auto=format&fit=crop",
    imagePosition = "left",
    buttonText = "Learn More",
    buttonUrl = "/about",
    founderQuote,
    founderName,
    stats,
  } = content;

  const isImageLeft = imagePosition === "left";

  return (
    <section
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 transition-colors"
      style={{
        backgroundColor: styles.backgroundColor || undefined,
        color: styles.textColor || undefined,
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Media Block */}
        <div className={`relative ${isImageLeft ? "lg:order-1" : "lg:order-2"}`}>
          <div className="relative aspect-4/3 sm:aspect-16/11 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-zinc-100 dark:bg-zinc-800">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Founder Quote Card Overlay */}
          {founderQuote && (
            <div className="absolute -bottom-6 -right-2 sm:right-6 max-w-xs p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl border border-zinc-200/80 dark:border-zinc-800">
              <p className="text-xs italic text-zinc-700 dark:text-zinc-300">
                "{founderQuote}"
              </p>
              {founderName && (
                <p className="mt-1 text-[11px] font-bold text-zinc-900 dark:text-white">
                  — {founderName}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Narrative Content Block */}
        <div className={`space-y-6 ${isImageLeft ? "lg:order-2" : "lg:order-1"}`}>
          {subtitle && (
            <span
              className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${theme.primaryColor}1A`,
                color: theme.primaryColor,
              }}
            >
              {subtitle}
            </span>
          )}

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
            {title}
          </h2>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {description}
          </p>

          {/* Key Metrics / Stats */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {buttonText && (
            <div className="pt-2">
              <Link
                href={buttonUrl || "/about"}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: theme.primaryColor,
                  borderRadius: theme.buttonRadius === "full" ? "9999px" : "12px",
                }}
              >
                <span>{buttonText}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
