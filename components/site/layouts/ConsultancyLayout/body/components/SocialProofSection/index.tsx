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

const SocialProofSection: React.FC = () => {
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
    // {/* 2. Social Proof Section */}
    <section className="relative py-20 bg-gradient-to-b from-white via-orange-50 to-white overflow-hidden">
      {/* Floating subtle shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="container relative z-10 mx-auto px-6 text-center">
        {/* Intro Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <span className="inline-block uppercase text-orange-700 font-semibold tracking-wide text-sm mb-3">
            Recognition & Impact
          </span>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Trusted by <span className="text-orange-600">Leaders, Innovators, and Visionaries</span>
          </h3>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-12">
            Over the years, I’ve partnered with renowned brands, appeared on major platforms,
            and helped individuals reach new levels of professional and personal excellence.
          </p>
        </motion.div>

        {/* Animated Logos */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 items-center justify-items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ staggerChildren: 0.15, delayChildren: 0.3 }}
          viewport={{ once: true }}
        >
          {[
            { src: "/logo-forbes.svg", alt: "Forbes" },
            { src: "/logo-tedx.svg", alt: "TEDx" },
            { src: "/logo-inc.svg", alt: "Inc." },
            { src: "/logo-entrepreneur.svg", alt: "Entrepreneur" },
            { src: "/logo-bloomberg.svg", alt: "Bloomberg" },
          ].map((logo, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.08, rotate: 1 }}
              className="grayscale hover:grayscale-0 transition-all duration-300"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-10 md:h-12 opacity-80 hover:opacity-100 transition-opacity"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Credibility Counter */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div>
            <h4 className="text-4xl font-extrabold text-orange-600">+10K</h4>
            <p className="text-gray-700 font-medium">Clients Coached</p>
          </div>
          <div>
            <h4 className="text-4xl font-extrabold text-orange-600">50+</h4>
            <p className="text-gray-700 font-medium">Talks Delivered</p>
          </div>
          <div>
            <h4 className="text-4xl font-extrabold text-orange-600">15</h4>
            <p className="text-gray-700 font-medium">Years of Experience</p>
          </div>
        </motion.div>
      </div>
    </section>

  );
};

export default SocialProofSection;
