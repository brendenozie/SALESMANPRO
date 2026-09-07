"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MarketListingForm } from '@/types/typings'; // Assuming this is correct
import useSWR from "swr";
import { createCachedFetcher } from "@/lib/swrCachedFetcher";
import { useSearchParams } from "next/navigation";
import PropertyCard from '../PropertyCard';

// API BASE
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// Build dynamic search URL for real estate
const buildQuery = (companyId: string, params: URLSearchParams) => {
  const q = new URLSearchParams();

  q.set("companyId", companyId);

  // Supported search filters
  const filters = [
    "location",
    "minPrice",
    "maxPrice",
    "bedrooms",
    "bathrooms",
    "propertyType",
    "keywords",
    "limit",
    "page",
  ];

  filters.forEach((key) => {
    const value = params.get(key);
    if (value) q.set(key, value);
  });

  // return `${apiBaseUrl}/propertymanagement/search?${q.toString()}`; &flag=isOnOffe
  return `${apiBaseUrl}/site/productsByFlag?${q.toString()}&flag=isFeaturedListing`;
};

export default function FeaturedListingsWrapper({ companyId }: { companyId: string }) {
  const params = useSearchParams();

  // build dynamic URL with filters
  const url = buildQuery(companyId, params);

  // SWR cache keys
  const cacheKey = `listings-${companyId}`;
  const fallbackKey = `swr-cache:${cacheKey}:${url}`;
  const fetcher = createCachedFetcher(cacheKey);

  // Local fallback
  const fallbackData =
    typeof window !== "undefined"
      ? (() => {
          try {
            return JSON.parse(localStorage.getItem(fallbackKey) || "null");
          } catch {
            return null;
          }
        })()
      : null;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    fallbackData: fallbackData || undefined,
    revalidateOnFocus: true,
    dedupingInterval: 30000,
    refreshInterval: 120000,
  });

  // If backend responses wrap data
  const listings: MarketListingForm[] = data?.data || [];

  // Inject into your design
  return <FeaturedListings listings={listings} slug={companyId} isLoading={isLoading} error={error} />;
}

// --- Helper Functions and Icons (Kept mostly the same, but simplified for clarity) ---

const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal (Simplified and made slightly more modern)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
    },
  },
};

// Placeholder Icons (Cleaned up for brevity)
const BedIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-1.154.218-2.266.608-3.302A8.96 8.96 0 0 1 12 3.75c3.046 0 5.892 1.144 8.042 3.098A9 9 0 0 1 21.75 12h-2.25a6.75 6.75 0 0 0-13.5 0H2.25ZM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM21 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
const BathIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75h1.838zM17.864 12.35L14.004 15.2h6.299c.552 0 1.082-.149 1.55-.432a3.75 3.75 0 0 0-1.077-4.702M1.082 14.542A3.75 3.75 0 0 1 3.51 12.02l4.851-3.784a2.25 2.25 0 0 1 2.924-.764 2.25 2.25 0 0 1 .764 2.924l-3.784 4.851H1.082z" /><path strokeLinecap="round" strokeLinejoin="round" d="M18.75 12h.008v.008h-.008V12z" /></svg>);
const SquareFootIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-3.75h.008v.008H7.5v-.008Zm0 2.25h.008v.008H7.5V16.5Zm0 2.25h.008v.008H7.5V18.75Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25a.75.75 0 0 0-1.5 0v.562a49.168 49.168 0 0 1-3.478 1.197 50.554 50.554 0 0 0-1.5.124.75.75 0 0 0-.75.75v3.626a.75.75 0 0 0 .61.745c.386.065.779.117 1.17.155L12 12l2.695-1.84c.39-.038.783-.09 1.17-.155a.75.75 0 0 0 .61-.745V4.877a.75.75 0 0 0-.75-.75 2.25 2.25 0 0 0-.124-1.5 50.554 50.554 0 0 0-1.197-3.478V2.25Zm-4.25 10.25a.75.75 0 0 0-1.5 0v3.89a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75v-3.89Zm8.5 0a.75.75 0 0 0-1.5 0v3.89a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75v-3.89Z" /></svg>);
const LocationIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>);


// --- Main Component ---
function FeaturedListings({ listings, companyId }: any) {
  if (!listings || listings.length === 0) {
    return (
      <section className="bg-gray-50 dark:bg-gray-950 py-16 text-center text-gray-700 dark:text-gray-300">
        <p className="text-xl font-medium"></p>
      </section>
    );
  }

  return (
    <section id="listings" className="bg-gray-50 dark:bg-gray-950 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading: More impactful and clear */}
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-50 text-center mb-4 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-emerald-600 dark:text-emerald-400">Exclusive</span> Featured Listings
        </motion.h2>
        <motion.p
          className="text-xl text-gray-600 dark:text-gray-400 text-center mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Discover hand-picked properties chosen for their exceptional value and appeal.
        </motion.p>
        
        {/* Listings Grid: Refined gap and column sizing */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12" // Increased vertical gap for breathing room
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {listings.map((item: MarketListingForm, index: number) => (
            <PropertyCard key={`${item.id}-${index}`} item={item} itemVariants={itemVariants} customLoader={customLoader} />
          ))}
        </motion.div>

        {/* Optional: View All Listings Button */}
        {listings.length > 0 && (
          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <Link href={`/propertymanagement/listings`} passHref>
              <motion.a
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-amber-500 text-lg font-semibold rounded-full shadow-lg
                           text-amber-500 bg-white hover:bg-amber-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-amber-400 dark:border-amber-400
                           focus:outline-none focus:ring-4 focus:ring-amber-400/50 transition duration-300 ease-in-out transform hover:scale-[1.03]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="View all available property listings"
              >
                View All Listings
                <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
              </motion.a>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
