"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { ThemeTokens, SectionStyle } from "@/types/website-builder";

interface HeroSlide {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  imageUrl: string;
  badgeText?: string;
}

interface HeroSectionProps {
  content: {
    variant?: "slider" | "split" | "centered" | "minimal" | "banner";
    slides?: HeroSlide[];
    autoplay?: boolean;
    autoplayIntervalMs?: number;
  };
  styles?: SectionStyle;
  theme: ThemeTokens;
  isEditorPreview?: boolean;
}

export default function HeroSection({
  content,
  styles = {},
  theme,
  isEditorPreview = false,
}: HeroSectionProps) {
  const slides = content.slides?.length ? content.slides : [];
  const variant = content.variant || "slider";
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    if (slides.length > 1) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length > 1) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  }, [slides.length]);

  useEffect(() => {
    if (isEditorPreview || variant !== "slider" || slides.length <= 1 || content.autoplay === false) return;
    const timer = setInterval(nextSlide, content.autoplayIntervalMs || 5000);
    return () => clearInterval(timer);
  }, [isEditorPreview, variant, slides.length, content.autoplay, content.autoplayIntervalMs, nextSlide]);

  if (!slides.length) {
    return (
      <div className="py-20 text-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
        No hero slides configured.
      </div>
    );
  }

  const activeSlide = slides[currentSlide] || slides[0];

  // 1. SPLIT VARIANT
  if (variant === "split") {
    return (
      <section className="relative overflow-hidden py-12 lg:py-20 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            {activeSlide.eyebrow && (
              <span
                className="inline-block text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${theme.primaryColor}1A`,
                  color: theme.primaryColor,
                }}
              >
                {activeSlide.eyebrow}
              </span>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
              {activeSlide.title}
            </h1>
            {activeSlide.description && (
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed">
                {activeSlide.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {activeSlide.primaryButtonText && (
                <Link
                  href={activeSlide.primaryButtonUrl || "/shop"}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                  style={{
                    backgroundColor: theme.primaryColor,
                    borderRadius: theme.buttonRadius === "full" ? "9999px" : theme.buttonRadius === "lg" ? "12px" : "6px",
                  }}
                >
                  <span>{activeSlide.primaryButtonText}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              )}
              {activeSlide.secondaryButtonText && (
                <Link
                  href={activeSlide.secondaryButtonUrl || "/about"}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-zinc-800 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                  style={{
                    borderRadius: theme.buttonRadius === "full" ? "9999px" : theme.buttonRadius === "lg" ? "12px" : "6px",
                  }}
                >
                  {activeSlide.secondaryButtonText}
                </Link>
              )}
            </div>
          </div>
          <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={activeSlide.imageUrl}
              alt={activeSlide.title}
              className="w-full h-full object-cover"
            />
            {activeSlide.badgeText && (
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-zinc-900 dark:text-white shadow">
                {activeSlide.badgeText}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 2. CENTERED / EDITORIAL VARIANT
  if (variant === "centered") {
    return (
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 bg-zinc-950 text-white text-center">
        <div className="absolute inset-0 z-0">
          <img
            src={activeSlide.imageUrl}
            alt={activeSlide.title}
            className="w-full h-full object-cover opacity-35 filter brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/80" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          {activeSlide.eyebrow && (
            <span
              className="inline-block text-xs uppercase tracking-widest font-bold px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20"
            >
              {activeSlide.eyebrow}
            </span>
          )}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
            {activeSlide.title}
          </h1>
          {activeSlide.description && (
            <p className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              {activeSlide.description}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {activeSlide.primaryButtonText && (
              <Link
                href={activeSlide.primaryButtonUrl || "/shop"}
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white shadow-xl transition-transform hover:scale-105"
                style={{
                  backgroundColor: theme.primaryColor,
                  borderRadius: theme.buttonRadius === "full" ? "9999px" : "12px",
                }}
              >
                <span>{activeSlide.primaryButtonText}</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 3. FULL SLIDER VARIANT (DEFAULT)
  return (
    <section className="relative w-full h-[60vh] sm:h-[75vh] lg:h-[85vh] min-h-[460px] overflow-hidden bg-black select-none">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={activeSlide.id || currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image & Ambient Gradient */}
          <img
            src={activeSlide.imageUrl}
            alt={activeSlide.title}
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

          {/* Slide Content Box */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-2xl space-y-4 sm:space-y-6"
              >
                {activeSlide.eyebrow && (
                  <span
                    className="inline-block text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full text-white bg-white/20 backdrop-blur-md border border-white/20"
                  >
                    {activeSlide.eyebrow}
                  </span>
                )}

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.1] drop-shadow-md">
                  {activeSlide.title}
                </h1>

                {activeSlide.description && (
                  <p className="text-sm sm:text-base lg:text-lg text-zinc-200 max-w-lg leading-relaxed drop-shadow">
                    {activeSlide.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {activeSlide.primaryButtonText && (
                    <Link
                      href={activeSlide.primaryButtonUrl || "/shop"}
                      className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white shadow-xl hover:opacity-95 transition-transform hover:-translate-y-0.5"
                      style={{
                        backgroundColor: theme.primaryColor,
                        borderRadius: theme.buttonRadius === "full" ? "9999px" : "12px",
                      }}
                    >
                      <span>{activeSlide.primaryButtonText}</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  )}
                  {activeSlide.secondaryButtonText && (
                    <Link
                      href={activeSlide.secondaryButtonUrl || "/about"}
                      className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30 transition"
                      style={{
                        borderRadius: theme.buttonRadius === "full" ? "9999px" : "12px",
                      }}
                    >
                      {activeSlide.secondaryButtonText}
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows for Slider */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-12 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md border border-white/20 transition"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md border border-white/20 transition"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}
