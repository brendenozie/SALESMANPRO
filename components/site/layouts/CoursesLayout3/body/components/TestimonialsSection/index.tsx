"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'; // Solid StarIcon for prominence
import Image from 'next/image'; // Import Image for optimized avatars
// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type Testimonial = {
  id: string | number | undefined;
  name?: string;
  role?: string;
  authorName?: string; // Corresponds to author name
  quote: string; // Corresponds to the testimonial text
  rating?: number; // 1-5 stars
  avatarUrl?: string; // URL for the author's image
  order?: number; // For sorting
  // The 'role' field (e.g., 'Student, Computer Science', 'Parent') is not
  // explicitly in your schema's Testimonial model. We will derive it or use a generic fallback.
};

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  testimonials?: Testimonial[];
  themeSettings?: ThemeSettings;
  // Add other relevant StoreForm fields if needed
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     themeSettings: {
//       primaryColor: "#fd2121", // Red from your sample
//       secondaryColor: "#FFC107", // Amber/Yellow for accent
//     },
//     testimonials: [
//       {
//         id: 'test-1',
//         author: "Emily R.",
//         quote: "Joining this academy was the best decision for my career. The instructors are incredibly supportive, and the course material is cutting-edge. I've gained practical skills that directly apply to my field.",
//         rating: 5,
//         avatarUrl: "https://placehold.co/100x100/A0A0A0/FFFFFF?text=ER",
//         order: 1,
//       },
//       {
//         id: 'test-2',
//         author: "John D.",
//         quote: "My son's grades and confidence have soared since he started here. The personalized attention and engaging lessons truly make a difference. Highly recommend for any student!",
//         rating: 5,
//         avatarUrl: "https://placehold.co/100x100/808080/FFFFFF?text=JD",
//         order: 2,
//       },
//       {
//         id: 'test-3',
//         author: "Sarah L.",
//         quote: "The vibrant community and extensive extracurriculars made my university experience unforgettable. Beyond academics, I developed leadership skills and made lifelong connections.",
//         rating: 4,
//         avatarUrl: "https://placehold.co/100x100/606060/FFFFFF?text=SL",
//         order: 3,
//       },
//       {
//         id: 'test-4',
//         author: "Michael B.",
//         quote: "The flexible online courses allowed me to upskill while working full-time. The content is relevant, and the certifications are recognized in the industry. A truly valuable investment.",
//         rating: 5,
//         avatarUrl: "https://placehold.co/100x100/404040/FFFFFF?text=MB",
//         order: 4,
//       },
//     ],
//   } as StoreForm,
// });

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => `${src}?w=${width}&q=${quality || 75}`;

// Interface for the testimonial data after transformation, including a 'role'
// interface RenderableTestimonial {
//   id: string; // Allow string or number for ID
//   name: string;
//   role: string;
//   quote: string;
//   rating: number;
//   avatarUrl: string;
// }

// Static fallback data (matches the RenderableTestimonial structure)
const fallbackTestimonials: Testimonial[] = [
  {
    id: 'fb-test-1',
    name: "Emily R.",
    role: "Student, Computer Science",
    quote: "Joining this academy was the best decision for my career. The instructors are incredibly supportive, and the course material is cutting-edge. I've gained practical skills that directly apply to my field.",
    rating: 5,
    avatarUrl: "https://placehold.co/100x100/A0A0A0/FFFFFF?text=ER",
  },
  {
    id: 'fb-test-2',
    name: "John D.",
    role: "Parent",
    quote: "My son's grades and confidence have soared since he started here. The personalized attention and engaging lessons truly make a difference. Highly recommend for any student!",
    rating: 5,
    avatarUrl: "https://placehold.co/100x100/808080/FFFFFF?text=JD",
  },
  {
    id: 'fb-test-3',
    name: "Sarah L.",
    role: "Alumna, Business Management",
    quote: "The vibrant community and extensive extracurriculars made my university experience unforgettable. Beyond academics, I developed leadership skills and made lifelong connections.",
    rating: 4,
    avatarUrl: "https://placehold.co/100x100/606060/FFFFFF?text=SL",
  },
  {
    id: 'fb-test-4',
    name: "Michael B.",
    role: "Professional Development",
    quote: "The flexible online courses allowed me to upskill while working full-time. The content is relevant, and the certifications are recognized in the industry. A truly valuable investment.",
    rating: 5,
    avatarUrl: "https://placehold.co/100x100/404040/FFFFFF?text=MB",
  },
];

export default function TestimonialSection({ storeFormData }: any) {
  // const { storeFormData } = useStoreContext();
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121'; // Your brand's primary color (red)
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107'; // A vibrant amber/yellow for highlights

  // Determine which testimonials to render: dynamic or fallback
  const testimonialsToRender: Testimonial[] = storeFormData?.testimonials && Array.isArray(storeFormData?.testimonials) && storeFormData.testimonials.length > 0
    ? storeFormData.testimonials
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) // Sort by order if available
        .map((t: any) => ({
          id: t.id,
          name: t.authorName || '',
          author: t.authorName?.includes('Dr.') ? 'Educator' : (t.authorName?.includes('Parent') ? 'Parent' : 'Student/Alumnus'), // Simple role derivation
          quote: t.quote,
          rating: t.rating || 5, // Default to 5 if rating is not provided
          avatarUrl: t.avatarUrl || `https://placehold.co/100x100/${primaryColor.replace('#', '')}/FFFFFF?text=${t.authorName?.split(' ').map((n: string) => n[0]).join('')}`, // Fallback avatar with initials
        }))
    : fallbackTestimonials;

  const currentTestimonial = testimonialsToRender[currentTestimonialIndex];

  const goToNextTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === testimonialsToRender.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPreviousTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === 0 ? testimonialsToRender.length - 1 : prevIndex - 1
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    const parentDiv = e.currentTarget.closest('.author-avatar-container'); // Find a parent container to get dynamic color
    let bgColor = primaryColor;
    if (parentDiv) {
      // Attempt to get the background color from a parent if needed, or stick to primaryColor
      // This is a bit tricky without direct access to the dynamic color from the element itself
      // For simplicity, we'll just use the primaryColor from context
    }
    const initials = e.currentTarget.alt.split(' ').map(n => n[0]).join('');
    e.currentTarget.src = `https://placehold.co/100x100/${bgColor.replace('#', '')}/FFFFFF?text=${initials}`;
  };

  return (
    <motion.section
      className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8 text-center"
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
              key={currentTestimonial.id}
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
                    className={`w-6 h-6`}
                    style={{ color: accentColor }} //i < currentTestimonial.rating ? accentColor : '#D1D5DB' }} // Use accentColor for solid stars
                  />
                ))}
              </div>

              {/* Testimonial Quote */}
              <blockquote className="text-xl md:text-2xl italic font-medium text-gray-800 leading-relaxed mb-8">
                “{currentTestimonial.quote}”
              </blockquote>

              {/* Author Info */}
              <div className="flex flex-col items-center">
                <div className="author-avatar-container"> {/* Added container for easier styling/ref for error handling */}
                  <Image
                    src={currentTestimonial.avatarUrl || ""}
                    alt={currentTestimonial.name || ""}
                    width={100}
                    height={100}
                    loader={loader}
                    className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-white shadow-md"
                    onError={handleImageError}
                  />
                </div>
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
            className={`p-3 border-2 rounded-full bg-white shadow-md transition-all duration-200 ml-4`}
            style={{
              borderColor: accentColor,
              color: accentColor,
              '--tw-hover-bg': accentColor,
              '--tw-hover-text': 'white',
            } as React.CSSProperties}
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
            className={`p-3 border-2 rounded-full bg-white shadow-md transition-all duration-200 mr-4`}
            style={{
              borderColor: accentColor,
              color: accentColor,
              '--tw-hover-bg': accentColor,
              '--tw-hover-text': 'white',
            } as React.CSSProperties}
            onClick={goToNextTestimonial}
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center mt-10 space-x-3">
        {testimonialsToRender.map((_, idx) => (
          <motion.button
            key={idx}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === currentTestimonialIndex ? 'scale-125' : 'bg-gray-300'
            }`}
            style={{ backgroundColor: idx === currentTestimonialIndex ? primaryColor : '#D1D5DB' }} // Dynamic primary color for active dot
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
