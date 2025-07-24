"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useStoreContext } from "@/contexts/StoreContext";

// Define the structure of a single podcast as it would come from StoreForm
// This type assumes you will have a 'Podcast' model in your Prisma schema
// or a JSON field in your Company model that stores this structure.
export type Podcast = {
  id: string; // Assuming an ID for each podcast
  title: string;
  description?: string; // Optional description for the podcast
  audioUrl: string; // The actual audio file URL
  coverImage: string | null; // URL for the podcast cover image
  slug: string; // For linking to a specific podcast page
  publishedAt?: string | null; // Optional publish date (ISO string)
  // Add other fields relevant to your podcast model (e.g., duration, guests, etc.)
};

// Define the relevant parts of StoreForm that LatestPodcastSection uses
export type StoreForm = {
  podcasts?: Podcast[]; // Array of Podcast objects
  themeSettings?: {
    primaryColor?: string;
  };
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import and ensure
// your StoreContext provides data conforming to the StoreForm type,
// including an array of 'podcasts'.
// const useStoreContext = () => ({
//   storeFormData: {
//     podcasts: [ // Added a mock for dynamic podcasts with more realistic fields
//       { 
//         id: 'podcast1',
//         title: 'Social Media Power: Amplifying Your Blog’s Reach', 
//         description: 'Learn strategies to boost your blog\'s visibility.',
//         audioUrl: '#', // Placeholder for actual audio URL
//         coverImage: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Social+Media', 
//         slug: 'social-media-power',
//         publishedAt: '2024-07-15T10:00:00Z',
//       },
//       { 
//         id: 'podcast2',
//         title: 'SEO Mastery: How to Rank Higher on Google', 
//         description: 'Dive deep into search engine optimization techniques.',
//         audioUrl: '#',
//         coverImage: 'https://placehold.co/600x400/EF4444/FFFFFF?text=SEO+Mastery', 
//         slug: 'seo-mastery',
//         publishedAt: '2024-07-10T14:30:00Z',
//       },
//       { 
//         id: 'podcast3',
//         title: 'Monetizing Your Blog: Turning Passion into Profit', 
//         description: 'Discover various ways to generate income from your content.',
//         audioUrl: '#',
//         coverImage: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=Monetizing+Blog', 
//         slug: 'monetizing-blog',
//         publishedAt: '2024-07-05T09:00:00Z',
//       },
//     ],
//     themeSettings: { primaryColor: '#F59E0B' }, // Tailwind 'amber-500'
//   } as StoreForm, // Cast to StoreForm for type safety in mock
// });

// Loader for next/image (required for external URLs with next/image)
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// Static fallback data (matches the new Podcast type structure for consistency)
const fallbackPodcasts: Podcast[] = [
  { 
    id: 'fallback1',
    title: 'Social Media Power: Amplifying Your Blog’s Reach', 
    description: 'A deep dive into social media strategies.',
    audioUrl: '#',
    coverImage: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Social+Media', 
    slug: 'fallback-social-media',
  },
  { 
    id: 'fallback2',
    title: 'SEO Mastery: How to Rank Higher on Google', 
    description: 'Master the art of search engine optimization.',
    audioUrl: '#',
    coverImage: 'https://placehold.co/600x400/EF4444/FFFFFF?text=SEO+Mastery', 
    slug: 'fallback-seo-mastery',
  },
  { 
    id: 'fallback3',
    title: 'Monetizing Your Blog: Turning Passion into Profit', 
    description: 'Strategies for generating income from your blog.',
    audioUrl: '#',
    coverImage: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=Monetizing+Blog', 
    slug: 'fallback-monetizing-blog',
  },
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
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevents infinite loop if placeholder also fails
    e.currentTarget.src = 'https://placehold.co/600x400/CCCCCC/333333?text=Podcast+Image'; // Generic placeholder
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
            key={pc.id || idx} // Use unique ID from data, fallback to index
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 1.01 }} // Subtle scale on hover
          >
            <a href={pc.slug ? `/podcasts/${pc.slug}` : pc.audioUrl || '#'} className="block"> {/* Link to podcast page or audio URL */}
              {/* Podcast Image */}
              <div className="w-full h-48 overflow-hidden">
                <Image
                  loader={loader}
                  src={pc.coverImage || 'https://placehold.co/600x400/CCCCCC/333333?text=Podcast+Image'} // Fallback for missing coverImage
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
                {/* Description (Optional) */}
                {pc.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {pc.description}
                  </p>
                )}
                {/* Listen Now Button */}
                <span // Changed from <a> to <span> as the entire card is now a link
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
                </span>
              </div>
            </a>
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
