'use client';

import React from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image for optimized avatars
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

// Import slick carousel styles (ensure these are installed or linked in your project)
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Testimonial } from '@/types/typings';

// Define types based on your transformCompanyToStoreForm
// export type Testimonial = {
//   id: string;
//   author: string; // Corresponds to author name
//   quote: string; // Corresponds to the testimonial text
//   rating?: number; // 1-5 stars
//   avatarUrl?: string; // URL for the author's image
//   order: number; // For sorting
//   // The 'title' field (e.g., 'Satisfied Client', 'Registered Therapist')
//   // is not explicitly in your schema's Testimonial model.
//   // We will derive it or use a generic fallback.
// };

export type StoreForm = {
  testimonials?: Testimonial[];
  // Add other relevant StoreForm fields if needed
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     testimonials: [
//       {
//         id: 'test-1',
//         author: 'Sarah L.',
//         quote: 'Ducun Vijed made finding and booking a massage therapist incredibly easy. The interface is intuitive, and I always find someone perfect for my needs. Truly a game-changer!',
//         rating: 5,
//         avatarUrl: 'https://placehold.co/200x200/F59E0B/FFFFFF?text=Sarah', // Example placeholder
//         order: 1,
//       },
//       {
//         id: 'test-2',
//         author: 'Dr. Alex M.',
//         quote: 'As a therapist, Ducun Vijed has expanded my client base significantly. The platform is professional, secure, and handles all the scheduling seamlessly. Highly recommended!',
//         rating: 5,
//         avatarUrl: 'https://placehold.co/200x200/EF4444/FFFFFF?text=Alex',
//         order: 2,
//       },
//       {
//         id: 'test-3',
//         author: 'Jessica P.',
//         quote: 'I love the variety of therapists available and the detailed profiles. It helps me choose with confidence. The booking process is super smooth, and support is fantastic!',
//         rating: 4,
//         avatarUrl: 'https://placehold.co/200x200/0EA5E9/FFFFFF?text=Jessica',
//         order: 3,
//       },
//       {
//         id: 'test-4',
//         author: 'Mark T.',
//         quote: 'Finding quality local services used to be a headache. Ducun Vijed simplifies everything, from discovery to booking. My experience has been consistently excellent!',
//         rating: 5,
//         avatarUrl: 'https://placehold.co/200x200/10B981/FFFFFF?text=Mark',
//         order: 4,
//       },
//     ],
//   } as StoreForm,
// });

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// Helper to render stars (reused from previous sections)
const renderStars = (count: number | undefined) => {
  if (count === undefined) return null;
  return (
    <div className="flex items-center space-x-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < count ? (
          <StarSolid key={i} className="h-4 w-4 text-yellow-500" />
        ) : (
          <StarOutline key={i} className="h-4 w-4 text-gray-300" />
        )
      )}
    </div>
  );
};

// Static fallback data (matches the structure we'll use for rendering)
// interface RenderableTestimonial {
//   id: string;
//   name: string;
//   text: string;
//   rating: number;
//   image: string;
//   title: string; // This field is derived or hardcoded for fallback
// }

const fallbackTestimonials: Testimonial[] = [
  {
    id: 'fallback-1',
    authorName: 'Sarah L.',
    quote: 'Ducun Vijed made finding and booking a massage therapist incredibly easy. The interface is intuitive, and I always find someone perfect for my needs. Truly a game-changer!',
    rating: 5,
    avatarUrl: 'https://placehold.co/200x200/F59E0B/FFFFFF?text=Sarah',
    authorTitle: 'Satisfied Client',
  },
  {
    id: 'fallback-2',
    authorName: 'Dr. Alex M.',
    quote: 'As a therapist, Ducun Vijed has expanded my client base significantly. The platform is professional, secure, and handles all the scheduling seamlessly. Highly recommended!',
    rating: 5,
    avatarUrl: 'https://placehold.co/200x200/EF4444/FFFFFF?text=Alex',
    authorTitle: 'Registered Therapist',
  },
  {
    id: 'fallback-3',
    authorName: 'Jessica P.',
    quote: 'I love the variety of therapists available and the detailed profiles. It helps me choose with confidence. The booking process is super smooth, and support is fantastic!',
    rating: 4,
    avatarUrl: 'https://placehold.co/200x200/0EA5E9/FFFFFF?text=Jessica',
    authorTitle: 'Regular User',
  },
  {
    id: 'fallback-4',
    authorName: 'Mark T.',
    quote: 'Finding quality local services used to be a headache. Ducun Vijed simplifies everything, from discovery to booking. My experience has been consistently excellent!',
    rating: 5,
    avatarUrl: 'https://placehold.co/200x200/10B981/FFFFFF?text=Mark',
    authorTitle: 'Community Member',
  },
];

// Carousel settings for react-slick
const settings = {
  dots: true,
  infinite: true,
  speed: 800, // Slightly faster transition
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 6000, // A bit longer autoplay speed
  adaptiveHeight: true,
  pauseOnHover: true, // Pause autoplay on hover
  appendDots: (dots: any) => (
    <div style={{ padding: '20px' }}>
      <ul className="flex justify-center mt-4 space-x-2">{dots}</ul>
    </div>
  ),
  customPaging: (i: number) => (
    <div className="w-3 h-3 rounded-full bg-gray-300 hover:bg-blue-400 transition-colors cursor-pointer" />
  ),
  responsive: [
    {
      breakpoint: 768, // md breakpoint
      settings: {
        slidesToShow: 1,
        dots: true,
      },
    },
    {
      breakpoint: 1024, // lg breakpoint - switch to grid
      settings: 'unslick' as const, // Destroys slick on larger screens for grid layout
    },
  ],
};

const TestimonialsSection = () => {
  // Destructure storeFormData from context
  const { storeFormData } = useStoreContext() || {};
  const { testimonials: dynamicTestimonials } = storeFormData || {};

  // Determine which testimonials to render: dynamic or fallback
  const testimonialsToRender: Testimonial[] = Array.isArray(dynamicTestimonials) && dynamicTestimonials.length > 0
    ? dynamicTestimonials
        .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order if available
        .map(t => ({
          id: t.id,
          authorName: t.authorName,
          quote: t.quote,
          rating: t.rating || 5, // Default to 5 if rating is not provided
          avatarUrl: t.avatarUrl || 'https://placehold.co/200x200/CCCCCC/333333?text=User', // Fallback image
          title: t.authorName?.includes('Dr.') ? 'Registered Therapist' : 'Satisfied Client', // Derive title based on name or a generic
        }))
    : fallbackTestimonials; // Use static fallback testimonials

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevents infinite loop if placeholder also fails
    e.currentTarget.src = 'https://placehold.co/200x200/CCCCCC/333333?text=User'; // Generic placeholder
  };

  return (
    <motion.section
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-20 px-4 sm:px-6 lg:px-8" // Modern gradient background
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
    >
      <div className="max-w-7xl mx-auto text-center">
        {/* Subtitle Badge */}
        <motion.span
          className="inline-block bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 shadow-sm" // More vibrant badge
          variants={itemVariants}
        >
          What Our Community Says
        </motion.span>

        {/* Headline */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4" // Larger, bolder headline
          variants={itemVariants}
        >
          Hear From Our <span className="text-blue-600 dark:text-blue-400">Happy Clients</span> and Service Providers
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12" // Larger, more prominent description
          variants={itemVariants}
        >
          Discover how Ducun Vijed is transforming the way people find and book services, and how providers connect with their ideal clients.
        </motion.p>

        {/* Testimonials Carousel (Mobile) */}
        <div className="block lg:hidden">
          <Slider {...settings}>
            {testimonialsToRender.map((t) => (
              <div key={t.id} className="px-2"> {/* Added padding for carousel items */}
                <motion.div
                  className="relative bg-white dark:bg-gray-800 p-8 shadow-xl rounded-3xl border border-gray-100 dark:border-gray-700 mx-auto" // Elevated card styling
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="text-lg font-medium text-gray-800 dark:text-white mb-6 leading-relaxed h-7 overflow-hidden">
                    “{t.quote}”
                  </p>
                  <div className="flex items-center gap-4 mt-6"> {/* Increased gap */}
                    <Image
                      src={t.avatarUrl || 'https://placehold.co/200x200/CCCCCC/333333?text=User'} // Fallback image
                      alt={t.authorName || 'authorName'}
                      width={48} // Larger avatar
                      height={48}
                      loader={loader}
                      className="rounded-full object-cover ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800" // Ring accent
                      onError={handleImageError} // Image error fallback
                    />
                    <div className="text-left">
                      <p className="text-md font-semibold text-gray-900 dark:text-white h-7 overflow-hidden">{t.quote}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.authorTitle}</p>
                      {renderStars(t.rating || 4)}
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Testimonials Grid (Desktop) */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12 justify-items-center">
          {testimonialsToRender.map((t, index) => (
            <motion.div
              key={t.id} // Use unique ID from data
              className="relative bg-white dark:bg-gray-800 p-8 shadow-xl rounded-3xl border border-gray-100 dark:border-gray-700 max-w-sm w-full" // Consistent card styling
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.15, duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -8, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
            >
              <p className="text-lg font-medium text-gray-800 dark:text-white mb-6 leading-relaxed h-7 overflow-hidden">
                “{t.quote}”
              </p>
              <div className="flex items-center gap-4 mt-6">
                <Image
                  src={t.avatarUrl || 'https://placehold.co/200x200/CCCCCC/333333?text=User'}
                  alt={t.authorName || ''}
                  width={48}
                  height={48}
                  loader={loader}
                  className="rounded-full object-cover ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800"
                  onError={handleImageError}
                />
                <div className="text-left">
                  <p className="text-md font-semibold text-gray-900 dark:text-white  h-7 overflow-hidden">{t.quote}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.authorTitle}</p>
                  {renderStars(t.rating || 4)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;
