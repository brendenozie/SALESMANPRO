"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import useSWR from "swr";
import { createCachedFetcher } from "@/lib/swrCachedFetcher";

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
import { useStateContext } from "@/contexts/ContextProvider";
import { MarketListingForm } from "@/types/typings";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Rating Stars
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

interface NewArrivalsSectionProps {
  id: string;
  currency?: string;
  marketplaceListings?: MarketListingForm[];
}

export default function NewArrivalsSection({
  id,
  currency = "KES",
  // marketplaceListings: dynamicListings,
}: NewArrivalsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();

  // --- SWR integration from DailyBestSells ---
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=trending&limit=8`;
  const cacheKey = `products-${id}-trending`;
  const fallbackKey = `swr-cache:${cacheKey}:${url}`;

  const fetcher = createCachedFetcher(cacheKey);

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

  // 🔄 Merge API data + dynamicListings support
  const apiListings =
    data?.data?.map((product: any) => ({
      id: product.id,
      businessName: product.storeName || product.brand || "Store",
      title: product.name,
      category: product.category || "General",
      price: `${currency} ${product.finalPrice?.toLocaleString() || product.price}`,
      img:
        product.images?.[0] ||
        "https://placehold.co/600x400/CCCCCC/333333?text=No+Image",
      rating: product.rating || 4,
      description: product.description,
      tags: product.isFeatured ? ["Featured"] : [],
    })) || [];

  const listingsToDisplay = apiListings;

  // --- Horizontal Scroll Controls ---
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const checkScroll = () => {
      if (!containerRef.current) return;
      setCanScrollLeft(containerRef.current.scrollLeft > 0);
      setCanScrollRight(
        containerRef.current.scrollLeft <
          containerRef.current.scrollWidth - containerRef.current.clientWidth
      );
    };

    containerRef.current?.addEventListener("scroll", checkScroll);
    checkScroll();

    return () => containerRef.current?.removeEventListener("scroll", checkScroll);
  }, [listingsToDisplay]);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const amount = containerRef.current.clientWidth * 0.8;
    containerRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // --- Cart Logic ---
  const handleAddToCart = (listing: any) => {
    addToCart(listing);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src =
      "https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found";
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10"></div>;
  if (!listingsToDisplay.length)
    return <div className="text-center py-10"></div>;

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            Discover What's <span className="text-orange-500">New & Trending</span>
          </h2>

          <div className="flex space-x-3">
            <motion.button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-3 rounded-full shadow-md ${
                canScrollLeft ? "opacity-100" : "opacity-40 cursor-not-allowed"
              }`}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </motion.button>

            <motion.button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-3 rounded-full shadow-md ${
                canScrollRight ? "opacity-100" : "opacity-40 cursor-not-allowed"
              }`}
            >
              <ChevronRightIcon className="h-6 w-6" />
            </motion.button>
          </div>
        </div>

        {/* SCROLL CAROUSEL */}
        <div
          ref={containerRef}
          className="flex space-x-6 pb-6 overflow-x-auto custom-scrollbar snap-x snap-mandatory"
        >
          {listingsToDisplay.map((listing: any) => {
            const quantity =
              cart.find((item: MarketListingForm) => item.id === listing.id)?.quantity || 0;

            return (
              <motion.div
                key={listing.id}
                className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex-shrink-0 snap-center"
              >
                {/* IMAGE */}
                <div
                  onClick={() => setSelectedListing(listing)}
                  className="relative w-full h-52 sm:h-60 rounded-t-3xl overflow-hidden cursor-pointer"
                >
                  <Image decoding="async"
                    src={listing.images?.[0] || "https://placehold.co/600x400/CCCCCC/333333?text=No+Image"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                  />
                </div>

                {/* CONTENT */}
                <div className="p-5 flex flex-col">
                  <p className="text-sm text-gray-500">{listing.businessName}</p>
                  <h3 className="font-bold text-xl">{listing.name}</h3>
                  <p className="text-sm text-gray-600">{listing.category}</p>

                  <RatingStars count={listing.rating} />

                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-extrabold text-xl">{listing.finalPrice || listing.sellingPrice || "0.00"}</span>
                  </div>

                  {/* CART ACTIONS */}
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

      {/* TOAST */}
      <AnimatePresence>
        {showToast &&
          createPortal(
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              <span>Item added to cart!</span>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>

      {/* MODAL */}
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
                onClick={(e: any) => e.stopPropagation()}
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
