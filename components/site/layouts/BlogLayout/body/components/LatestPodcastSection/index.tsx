"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayIcon } from "@heroicons/react/24/solid"; // Using PlayIcon for listen button
// Assuming useStoreContext is available and provides storeFormData
// import { useStoreContext } from '@/contexts/StoreContext';

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
const useStoreContext = () => ({
  storeFormData: {
    podcasts: [ // Added a mock for dynamic podcasts
      { title: 'Social Media Power: Amplifying Your Blog’s Reach', img: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Social+Media', link: '#' },
      { title: 'SEO Mastery: How to Rank Higher on Google', img: 'https://placehold.co/600x400/EF4444/FFFFFF?text=SEO+Mastery', link: '#' },
      { title: 'Monetizing Your Blog: Turning Passion into Profit', img: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=Monetizing+Blog', link: '#' },
    ],
    themeSettings: { primaryColor: '#F59E0B' }, // Tailwind 'amber-500'
  },
});

// Loader for next/image (required for external URLs with next/image)
const loader = ({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`;

// Static fallback data
const fallbackPodcasts = [
  { title: 'Social Media Power: Amplifying Your Blog’s Reach', img: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Social+Media', link: '#' },
  { title: 'SEO Mastery: How to Rank Higher on Google', img: 'https://placehold.co/600x400/EF4444/FFFFFF?text=SEO+Mastery', link: '#' },
  { title: 'Monetizing Your Blog: Turning Passion into Profit', img: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=Monetizing+Blog', link: '#' },
];


export default function LatestPodcastSection() {
  // Destructure storeFormData from context, providing a fallback for when context is not available
  const { storeFormData } = useStoreContext() || {};
  const { podcasts: dynamicPodcasts, themeSettings: { primaryColor = '#F59E0B' } = {} } = storeFormData || {}; // Default primary color (Tailwind amber-500)

  // Determine which podcast data to use
  const podcastsToRender = Array.isArray(dynamicPodcasts) && dynamicPodcasts.length > 0
    ? dynamicPodcasts.slice(0, 3) // Limit to 3 for this section
    : fallbackPodcasts;

  // Function to handle image loading errors, replacing with a generic placeholder
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevents infinite loop if placeholder also fails
    e.target.src = 'https://placehold.co/600x400/CCCCCC/333333?text=Podcast+Image'; // Generic placeholder
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 md:py-20 font-inter">
      {/* Section Title */}
      <motion.h2
        className="text-3xl sm:text-4xl font-extrabold text-center mb-10 text-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Latest Podcasts
      </motion.h2>

      {/* Grid of Podcasts */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {podcastsToRender.map((pc, idx) => (
          <motion.div
            key={idx}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 1.01 }} // Subtle scale on hover
          >
            {/* Podcast Image */}
            <div className="w-full h-48 overflow-hidden">
              <Image
                loader={loader}
                src={pc.img}
                alt={pc.title}
                width={600} // Increased width for better quality on larger screens
                height={320} // Adjusted height for a consistent aspect ratio
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={handleImageError} // Image error fallback
              />
            </div>
            
            {/* Podcast Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              {/* Title */}
              <h3 className="font-bold text-xl mb-4 text-gray-800 leading-snug">
                {pc.title}
              </h3>
              {/* Listen Now Button */}
              <a
                href={pc.link || '#'} // Ensure there's a fallback link
                className="inline-flex items-center mt-auto px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300
                           bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900" // Default styling
                style={{
                  backgroundColor: `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.1)`, // Light background from primary color
                  color: primaryColor, // Text color from primary color
                  borderColor: primaryColor,
                  borderWidth: '1px'
                }}
              >
                <PlayIcon className="h-4 w-4 mr-2" /> Listen Now
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Browse All Podcasts Button */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: podcastsToRender.length * 0.1 + 0.2 }}
      >
        <a
          href="/podcasts" // Link to your main podcast archive page
          className="inline-block px-8 py-4 rounded-full font-bold text-lg shadow-md transition-all duration-300
                     bg-white text-gray-800 hover:bg-gray-100 hover:shadow-lg transform hover:scale-105"
          style={{
            borderColor: primaryColor,
            borderWidth: '2px',
            color: primaryColor,
          }}
        >
          Browse All Podcasts
        </a>
      </motion.div>
    </section>
  );
}
