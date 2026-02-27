"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  StarIcon,
  ShoppingBagIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { useStateContext } from "@/contexts/ContextProvider";
import { createCachedFetcher } from "@/lib/swrCachedFetcher";
import { SkeletonGrid } from "../SkeletonGrid/SkeletonGrid";

// ---------------------------
// IMAGE LOADER
// ---------------------------
const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// ---------------------------
// RATING
// ---------------------------
const RatingStars = ({ count = 0 }: { count?: number }) => (
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

// ------------------------------------------
// FINAL COMPONENT — POPULAR PRODUCTS SECTION
// ------------------------------------------
export default function PopularProductsSection({
  id,
  currency = "KES",
}: {
  id: string;
  currency?: string;
}) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isPopular&limit=12`;
  const cacheKey = `popular-products-${id}`;
  const fallbackKey = `swr-cache:${cacheKey}:${url}`;

  const fetcher = createCachedFetcher(cacheKey);

  // Get fallback data from localStorage
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

  const products = data?.data || [];

  // ------------------------------------------
  // CART + UI STATE
  // ------------------------------------------
  const { cart, addToCart, decreaseQuantity, removeFromCart } =
    useStateContext();

  const containerRef = useRef<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // ------------------------------------------
  // SCROLL CONTROL
  // ------------------------------------------
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const checkScroll = () => {
      if (!containerRef.current) return;

      setCanScrollLeft(containerRef.current.scrollLeft > 0);

      setCanScrollRight(
        containerRef.current.scrollLeft <
          containerRef.current.scrollWidth -
            containerRef.current.clientWidth
      );
    };

    containerRef.current?.addEventListener("scroll", checkScroll);
    checkScroll();

    return () =>
      containerRef.current?.removeEventListener("scroll", checkScroll);
  }, [products]);

  const scroll = (dir: "left" | "right") => {
    if (!containerRef.current) return;

    const amount = containerRef.current.clientWidth * 0.8;

    containerRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------
  const handleAddToCart = (item: any) => {
    addToCart(item);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleImageError = (e: any) => {
    e.currentTarget.src =
      "https://placehold.co/600x400/CCCCCC/333333?text=No+Image";
  };

  // ------------------------------------------
  // LOADING + ERROR
  // ------------------------------------------
  if (isLoading) return <SkeletonGrid count={8} />;
  if (error) return <div className="text-center text-gray-500"></div>;
  if (!products.length)
    return <div className="text-center text-gray-500"></div>;

  // ------------------------------------------
  // RENDER
  // ------------------------------------------
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            Popular <span className="text-orange-500">Products</span>
          </h2>

          <div className="flex space-x-3">
            <motion.button
              onClick={() => scroll("left")}
              className={`p-3 rounded-full shadow-md ${
                canScrollLeft
                  ? "opacity-100"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </motion.button>

            <motion.button
              onClick={() => scroll("right")}
              className={`p-3 rounded-full shadow-md ${
                canScrollRight
                  ? "opacity-100"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <ChevronRightIcon className="h-6 w-6" />
            </motion.button>
          </div>
        </div>

        {/* HORIZONTAL SCROLL LIST */}
        <div
          ref={containerRef}
          className="flex space-x-6 pb-6 overflow-x-auto custom-scrollbar snap-x snap-mandatory"
        >
          {products.map((product: any) => {
            const quantity =
              cart.find((i: any) => i.id === product.id)?.quantity || 0;

            return (
              <motion.div
                key={product.id}
                className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex-shrink-0 snap-center"
              >
                {/* IMAGE */}
                <div
                  className="relative w-full h-52 sm:h-60 rounded-t-3xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <Image
                    src={
                      product.thumbnail ||
                      product.images?.[0] ||
                      "https://placehold.co/600x400/CCC/333?text=No+Image"
                    }
                    alt={product.name}
                    fill
                    loader={loader}
                    onError={handleImageError}
                    className="object-cover"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h3 className="font-bold text-xl">{product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {product.brand || "General"}
                  </p>

                  <RatingStars count={product.rating || 4} />

                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-extrabold text-xl">
                      {currency}{" "}
                      {product.finalPrice?.toLocaleString() ||
                        product.price?.toLocaleString()}
                    </span>
                  </div>

                  {/* CART BUTTONS */}
                  {quantity > 0 ? (
                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => decreaseQuantity(product.id)}
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
                          onClick={() => addToCart(product)}
                          className="p-2 bg-gray-100 rounded-full"
                        >
                          <PlusIcon className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-sm text-red-600 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product)}
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

      {/* ------------------------ TOAST ------------------------ */}
      <AnimatePresence>
        {showToast &&
          createPortal(
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              <span>Item added to cart!</span>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>

      {/* ------------------------ MODAL ------------------------ */}
      <AnimatePresence>
        {selectedProduct &&
          createPortal(
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
              onClick={() => setSelectedProduct(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                <p className="mt-2">{selectedProduct.description}</p>
              </motion.div>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>
    </section>
  );
}
