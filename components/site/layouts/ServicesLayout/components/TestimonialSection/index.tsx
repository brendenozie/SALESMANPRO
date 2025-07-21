"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/20/solid'; // Using solid stars for ratings
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?src=${src}&w=${width}&q=${quality || 75}`;

export default function TestimonialSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">Gathering kind words...</p>
      </div>
    );
  }

  const { testimonials, themeSettings } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || '#0d9488'; // teal-600 fallback
  const secondaryColor = themeSettings?.secondaryColor || '#f97316'; // orange-500 fallback

  // If no testimonials, gracefully return null
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
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 12 } },
    hover: { scale: 1.02, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-16 lg:py-24 px-4 relative overflow-hidden">
      {/* Subtle background gradient/blobs */}
      <div
        className="absolute top-0 left-0 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-alt"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-alt animation-delay-2000"
        style={{ backgroundColor: secondaryColor }}
      />

      <motion.div
        className="max-w-7xl mx-auto text-center relative z-10"
        initial="hidden"
        whileInView="visible"
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 text-gray-900 dark:text-gray-100" variants={textVariants}>
          What Our <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>Amazing Clients</span> Say
        </motion.h2>
        <motion.p className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto" variants={textVariants}>
          Don't just take our word for it – hear directly from those who've experienced our commitment to excellence.
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id || idx} // Use a unique ID if available, otherwise index
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center transition-all duration-300"
              variants={cardVariants}
              whileHover="hover"
            >
              {/* Avatar and Rating */}
              <div className="flex flex-col items-center mb-6">
                {testimonial.avatarUrl ? (
                  <Image
                    loader={loader}
                    src={testimonial.avatarUrl}
                    alt={testimonial.author}
                    width={80} // Slightly larger for prominence
                    height={80}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-offset-2 dark:ring-offset-gray-800"
                    style={{ ringColor: primaryColor }} // Ring matches primary color
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {testimonial.author ? testimonial.author.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                {/* Star Rating (assuming a 'rating' field in your testimonial data, fallback to 5) */}
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

              {/* Quote */}
              <p className="text-lg italic text-gray-800 dark:text-gray-200 mb-6 flex-grow line-clamp-4">
                "{testimonial.quote}"
              </p>

              {/* Author Info */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 w-full">
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{testimonial.author}</h4>
                {testimonial.role && <p className="text-sm text-gray-500 mt-1">{testimonial.role}</p>}
                {testimonial.company && <p className="text-sm text-gray-500">at {testimonial.company}</p>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Optional: Call to action for more reviews or leaving a review */}
        <motion.div className="mt-16" variants={textVariants}>
          <Link href="/reviews" passHref> {/* Link to a dedicated reviews page */}
            <button
              className="inline-flex items-center px-8 py-4 rounded-full font-bold text-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105"
              style={{ backgroundColor: primaryColor, color: 'white' }}
              whileHover={{ backgroundColor: secondaryColor }}
              whileTap={{ scale: 0.95 }}
            >
              Read More Testimonials
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}