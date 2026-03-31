"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { EyeIcon } from "@heroicons/react/24/solid"; // For the view icon

// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from "@/contexts/StoreContext"; // Adjust path as needed

// Define types for the data expected from StoreContext, aligning with a potential backend schema
export type GalleryImage = {
  id: string;
  imageUrl: string; // Changed from 'src' to 'imageUrl'
  altText: string; // Changed from 'alt' to 'altText'
  category: string; // Can be "Dishes", "Ambiance", "Events", "Team" etc.
  spanClasses?: string; // Tailwind grid span classes like 'col-span-2 row-span-2'
  order: number; // For sorting
};

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  id?: string;
  name?: string; // Restaurant name, for section title
  slug?: string; // For constructing dynamic links
  galleryImages?: GalleryImage[]; // Array of gallery images
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

// Static fallback gallery images data
const fallbackGalleryImages: GalleryImage[] = [
  { id: "fb-g1", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", altText: "Restaurant Interior", category: "Ambiance", spanClasses: "md:col-span-2 md:row-span-2", order: 1 },
  {
    id: "fb-g2",
    imageUrl:
      "https://blog-assets.lightspeedhq.com/img/2021/10/a1a3dafe-2.jpg?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    altText: "Delicious Pasta with sauce and herbs",
    category: "Dishes",
    order: 2,
  },
  {
    id: "fb-g3",
    imageUrl:
      "https://bdc2020.o0bc.com/wp-content/uploads/2017/08/081317coverpicmain-630a6433d8b2e.jpg?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    altText: "Perfectly Grilled Steak on a plate",
    category: "Dishes",
    order: 3,
  },
  {
    id: "fb-g4",
    imageUrl:
      "https://designbyfinch.com/wp-content/uploads/2023/07/nsk.jpg?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    altText: "Chef in Action preparing food in a busy kitchen",
    category: "Team",
    spanClasses: "md:col-span-2",
    order: 4,
  },
  {
    id: "fb-g5",
    imageUrl:
      "https://dozi4r4ug9739.cloudfront.net/images/1762616074584-pexels-pixabay-260922.jpg?w=1920&q=75&auto=format&fit=crop",
    altText: "Elegant Dessert Platter with fruit and chocolate",
    category: "Dishes",
    order: 5,
  },
  {
    id: "fb-g6",
    imageUrl:
      "https://www1.lovethatdesign.com/wp-content/uploads/2021/09/Love-That-Design-Nairobi-Street-Kitchen-Kenya-10-2048x1152.jpg?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    altText: "Stylish Cocktail Bar ambiance at night",
    category: "Ambiance",
    order: 6,
  },
  {
    id: "fb-g7",
    imageUrl:
      "https://www.lavenderthemes.com/wp-content/uploads/2020/05/restaurant-website-design.jpg?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    altText: "Cozy dining area with warm lighting",
    category: "Ambiance",
    order: 7,
  }
]

export default function RestaurantGallery() {
  const { storeFormData } = useStoreContext() as { storeFormData : StoreForm };
  const { name, slug, themeSettings, galleryImages } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || "#FF5722"; // Deep Orange
  const secondaryColor = themeSettings?.secondaryColor || "#3F51B5"; // Indigo

  // Determine which gallery images to render: dynamic or fallback
  const imagesToRender = Array.isArray(galleryImages) && galleryImages.length > 0
    ? galleryImages.sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackGalleryImages;

  const handleImageClick = (image: GalleryImage) => {
    console.log(`Viewing image: ${image.altText}. In a real app, this would open a lightbox.`);
    // You would typically open a lightbox component here
    // e.g., setIsLightboxOpen(true); setSelectedImage(image);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevents infinite loop if placeholder also fails
    e.currentTarget.src = "https://placehold.co/400x300/CCCCCC/333333?text=Image+Error";
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
          <motion.p className="text-sm uppercase tracking-widest font-semibold" style={{ color: primaryColor }} variants={itemVariants}>
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
            From exquisite dishes to our inviting ambiance, explore the beauty and passion that define {name || "our restaurant"}.
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
          {imagesToRender.map((image) => (
            <motion.div
              key={image.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
              className={`relative rounded-lg overflow-hidden shadow-md cursor-pointer group ${image.spanClasses || ''}`} // Apply span classes
              onClick={() => handleImageClick(image)}
            >
              <Image
                src={image.imageUrl}
                alt={image.altText}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loader={loader}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" // Optimize image loading
                onError={handleImageError}
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
            href={`/restaurent/gallery`} // Link to a dedicated full gallery page
            className="px-8 py-4 text-white rounded-full font-bold text-lg shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            style={{ backgroundColor: primaryColor, '--tw-hover-bg': secondaryColor } as React.CSSProperties}
          >
            View Full Gallery
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
