"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Make sure AnimatePresence is imported
import Image from 'next/image'; // Import Image from next/image
import {
  ChevronLeftIcon, // For carousel navigation
  ChevronRightIcon, // For carousel navigation
  StarIcon, // To indicate ratings or quality
} from '@heroicons/react/24/solid'; // Only import necessary icons

// Framer Motion variants (reusing from previous sections for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Slightly faster for smaller elements
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Colors (matching the previous sections)
const darkBackground = "#0A192F"; // From services section
const cardBackground = "#1B2A41"; // From services section
const accentColor = "#66B2FF"; // A bright blue for highlights
const textColorLight = "#E0E7FF"; // Lighter blue for text on dark background
const textColorMuted = "#A7B8D6"; // Muted blue for secondary text

interface Testimonial {
  id: string | number;
  quote: string;
  author: string;
  title?: string; // Client's title/company
  avatarUrl?: string; // Optional avatar image
  rating?: number; // Star rating (1-5)
}

interface CaseStudiesTestimonialsProps {
  testimonials?: Testimonial[]; // Made optional for sample data
}

export default function CaseStudiesTestimonials({ testimonials }: CaseStudiesTestimonialsProps) {
  // Sample Data (if no testimonials are passed, use these defaults)
  const defaultTestimonials: Testimonial[] = [
    {
      id: "t1",
      quote: "Partnering with them was a game-changer for our financial strategy. Their insights were invaluable, leading to significant growth and stability.",
      author: "Sarah Chen",
      title: "CEO, InnovateTech Solutions",
      avatarUrl: "/images/avatar-sarah.webp", // Placeholder
      rating: 5,
    },
    {
      id: "t2",
      quote: "The legal team provided exceptional guidance through a complex acquisition. Their attention to detail and unwavering support were truly impressive.",
      author: "David Miller",
      title: "Founder, Quantum Holdings",
      avatarUrl: "/images/avatar-david.webp", // Placeholder
      rating: 5,
    },
    {
      id: "t3",
      quote: "From tax planning to estate management, their holistic approach brought immense peace of mind. Highly recommend their integrated services.",
      author: "Jessica Lee",
      title: "Private Investor",
      avatarUrl: "/images/avatar-jessica.webp", // Placeholder
      rating: 4,
    },
    {
      id: "t4",
      quote: "Their financial advisors helped me secure my retirement with clear, actionable plans. Professional, trustworthy, and genuinely caring.",
      author: "Robert Green",
      title: "Retired Executive",
      avatarUrl: "/images/avatar-robert.webp", // Placeholder
      rating: 5,
    },
  ];

  const testimonialsToDisplay = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  const [index, setIndex] = React.useState(0);
  const length = testimonialsToDisplay.length;

  const prev = () => setIndex((prevIndex) => (prevIndex - 1 + length) % length);
  const next = () => setIndex((prevIndex) => (prevIndex + 1) % length);

  // Auto-advance the carousel
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % length);
    }, 8000); // Change testimonial every 8 seconds
    return () => clearInterval(interval);
  }, [length]);

  const currentTestimonial = testimonialsToDisplay[index];

  return (
    <section
      id="testimonials"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden"
      style={{ background: darkBackground }} // Use dark background for consistent feel
    >
      {/* Background pattern for visual interest */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <Image
          src="/images/lines-pattern-light.svg" // Subtle lines or grid pattern
          alt="background pattern"
          fill
          className="object-cover"
          style={{ mixBlendMode: "overlay" }}
          loader={({ src, width, quality }) =>
            `${src}?w=${width}&q=${quality || 75}`
          }
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Section Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
            What Our Valued Clients Say
          </h2>
          <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Hear directly from individuals and businesses who have experienced our commitment to excellence.
          </p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence initial={false} mode="wait"> {/* Use mode="wait" for smooth transitions */}
            <motion.div
              key={currentTestimonial.id} // Key ensures re-render and animation
              className="p-8 sm:p-12 bg-gradient-to-br from-[#1B2A41] to-[#122033] rounded-3xl shadow-2xl border border-transparent hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.005]"
              initial={{ opacity: 0, x: 100 }} // Enter from right
              animate={{ opacity: 1, x: 0 }} // Animate to center
              exit={{ opacity: 0, x: -100 }} // Exit to left
              transition={{ type: "spring", stiffness: 200, damping: 25 }} // Spring animation for a more dynamic feel
            >
              <div className="flex flex-col items-center">
                {currentTestimonial.avatarUrl && (
                  <Image
                    src={currentTestimonial.avatarUrl}
                    alt={currentTestimonial.author}
                    width={96} // Larger avatar
                    height={96} // Larger avatar
                    className="rounded-full mb-6 border-4 border-blue-500/30 shadow-md"
                    loader={({ src, width, quality }) =>
                      `${src}?w=${width}&q=${quality || 75}`
                    }
                  />
                )}
                {currentTestimonial.rating && (
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-6 w-6 ${
                          i < currentTestimonial.rating! ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
                <p className="italic text-xl sm:text-2xl text-blue-100/90 mb-6 leading-relaxed max-w-2xl mx-auto">
                  “{currentTestimonial.quote}”
                </p>
                <div className="font-semibold text-white">
                  <span className="block text-lg">{currentTestimonial.author}</span>
                  {currentTestimonial.title && (
                    <span className="block text-sm text-blue-200/70 mt-1">
                      {currentTestimonial.title}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Controls */}
          <button
            onClick={prev}
            className="absolute top-1/2 left-0 -translate-x-1/2 transform -translate-y-1/2 p-3 rounded-full bg-blue-600/30 text-white shadow-lg hover:bg-blue-600/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBackground focus-visible:ring-blue-400 transition-all duration-200 z-20"
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="h-7 w-7" />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 right-0 translate-x-1/2 transform -translate-y-1/2 p-3 rounded-full bg-blue-600/30 text-white shadow-lg hover:bg-blue-600/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBackground focus-visible:ring-blue-400 transition-all duration-200 z-20"
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="h-7 w-7" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-12 space-x-3">
            {testimonialsToDisplay.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  i === index ? 'bg-blue-400 w-6' : 'bg-blue-200/50 hover:bg-blue-300/70'
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