'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLongRightIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { MarketListingForm, StoreForm } from '@/types/typings';
import BookingFormModal from '../BookingFormModal';

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

interface MarketplaceListingsSectionProps {
    name: string | undefined | null;
    slug: string | undefined | null;
    themeSettings: { 
      primaryColor?: string; 
      secondaryColor?: string; 
    } | undefined | null;
    marketplaceListings: MarketListingForm[] | undefined | null;
  }


export default function MarketplaceListingsSection({ name, slug, themeSettings, marketplaceListings }: MarketplaceListingsSectionProps) {
  const [activeService, setActiveService] = useState<MarketListingForm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
    

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
      <section id="services" className="relative py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-950 overflow-hidden">
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
                        {/* Tagline */}
                        <motion.p
                            className="text-lg font-bold uppercase tracking-widest mb-3"
                            style={{ color: primaryColor }}
                            variants={itemVariants}
                        >
                            Digital Resources & Expertise
                        </motion.p>
                        
                        {/* Main Headline */}
                        <motion.h2
                            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-4 drop-shadow-sm"
                            variants={itemVariants}
                        >
                            Explore Our <span style={{ color: primaryColor }}>{name || 'Marketplace'}</span>
                        </motion.h2>
                        
                        {/* Sub-description */}
                        <motion.p
                            className="mt-6 text-gray-600 max-w-4xl mx-auto text-xl md:text-2xl leading-relaxed"
                            variants={itemVariants}
                        >
                            Discover individual products, courses, and tailored services designed to provide immediate, actionable value.
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
                    <button
                      onClick={() => {
                        setActiveService(item);
                        setIsModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-300 transform hover:scale-105"
                      style={{ backgroundColor: primaryColor, color: '#fff' }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- BOOKING MODAL (Reusing the detailed split modal) --- */}
                  <AnimatePresence>
                      {isModalOpen && activeService && (
                          <motion.div
                              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                          >
                              <div 
                                  onClick={() => setIsModalOpen(false)}
                                  className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl transition-opacity"
                              />
      
                              <motion.div
                                  layoutId="booking-modal"
                                  initial={{ scale: 0.95, y: 30 }}
                                  animate={{ scale: 1, y: 0 }}
                                  exit={{ scale: 0.95, y: 30 }}
                                  className="relative w-full max-w-6xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                              >
                                   {/* Close Button */}
                                  <button 
                                     onClick={() => setIsModalOpen(false)}
                                     className="absolute top-4 right-4 z-30 p-2 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-all"
                                  >
                                      <ArrowLongRightIcon className="w-6 h-6 text-gray-900 dark:text-white transform rotate-90" />
                                  </button>
      
                                  {/* Left Column: Details & Diagram */}
                                  <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{activeService.name}</h2>
                                      <p className="text-gray-600 dark:text-gray-300 mb-8">{activeService.description || "Detailed description of service."}</p>
      
                                      {/* INSTRUCTIONAL DIAGRAM SECTION */}
                                      <div className="mb-8 p-6 rounded-2xl border bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                                          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                              <ArrowLongRightIcon className="w-4 h-4" /> **The Service Workflow**
                                          </h4>
                                          <div className="relative w-full aspect-[2.5/1] bg-white dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                                              
                                              <Image
                                                  src={ activeService.images?.[0] || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80"}
                                                  alt="Service Workflow Diagram"
                                                  loader={imageLoader}
                                                  fill
                                                  className="object-contain"
                                              />
      
      
                                          </div>
                                          <p className="text-xs text-center text-gray-400 mt-2">
                                              Clear milestones: <span className="font-semibold">Consult </span>→ Plan → Execute → Review.
                                          </p>
                                      </div>
                                      
                                      <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                                           {["Premium Quality", "Dedicated Team", "Satisfaction Guarantee"].map(feature => (
                                              <div key={feature} className="flex items-center gap-2">
                                                  <CheckCircleIcon className="w-5 h-5 text-green-500" /> {feature}
                                              </div>
                                           ))}
                                      </div>
                                  </div>
      
                                  {/* Right Column: Booking Form */}
                                  <div className="w-full md:w-5/12 bg-gray-50 dark:bg-gray-800 border-l border-gray-100 dark:border-gray-700 flex flex-col">
                                      <div className="p-8 md:p-12 flex-1 overflow-y-auto">
                                          <div className="mb-8">
                                              <p className="text-sm text-gray-500 font-medium">Total Estimation</p>
                                              <p className="text-4xl font-serif font-bold text-gray-900 dark:text-white" style={{ color: primaryColor }}>
                                                  {(activeService.finalPrice ?? 0).toFixed(2)}
                                              </p>
                                          </div>
                                          <BookingFormModal service={activeService} />
                                      </div>
                                  </div>
                              </motion.div>
                          </motion.div>
                      )}
                  </AnimatePresence>
    </AnimatePresence>
  );
}
