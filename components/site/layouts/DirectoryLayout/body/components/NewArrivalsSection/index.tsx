"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  HeartIcon,
  ShoppingBagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  StarIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreContext } from "@/contexts/StoreContext";
import { useStateContext } from "@/contexts/ContextProvider";

// Optimized image loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};


// Rating Component
const RatingStars: React.FC<{ count?: number }> = ({ count = 0 }) => (
  <div className="flex items-center space-x-0.5">
    {Array.from({ length: 5 }).map((_, i) =>
      i < count ? (
        <StarSolid key={i} className="h-4 w-4 text-yellow-500" />
      ) : (
        <StarIcon key={i} className="h-4 w-4 text-gray-300" />
      )
    )}
  </div>
);

export default function NewArrivalsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext() || {};
  const { marketplaceListings: dynamicListings, currency = "KES" } = storeFormData || {};

  // Map dynamic or fallback data
  const listingsToDisplay =
    Array.isArray(dynamicListings) && dynamicListings.length > 0
      ? dynamicListings.map((listing) => ({
          id: listing.id,
          businessName: listing.name,
          title: listing.name, // ✅ fixed
          category: listing.brand || "General", // fallback if missing
          price: `${currency} ${listing?.finalPrice?.toLocaleString()}`,
          img: listing.images?.[0] ||  "https://placehold.co/600x400/CCCCCC/333333?text=No+Image",
          rating: 4, // ✅ allow optional rating listing?.rating ?? 
          description: listing.description || listing?.description,
          tags: listing.isFeatured ? ["Featured"] : [],
        }))
      : []; // You can plug fallbackListings here if needed

  // Scroll handling
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

    containerRef.current?.addEventListener("scroll", checkScroll);
    checkScroll();
    return () => containerRef.current?.removeEventListener("scroll", checkScroll);
  }, [listingsToDisplay]);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const scrollAmount = containerRef.current.clientWidth * 0.8;
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleAddToCart = (listing: any) => {
    addToCart(listing);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      "https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found";
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            Discover What's <span className="text-orange-500">New & Trending</span>
          </h2>
          <div className="flex space-x-3">
            <motion.button
              onClick={() => scroll("left")}
              className={`p-3 rounded-full shadow-md ${
                canScrollLeft ? "opacity-100" : "opacity-40 cursor-not-allowed"
              }`}
              disabled={!canScrollLeft}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </motion.button>
            <motion.button
              onClick={() => scroll("right")}
              className={`p-3 rounded-full shadow-md ${
                canScrollRight ? "opacity-100" : "opacity-40 cursor-not-allowed"
              }`}
              disabled={!canScrollRight}
            >
              <ChevronRightIcon className="h-6 w-6" />
            </motion.button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={containerRef}
          className="flex space-x-6 pb-6 overflow-x-auto custom-scrollbar snap-x snap-mandatory"
        >
          {listingsToDisplay.map((listing) => {
            const quantity =
              cart.find((item: any) => item.id === listing.id)?.quantity || 0;

            return (
              <motion.div
                key={listing.id}
                className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex-shrink-0 snap-center"
              >
                {/* Image */}
                <div
                  className="relative w-full h-52 sm:h-60 rounded-t-3xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedListing(listing)}
                >
                  <Image
                    src={listing.img}
                    alt={listing.title}
                    loader={loader}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                  />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col justify-between">
                  <p className="text-sm text-gray-500">{listing.businessName}</p>
                  <h3 className="font-bold text-xl">{listing.title}</h3>
                  <p className="text-sm text-gray-600">{listing.category}</p>
                  <RatingStars count={listing.rating} />

                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-extrabold text-xl">{listing.price}</span>
                    <button
                      onClick={() => setSelectedListing(listing)}
                      className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-full"
                    >
                      View Details <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Cart Actions */}
                  {quantity > 0 ? (
                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => decreaseQuantity(listing.id)}
                          className="p-2 bg-gray-100 rounded-full"
                        >
                          {quantity === 1 ? (
                            <TrashIcon className="h-5 w-5 text-red-500" />
                          ) : (
                            <MinusIcon className="h-5 w-5 text-gray-600" />
                          )}
                        </button>
                        <span className="text-lg font-bold">{quantity}</span>
                        <button
                          onClick={() => addToCart(listing)}
                          className="p-2 bg-gray-100 rounded-full"
                        >
                          <PlusIcon className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(listing.id)}
                        className="text-sm font-medium text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(listing)}
                      className="mt-5 w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast &&
          createPortal(
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              <span>Item added to cart!</span>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {selectedListing &&
          createPortal(
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedListing(null)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 relative"
              >
                <button
                  onClick={() => setSelectedListing(null)}
                  className="absolute top-4 right-4"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold">{selectedListing.title}</h2>
                <p className="mt-2">{selectedListing.description}</p>
              </motion.div>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>
    </section>
  );
}
