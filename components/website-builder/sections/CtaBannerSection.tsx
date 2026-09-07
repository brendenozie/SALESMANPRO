"use client";

import React from "react";
import Link from "next/link";
import { ThemeTokens, SectionStyle } from "@/types/website-builder";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface CtaBannerProps {
  content: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
    secondaryButtonText?: string;
    secondaryButtonUrl?: string;
    badgeText?: string;
    backgroundImageUrl?: string;
  };
  styles?: SectionStyle;
  theme: ThemeTokens;
}

export default function CtaBannerSection({
  content,
  styles = {},
  theme,
}: CtaBannerProps) {
  const {
    title = "Ready to elevate your shopping experience?",
    description = "Join thousands of satisfied shoppers. Browse our full catalog today.",
    buttonText = "Shop Now",
    buttonUrl = "/shop",
    secondaryButtonText,
    secondaryButtonUrl,
    badgeText,
    backgroundImageUrl,
  } = content;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl"
        style={{
          backgroundColor: styles.backgroundColor || "#0F172A",
        }}
      >
        {backgroundImageUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={backgroundImageUrl}
              alt={title}
              className="w-full h-full object-cover opacity-25 filter brightness-50"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/80" />
          </div>
        )}

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          {badgeText && (
            <span
              className="inline-block text-xs uppercase font-bold tracking-widest px-3.5 py-1 rounded-full text-white"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {badgeText}
            </span>
          )}

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {title}
          </h2>

          {description && (
            <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {buttonText && (
              <Link
                href={buttonUrl || "/shop"}
                className="inline-flex items-center gap-2 px-8 py-4 text-sm sm:text-base font-bold text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: theme.primaryColor,
                  borderRadius: theme.buttonRadius === "full" ? "9999px" : "12px",
                }}
              >
                <span>{buttonText}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            )}

            {secondaryButtonText && (
              <Link
                href={secondaryButtonUrl || "/contact"}
                className="inline-flex items-center gap-2 px-8 py-4 text-sm sm:text-base font-bold text-white bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 transition"
                style={{
                  borderRadius: theme.buttonRadius === "full" ? "9999px" : "12px",
                }}
              >
                {secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
