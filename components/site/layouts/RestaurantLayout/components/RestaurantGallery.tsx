"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { EyeIcon } from "@heroicons/react/24/solid"; // For the view icon

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

// Define the GalleryImage type
type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  category: "Dishes" | "Ambiance" | "Events" | "Team"; // Categorize images
  span?: string; // Tailwind grid span classes like 'col-span-2 row-span-2'
};

// Sample Gallery Images Data (replace with data fetched from your backend)
const sampleGalleryImages: GalleryImage[] = [
  { id: "g1", src: "/images/gallery/dish1.jpg", alt: "Gourmet Pasta Dish", category: "Dishes", span: "md:col-span-2 md:row-span-2" },
  { id: "g2", src: "/images/gallery/ambiance1.jpg", alt: "Cozy Restaurant Interior", category: "Ambiance" },
  { id: "g3", src: "/images/gallery/dish2.jpg", alt: "Artfully Plated Salad", category: "Dishes" },
  { id: "g4", src: "/images/gallery/chef1.jpg", alt: "Chef preparing food", category: "Team", span: "md:col-span-2" },
  { id: "g5", src: "/images/gallery/ambiance2.jpg", alt: "Outdoor Dining Area", category: "Ambiance" },
  { id: "g6", src: "/images/gallery/dish3.jpg", alt: "Delicious Dessert", category: "Dishes" },
  { id: "g7", src: "/images/gallery/event1.jpg", alt: "Special Event Setup", category: "Events" },
  { id: "g8", src: "/images/gallery/bar1.jpg", alt: "Restaurant Bar", category: "Ambiance" },
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
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function RestaurantGallery() {
  const { storeFormData } = useStoreContext();
  const { name, slug, themeSettings } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || "#FF5722"; // Deep Orange

  const handleImageClick = (image: GalleryImage) => {
    alert(`Viewing image: ${image.alt}. In a real app, this would open a lightbox.`);
    // You would typically open a lightbox component here
    // e.g., setIsLightboxOpen(true); setSelectedImage(image);
  };

  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
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
            Our Visual Feast
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 drop-shadow-md"
            variants={itemVariants}
          >
            A Glimpse Into Our World
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            From exquisite dishes to our inviting ambiance, explore the beauty and passion that define {name || "Unbite"}.
          </motion.p>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[150px]" // Responsive grid with fixed row height
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {sampleGalleryImages.map((image) => (
            <motion.div
              key={image.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
              className={`relative rounded-lg overflow-hidden shadow-md cursor-pointer group ${image.span || ''}`} // Apply span classes
              onClick={() => handleImageClick(image)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loader={loader}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" // Optimize image loading
              />
              {/* Overlay with View Icon */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <EyeIcon className="h-10 w-10 text-white" />
              </div>
              {/* Optional: Category Tag */}
              <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {image.category}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View Full Gallery CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Want to see more of our culinary artistry and beautiful spaces?
          </p>
          <Link
            href={`/${slug}/gallery`} // Link to a dedicated full gallery page
            className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg shadow-xl hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            View Full Gallery
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
