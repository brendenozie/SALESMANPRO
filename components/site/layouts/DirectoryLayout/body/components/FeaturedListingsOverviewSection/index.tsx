'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPinIcon, StarIcon as StarOutline } from '@heroicons/react/24/outline'; // Added MapPinIcon
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'; // Solid star for ratings
import { useStoreContext } from '@/contexts/StoreContext';

// Assuming loader is defined elsewhere or passed down, for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Dummy Listing Data (More detailed and realistic) ---
interface ListingItem {
  id: string;
  name: string;
  subtitle?: string; // e.g., "Italian Restaurant"
  location?: string; // e.g., "Nairobi CBD"
  rating?: number; // 1-5 stars
  imageUrl: string;
  slug: string;
  tags?: string[]; // e.g., ["New", "Pet-Friendly", "24/7"]
}

const dummyListings: ListingItem[] = [
  {
    id: '1',
    name: 'The Gourmet Plate Bistro',
    subtitle: 'Fine Dining & Catering',
    location: 'Westlands, Nairobi',
    rating: 5,
    imageUrl: '/images/listing-gourmet-bistro.webp',
    slug: 'the-gourmet-plate-bistro',
    tags: ['New Arrival', 'Reservations Recommended'],
  },
  {
    id: '2',
    name: 'Serenity Spa & Wellness',
    subtitle: 'Relaxation & Therapeutic Services',
    location: 'Karen, Nairobi',
    rating: 4,
    imageUrl: '/images/listing-serenity-spa.webp',
    slug: 'serenity-spa-wellness',
    tags: ['Exclusive Offer'],
  },
  {
    id: '3',
    name: 'Tech Haven Electronics',
    subtitle: 'Gadgets & Repairs',
    location: 'Upper Hill, Nairobi',
    rating: 4,
    imageUrl: '/images/listing-tech-haven.webp',
    slug: 'tech-haven-electronics',
    tags: ['Top Rated'],
  },
  {
    id: '4',
    name: 'Urban Greens Nursery',
    subtitle: 'Plants, Tools & Landscaping',
    location: 'Lavington, Nairobi',
    rating: 3,
    imageUrl: '/images/listing-urban-greens.webp',
    slug: 'urban-greens-nursery',
    tags: ['Eco-Friendly'],
  },
  {
    id: '5',
    name: 'Safari Adventures Kenya',
    subtitle: 'Wildlife Tours & Safaris',
    location: 'Langata, Nairobi',
    rating: 5,
    imageUrl: '/images/listing-safari-adventures.webp',
    slug: 'safari-adventures-kenya',
    tags: ['Best of Kenya'],
  },
  {
    id: '6',
    name: 'Crafted Cuppa Coffee Shop',
    subtitle: 'Artisan Coffee & Pastries',
    location: 'Gigiri, Nairobi',
    rating: 4,
    imageUrl: '/images/listing-crafted-cuppa.webp',
    slug: 'crafted-cuppa-coffee-shop',
    tags: ['Cozy Atmosphere'],
  },
];

interface ListingGridProps {
  listings: ListingItem[]; // Use the new interface
  slug: string; // Base slug for the site (e.g., 'your-site-name')
}

// Function to render star ratings
const renderStars = (count: number | undefined) => {
  if (count === undefined) return null;
  return (
    <div className="flex items-center">
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

function ListingGrid({ listings, slug }: ListingGridProps) {
  const router = useRouter();

  return (
    // Section background changed for more vibrancy and distinction
    <section className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 py-12 px-4 sm:px-6 lg:px-8 rounded-3xl -mt-20 relative z-10 shadow-inner">
      <div className="max-w-7xl mx-auto"> {/* Added max-width container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> {/* Increased gap */}
          {listings.map((item) => (
            <motion.article
              key={item.id}
              whileHover={{ y: -8, scale: 1.03 }} // More pronounced lift and scale
              transition={{ type: 'spring', stiffness: 200, damping: 20 }} // Softer spring animation
              onClick={() => router.push(`/site/${slug}/listing/${item.slug}`)} // Corrected dynamic path
              role="link"
              aria-label={`View details for ${item.name}`}
              className="group bg-white dark:bg-gray-850 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 dark:border-gray-700 relative" // Enhanced card styling
            >
              {/* Image with overlay and tags */}
              <div className="relative h-52 sm:h-60 overflow-hidden rounded-t-3xl"> {/* Increased height */}
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110" // Slower, more dramatic zoom
                  loader={loader}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={item.id === '1' || item.id === '2'} // Prioritize first couple of images for LCP
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="bg-white/90 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-2"> {/* Increased padding and spacing */}
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {item.name}
                </h3>
                {item.subtitle && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
                    {item.subtitle}
                  </p>
                )}
                {item.location && (
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <MapPinIcon className="h-4 w-4 mr-1 text-blue-500" /> {/* Location icon */}
                    <span>{item.location}</span>
                  </div>
                )}
                {item.rating !== undefined && (
                  <div className="pt-1">{renderStars(item.rating)}</div>
                )}
                {/* Optional: Add a subtle call to action within the card */}
                <motion.button
                  className="mt-4 w-full py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors duration-200 shadow-md transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event from firing twice
                    router.push(`/site/${slug}/listing/${item.slug}`);
                  }}
                >
                  View Listing
                </motion.button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Parent Section Wrapper (Where ListingGrid will be used) ---
// import { useStoreContext } from '../../../../../contexts/StoreContext'; // Assuming you have this context for storeFormData
// import dummyListings from './path/to/dummyListings'; // If you want to keep them separate

export default function FeaturedListingsOverviewSection() {
  const { storeFormData } = useStoreContext();
  const baseSlug = storeFormData?.slug || 'default-site'; // Fallback slug

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4"
          >
            Discover Top <span className="text-teal-600 dark:text-teal-400">Featured Listings</span>
          </motion.h2>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Explore a curated selection of the best businesses and services in our community. Find your next favorite spot!
          </motion.p>
        </div>

        {/* The Listing Grid Component */}
        <ListingGrid listings={dummyListings} slug={baseSlug} /> {/* Use dummyListings here */}

        {/* Call to Action - View All Listings */}
        <div className="text-center mt-16">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-semibold rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => router.push(`/site/${baseSlug}/listings`)}
            aria-label="View all listings"
          >
            View All Listings
            <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
      </div>
    </section>
  );
}