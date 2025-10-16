"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

const heroSlides = [
  {
    type: "image",
    url: "/coach-hero.jpg",
    headline: "Unlock Your True Potential",
    subline:
      "Empowering ambitious individuals and teams to create a life of purpose, clarity, and success.",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2670&auto=format&fit=crop",
    headline: "Transform Your Vision into Action",
    subline:
      "Through strategic coaching and tailored consultation, I help you move from ideas to impact.",
  },
  {
    type: "video",
    url: "https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4",
    headline: "Lead with Confidence, Inspire with Purpose",
    subline:
      "Gain clarity, build resilience, and become the leader you were meant to be.",
  },
];

const autoAdvanceDelay = 9000; // 9 seconds

const CallToActionSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const advanceSlide = useCallback(
    (direction: "next" | "prev") => {
      setCurrent((prev) =>
        direction === "next"
          ? (prev + 1) % heroSlides.length
          : (prev - 1 + heroSlides.length) % heroSlides.length
      );
    },
    []
  );

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => advanceSlide("next"), autoAdvanceDelay);
    return () => clearTimeout(timeoutRef.current!);
  }, [current, advanceSlide]);

  return (
    
    // {/* 6. Call to Action / Lead Magnet Section */}
    <section
      id="contact"
      className="relative py-28 bg-gradient-to-br from-orange-600 via-red-500 to-orange-700 text-white overflow-hidden"
    >
      {/* Ambient Glow Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-10 left-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-red-400 rounded-full mix-blend-overlay filter blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          Ready to <span className="text-orange-200">Transform</span> Your Future?
        </h2>
        <p className="text-xl max-w-3xl mx-auto text-orange-100 mb-10 leading-relaxed">
          Take the bold first step toward unlocking your potential. Let’s connect for a free discovery call — 
          no pressure, just clarity, strategy, and purpose.
        </p>

        {/* CTA Button */}
        <a
          href="#"
          className="relative inline-flex items-center justify-center px-12 py-6 font-bold text-lg md:text-xl text-orange-700 bg-white rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.25)] hover:bg-orange-50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-7 h-7 mr-3 text-orange-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10m-7 4h4m-5 4h6m4 0a2 2 0 002-2V7a2 2 0 00-2-2h-2V3H8v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12z"
            />
          </svg>
          Schedule Your Free Call Today
        </a>

        {/* Decorative Line */}
        <div className="mt-12 w-32 h-1 bg-gradient-to-r from-orange-200 via-white to-orange-200 mx-auto rounded-full opacity-80"></div>
      </div>

      {/* Floating Shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)]"></div>
    </section>

  );
};

export default CallToActionSection;
