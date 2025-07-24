'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
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
import { motion, AnimatePresence } from 'framer-motion';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type ProductForListing = {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  color?: string[];
  size?: string[];
};

export type MarketplaceListing = {
  id: string;
  title: string; // Used for the listing's main title
  name: string; // Used for the business name
  description?: string; // Listing-specific description
  finalPrice: number; // Numeric price
  images: string[]; // Array of image URLs
  isAvailable: boolean;
  isFeatured: boolean; // Can be used for tags
  product?: ProductForListing; // Nested product details
  // Add other fields from your MarketplaceListing model if relevant for display
};

export type StoreForm = {
  marketplaceListings?: MarketplaceListing[];
  // Add other relevant StoreForm fields if needed
  currency?: string; // From transformCompanyToStoreForm
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
const useStoreContext = () => ({
  storeFormData: {
    marketplaceListings: [
      {
        id: 'listing-1',
        name: 'Luxe Fashion Boutique', // Business Name
        title: 'Elegant Handbag Collection', // Listing Title
        description: 'Discover our latest collection of handcrafted leather bags, perfect for any occasion. Elegance meets functionality.',
        finalPrice: 500.00,
        images: ['https://images.unsplash.com/photo-1588117765119-9403330601f0?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        isAvailable: true,
        isFeatured: true, // Will be used as a tag
        product: {
          id: 'prod-bag-1',
          name: 'Handbag',
          description: 'High-quality leather handbag.',
        },
      },
      {
        id: 'listing-2',
        name: 'Green Eats Cafe',
        title: 'Organic Smoothie Bar',
        description: 'Freshly blended organic smoothies made with local ingredients. A perfect healthy boost for your day!',
        finalPrice: 12.00,
        images: ['https://images.unsplash.com/photo-1612443429399-ea16bb1c2c2f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        isAvailable: true,
        isFeatured: false,
        product: {
          id: 'prod-smoothie-1',
          name: 'Green Smoothie',
        },
      },
      {
        id: 'listing-3',
        name: 'Urban Oasis Spa',
        title: 'Relaxing Massage Therapy',
        description: 'Unwind with our signature deep tissue massage. Rejuvenate your mind and body in a serene atmosphere.',
        finalPrice: 99.00,
        images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d88f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        isAvailable: true,
        isFeatured: true,
        product: {
          id: 'prod-massage-1',
          name: 'Deep Tissue Massage',
        },
      },
      {
        id: 'listing-4',
        name: 'Tech Innovations Store',
        title: 'Smart Home Devices',
        description: 'Transform your home into a smart haven with our latest range of intuitive and energy-efficient devices.',
        finalPrice: 150.00,
        images: ['https://images.unsplash.com/photo-1593642532781-0393ee809550?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        isAvailable: true,
        isFeatured: false,
        product: {
          id: 'prod-smarthome-1',
          name: 'Smart Hub',
        },
      },
      {
        id: 'listing-5',
        name: 'Artistic Hub Studio',
        title: 'Beginner Art Classes',
        description: 'Unleash your creativity! Fun and engaging art classes for all skill levels, taught by professional artists.',
        finalPrice: 75.00,
        images: ['https://images.unsplash.com/photo-1513506003901-ad169460c11f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        isAvailable: true,
        isFeatured: true,
        product: {
          id: 'prod-artclass-1',
          name: 'Painting Basics',
        },
      },
      {
        id: 'listing-6',
        name: 'Pet Paradise Grooming',
        title: 'Professional Pet Grooming',
        description: 'Pamper your furry friend with our expert grooming services. We ensure a stress-free and sparkling clean experience.',
        finalPrice: 60.00,
        images: ['https://images.unsplash.com/photo-1583511657519-c09e39066601?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        isAvailable: true,
        isFeatured: false,
        product: {
          id: 'prod-petgroom-1',
          name: 'Full Grooming Package',
        },
      },
    ],
    currency: 'KES', // Example currency
  } as StoreForm,
});

// Optimized image loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Static fallback data (matches the structure we'll use for rendering)
const fallbackListings = [
  {
    id: 'fallback-1',
    businessName: 'Local Coffee Shop',
    title: 'Artisan Coffee Beans',
    category: 'Food & Drink',
    price: 'KES 2500',
    img: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Coffee+Beans',
    rating: 5,
    description: 'Premium roasted coffee beans from local farms. Perfect for your morning brew.',
    tags: ['New Arrival'],
  },
  {
    id: 'fallback-2',
    businessName: 'Community Bookstore',
    title: 'Bestselling Novels',
    category: 'Books & Literature',
    price: 'KES 1200',
    img: 'https://placehold.co/600x400/EF4444/FFFFFF?text=Books',
    rating: 4,
    description: 'Explore a wide range of bestselling novels and classic literature.',
    tags: ['Popular'],
  },
  {
    id: 'fallback-3',
    businessName: 'City Auto Repair',
    title: 'Full Vehicle Service',
    category: 'Automotive',
    price: 'KES 8000',
    img: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=Car+Service',
    rating: 4,
    description: 'Comprehensive service for all vehicle types, ensuring safety and performance.',
    tags: [],
  },
  {
    id: 'fallback-4',
    businessName: 'Healthy Living Pharmacy',
    title: 'Vitamins & Supplements',
    category: 'Health & Wellness',
    price: 'KES 1500',
    img: 'https://placehold.co/600x400/10B981/FFFFFF?text=Vitamins',
    rating: 5,
    description: 'Boost your well-being with our high-quality vitamins and dietary supplements.',
    tags: ['New'],
  },
  {
    id: 'fallback-5',
    businessName: 'Kids Play Zone',
    title: 'Indoor Playground Access',
    category: 'Entertainment',
    price: 'KES 500/hr',
    img: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Playground',
    rating: 4,
    description: 'A fun and safe indoor environment for kids to play and explore.',
    tags: ['Family Friendly'],
  },
  {
    id: 'fallback-6',
    businessName: 'Home Decor Studio',
    title: 'Custom Furniture Design',
    category: 'Home & Living',
    price: 'KES 50000',
    img: 'https://placehold.co/600x400/EC4899/FFFFFF?text=Furniture',
    rating: 5,
    description: 'Bespoke furniture designs to perfectly fit your home and style.',
    tags: ['Premium'],
  },
];

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

export default function NewArrivalsSection() { // Renamed for better context
  const containerRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null); // Changed to selectedListing

  // Destructure storeFormData from context
  const { storeFormData } = useStoreContext() || {};
  const { marketplaceListings: dynamicListings, currency = 'KES' } = storeFormData || {};

  // Map dynamic listings to the display format, or use fallback data
  const listingsToDisplay = Array.isArray(dynamicListings) && dynamicListings.length > 0
    ? dynamicListings.map(listing => ({
        id: listing.id,
        businessName: listing.name, // Use 'name' from MarketplaceListing for business name
        title: listing.title, // Use 'title' from MarketplaceListing for listing title
        category: 'General Category', // Placeholder: You might need to add a 'category' field to MarketplaceListing or derive it
        price: `${currency} ${listing.finalPrice.toLocaleString()}`, // Format price with currency
        img: listing.images?.[0] || 'https://placehold.co/600x400/CCCCCC/333333?text=No+Image', // First image or fallback
        rating: 4, // Placeholder: You might need to add a 'rating' field to MarketplaceListing
        description: listing.description || listing.product?.description || 'No description available.',
        tags: listing.isFeatured ? ['Featured'] : [], // Example: Use isFeatured as a tag
      }))
    : fallbackListings; // Use static fallback listings

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
  }, [listingsToDisplay]); // Depend on listingsToDisplay to re-check if data changes

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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevents infinite loop if placeholder also fails
    e.currentTarget.src = 'https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found'; // Generic placeholder
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
          {listingsToDisplay.map((listing) => (
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
                  loader={loader}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={handleImageError} // Image error fallback
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
                onClick={(e:any) => e.stopPropagation()} // Prevent closing modal when clicking inside
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
                    loader={loader}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={handleImageError} // Image error fallback
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
