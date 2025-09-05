'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { MarketListingForm, StoreForm } from '@/types/typings';

// Loader for Next.js Image component
const imageLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Fallback data for a standalone preview
const defaultListings: MarketListingForm[] = [
  {
    id: '1',
    name: 'Consulting Session',
    description: 'A focused, one-on-one session to address your most pressing business challenges.',
    finalPrice: 250,
    duration: undefined,
    productCategoryId: '',
    subCategory: undefined,
    tags: [],
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    images: [],
    buyingPrice: 0,
    sellingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: '',
    status: 'ACTIVE',
    location: null
  },
  {
    id: '2',
    name: 'Webinar Series',
    description: 'Access to a five-part series on advanced strategic planning and business growth.',
    finalPrice: 50,
    // priceUnit: 'USD',
    // imageUrl: 'https://images.unsplash.com/photo-1596525997424-3453a479261a?q=80&w=2670&auto=format&fit=crop',
    
    duration: undefined,
    productCategoryId: '',
    subCategory: undefined,
    tags: [],
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    images: [],
    buyingPrice: 0,
    sellingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: '',
    status: 'ACTIVE',
    location: null
  },
  {
    id: '3',
    name: 'Ebook: Growth Blueprint',
    description: 'A comprehensive digital guide to scaling your business from the ground up.',
    finalPrice: 25,
    // priceUnit: 'USD',
    // imageUrl: 'https://images.unsplash.com/photo-1517457210740-420131464303?q=80&w=2670&auto=format&fit=crop',
    
    duration: undefined,
    productCategoryId: '',
    subCategory: undefined,
    tags: [],
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    images: [],
    buyingPrice: 0,
    sellingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: '',
    status: 'ACTIVE',
    location: null
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function MarketplaceListingsSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreForm };
  const {
    name,
    slug,
    themeSettings = {},
    marketplaceListings = [],
  } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const secondaryColor = themeSettings?.secondaryColor || '#10B981';

  const dynamicListings: MarketListingForm[] = Array.isArray(marketplaceListings) && marketplaceListings.length > 0
    ? marketplaceListings
    : defaultListings;

  if (dynamicListings.length === 0) {
    return null; // Don't render the section if there are no listings
  }

  return (
    <AnimatePresence>
      <section id="marketplace-listings" className="relative py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-950 overflow-hidden">
        {/* Dynamic Background Gradients */}
        <div
          className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 10% 20%, ${primaryColor}10, transparent 40%), radial-gradient(circle at 90% 80%, ${secondaryColor}10, transparent 40%)`,
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 drop-shadow-sm"
              variants={itemVariants}
            >
              Explore Our <span style={{ color: primaryColor }}>Marketplace</span>
            </motion.h2>
            <motion.p
              className="mt-4 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed"
              variants={itemVariants}
            >
              Discover individual products and digital resources designed to accelerate your growth.
            </motion.p>
          </motion.div>

          {/* Grid of Product Cards, now with portfolio styling */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {dynamicListings.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                className="relative group bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl transform transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative w-full aspect-video overflow-hidden">
                  <Image
                    src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop'}
                    loader={imageLoader}
                    alt={item.name}
                    fill
                    className="object-cover object-center transform transition-transform duration-500 ease-in-out group-hover:scale-110"
                  />
                </div>
                
                <div className="p-6 md:p-8">
                  {/* Tag to match portfolio style */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className="px-3 py-1 text-sm font-medium rounded-full"
                      style={{
                        backgroundColor: `${primaryColor}10`,
                        color: primaryColor,
                      }}
                    >
                      Marketplace
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                      {item.finalPrice}
                      {/* {item.priceUnit}$/ */}
                    </p>
                    <Link
                      href={`/${slug}/product/${item.id}`}
                      className="inline-flex items-center gap-2 text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-300 transform hover:scale-105"
                      style={{ backgroundColor: primaryColor, color: '#fff' }}
                    >
                      View Details
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}
