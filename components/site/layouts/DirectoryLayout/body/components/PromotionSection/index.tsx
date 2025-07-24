'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx'; // Utility for conditional class names

// Define the structure of a single promotion as it comes from StoreForm
export type Promotion = {
  id: string;
  code?: string; // Could be used as a label/badge
  title: string;
  description?: string;
  startsAt?: string; // ISO string date
  endsAt?: string; // ISO string date
  bannerUrl?: string; // This will be the image source
  ctaText?: string; // Assuming you might add this to your Promotion model
  ctaLink?: string; // Assuming you might add this to your Promotion model
};

// Define the relevant parts of StoreForm that PromotionSection uses
export type StoreForm = {
  promotions?: Promotion[]; // Array of Promotion objects
  // Add other theme settings if needed, e.g., primaryColor, secondaryColor
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import and ensure
// your StoreContext provides data conforming to the StoreForm type,
// including an array of 'promotions'.
const useStoreContext = () => ({
  storeFormData: {
    promotions: [
      {
        id: 'promo-summer-clearance',
        code: 'SUMMER SAVINGS',
        title: 'Up to 50% Off Everything!',
        description: 'Refresh your wardrobe with our hottest deals. Limited stock available.',
        bannerUrl: 'https://images.unsplash.com/photo-1588117765119-9403330601f0?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        ctaText: 'Shop Summer Deals',
        ctaLink: '/shop/summer-clearance',
        startsAt: '2024-07-01T00:00:00Z',
        endsAt: '2024-08-31T23:59:59Z',
      },
      {
        id: 'promo-winter-collection',
        code: 'NEW ARRIVALS',
        title: 'Cozy Winter Collection',
        description: 'Embrace the cold in style with our latest collection of warm essentials.',
        bannerUrl: 'https://images.unsplash.com/photo-1612443429399-ea16bb1c2c2f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        ctaText: 'Explore Winter Styles',
        ctaLink: '/shop/winter-collection',
        startsAt: '2024-09-01T00:00:00Z',
        endsAt: '2024-11-30T23:59:59Z',
      },
      // Add more dynamic promotions here if needed
    ],
  } as StoreForm, // Cast to StoreForm for type safety in mock
});

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Static fallback data for banners (matches the structure we'll use for rendering)
const fallbackBanners = [
  {
    id: 'fallback-summer-clearance',
    label: 'SUMMER SAVINGS',
    title: 'Up to 50% Off Everything!',
    description: 'Refresh your wardrobe with our hottest deals. Limited stock available.',
    imgSrc: 'https://images.unsplash.com/photo-1588117765119-9403330601f0?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bgClass: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900',
    imgPosition: 'right',
    ctaText: 'Shop Summer Deals',
    ctaLink: '/shop/summer-clearance',
  },
  {
    id: 'fallback-winter-collection',
    label: 'NEW ARRIVALS',
    title: 'Cozy Winter Collection',
    description: 'Embrace the cold in style with our latest collection of warm essentials.',
    imgSrc: 'https://images.unsplash.com/photo-1612443429399-ea16bb1c2c2f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bgClass: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900',
    imgPosition: 'left',
    ctaText: 'Explore Winter Styles',
    ctaLink: '/shop/winter-collection',
  },
];


// Animation variants for the whole section
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      when: "beforeChildren", // Ensures parent animation completes before children
      staggerChildren: 0.2, // Stagger effect for individual banners
    },
  },
};

// Animation variants for individual banner cards
const bannerCardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function PromotionSection() {
  // Destructure storeFormData from context, providing a fallback for when context is not available
  const { storeFormData } = useStoreContext() || {};
  const { promotions: dynamicPromotions } = storeFormData || {};

  // Determine which banners to render: dynamic or fallback
  const bannersToRender = Array.isArray(dynamicPromotions) && dynamicPromotions.length > 0
    ? dynamicPromotions.map((promo, idx) => ({
        id: promo.id,
        label: promo.code || 'PROMOTION', // Use 'code' as label, fallback to 'PROMOTION'
        title: promo.title,
        description: promo.description || '',
        imgSrc: promo.bannerUrl || 'https://placehold.co/600x400/CCCCCC/333333?text=Promotion+Image', // Fallback image
        // Assign alternating background classes and image positions
        bgClass: idx % 2 === 0 
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900',
        imgPosition: idx % 2 === 0 ? 'right' : 'left', // Alternate image position
        ctaText: promo.ctaText || 'Learn More', // Fallback CTA text
        ctaLink: promo.ctaLink || '#', // Fallback CTA link
      }))
    : fallbackBanners; // Use static fallback banners

  // Function to handle image loading errors, replacing with a generic placeholder
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevents infinite loop if placeholder also fails
    e.currentTarget.src = 'https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found'; // Generic placeholder
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }} // Trigger animation when 30% of section is in view
      variants={sectionVariants}
      className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50 dark:bg-gray-950 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
            Limited-Time Offers You Can't Miss! 🔥
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover exclusive discounts and new collections. Shop smart, save big.
          </p>
        </motion.div>

        {/* Banners Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {bannersToRender.map((banner) => (
            <motion.div
              key={banner.id}
              variants={bannerCardVariants}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={clsx(
                `relative flex items-center rounded-3xl shadow-xl overflow-hidden transition-transform transform cursor-pointer group`,
                banner.bgClass,
                banner.imgPosition === 'right' ? 'flex-row' : 'flex-row-reverse'
              )}
            >
              {/* Text Content */}
              <div className="w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-center z-10 text-gray-900 dark:text-gray-100">
                <p className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-gray-700 dark:text-gray-300 mb-2">
                  {banner.label}
                </p>
                <h3 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
                  {banner.title}
                </h3>
                <p className="mt-3 text-sm md:text-base text-gray-600 dark:text-gray-400">
                  {banner.description}
                </p>
                <Link href={banner.ctaLink} passHref>
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#1D4ED8", color: "#FFFFFF" }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-7 inline-flex items-center justify-center px-7 py-3 text-sm font-bold bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform"
                  >
                    {banner.ctaText}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </motion.button>
                </Link>
              </div>

              {/* Image Block */}
              <div className="w-1/2 h-full relative">
                <Image
                  src={banner.imgSrc}
                  alt={banner.title}
                  fill // Use fill instead of layout="fill" for Next.js 13+
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimize image loading
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  loader={loader} // Use the defined loader
                  onError={handleImageError} // Image error fallback
                />
                {/* Subtle overlay for visual depth and dark mode text readability */}
                <div className="absolute inset-0 bg-black opacity-10 group-hover:opacity-0 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
