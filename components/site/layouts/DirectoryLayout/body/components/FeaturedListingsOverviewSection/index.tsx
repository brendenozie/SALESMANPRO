'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ShoppingBagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MapPinIcon,
  StarIcon as StarOutline // Outline star for ratings
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'; // Solid star for ratings
import { createPortal } from 'react-dom';
import { useStoreContext } from '@/contexts/StoreContext';

// Assuming useStoreContext is available and provides storeFormData
// import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type ProductForListing = {
  id: string;
  name: string;
  description?: string;
  brand?: string; // Can be used for subtitle
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
  // Assuming a 'location' field might be added to MarketplaceListing or derived
  location?: string;
  // Assuming a 'rating' might be added or calculated
  rating?: number;
};

export type StoreForm = {
  slug?: string; // For the base path of the site
  marketplaceListings?: MarketplaceListing[];
  currency?: string; // From transformCompanyToStoreForm
  // Add other relevant StoreForm fields if needed
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     slug: 'my-directory-site', // Example slug for the site
//     currency: 'KES', // Example currency
//     marketplaceListings: [
//       {
//         id: 'listing-1',
//         name: 'The Gourmet Plate Bistro', // Business Name
//         title: 'Exquisite Dining Experience', // Listing Title
//         description: 'Discover our latest collection of handcrafted leather bags, perfect for any occasion. Elegance meets functionality.',
//         finalPrice: 500.00,
//         images: ['https://images.unsplash.com/photo-1588117765119-9403330601f0?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
//         isAvailable: true,
//         isFeatured: true,
//         location: 'Westlands, Nairobi', // Example location
//         rating: 5, // Example rating
//         product: {
//           id: 'prod-1',
//           name: 'Handbag',
//           description: 'High-quality leather handbag.',
//           brand: 'Luxe Fashion', // Example brand for subtitle
//         },
//       },
//       {
//         id: 'listing-2',
//         name: 'Serenity Spa & Wellness',
//         title: 'Ultimate Relaxation Package',
//         description: 'Unwind with our signature deep tissue massage. Rejuvenate your mind and body in a serene atmosphere.',
//         finalPrice: 99.00,
//         images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d88f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
//         isAvailable: true,
//         isFeatured: false,
//         location: 'Karen, Nairobi',
//         rating: 4,
//         product: {
//           id: 'prod-2',
//           name: 'Massage Therapy',
//           brand: 'Urban Oasis',
//         },
//       },
//       {
//         id: 'listing-3',
//         name: 'Tech Haven Electronics',
//         title: 'Cutting-Edge Smart Devices',
//         description: 'Transform your home into a smart haven with our latest range of intuitive and energy-efficient devices.',
//         finalPrice: 150.00,
//         images: ['https://images.unsplash.com/photo-1593642532781-0393ee809550?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
//         isAvailable: true,
//         isFeatured: true,
//         location: 'Upper Hill, Nairobi',
//         rating: 4,
//         product: {
//           id: 'prod-3',
//           name: 'Smart Home Hub',
//           brand: 'Innovate Tech',
//         },
//       },
//       {
//         id: 'listing-4',
//         name: 'Urban Greens Nursery',
//         title: 'Premium Plant Selection',
//         description: 'Plants, Tools & Landscaping services for your urban garden.',
//         finalPrice: 75.00,
//         images: ['https://images.unsplash.com/photo-1513506003901-ad169460c11f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
//         isAvailable: true,
//         isFeatured: false,
//         location: 'Lavington, Nairobi',
//         rating: 3,
//         product: {
//           id: 'prod-4',
//           name: 'Indoor Plants',
//           brand: 'Green Thumb',
//         },
//       },
//       {
//         id: 'listing-5',
//         name: 'Safari Adventures Kenya',
//         title: 'Unforgettable Wildlife Safaris',
//         description: 'Wildlife Tours & Safaris across Kenya\'s best national parks.',
//         finalPrice: 1200.00,
//         images: ['https://images.unsplash.com/photo-1583511657519-c09e39066601?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
//         isAvailable: true,
//         isFeatured: true,
//         location: 'Langata, Nairobi',
//         rating: 5,
//         product: {
//           id: 'prod-5',
//           name: 'Safari Package',
//           brand: 'Wild Expeditions',
//         },
//       },
//       {
//         id: 'listing-6',
//         name: 'Crafted Cuppa Coffee Shop',
//         title: 'Artisan Coffee & Pastries',
//         description: 'Enjoy freshly brewed coffee and delicious pastries in a cozy atmosphere.',
//         finalPrice: 15.00,
//         images: ['https://images.unsplash.com/photo-1507146153580-6c02061bc4a6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
//         isAvailable: true,
//         isFeatured: false,
//         location: 'Gigiri, Nairobi',
//         rating: 4,
//         product: {
//           id: 'prod-6',
//           name: 'Coffee Blend',
//           brand: 'Cupping Masters',
//         },
//       },
//     ],
//   } as StoreForm,
// });

// Optimized image loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Static fallback data (matches the structure we'll use for rendering)
interface FallbackListingItem {
  id: string;
  name: string;
  subtitle?: string;
  location?: any;
  rating?: number;
  imageUrl: string;
  slug: string;
  tags?: string[];
}

const fallbackListings: FallbackListingItem[] = [
  {
    id: 'fallback-1',
    name: 'The Gourmet Plate Bistro',
    subtitle: 'Fine Dining & Catering',
    location: 'Westlands, Nairobi',
    rating: 5,
    imageUrl: 'https://placehold.co/600x400/22C55E/FFFFFF?text=Restaurant',
    slug: 'the-gourmet-plate-bistro',
    tags: ['New Arrival', 'Reservations Recommended'],
  },
  {
    id: 'fallback-2',
    name: 'Serenity Spa & Wellness',
    subtitle: 'Relaxation & Therapeutic Services',
    location: 'Karen, Nairobi',
    rating: 4,
    imageUrl: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=Spa',
    slug: 'serenity-spa-wellness',
    tags: ['Exclusive Offer'],
  },
  {
    id: 'fallback-3',
    name: 'Tech Haven Electronics',
    subtitle: 'Gadgets & Repairs',
    location: 'Upper Hill, Nairobi',
    rating: 4,
    imageUrl: 'https://placehold.co/600x400/EC4899/FFFFFF?text=Electronics',
    slug: 'tech-haven-electronics',
    tags: ['Top Rated'],
  },
  {
    id: 'fallback-4',
    name: 'Urban Greens Nursery',
    subtitle: 'Plants, Tools & Landscaping',
    location: 'Lavington, Nairobi',
    rating: 3,
    imageUrl: 'https://placehold.co/600x400/F97316/FFFFFF?text=Nursery',
    slug: 'urban-greens-nursery',
    tags: ['Eco-Friendly'],
  },
  {
    id: 'fallback-5',
    name: 'Safari Adventures Kenya',
    subtitle: 'Wildlife Tours & Safaris',
    location: 'Langata, Nairobi',
    rating: 5,
    imageUrl: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Safari',
    slug: 'safari-adventures-kenya',
    tags: ['Best of Kenya'],
  },
  {
    id: 'fallback-6',
    name: 'Crafted Cuppa Coffee Shop',
    subtitle: 'Artisan Coffee & Pastries',
    location: 'Gigiri, Nairobi',
    rating: 4,
    imageUrl: 'https://placehold.co/600x400/10B981/FFFFFF?text=Coffee+Shop',
    slug: 'crafted-cuppa-coffee-shop',
    tags: ['Cozy Atmosphere'],
  },
];

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

// ListingGrid component (kept separate for modularity)
interface ListingGridProps {
  listings: FallbackListingItem[]; // Use the transformed/fallback type here
  baseSlug: string; // Base slug for the site (e.g., 'your-site-name')
}

function ListingGrid({ listings, baseSlug }: ListingGridProps) {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null); // State for modal quick view

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

    const currentRef = containerRef.current; // Capture current ref
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScroll);
      checkScroll(); // Initial check
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScroll);
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
    // This is a placeholder for adding to cart functionality
    // In a directory context, this might be "Add to Favorites" or "Contact Business"
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
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
          className="flex space-x-6 pb-6 overflow-x-auto custom-scrollbar scroll-snap-x snap-mandatory"
        >
          {listings.map((item:any) => (
            <motion.div
              key={item.id}
              className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative group flex-shrink-0 snap-center border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5 }}
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
              {(item.tags?.length ?? 0) > 0 && (
                <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {item.tags?.[0]}
                </span>
              )}

              {/* Image */}
              <div className="relative w-full h-52 sm:h-60 rounded-t-3xl overflow-hidden cursor-pointer" onClick={() => setSelectedListing(item)}>
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loader={loader}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={handleImageError}
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">{item.name}</p> {/* Using item.name for business name */}
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mt-1 leading-tight">{item.title}</h3> {/* Using item.title for listing title */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{item.subtitle}</p> {/* Using item.subtitle for category/subtitle */}
                  {item.location && (
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                      <MapPinIcon className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{item.location}</span>
                    </div>
                  )}
                  {item.rating !== undefined && (
                    <div className="pt-1">{renderStars(item.rating)}</div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {/* Price is not directly available in this section's mock/schema, using a placeholder */}
                  {/* <span className="font-extrabold text-xl text-gray-900 dark:text-white">View Details</span> 
                  <button
                    onClick={() => setSelectedListing(item)}
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors duration-200 shadow-md"
                    aria-label={`View details for ${item.title}`}
                  >
                    View Details
                    <ChevronRightIcon className="h-4 w-4" />
                  </button> */}
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
              onClick={() => setSelectedListing(null)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={(e:any) => e.stopPropagation()}
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
                    src={selectedListing.imageUrl} // Use imageUrl from the transformed data
                    alt={selectedListing.name}
                    fill
                    className="object-cover"
                    loader={loader}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={handleImageError}
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">{selectedListing.name}</p>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{selectedListing.title}</h2>
                  <p className="text-md text-gray-600 dark:text-gray-300 mb-2">{selectedListing.subtitle}</p>
                  {selectedListing.rating !== undefined && (
                    <div className="pt-1">{renderStars(selectedListing.rating)}</div>
                  )}
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

// Parent component that uses ListingGrid
export default function FeaturedListingsOverviewSection() {
  const router = useRouter();
  // Assuming useStoreContext is available and provides storeFormData
  const { storeFormData } = useStoreContext();

  // Use dynamic listings from storeFormData, or fallback if not available
  const dynamicListings = storeFormData?.marketplaceListings || [];
  const currency = storeFormData?.currency || 'KES'; // Default currency

  // Transform dynamic listings to the format expected by ListingGrid
  const transformedListings = dynamicListings.map(listing => ({
    id: listing.id,
    name: listing.name, // Business name
    title: listing.name, // Listing title
    subtitle: listing.category?.brand || 'Service/Product', // Using brand as subtitle, or generic
    location: listing.location || 'Nairobi, Kenya', // Placeholder if not in schema
    rating:  Math.floor(Math.random() * 3) + 3, // listing.rating || Random rating 3-5 if not provided
    imageUrl: listing.images?.[0] || 'https://placehold.co/600x400/CCCCCC/333333?text=No+Image', // First image or fallback
    slug: listing.id, // Using ID as slug for simplicity, ideally you'd have a dedicated slug field
    tags: listing.isFeatured ? ['Featured'] : [], // Example tag
    description: listing.description || listing.category?.brand || 'No description available.', // For modal
    price: `${currency} ${listing?.finalPrice?.toLocaleString()}`, // For modal
  }));

  // Use transformed listings if available, otherwise use static fallback
  const listingsToPass = transformedListings.length > 0 ? transformedListings : fallbackListings;

  const baseSlug = storeFormData?.slug || 'default-site'; // Fallback slug for the site

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
        <ListingGrid listings={listingsToPass} baseSlug={baseSlug} />

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
