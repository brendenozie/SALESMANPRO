'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image'; // Import Image from next/image for optimization
import {
  HeartIcon,
  ShoppingBagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence for exit animations

// --- Dummy Data (Refined to be more realistic for a directory/listing context) ---
// Note: Changed "products" to "listings" for directory relevance.
// Added more descriptive image paths for clarity.
const listings = [
  {
    id: 1,
    businessName: 'Luxe Fashion Boutique',
    title: 'Elegant Handbag Collection',
    category: 'Fashion & Apparel',
    price: '$500',
    img: '/images/listing-fashion-bag1.webp', // Updated image path
    rating: 4,
    description: 'Discover our latest collection of handcrafted leather bags, perfect for any occasion. Elegance meets functionality.',
  },
  {
    id: 2,
    businessName: 'Green Eats Cafe',
    title: 'Organic Smoothie Bar',
    category: 'Food & Drink',
    price: '$12',
    img: '/images/listing-cafe-smoothie.webp', // Updated image path
    tags: ['New', 'Healthy'],
    rating: 5,
    description: 'Freshly blended organic smoothies made with local ingredients. A perfect healthy boost for your day!',
  },
  {
    id: 3,
    businessName: 'Urban Oasis Spa',
    title: 'Relaxing Massage Therapy',
    category: 'Health & Wellness',
    price: '$99',
    img: '/images/listing-spa-massage.webp', // Updated image path
    tags: ['Limited Offer'],
    rating: 3,
    description: 'Unwind with our signature deep tissue massage. Rejuvenate your mind and body in a serene atmosphere.',
  },
  {
    id: 4,
    businessName: 'Tech Innovations Store',
    title: 'Smart Home Devices',
    category: 'Electronics',
    price: '$150',
    img: '/images/listing-tech-gadgets.webp', // Updated image path
    tags: ['Popular'],
    rating: 4,
    description: 'Transform your home into a smart haven with our latest range of intuitive and energy-efficient devices.',
  },
  {
    id: 5,
    businessName: 'Artistic Hub Studio',
    title: 'Beginner Art Classes',
    category: 'Education & Hobbies',
    price: '$75',
    img: '/images/listing-art-classes.webp', // Updated image path
    tags: ['Enroll Now'],
    rating: 5,
    description: 'Unleash your creativity! Fun and engaging art classes for all skill levels, taught by professional artists.',
  },
  {
    id: 6,
    businessName: 'Pet Paradise Grooming',
    title: 'Professional Pet Grooming',
    category: 'Pet Services',
    price: '$60',
    img: '/images/listing-pet-grooming.webp', // Updated image path
    tags: ['Local Favorite'],
    rating: 4,
    description: 'Pamper your furry friend with our expert grooming services. We ensure a stress-free and sparkling clean experience.',
  },
  {
    id: 7,
    businessName: 'The Book Nook',
    title: 'Rare First Edition Books',
    category: 'Books & Literature',
    price: '$200',
    img: '/images/listing-books-rare.webp', // Updated image path
    tags: ['Collector\'s Item'],
    rating: 5,
    description: 'Explore our curated collection of rare and antique books. A treasure trove for every bibliophile.',
  },
  // Added more diverse categories to reflect a directory site
  {
    id: 8,
    businessName: 'FitZone Gym',
    title: 'Personal Training Sessions',
    category: 'Sports & Fitness',
    price: '$70/hr',
    img: '/images/listing-gym-training.webp',
    rating: 4,
    description: 'Achieve your fitness goals with our certified personal trainers. Customized plans for all levels.',
  },
  {
    id: 9,
    businessName: 'Sweet Tooth Bakery',
    title: 'Artisan Cupcake Dozen',
    category: 'Food & Drink',
    price: '$35',
    img: '/images/listing-bakery-cupcakes.webp',
    tags: ['Fresh Daily'],
    rating: 5,
    description: 'Indulge in our delicious, freshly baked artisan cupcakes. Perfect for celebrations or a sweet treat.',
  },
];

// Optimized image loader for Next.js Image component
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Rating component for cleaner code
const RatingStars: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="flex items-center space-x-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < count ? (
          <StarSolid key={i} className="h-4 w-4 text-yellow-500" /> // Brighter yellow
        ) : (
          <StarIcon key={i} className="h-4 w-4 text-gray-300" />
        )
      )}
    </div>
  );
};

export default function FeaturedListingsSection() { // Renamed for better context
  const containerRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null); // Changed to selectedListing

  // State to track scroll position for button visibility/opacity
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Effect to update scroll button visibility
  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current) {
        setCanScrollLeft(containerRef.current.scrollLeft > 0);
        setCanScrollRight(
          containerRef.current.scrollLeft <
            containerRef.current.scrollWidth - containerRef.current.clientWidth
        );
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', checkScroll);
      checkScroll(); // Initial check
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', checkScroll);
      }
    };
  }, [listings]); // Depend on listings to re-check if data changes

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const scrollAmount = containerRef.current.clientWidth * 0.8; // Scroll 80% of current view
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleAddToCart = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500); // Slightly longer toast display
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Discover What's <span className="text-orange-500">New & Trending</span>
          </h2>
          <div className="flex space-x-3">
            <motion.button
              onClick={() => scroll('left')}
              className={`p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-x-0.5 ${canScrollLeft ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </motion.button>
            <motion.button
              onClick={() => scroll('right')}
              className={`p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-x-0.5 ${canScrollRight ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </motion.button>
          </div>
        </div>

        {/* Listings Carousel */}
        <div
          ref={containerRef}
          className="flex space-x-6 pb-6 overflow-x-auto custom-scrollbar scroll-snap-x snap-mandatory" // Custom scrollbar and snap
        >
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative group flex-shrink-0 snap-center border border-gray-100 dark:border-gray-700" // Elevated card design
              whileHover={{ y: -5 }} // Subtle lift on hover
            >
              {/* Top Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors text-gray-500 hover:text-red-500"
                  aria-label="Add to Favorites"
                >
                  <HeartIcon className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddToCart}
                  className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors text-gray-500 hover:text-green-600"
                  aria-label="Add to Cart"
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Tags/Badges */}
              {(listing.tags?.length ?? 0) > 0 && (
                <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {listing.tags?.[0]}
                </span>
              )}

              {/* Image */}
              <div className="relative w-full h-52 sm:h-60 rounded-t-3xl overflow-hidden cursor-pointer" onClick={() => setSelectedListing(listing)}>
                <Image
                  src={listing.img}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105" // Zoom on hover
                  loader={customLoader}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">{listing.businessName}</p>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mt-1 leading-tight">{listing.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{listing.category}</p>
                  <RatingStars count={listing.rating} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-extrabold text-xl text-gray-900 dark:text-white">{listing.price}</span>
                  <button
                    onClick={() => setSelectedListing(listing)} // View details button
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors duration-200 shadow-md"
                    aria-label={`View details for ${listing.title}`}
                  >
                    View Details
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast &&
          createPortal(
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center space-x-2"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              <span>Item added to cart!</span>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>

      {/* Modal / Quick View */}
      <AnimatePresence>
        {selectedListing &&
          createPortal(
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedListing(null)} // Close on overlay click
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
                className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl flex flex-col md:flex-row gap-6"
              >
                <button
                  onClick={() => setSelectedListing(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2 rounded-full bg-gray-100 dark:bg-gray-700 transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                <div className="flex-shrink-0 w-full md:w-1/2 relative h-60 md:h-auto rounded-xl overflow-hidden">
                  <Image
                    src={selectedListing.img}
                    alt={selectedListing.title}
                    fill
                    className="object-cover"
                    loader={customLoader}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">{selectedListing.businessName}</p>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{selectedListing.title}</h2>
                  <p className="text-md text-gray-600 dark:text-gray-300 mb-2">{selectedListing.category}</p>
                  <RatingStars count={selectedListing.rating} />
                  <p className="mt-4 text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{selectedListing.description}</p>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{selectedListing.price}</span>
                    <button
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-base font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={() => {
                        handleAddToCart();
                        setSelectedListing(null);
                      }}
                    >
                      <ShoppingBagIcon className="h-5 w-5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>
    </section>
  );
}