"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlayCircleIcon } from "@heroicons/react/24/solid"; // Using solid icon for better visibility

import { useStoreContext } from "../../../../../contexts/StoreContext"; // Adjust path as needed

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

export default function RestaurantHero() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();

  const {
    name,
    slug,
    bannerUrl, // Assuming this is the main hero image URL
    description, // Can be used for a longer tagline
    themeSettings,
  } = storeFormData;

  // Use restaurant’s theme settings or fallbacks
  const primaryColor = themeSettings?.primaryColor || "#FF5722"; // Deep Orange
  const secondaryColor = themeSettings?.secondaryColor || "#3F51B5"; // Indigo

  // Animation variants for staggered appearance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const handleWatchVideo = () => {
    // In a real application, this would open a video modal
    alert("Playing a delicious video about our restaurant!");
    // Example: You could use a state to open a modal:
    // setIsVideoModalOpen(true);
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bannerUrl || "/images/hero-restaurant-bg.jpg"} // Fallback image
          alt={name ? `${name} restaurant hero background` : "Delicious food background"}
          fill
          className="object-cover brightness-[0.7] saturate-125" // Dim and slightly saturate for mood
          loader={loader}
          priority // Prioritize loading for LCP
        />
        {/* Subtle gradient overlay for depth and text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 text-center text-white px-4 max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight drop-shadow-2xl mb-4"
          variants={itemVariants}
        >
          Savor the Taste of <br className="hidden md:block" />
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, type: "spring", damping: 10, stiffness: 100 }}
            style={{ color: primaryColor }} // Dynamic highlight color
          >
            Perfection.
          </motion.span>
        </motion.h1>

        <motion.p
          className="max-w-3xl mx-auto text-lg md:text-xl mb-8 font-light text-white/90 drop-shadow-lg"
          variants={itemVariants}
        >
          {description || "Fresh ingredients, mouth-watering recipes, and a passion for good food delivered to your door or ready for pick-up."}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mt-8"
          variants={itemVariants}
        >
          <Link
            href={`/${slug}/order`}
            className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            style={{ backgroundColor: primaryColor, color: 'white' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = secondaryColor)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = primaryColor)}
          >
            Order Now
          </Link>
          <Link
            href={`/${slug}/menu`}
            className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            View Menu
          </Link>
        </motion.div>
      </motion.div>

      {/* Watch Video Button */}
      <motion.button
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-2 text-white text-lg font-semibold hover:text-opacity-80 transition-colors duration-300 group"
        onClick={handleWatchVideo}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <PlayCircleIcon className="h-10 w-10 text-white group-hover:text-yellow-400 transition-colors duration-300" />
        <span>Watch Our Story</span>
      </motion.button>
    </section>
  );
}
