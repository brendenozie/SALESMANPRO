"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  FaceSmileIcon,
  FireIcon, // Using FireIcon as a placeholder for Chef Hat
} from "@heroicons/react/24/solid"; // Using solid icons for features

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

// Sample Features Data (replace with dynamic data if available from storeFormData or backend)
const featuresData = [
  {
    title: "Fresh & Local Ingredients",
    description: "We source the finest ingredients from local farms, ensuring peak freshness and supporting our community.",
    icon: <SparklesIcon className="h-10 w-10 text-orange-500" />,
    img: "/images/feature-fresh.jpg", // Placeholder image
    link: "/menu", // Link to relevant page
  },
  {
    title: "Masterful Culinary Team",
    description: "Our chefs are artists, blending traditional techniques with innovative flavors to create unforgettable dishes.",
    icon: <FireIcon className="h-10 w-10 text-red-500" />,
    img: "/images/feature-chef.jpg", // Placeholder image
    link: "/about#team",
  },
  {
    title: "Cozy & Inviting Atmosphere",
    description: "Dine in comfort with a warm ambiance, perfect for intimate dinners or lively gatherings.",
    icon: <BuildingStorefrontIcon className="h-10 w-10 text-green-500" />,
    img: "/images/feature-ambiance.jpg", // Placeholder image
    link: "/gallery",
  },
  {
    title: "Exceptional Service",
    description: "Our attentive staff is dedicated to making your dining experience seamless and delightful from start to finish.",
    icon: <FaceSmileIcon className="h-10 w-10 text-blue-500" />,
    img: "/images/feature-service.jpg", // Placeholder image
    link: "/contact",
  },
];

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
  const { name, description } = storeFormData; // Using name from storeFormData

  return (
    <section className="py-20 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.p className="text-sm uppercase tracking-widest font-semibold text-orange-600 dark:text-orange-400 mb-2" variants={itemVariants}>
            Our Philosophy
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 drop-shadow-md"
            variants={itemVariants}
          >
            Discover the Unbite Difference
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
              src="/images/about-chef-story.jpg" // A more narrative image
              alt="Chef preparing food with passion"
              width={700}
              height={500}
              className="rounded-2xl shadow-xl object-cover w-full h-auto"
              loader={loader}
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
              At {name || "Unbite"}, we blend timeless recipes with modern flair. Each
              dish reflects our unwavering passion for quality ingredients,
              authentic flavors, and a commitment to culinary excellence.
              We believe great food tells a story, and we invite you to be part of ours.
            </p>
            <p className="text-md italic text-gray-600 dark:text-gray-400 mb-6">
              — Chef de Cuisine, {name || "Unbite"}
            </p>
            <Link
              href={`/${name ? name.toLowerCase() : 'unbite'}/about`} // Dynamic link
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-full font-semibold shadow-md hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-0.5"
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
          {featuresData.map((f, i) => (
            <motion.div
              key={f.title}
              variants={itemVariants}
              whileHover={{ y: -8, boxShadow: "0 15px 20px -5px rgba(0, 0, 0, 0.1), 0 6px 10px -3px rgba(0, 0, 0, 0.08)" }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-300"
            >
              <div className="w-24 h-24 relative mb-6 rounded-full overflow-hidden border-4 border-orange-100 dark:border-gray-700 flex items-center justify-center">
                {/* Feature image, if available, otherwise just use the icon */}
                {f.img ? (
                  <Image
                    src={f.img}
                    alt={f.title}
                    fill
                    className="object-cover"
                    loader={loader}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {f.icon}
                  </div>
                )}
                {/* Icon overlay, always visible */}
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-800/70 rounded-full">
                  {f.icon}
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{f.title}</h4>
              <p className="text-md text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">
                {f.description}
              </p>
              <Link
                href={f.link}
                className="inline-flex items-center text-orange-600 dark:text-orange-400 font-semibold hover:underline transition-colors"
              >
                Learn More <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
