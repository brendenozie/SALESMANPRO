"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/20/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?src=${src}&w=${width}&q=${quality || 75}`;

export default function TestimonialSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">Gathering kind words...</p>
      </div>
    );
  }

  const { testimonials, themeSettings } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || '#4CAF50';
  const secondaryColor = themeSettings?.secondaryColor || '#FFC107';

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 12 } },
    hover: {
      y: -5,
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      transition: { duration: 0.3, ease: "easeOut" }
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section id="testimonials" className="bg-white dark:bg-gray-950 py-16 lg:py-24 px-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-5 dark:bg-dot-pattern-dark z-0" />

      <motion.div
        className="max-w-7xl mx-auto text-center relative z-10"
        initial="hidden"
        whileInView="visible"
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 text-gray-900 dark:text-gray-100" variants={textVariants}>
          What Our <span className="bg-clip-text text-transparent" style={{ backgroundColor: primaryColor }}>Amazing Clients</span> Say
        </motion.h2>
        <motion.p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto" variants={textVariants}>
          Don't just take our word for it—hear directly from those who've experienced our commitment to excellence.
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((testimonial, idx) => (
            <motion.div
              key={testimonial.id || idx}
              className={`bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-transparent flex flex-col items-center text-center transition-all duration-300 relative ${idx === 1 ? 'md:mt-8 lg:mt-16' : ''}`}
              variants={cardVariants}
              whileHover="hover"
            >
              {/* Colored border on hover */}
              <div
                className="absolute inset-0 rounded-3xl border-2 transition-colors duration-300 pointer-events-none"
                style={{ borderColor: 'transparent' }}
              />
              <style jsx>{`
                .testimonial-card:hover .inset-0.border-2 {
                  border-color: ${primaryColor} !important;
                }
              `}</style>
              
              {/* Quote Icon */}
              <div
                className="w-12 h-12 flex items-center justify-center rounded-full mb-4"
                style={{ backgroundColor: secondaryColor }}
              >
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
              </div>

              {/* Quote */}
              <p className="text-lg italic text-gray-800 dark:text-gray-200 mb-6 flex-grow line-clamp-4">
                "{testimonial.quote}"
              </p>

              {/* Avatar and Rating */}
              <div className="flex flex-col items-center mb-6">
                {testimonial.avatarUrl ? (
                  <Image
                    loader={loader}
                    src={testimonial.avatarUrl}
                    alt={testimonial.authorName || 'Client Avatar'}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-offset-2 dark:ring-offset-gray-800"
                    style={{ borderColor: primaryColor }}
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {testimonial.author ? testimonial.authorName?.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                {/* Star Rating */}
                <div className="flex mt-3">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 w-full">
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{testimonial.authorName}</h4>
                {/* {testimonial.role && <p className="text-sm text-gray-500 mt-1">{testimonial.role}</p>}
                {testimonial.company && <p className="text-sm text-gray-500">at {testimonial.company}</p>} */}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Optional: Call to action for more reviews */}
        <motion.div className="mt-16" variants={textVariants}>
          <Link href="/reviews" passHref>
            <motion.button
              className="inline-flex items-center px-10 py-4 rounded-full font-bold text-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105"
              style={{ backgroundColor: primaryColor, color: 'white' }}
              whileHover={{
                background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              }}
              whileTap={{ scale: 0.95 }}
            >
              Read More Testimonials
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}