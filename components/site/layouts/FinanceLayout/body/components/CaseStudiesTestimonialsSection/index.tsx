"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

// === Animation Variants ===
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// === Light Mode Palette ===
const lightBackground = "#F8FAFC"; // soft off-white
const cardBackground = "#FFFFFF"; // white cards
const accentColor = "#2563EB"; // blue-600
const textColorPrimary = "#1E293B"; // slate-800
const textColorSecondary = "#475569"; // slate-600

interface Testimonial {
  id: string | number;
  quote: string;
  author: string;
  title?: string;
  avatarUrl?: string;
  rating?: number;
}

interface CaseStudiesTestimonialsProps {
  testimonials?: Testimonial[];
}

export default function CaseStudiesTestimonials({
  testimonials,
}: CaseStudiesTestimonialsProps) {
  const defaultTestimonials: Testimonial[] = [
    {
      id: "t1",
      quote:
        "Partnering with them was a game-changer for our financial strategy. Their insights were invaluable, leading to significant growth and stability.",
      author: "Sarah Chen",
      title: "CEO, InnovateTech Solutions",
      avatarUrl: "/images/avatar-sarah.webp",
      rating: 5,
    },
    {
      id: "t2",
      quote:
        "The legal team provided exceptional guidance through a complex acquisition. Their attention to detail and unwavering support were truly impressive.",
      author: "David Miller",
      title: "Founder, Quantum Holdings",
      avatarUrl: "/images/avatar-david.webp",
      rating: 5,
    },
    {
      id: "t3",
      quote:
        "From tax planning to estate management, their holistic approach brought immense peace of mind. Highly recommend their integrated services.",
      author: "Jessica Lee",
      title: "Private Investor",
      avatarUrl: "/images/avatar-jessica.webp",
      rating: 4,
    },
    {
      id: "t4",
      quote:
        "Their financial advisors helped me secure my retirement with clear, actionable plans. Professional, trustworthy, and genuinely caring.",
      author: "Robert Green",
      title: "Retired Executive",
      avatarUrl: "/images/avatar-robert.webp",
      rating: 5,
    },
  ];

  const testimonialsToDisplay =
    testimonials && testimonials.length > 0
      ? testimonials
      : defaultTestimonials;

  const [index, setIndex] = React.useState(0);
  const length = testimonialsToDisplay.length;

  const prev = () => setIndex((prevIndex) => (prevIndex - 1 + length) % length);
  const next = () => setIndex((prevIndex) => (prevIndex + 1) % length);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % length);
    }, 8000);
    return () => clearInterval(interval);
  }, [length]);

  const currentTestimonial = testimonialsToDisplay[index];

  // Subtle light grid background
  const customBackground = `
    radial-gradient(circle, rgba(37,99,235,0.08) 1px, transparent 1px) 0 0 / 24px 24px,
    linear-gradient(to bottom, ${lightBackground}, #FFFFFF)
  `;

  return (
    <section
      id="testimonials"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden"
      style={{ background: lightBackground }}
    >
      {/* Subtle Background Pattern */}
      {/* Center Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          loader={({ src, width, quality }: { src: string; width: number; quality?: number }) =>
            `${src}?w=${width}&q=${quality || 75}`
          }
          className="text-center mb-16"
        >
          <h2
            className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight"
            style={{ color: textColorPrimary }}
          >
            What Our Valued Clients Say
          </h2>
          <p
            className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: textColorSecondary }}
          >
            Hear directly from individuals and businesses who have experienced
            our commitment to excellence.
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentTestimonial.id}
              className="p-8 sm:p-12 rounded-3xl shadow-lg bg-white border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.005]"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <div className="flex flex-col items-center">
                {currentTestimonial.avatarUrl && (
                  <Image
                    src={currentTestimonial.avatarUrl}
                    alt={currentTestimonial.author}
                    loader={({ src, width, quality }) =>
                      `${src}?w=${width}&q=${quality || 75}`
                    }
                    width={96}
                    height={96}
                    className="rounded-full mb-6 border-4 border-blue-100 shadow-md"
                  />
                )}
                {currentTestimonial.rating && (
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-6 w-6 ${
                          i < currentTestimonial.rating!
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
                <p
                  className="italic text-xl sm:text-2xl mb-6 leading-relaxed max-w-2xl mx-auto"
                  style={{ color: textColorSecondary }}
                >
                  “{currentTestimonial.quote}”
                </p>
                <div className="font-semibold" style={{ color: textColorPrimary }}>
                  <span className="block text-lg">
                    {currentTestimonial.author}
                  </span>
                  {currentTestimonial.title && (
                    <span
                      className="block text-sm mt-1"
                      style={{ color: textColorSecondary }}
                    >
                      {currentTestimonial.title}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prev}
            className="absolute top-1/2 left-0 -translate-x-1/2 transform -translate-y-1/2 p-3 rounded-full bg-blue-100 text-blue-600 shadow-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 z-20"
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="h-7 w-7" />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 right-0 translate-x-1/2 transform -translate-y-1/2 p-3 rounded-full bg-blue-100 text-blue-600 shadow-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 z-20"
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="h-7 w-7" />
          </button>

          {/* Dots */}
          <div className="flex justify-center mt-12 space-x-3">
            {testimonialsToDisplay.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  i === index
                    ? "bg-blue-600 w-6"
                    : "bg-blue-200 hover:bg-blue-300"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
