'use client';

import React from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import { Testimonial } from '@/types/typings';

// Import slick carousel styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ---------------------------------------------------------
// UTILS & MOCK DATA
// ---------------------------------------------------------

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

const renderStars = (count: number | undefined) => {
  if (count === undefined) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < count ? (
          <StarSolid key={i} className="h-4 w-4 text-amber-400" />
        ) : (
          <StarOutline key={i} className="h-4 w-4 text-gray-300" />
        )
      )}
    </div>
  );
};

const fallbackTestimonials: any[] = [
  {
    id: 'fallback-1',
    authorName: 'Sarah Jenkins',
    quote: 'The interface is intuitive, and I always find someone perfect for my needs. Truly a game-changer for my weekend routine!',
    rating: 5,
    avatarUrl: 'https://placehold.co/200x200/F59E0B/FFFFFF?text=Sarah',
    authorTitle: 'Design Professional',
  },
  {
    id: 'fallback-2',
    authorName: 'Dr. Alex Morras',
    quote: 'As a therapist, this platform has expanded my client base significantly. It handles all the scheduling seamlessly.',
    rating: 5,
    avatarUrl: 'https://placehold.co/200x200/EF4444/FFFFFF?text=Alex',
    authorTitle: 'Clinical Therapist',
  },
  {
    id: 'fallback-3',
    authorName: 'Jessica Pearson',
    quote: 'I love the detailed profiles. It helps me choose with confidence. The booking process is super smooth, and support is fantastic!',
    rating: 4,
    avatarUrl: 'https://placehold.co/200x200/0EA5E9/FFFFFF?text=Jess',
    authorTitle: 'Frequent User',
  },
  {
    id: 'fallback-4',
    authorName: 'Mark Thompson',
    quote: 'Finding quality local services used to be a headache. This simplifies everything, from discovery to booking.',
    rating: 5,
    avatarUrl: 'https://placehold.co/200x200/10B981/FFFFFF?text=Mark',
    authorTitle: 'Small Business Owner',
  },
];

// Carousel settings
const settings = {
  dots: true,
  infinite: true,
  speed: 600,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 5000,
  pauseOnHover: true,
  appendDots: (dots: any) => (
    <div style={{ bottom: "-40px" }}>
      <ul className="flex justify-center gap-2">{dots}</ul>
    </div>
  ),
  customPaging: () => (
    <div className="w-2 h-2 rounded-full bg-gray-300 hover:bg-indigo-500 transition-colors" />
  ),
};

interface TestimonialProps {
  testimonial: Testimonial[];
}

const TestimonialsSection = ({ testimonial: dynamicTestimonials }: TestimonialProps) => {
  
  // 1. Data Prep
  const testimonialsToRender = Array.isArray(dynamicTestimonials) && dynamicTestimonials.length > 0
    ? dynamicTestimonials
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(t => ({
          id: t.id,
          authorName: t.authorName,
          quote: t.quote,
          rating: t.rating || 5,
          avatarUrl: t.avatarUrl || 'https://placehold.co/200x200/CCCCCC/333333?text=User',
          authorTitle: t.authorName?.includes('Dr.') ? 'Specialist' : 'Community Member',
        }))
    : fallbackTestimonials;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/200x200/cbd5e1/64748b?text=User';
  };

  // 2. Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 60, damping: 15 }
    },
  };

  return (
    <section className="relative py-24 bg-slate-50 dark:bg-gray-950 font-sans overflow-hidden">
      
      {/* Abstract Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200/50 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
                <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-indigo-500" />
                <span className="text-sm font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                    Testimonials
                </span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">thousands</span>
            </h2>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Don't just take our word for it. Read honest feedback from real users who have transformed their daily routines with us.
            </p>

            {/* This diagram explains the concept of the Net Promoter Score (NPS), 
               which is a common metric derived from customer ratings (like the 1-5 stars below)
               to gauge customer loyalty.
            */}
            <div className="mt-8 flex justify-center opacity-0 h-0 w-0 overflow-hidden">
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/88/Net_Promoter_Score_Diagram.svg" alt="Net Promoter Score Diagram" className="h-48 w-auto" />
              {/*
                [Image of Net Promoter Score diagram]
              */}

            </div>

          </motion.div>
        </div>

        {/* Mobile Carousel (Visible < 1024px) */}
        <div className="lg:hidden mb-12">
          <Slider {...settings}>
            {testimonialsToRender.map((t) => (
              <div key={t.id} className="px-2 pb-10">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-slate-100 dark:border-gray-700 h-full flex flex-col relative">
                  {/* Giant Quote Mark */}
                  <span className="absolute top-6 right-8 text-8xl font-serif text-slate-100 dark:text-gray-700 select-none opacity-50">
                    &rdquo;
                  </span>
                  
                  <div className="mb-4">{renderStars(t.rating)}</div>
                  
                  <blockquote className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-6 relative z-10 flex-grow">
                    "{t.quote.substring(0, 200)}{t.quote.length > 200 ? '...' : '' }"
                  </blockquote>
                  
                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100 dark:border-gray-700">
                    <Image
                      src={t.avatarUrl}
                      alt={t.authorName}
                      width={50}
                      height={50}
                      loader={loader}
                      onError={handleImageError}
                      className="rounded-full object-cover ring-4 ring-slate-50 dark:ring-gray-800"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{t.authorName}</div>
                      <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">{t.authorTitle}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Desktop Grid (Visible >= 1024px) */}
        <motion.div 
          className="hidden lg:grid grid-cols-3 gap-8 items-start"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
            {/* We map 3 columns manually or using masonry logic if needed. 
               For simplicity in this snippet, we assume a balanced grid or use flex-col within cols.
               Here, simply mapping them into a responsive grid.
            */}
            {testimonialsToRender.map((t, idx) => (
               <motion.div 
                 key={t.id}
                 variants={cardVariants}
                 className="group relative bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 border border-slate-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-900/10"
               >
                  {/* Decorative Gradient Border on Hover */}
                  <div className="absolute inset-0 rounded-[2rem] border-2 border-transparent group-hover:border-indigo-50 transition-colors duration-300 pointer-events-none" />

                  {/* Giant Quote Mark */}
                  <span className="absolute top-4 right-8 text-9xl font-serif text-slate-50 dark:text-gray-700/50 leading-none select-none group-hover:text-indigo-50 dark:group-hover:text-indigo-900/20 transition-colors duration-300">
                    &rdquo;
                  </span>

                  {/* Rating */}
                  <div className="relative z-10 mb-6">
                     {renderStars(t.rating)}
                  </div>

                  {/* Quote */}
                  <blockquote className="relative z-10 text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-8 font-medium">
                    "{t.quote.substring(0, 200)}{t.quote.length > 200 ? '...' : '' }"
                  </blockquote>

                  {/* Author Meta */}
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="relative">
                       <Image
                        src={t.avatarUrl}
                        alt={t.authorName}
                        width={56}
                        height={56}
                        loader={loader}
                        onError={handleImageError}
                        className="rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Verified Badge */}
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 border-2 border-white dark:border-gray-800">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {t.authorName}
                      </h4>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {t.authorTitle}
                      </p>
                    </div>
                  </div>
               </motion.div>
            ))}
        </motion.div>

      </div>
    </section>
  );
};

export default TestimonialsSection;