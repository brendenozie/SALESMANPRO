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

const HeroSection: React.FC = () => {
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
    <section id="hero" className="relative overflow-hidden h-screen flex items-center justify-center bg-white">
      {/* Background media */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          {heroSlides[current].type === "image" ? (
            <Image
              src={heroSlides[current].url}
              alt={heroSlides[current].headline}
              fill
              priority
              className="object-cover"
              loader={loader}
            />
          ) : (
            <video
              src={heroSlides[current].url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl px-6">
        <motion.span
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg font-semibold text-orange-700 uppercase tracking-wide mb-3 block"
        >
          Your Partner in Growth
        </motion.span>

        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight"
        >
          {heroSlides[current].headline.split(" ").slice(0, 3).join(" ")}{" "}
          <span className="text-orange-600">
            {heroSlides[current].headline.split(" ").slice(3).join(" ")}
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 text-xl text-gray-700 max-w-2xl mx-auto"
        >
          {heroSlides[current].subline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-10 py-5 bg-orange-600 text-white font-bold rounded-full shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-lg"
          >
            Book a Free Discovery Call
            <ArrowRightIcon className="w-6 h-6 ml-3" />
          </a>
          <a
            href="#services"
            className="inline-flex items-center justify-center px-10 py-5 bg-white text-orange-600 font-bold rounded-full shadow-lg border border-orange-200 hover:bg-orange-50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-lg"
          >
            Explore Services
          </a>
        </motion.div>
      </div>

      {/* Slide navigation */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-4 z-20">
        <button
          onClick={() => advanceSlide("prev")}
          className="p-3 rounded-full bg-white/50 hover:bg-white/70 text-gray-800 backdrop-blur-sm transition"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          {heroSlides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                idx === current ? "bg-orange-600 scale-110" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => advanceSlide("next")}
          className="p-3 rounded-full bg-white/50 hover:bg-white/70 text-gray-800 backdrop-blur-sm transition"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
    </section>
  );
};

export default HeroSection;
