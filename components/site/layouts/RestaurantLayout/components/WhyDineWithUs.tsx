"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  SparklesIcon, // Generic icon for fallback
  BuildingStorefrontIcon, // Example icon for ambiance
  FaceSmileIcon, // Example icon for service
  FireIcon, // Example icon for culinary team
} from "@heroicons/react/24/solid";

// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from "@/contexts/StoreContext"; // Adjust path as needed
import { TagIcon } from "@heroicons/react/20/solid";
import { ICoreValue } from "@/types/typings";

// Define types for the data expected from StoreContext
export type Feature = {
  id: string;
  title: string;
  description: string;
  iconUrl?: string; // URL to an SVG or image icon
  link?: string; // Optional link for the feature card
  order: number; // For sorting
};

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  id?: string;
  name?: string; // Restaurant name, for section title and "Our Culinary Journey"
  slug?: string; // For constructing dynamic links
  description?: string; // Can be used for "Our Culinary Journey" description
  aboutImageUrl?: string; // Specific image for the "Our Culinary Journey" section
  features?: Feature[]; // Array of features for "Why Dine With Us"
  themeSettings?: ThemeSettings;
  // Add other relevant StoreForm fields if needed for this section
};

// Optimized image loader for Next.js Image component
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

// Static fallback features data
const fallbackFeatures: ICoreValue[] = [
  {
    id: "f1",
    title: "Fresh & Local Ingredients",
    description: "We source the finest ingredients from local farms, ensuring peak freshness and supporting our community.",
    icon: "/icons/leaf.svg", // Example SVG path
    // link: "/menu",
    // order: 1,
  },
  {
    id: "f2",
    title: "Masterful Culinary Team",
    description: "Our chefs are artists, blending traditional techniques with innovative flavors to create unforgettable dishes.",
    icon: "/icons/chef-hat.svg", // Example SVG path
    // link: "/about#team",
    // order: 2,
  },
  {
    id: "f3",
    title: "Cozy & Inviting Atmosphere",
    description: "Dine in comfort with a warm ambiance, perfect for intimate dinners or lively gatherings.",
    icon: "/icons/restaurant.svg", // Example SVG path
    // link: "/gallery",
    // order: 3,
  },
  {
    id: "f4",
    title: "Exceptional Service",
    description: "Our attentive staff is dedicated to making your dining experience seamless and delightful from start to finish.",
    icon: "/icons/smile.svg", // Example SVG path
    // link: "/contact",
    // order: 4,
  },
];

// Map string icon names to Heroicon components (for fallbacks or if icon names are passed)
const iconMap: { [key: string]: React.ElementType } = {
  SparklesIcon: SparklesIcon,
  BuildingStorefrontIcon: BuildingStorefrontIcon,
  FaceSmileIcon: FaceSmileIcon,
  FireIcon: FireIcon,
  LeafIcon: TagIcon,  
};

// Animation variants for staggered appearance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

export default function WhyDineWithUs() {
  const { storeFormData } = useStoreContext();

  // Dynamic content with fallbacks
  const restaurantName = storeFormData?.name || "Unbite";
  const restaurantSlug = storeFormData?.slug || "unbite";
  const restaurantDescription = storeFormData?.description || "At Unbite, we blend timeless recipes with modern flair. Each dish reflects our unwavering passion for quality ingredients, authentic flavors, and a commitment to culinary excellence. We believe great food tells a story, and we invite you to be part of ours.";
  const aboutImage = storeFormData?.bannerUrl || "/images/about-chef-story.jpg"; // Specific image for about section

  // Dynamic features from storeFormData or fallback
  const featuresToRender = Array.isArray(storeFormData?.CoreValues) && storeFormData.CoreValues.length > 0
    ? storeFormData.CoreValues//.sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
    : fallbackFeatures;

  // Dynamic colors from theme settings
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#FF5722"; // Deep Orange
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || "#3F51B5"; // Indigo (used for accent/hover)

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevents infinite loop if placeholder also fails
    e.currentTarget.src = "https://placehold.co/700x500/CCCCCC/333333?text=Image+Error";
  };

  const handleIconImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.style.display = 'none'; // Hide broken image
    const parent = e.currentTarget.closest('.icon-container');
    if (parent) {
      const fallbackIcon = document.createElement('div');
      fallbackIcon.className = 'absolute inset-0 flex items-center justify-center';
      const sparkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      sparkIcon.setAttribute('class', `h-10 w-10`);
      sparkIcon.setAttribute('fill', 'currentColor');
      sparkIcon.setAttribute('viewBox', '0 0 24 24');
      sparkIcon.innerHTML = `<path fill-rule="evenodd" d="M9.302 3.007a60.124 60.124 0 015.396 0 60.178 60.178 0 00-5.396 0zM12 2.25a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM12 18.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM12 6.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0V7.5a.75.75 0 01.75-.75zM12 15.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM12 9.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM12 12.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM12 21.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM12 3.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0V4.5a.75.75 0 01.75-.75zM12 20.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM12 7.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0V8.5a.75.75 0 01.75-.75zM12 16.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM12 10.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM12 13.75a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75z" clip-rule="evenodd" />`;
      fallbackIcon.style.color = primaryColor; // Apply primary color to fallback icon
      parent.appendChild(fallbackIcon);
    }
  };

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.p className="text-sm uppercase tracking-widest font-semibold mb-2" style={{ color: primaryColor }} variants={itemVariants}>
            Our Philosophy
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 drop-shadow-md"
            variants={itemVariants}
          >
            Discover the {restaurantName} Difference
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            More than just food, it&apos;s an experience. We invite you to explore the passion behind every dish.
          </motion.p>
        </motion.div>

        {/* Our Story / About Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Image
              src={aboutImage}
              alt="Chef preparing food with passion"
              width={700}
              height={500}
              className="rounded-2xl shadow-xl object-cover w-full h-auto"
              loader={loader}
              onError={handleImageError}
            />
          </motion.div>
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Our Culinary Journey
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {restaurantDescription}
            </p>
            <p className="text-md italic text-gray-600 dark:text-gray-400 mb-6">
              — Chef de Cuisine, {restaurantName}
            </p>
            <Link
              href={`/${restaurantSlug}/about`}
              className="inline-flex items-center px-6 py-3 text-white rounded-full font-semibold shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              style={{ backgroundColor: primaryColor, '--tw-hover-bg': secondaryColor } as React.CSSProperties}
            >
              Learn More About Us <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>

        {/* Why Dine With Us - Features Grid */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h3
            className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 drop-shadow-md"
            variants={itemVariants}
          >
            Why Guests Love Dining With Us
          </motion.h3>
          <motion.p
            className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            It&apos;s not just about the food; it&apos;s about the complete experience. Here&apos;s what makes us special.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {featuresToRender.map((f, i) => (
            <motion.div
              key={f.id} // Use unique ID for key
              variants={itemVariants}
              whileHover={{ y: -8, boxShadow: "0 15px 20px -5px rgba(0, 0, 0, 0.1), 0 6px 10px -3px rgba(0, 0, 0, 0.08)" }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-300"
            >
              <div className="w-24 h-24 relative mb-6 rounded-full overflow-hidden border-4 border-orange-100 dark:border-gray-700 flex items-center justify-center icon-container">
                {f.icon ? (
                  <Image
                    src={f.icon}
                    alt={f.title}
                    fill
                    className="object-cover"
                    loader={loader}
                    onError={handleIconImageError} // Specific error handler for icons
                  />
                ) : (
                  // Fallback to a generic Heroicon if no iconUrl is provided
                  <SparklesIcon className="h-10 w-10" style={{ color: primaryColor }} />
                )}
                {/* Optional: A subtle overlay for visual consistency if image is used */}
                {f.icon && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-800/70 rounded-full">
                    {/* This div acts as a subtle filter over the image, or simply provides a background if no image */}
                  </div>
                )}
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{f.title}</h4>
              <p className="text-md text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">
                {f.description}
              </p>
              {/* {f.link && ( // Only render link if provided */}
                <Link
                  href={'#'}//f.link
                  className="inline-flex items-center font-semibold hover:underline transition-colors"
                  style={{ color: primaryColor }}
                >
                  Learn More <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
              {/* )} */}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
