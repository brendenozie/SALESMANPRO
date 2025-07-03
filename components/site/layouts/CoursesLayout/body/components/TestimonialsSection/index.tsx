"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'; // Solid StarIcon for prominence
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking the image loader since Next.js Image is not available
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function TestimonialSection() {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  // For this specific issue, I'm using a mock to ensure consistent defaults and data structure.
  const useMockStoreContext = () => ({
    storeFormData: {
      themeSettings: {
        primaryColor: "#fd2121", // Red from your sample
        secondaryColor: "#ffffff", // White from your sample
      },
      testimonials: [
        {
          id: 1,
          name: "Emily R.",
          role: "Student, Computer Science",
          quote: "Joining this academy was the best decision for my career. The instructors are incredibly supportive, and the course material is cutting-edge. I've gained practical skills that directly apply to my field.",
          rating: 5,
          avatarUrl: "https://placehold.co/100x100/A0A0A0/FFFFFF?text=ER", // Placeholder avatar
        },
        {
          id: 2,
          name: "John D.",
          role: "Parent",
          quote: "My son's grades and confidence have soared since he started here. The personalized attention and engaging lessons truly make a difference. Highly recommend for any student!",
          rating: 5,
          avatarUrl: "https://placehold.co/100x100/808080/FFFFFF?text=JD", // Placeholder avatar
        },
        {
          id: 3,
          name: "Sarah L.",
          role: "Alumna, Business Management",
          quote: "The vibrant community and extensive extracurriculars made my university experience unforgettable. Beyond academics, I developed leadership skills and made lifelong connections.",
          rating: 4,
          avatarUrl: "https://placehold.co/100x100/606060/FFFFFF?text=SL", // Placeholder avatar
        },
        {
          id: 4,
          name: "Michael B.",
          role: "Professional Development",
          quote: "The flexible online courses allowed me to upskill while working full-time. The content is relevant, and the certifications are recognized in the industry. A truly valuable investment.",
          rating: 5,
          avatarUrl: "https://placehold.co/100x100/404040/FFFFFF?text=MB", // Placeholder avatar
        },
      ],
    },
  });

  const { storeFormData } = useMockStoreContext();
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121'; // Your brand's primary color (red)
  const accentColor = "#FFC107"; // A vibrant amber/yellow for highlights

  const testimonials = storeFormData?.testimonials || [];
  const currentTestimonial = testimonials[currentTestimonialIndex];

  const goToNextTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPreviousTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  // Animation variants for staggered appearance
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 10,
        when: "beforeChildren",
        staggerChildren: 0.2
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      },
    },
  };

  const quoteVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 10,
        delay: 0.3
      },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <motion.section
      className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8 text-center" // Light background
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 leading-tight"
        variants={itemVariants}
      >
        What Our <span style={{ color: primaryColor }}>Students</span> Say
      </motion.h2>

      <motion.p
        className="mt-4 text-gray-700 max-w-xl mx-auto text-lg leading-relaxed"
        variants={itemVariants}
      >
        Hear directly from those who have experienced our commitment to excellence and transformative learning environment.
      </motion.p>

      <div className="relative max-w-4xl mx-auto mt-12 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
        <AnimatePresence mode="wait">
          {currentTestimonial && (
            <motion.div
              key={currentTestimonial.id} // Key for AnimatePresence to detect changes
              variants={quoteVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Star Rating */}
              <div className="flex justify-center mb-6 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-6 h-6 ${i < currentTestimonial.rating ? `text-[${accentColor}]` : 'text-gray-300'}`}
                  />
                ))}
              </div>

              {/* Testimonial Quote */}
              <blockquote className="text-xl md:text-2xl italic font-medium text-gray-800 leading-relaxed mb-8">
                “{currentTestimonial.quote}”
              </blockquote>

              {/* Author Info */}
              <div className="flex flex-col items-center">
                <img
                  src={customLoader({ src: currentTestimonial.avatarUrl, width: 100 })}
                  alt={currentTestimonial.name}
                  className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-white shadow-md"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://placehold.co/100x100/${primaryColor.replace('#', '')}/FFFFFF?text=${currentTestimonial.name.split(' ').map(n => n[0]).join('')}`;
                  }}
                />
                <p className="text-gray-900 font-bold text-lg">{currentTestimonial.name}</p>
                <p className="text-sm text-gray-600">{currentTestimonial.role}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 border-2 border-[${accentColor}] rounded-full text-[${accentColor}] bg-white shadow-md
                        hover:bg-[${accentColor}] hover:text-white transition-all duration-200 ml-4`}
            onClick={goToPreviousTestimonial}
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </motion.button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 border-2 border-[${accentColor}] rounded-full text-[${accentColor}] bg-white shadow-md
                        hover:bg-[${accentColor}] hover:text-white transition-all duration-200 mr-4`}
            onClick={goToNextTestimonial}
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center mt-10 space-x-3">
        {testimonials.map((_, idx) => (
          <motion.button
            key={idx}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === currentTestimonialIndex ? `bg-[${primaryColor}] scale-125` : 'bg-gray-300'
            }`}
            onClick={() => setCurrentTestimonialIndex(idx)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </motion.section>
  );
}
