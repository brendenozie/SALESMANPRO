"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { StarIcon, ShoppingCartIcon, EyeIcon } from "@heroicons/react/24/solid"; // Using solid icons
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline"; // For favorite icon

// Image loader (same as elsewhere)
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

// Define the Dish type
type Dish = {
  id: string;
  title: string;
  img: string;
  price: string;
  desc: string;
  category: "All Menu" | "Burger" | "Pizza" | "Subway" | "Dessert" | "Drink";
  rating: number; // 1-5
};

// Sample Dishes Data (replace with data fetched from your backend)
const allDishes: Dish[] = [
  {
    id: "d1",
    title: "Classic Beef Burger",
    img: "/images/dishes/burger1.jpg",
    price: "$12.99",
    desc: "Juicy beef patty, fresh lettuce, tomato, onion, and our special sauce on a toasted brioche bun.",
    category: "Burger",
    rating: 4.8,
  },
  {
    id: "d2",
    title: "Pepperoni Pizza",
    img: "/images/dishes/pizza1.jpg",
    price: "$15.50",
    desc: "Classic pepperoni pizza with rich tomato sauce, mozzarella, and spicy pepperoni slices.",
    category: "Pizza",
    rating: 4.5,
  },
  {
    id: "d3",
    title: "Chicken Teriyaki Subway",
    img: "/images/dishes/subway1.jpg",
    price: "$9.75",
    desc: "Grilled chicken with sweet teriyaki glaze, fresh veggies, and provolone cheese on a footlong.",
    category: "Subway",
    rating: 4.2,
  },
  {
    id: "d4",
    title: "Veggie Supreme Pizza",
    img: "/images/dishes/pizza2.jpg",
    price: "$14.00",
    desc: "A garden fresh pizza topped with bell peppers, onions, mushrooms, olives, and spinach.",
    category: "Pizza",
    rating: 4.6,
  },
  {
    id: "d5",
    title: "Double Cheese Burger",
    img: "/images/dishes/burger2.jpg",
    price: "$14.50",
    desc: "Two beef patties, double cheddar cheese, pickles, and our signature burger sauce.",
    category: "Burger",
    rating: 4.9,
  },
  {
    id: "d6",
    title: "Meatball Marinara Subway",
    img: "/images/dishes/subway2.jpg",
    price: "$10.25",
    desc: "Hearty meatballs smothered in marinara sauce with melted mozzarella on toasted bread.",
    category: "Subway",
    rating: 4.3,
  },
  {
    id: "d7",
    title: "Chocolate Lava Cake",
    img: "/images/dishes/dessert1.jpg",
    price: "$7.00",
    desc: "Warm chocolate cake with a molten chocolate center, served with vanilla ice cream.",
    category: "Dessert",
    rating: 4.9,
  },
  {
    id: "d8",
    title: "Strawberry Milkshake",
    img: "/images/dishes/drink1.jpg",
    price: "$5.50",
    desc: "Creamy milkshake blended with fresh strawberries and topped with whipped cream.",
    category: "Drink",
    rating: 4.7,
  },
];

// Animation variants for staggered appearance
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
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function SignatureDishes() {
  const [activeCategory, setActiveCategory] = useState<Dish['category'] | "All Menu">("All Menu");

  const filteredDishes = useMemo(() => {
    if (activeCategory === "All Menu") {
      return allDishes;
    }
    return allDishes.filter((dish) => dish.category === activeCategory);
  }, [activeCategory]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(allDishes.map(dish => dish.category));
    return ["All Menu", ...Array.from(uniqueCategories)].sort(); // Sort for consistent order
  }, []);

  const handleAddToCart = (dishId: string) => {
    alert(`Added dish ${dishId} to cart!`);
    // In a real app, this would dispatch an action to a cart state management system
  };

  const handleQuickView = (dishId: string) => {
    alert(`Quick view for dish ${dishId}`);
    // In a real app, this would open a modal with dish details
  };

  const handleFavorite = (dishId: string) => {
    alert(`Toggled favorite for dish ${dishId}`);
    // In a real app, this would update user's favorites
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-orange-600 dark:text-orange-400 mb-4 drop-shadow-md"
            variants={itemVariants}
          >
            Our Signature Dishes
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8"
            variants={itemVariants}
          >
            Explore a world of flavors with our chef&apos;s finest creations, crafted with passion and the freshest ingredients.
          </motion.p>

          {/* Category Tabs */}
          <motion.div
            className="inline-flex flex-wrap justify-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-inner"
            variants={itemVariants}
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                className={`px-5 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300
                  ${activeCategory === category
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                onClick={() => setActiveCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
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
            {filteredDishes.map((dish) => (
              <motion.div
                key={dish.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col group cursor-pointer"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={dish.img}
                    alt={dish.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loader={loader}
                  />
                  {/* Image Overlay for icons */}
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
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{dish.title}</h3>
                    <span className="text-xl md:text-2xl font-extrabold text-orange-600 dark:text-orange-400">
                      {dish.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-3">
                    {dish.desc}
                  </p>
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(dish.rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({dish.rating.toFixed(1)})</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(dish.id)}
                    className="mt-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-semibold shadow-md hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
