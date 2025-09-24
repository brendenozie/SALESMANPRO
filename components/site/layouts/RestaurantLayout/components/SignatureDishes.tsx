"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  StarIcon,
  ShoppingCartIcon,
  EyeIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";

import { useStoreContext } from "@/contexts/StoreContext";
import { useStateContext } from "@/contexts/ContextProvider"; // ✅ cart context

// Optimized image loader
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

export default function SignatureDishes() {
  const { storeFormData } = useStoreContext();
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext(); // ✅ cart actions

  const allProducts = storeFormData?.marketplaceListings || [];
  const productCategories = storeFormData?.StoreCategory || [];
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#FF5722";
  const secondaryColor =
    storeFormData?.themeSettings?.secondaryColor || "#3F51B5";

  const [activeCategory, setActiveCategory] = useState<string>("all-menu");

  const categoriesForDisplay = useMemo(() => {
    const sortedCategories = [...productCategories].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
    );
    return [
      { id: "all-menu", displayName: "All Menu", order: 0 },
      ...sortedCategories,
    ];
  }, [productCategories]);

  const filteredDishes = useMemo(() => {
    let dishesToFilter = [...allProducts];
    if (activeCategory === "all-menu") return dishesToFilter;
    return dishesToFilter.filter((dish) =>
      dish.category?.categoryId.includes(activeCategory)
    );
  }, [activeCategory, allProducts]);

  const getQuantity = (id: string) =>
    cart.find((item: any) => item.id === id)?.quantity || 0;

  const handleQuickView = (dishId: string) => {
    console.log(`Quick view for dish ${dishId}`);
  };

  const handleFavorite = (dishId: string) => {
    console.log(`Toggled favorite for dish ${dishId}`);
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      "https://placehold.co/400x250/CCCCCC/333333?text=Dish+Image+Error";
  };

  return (
    <section
      id="menu"
      className="py-20 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md"
            style={{ color: primaryColor }}
            variants={itemVariants}
          >
            Our Signature Dishes
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8"
            variants={itemVariants}
          >
            Explore a world of flavors with our chef&apos;s finest creations,
            crafted with passion and the freshest ingredients.
          </motion.p>

          {/* Category Tabs */}
          <motion.div
            className="inline-flex flex-wrap justify-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-inner"
            variants={itemVariants}
          >
            {categoriesForDisplay.map((category) => (
              <motion.button
                key={category.id}
                className={`px-5 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300
                  ${
                    activeCategory === category.id
                      ? "text-white shadow-md"
                      : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                style={{
                  backgroundColor:
                    activeCategory === category.id ? primaryColor : "transparent",
                }}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.displayName}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Dishes Grid */}
        {filteredDishes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 text-gray-600 dark:text-gray-400"
          >
            <p className="text-xl">No dishes found for this category.</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {filteredDishes.map((dish) => {
              const quantity = getQuantity(dish.id);

              return (
                <motion.div
                  key={dish.id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.03,
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={
                        dish.images?.[0] ||
                        "https://placehold.co/400x250/FF7043/FFFFFF?text=Dish"
                      }
                      alt={dish.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      loader={loader}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      onError={handleImageError}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleQuickView(dish.id)}
                        className="p-3 bg-white/80 rounded-full text-gray-800 hover:bg-white transition-colors mx-2"
                        aria-label="Quick View"
                      >
                        <EyeIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => handleFavorite(dish.id)}
                        className="p-3 bg-white/80 rounded-full text-red-500 hover:bg-white transition-colors mx-2"
                        aria-label="Add to Favorites"
                      >
                        <HeartOutlineIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {dish.name}
                      </h3>
                      <span
                        className="text-xl md:text-2xl font-extrabold"
                        style={{ color: primaryColor }}
                      >
                        ${dish?.finalPrice?.toFixed(2) || dish?.sellingPrice?.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-3">
                      {dish.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(0) //dish.rating ||
                              ? "text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        ({( 0).toFixed(1)})//dish.rating ||
                      </span>
                    </div>

                    {/* ✅ Cart Controls */}
                    {quantity > 0 ? (
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => decreaseQuantity(dish.id)}
                            className="p-2 bg-gray-100 rounded-full hover:bg-red-100 transition-all duration-200 shadow-sm"
                          >
                            {quantity === 1 ? (
                              <TrashIcon className="h-5 w-5 text-red-500" />
                            ) : (
                              <MinusIcon className="h-5 w-5 text-gray-600" />
                            )}
                          </motion.button>
                          <span className="text-lg text-gray-800 font-bold">
                            {quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addToCart(dish)}
                            className="p-2 bg-gray-100 rounded-full hover:bg-green-100 transition-all duration-200 shadow-sm"
                          >
                            <PlusIcon className="h-5 w-5 text-gray-600" />
                          </motion.button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeFromCart(dish.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                        >
                          Remove
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addToCart(dish)}
                        className="mt-auto flex items-center justify-center gap-2 px-6 py-3 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        }}
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                        Add to Cart
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
