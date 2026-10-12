"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "@heroicons/react/24/solid";
import { Testimonial } from "@/types/typings";
import { useEditableContent, EditableElement } from "@/contexts/EditableContentContext";

const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const defaultTestimonials: Testimonial[] = [
  {
    authorName: "Alexander Vance",
    authorTitle: "Automotive Enthusiast",
    quote: "Finding an ultra-rare vintage roadster was seamless. The verification and concierge delivery exceeded every expectation.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
    rating: 5,
  },
  {
    authorName: "Elena Rostova",
    authorTitle: "Collector & Private Client",
    quote: "The transparency and speed of the transaction was world-class. Secured my dream spec without a single compromise.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&auto=format&fit=crop",
    rating: 5,
  },
  {
    authorName: "Marcus Sterling",
    authorTitle: "Executive Fleet Director",
    quote: "From initial inquiry to final handover, the white-glove service set an entirely new benchmark for luxury automotive acquisitions.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop",
    rating: 5,
  },
];

interface Props {
  testimonials: Testimonial[];
}

// Animation variants for carousel transitions
const itemVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
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
    scale: 0.8,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      opacity: { duration: 0.2 },
    },
  }),
};

export default function TestimonialsCarouselSection({ testimonials }: Props) {
  const { isEditorMode } = useEditableContent();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const activeTestimonials = testimonials && testimonials.length > 0
    ? testimonials
    : (isEditorMode ? defaultTestimonials : []);

  if (activeTestimonials.length === 0) {
    return (
      <section className="py-16 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          No testimonials available at the moment. Be the first to share your experience!
        </p>
      </section>
    );
  }

  // Auto-rotate every 7 seconds, paused in editor mode
  useEffect(() => {
    if (isEditorMode) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % activeTestimonials.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [activeTestimonials.length, isEditorMode]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => {
      const newIndex = (prev + newDirection + activeTestimonials.length) % activeTestimonials.length;
      return newIndex;
    });
  };

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Editor Mode Carousel Switcher */}
      {isEditorMode && activeTestimonials.length > 1 && (
        <div className="absolute top-4 right-6 z-40 flex items-center gap-1.5 bg-neutral-950/90 backdrop-blur-md p-1.5 rounded-xl border border-rose-500/30 shadow-xl pointer-events-auto">
          <span className="text-rose-400 px-2 font-mono font-bold uppercase text-[10px] tracking-wider">
            Edit Testimonial:
          </span>
          {activeTestimonials.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDirection(idx > current ? 1 : -1);
                setCurrent(idx);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                current === idx
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              #{idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: "-3s" }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-reverse" style={{ animationDelay: "-5s" }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
            <EditableElement
              targetId="home.testimonials.title"
              label="Section Title"
              inline
            >
              <span>Hear From Our Community! 🌟</span>
            </EditableElement>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            <EditableElement
              targetId="home.testimonials.subtitle"
              label="Section Subtitle"
              inline
            >
              <span>Discover why our users love us. Real stories from real people.</span>
            </EditableElement>
          </p>
        </motion.div>

        <div className="relative max-w-2xl mx-auto h-[350px] md:h-[300px] flex items-center justify-center">
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
              onDragEnd={(e: any, { offset, velocity }:any) => {
                const swipePower = Math.abs(offset.x) * velocity.x;
                if (swipePower < -10000) {
                  paginate(1);
                } else if (swipePower > 10000) {
                  paginate(-1);
                }
              }}
              className="absolute w-full px-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl border border-blue-100 dark:border-gray-700 transform hover:scale-[1.01] transition-transform duration-300 ease-out cursor-grab">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  {activeTestimonials[current].avatarUrl && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                      className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 dark:border-blue-400 shadow-md mb-6"
                    >
                      <EditableElement
                        targetId={`home.testimonials.items.${current}.avatarUrl`}
                        label={`Testimonial #${current + 1} Avatar`}
                        type="image"
                        className="w-full h-full block relative"
                      >
                        <Image decoding="async"
                          src={activeTestimonials[current].avatarUrl || 'placeholder.com'}
                          alt={activeTestimonials[current].authorName || 'author name'}
                          width={96}
                          height={96}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </EditableElement>
                    </motion.div>
                  )}

                  {/* Quote */}
                  <p className="text-xl md:text-2xl italic text-gray-800 dark:text-gray-100 mb-6 font-serif leading-relaxed">
                    <EditableElement
                      targetId={`home.testimonials.items.${current}.quote`}
                      label={`Testimonial #${current + 1} Quote`}
                      type="textarea"
                      inline
                    >
                      <span>&ldquo;{activeTestimonials[current].quote}&rdquo;</span>
                    </EditableElement>
                  </p>

                  {/* Rating */}
                  {activeTestimonials[current].rating && (
                    <div className="flex justify-center mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-6 h-6 ${
                            i < (activeTestimonials[current].rating ?? 0)
                              ? "text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Author */}
                  <p className="font-bold text-blue-700 dark:text-blue-400 text-lg">
                    <EditableElement
                      targetId={`home.testimonials.items.${current}.author`}
                      label={`Testimonial #${current + 1} Author`}
                      inline
                    >
                      <span>{activeTestimonials[current].authorName}</span>
                    </EditableElement>
                  </p>
                  {activeTestimonials[current].authorTitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <EditableElement
                        targetId={`home.testimonials.items.${current}.authorTitle`}
                        label={`Testimonial #${current + 1} Role`}
                        inline
                      >
                        <span>{activeTestimonials[current].authorTitle}</span>
                      </EditableElement>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <motion.button
            onClick={() => paginate(-1)}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 z-20 opacity-80 hover:opacity-100 -ml-2 md:-ml-8"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeftIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </motion.button>
          <motion.button
            onClick={() => paginate(1)}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 z-20 opacity-80 hover:opacity-100 -mr-2 md:-mr-8"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRightIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </motion.button>
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-12 gap-3">
          {activeTestimonials.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setDirection(idx > current ? 1 : -1);
                setCurrent(idx);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === current ? "bg-blue-600 w-8" : "bg-gray-300 dark:bg-gray-600"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
