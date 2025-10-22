'use client';

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid";
import { Testimonial } from "@/types/typings";

// Assuming Testimonial is defined in typings as:
// export interface Testimonial {
//   id: string;
//   quote: string;
//   authorName: string; // Changed from 'author' to match usage
//   authorTitle?: string; // Changed from 'role' to match usage
//   avatarUrl?: string;
//   rating?: number;
// }

interface Props {
  testimonials: Testimonial[];
}

const customLoader = ({ src, width, quality }: any) => {
  // Ensure placeholder paths are handled gracefully
  if (src.startsWith('/')) return src; 
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- Sample Data (High-quality fallback) ---
const sampleTestimonials: Testimonial[] = [
  {
    id: "t1",
    quote: "Working with the team was a breakthrough moment. I gained the clarity and confidence to pitch my business idea, and it was funded! Truly transformative coaching.",
    authorName: "Alexandria J.",
    authorTitle: "Founder & CEO, Startup Inc.",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    rating: 5,
  },
  {
    id: "t2",
    quote: "The strategies I learned here fundamentally changed my time management and productivity. I now achieve more with less stress. Highly recommend!",
    authorName: "Marcus P.",
    authorTitle: "Senior Product Manager",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a6dd7228f7d?w=100&h=100&fit=crop",
    rating: 5,
  },
  {
    id: "t3",
    quote: "The personalized approach felt deeply intuitive. It wasn't just advice; it was a partnership that helped me overcome my greatest professional hurdle yet.",
    authorName: "Dr. Elena V.",
    authorTitle: "Lead Research Scientist",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29329?w=100&h=100&fit=crop",
    rating: 4,
  },
  {
    id: "t4",
    quote: "If you're stuck in a rut, this is the guidance you need. I found my purpose and a clear pathway forward.",
    authorName: "Chris R.",
    authorTitle: "Freelance Creative Director",
    avatarUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop",
    rating: 5,
  },
];

// Animation variants for carousel transitions (unchanged, they are perfect)
const itemVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9, // Slightly less aggressive scale change
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
      opacity: { duration: 0.3 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9, // Slightly less aggressive scale change
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      opacity: { duration: 0.2 },
    },
  }),
};


// --- Main Component ---
export default function TestimonialsCarouselSection({ testimonials }: Props) {
  // Use provided data or sample data
  const data = (testimonials && testimonials.length > 0) ? testimonials : sampleTestimonials;
    
  // Early return if data is genuinely empty
  if (data.length === 0) {
    return (
      <section className="py-20 text-center bg-gray-50">
        <p className="text-xl text-gray-600">
          No client stories to show yet. Be the first to share your **success story**!
        </p>
      </section>
    );
  }

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-rotate every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % data.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [data.length]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => {
      // Calculate new index correctly
      return (prev + newDirection + data.length) % data.length;
    });
  };

  return (
    <section 
      id="testimonials"
      className="relative py-20 md:py-32 bg-gradient-to-br from-white via-orange-50/50 to-orange-100/30 overflow-hidden"
    >
      {/* Background Flourish (Intuitive Visual Appeal) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-lg font-semibold text-orange-700 uppercase tracking-wider mb-3 block flex items-center justify-center gap-2">
            <ChatBubbleBottomCenterTextIcon className="w-5 h-5" /> Voices of Transformation
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Real Clients, <span className="text-orange-600">Real Results</span>
          </h2>
          <p className="mt-5 text-xl text-gray-700 max-w-3xl mx-auto">
            Read inspiring stories from individuals and businesses that have achieved peak performance and clarity.
          </p>
        </motion.div>

        {/* Carousel Area */}
        <div className="relative max-w-3xl mx-auto h-[400px] md:h-[350px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={itemVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(_e: any, { offset, velocity }:any) => {
                const swipe = offset.x;
                // Use swipe velocity and distance for intuitive drag
                if (swipe < -100 || (swipe < -50 && velocity.x < -100)) {
                  paginate(1);
                } else if (swipe > 100 || (swipe > 50 && velocity.x > 100)) {
                  paginate(-1);
                }
              }}
              className="absolute w-full px-4"
            >
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-orange-200/50 transform transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing hover:scale-[1.01]">
                <div className="flex flex-col items-center text-center">
                  {/* Quotation Mark Accent */}
                  <ChatBubbleBottomCenterTextIcon className="w-10 h-10 text-orange-400 mb-4 opacity-70" />

                  {/* Quote */}
                  <p className="text-xl md:text-2xl italic text-gray-800 mb-6 font-serif leading-relaxed">
                    &ldquo;{data[current].quote}&rdquo;
                  </p>

                  {/* Author Info Container */}
                  <div className="flex flex-col items-center">
                    {/* Avatar */}
                    {data[current].avatarUrl && (
                      <div
                        className="w-16 h-16 rounded-full overflow-hidden border-4 border-orange-100 shadow-md mb-3"
                      >
                        <Image
                          src={data[current].avatarUrl || '/placeholder.jpg'}
                          alt={data[current].authorName || 'Client'}
                          width={64}
                          height={64}
                          loader={customLoader}
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Author Name and Title */}
                    <p className="font-bold text-orange-700 text-lg">
                      {data[current].authorName}
                    </p>
                    {data[current].authorTitle && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {data[current].authorTitle}
                      </p>
                    )}
                  </div>
                  
                  {/* Rating (Placed below author for better flow) */}
                  {data[current].rating && (
                    <div className="flex justify-center mt-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-5 h-5 transition-colors duration-300 ${
                            i < (data[current].rating ?? 0)
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.button
            onClick={() => paginate(-1)}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-xl border border-orange-100/50 hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-300 z-20 opacity-90 hover:opacity-100 -ml-2 md:-ml-12"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeftIcon className="w-6 h-6 text-orange-600" />
          </motion.button>
          <motion.button
            onClick={() => paginate(1)}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-xl border border-orange-100/50 hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-300 z-20 opacity-90 hover:opacity-100 -mr-2 md:-mr-12"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRightIcon className="w-6 h-6 text-orange-600" />
          </motion.button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center mt-12 gap-3">
          {data.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setDirection(idx > current ? 1 : -1);
                setCurrent(idx);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === current ? "bg-orange-600 w-7" : "bg-gray-300 hover:bg-orange-300"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}