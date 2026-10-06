"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// --- INLINE DESIGN SYSTEM ICONS ---
const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const QuoteIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
  </svg>
);

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

export default function CaseStudiesTestimonials({ testimonials }: CaseStudiesTestimonialsProps) {
  const defaultTestimonials: Testimonial[] = [
    {
      id: "t1",
      quote: "Partnering with them was a game-changer for our financial strategy. Their insights were invaluable, leading to significant growth and stability.",
      author: "Sarah Chen",
      title: "CEO, InnovateTech Solutions",
      avatarUrl: "/images/avatar-sarah.webp",
      rating: 5,
    },
    {
      id: "t2",
      quote: "The legal team provided exceptional guidance through a complex acquisition. Their attention to detail and unwavering support were truly impressive.",
      author: "David Miller",
      title: "Founder, Quantum Holdings",
      avatarUrl: "/images/avatar-david.webp",
      rating: 5,
    },
    {
      id: "t3",
      quote: "From tax planning to estate management, their holistic approach brought immense peace of mind. Highly recommend their integrated services.",
      author: "Jessica Lee",
      title: "Private Investor",
      avatarUrl: "/images/avatar-jessica.webp",
      rating: 5,
    },
    {
      id: "t4",
      quote: "Their financial advisors helped me secure my retirement with clear, actionable plans. Professional, trustworthy, and genuinely caring.",
      author: "Robert Green",
      title: "Retired Executive",
      avatarUrl: "/images/avatar-robert.webp",
      rating: 5,
    },
  ];

  const list = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % list.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % list.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [list.length]);

  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 40 : -40,
      filter: "blur(4px)"
    }),
    center: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -40 : 40,
      filter: "blur(4px)",
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    })
  };

  const current = list[index];

  return (
    <section id="testimonials" className="py-24 lg:py-36 bg-slate-50 relative overflow-hidden selection:bg-blue-600/10">
      
      {/* Decorative Top Blur Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[30rem] h-[30rem] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-start">
          
          {/* --- LEFT COL: PERSISTENT CALLOUT & METRICS --- */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full lg:sticky lg:top-28">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200/60 text-xs font-semibold tracking-wide text-blue-700 uppercase mb-5">
                Client Relations
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-5 leading-[1.1]">
                Real Outcomes, <br />
                Trusted Voices.
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-normal max-w-md leading-relaxed">
                We bridge high-complexity legal guidance with pristine financial design. Explore the feedback from individuals and market firms who build with us.
              </p>
            </div>

            {/* Static High-End Trust Block */}
            <div className="mt-10 lg:mt-16 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-6 max-w-sm">
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5 mb-1.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5" />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-900">4.9 / 5.0 Client Rating</span>
                <span className="text-xs text-slate-500 mt-0.5">Based on independent annual verified reviews</span>
              </div>
            </div>
          </div>

          {/* --- RIGHT COL: CAROUSEL CORE SLIDER ENGINE --- */}
          <div className="lg:col-span-7 flex flex-col justify-center min-h-[420px]">
            <div className="relative w-full">
              
              <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div
                  key={current.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full bg-white border border-slate-200/70 p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200/50 relative flex flex-col justify-between"
                >
                  {/* Backdrop Aesthetic Accent Watermark */}
                  <QuoteIcon className="absolute top-8 right-8 text-slate-100 h-24 w-24 pointer-events-none z-0 transform translate-x-2 -translate-y-2" />

                  <div className="relative z-10">
                    {/* Testimonial Star Breakdown Block */}
                    {current.rating && (
                      <div className="flex gap-0.5 mb-6 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`h-5 w-5 ${i < current.rating! ? "text-amber-500" : "text-slate-200"}`} 
                          />
                        ))}
                      </div>
                    )}

                    {/* Massive Captivating Quote Content */}
                    <blockquote className="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed tracking-tight mb-8">
                      “{current.quote}”
                    </blockquote>
                  </div>

                  {/* Presenter Signoff Identity Row */}
                  <div className="flex items-center gap-4 pt-6 border-t border-slate-100 relative z-10">
                    {current.avatarUrl && (
                      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 ring-4 ring-slate-50">
                        <Image decoding="async"
                          src={current.avatarUrl}
                          alt={current.author}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900 text-base">{current.author}</div>
                      {current.title && (
                        <div className="text-xs font-medium text-slate-500 mt-0.5">{current.title}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls Layout Structure */}
              <div className="flex items-center justify-between sm:justify-start gap-4 mt-8 px-2">
                
                {/* Dot Index Matrices */}
                <div className="flex gap-2 order-2 sm:order-1">
                  {list.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDirection(i > index ? 1 : -1);
                        setIndex(i);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${i === index ? "bg-blue-600 w-8" : "bg-slate-300 hover:bg-slate-400 w-2"}`}
                      aria-label={`Jump to review slide index ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Arrow Interactive Pair */}
                <div className="flex gap-2.5 order-1 sm:order-2 sm:ml-auto">
                  <button
                    onClick={handlePrev}
                    className="p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
                    aria-label="Previous direct testimonial entry"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
                    aria-label="Next direct testimonial entry"
                  >
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}