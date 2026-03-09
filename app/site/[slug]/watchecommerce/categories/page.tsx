'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRightIcon, ArrowRightCircleIcon } from '@heroicons/react/24/outline'; // Added for visual flow
import Section from '@/components/site/Section/Section'; // Assuming this component exists
import { useStore } from '@/contexts/StoreContext';
import clsx from 'clsx';
import { IStoreCategory } from '@/types/typings'; // Assuming your category type is defined here

// --- Animation Variants ---
const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } },
};
const containerVariants = {
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// =========================================================
// --- CATEGORY CARD COMPONENT (Reimagined) ---
// =========================================================

const CategoryCard = ({ cat, storeSlug }: { cat: IStoreCategory, storeSlug: string }) => {
    const hasImage = cat.icon && cat.icon.startsWith('http');
    const categoryName = cat.displayName || cat.category?.name || 'Unknown Category';
    const linkHref = `/site/${storeSlug}/ecommerce/products?category=${cat.id}`;
    
    // Choose a placeholder/default icon if no image is available
    const defaultIcon = cat.icon || '📦'; 

    return (
        <motion.div variants={cardVariants}>
            <Link
                key={cat.id}
                href={linkHref}
                className={clsx(
                    "group relative block rounded-2xl overflow-hidden transition-all duration-300 transform",
                    hasImage 
                        ? "shadow-xl hover:shadow-2xl h-72 md:h-80" // Large card for image categories
                        : "bg-white dark:bg-gray-800 shadow-md hover:shadow-lg h-40 flex items-center justify-center p-6 border border-gray-100 dark:border-gray-700" // Smaller card for icon categories
                )}
            >
                {/* --- IMAGE CARD LAYOUT --- */}
                {hasImage ? (
                    <>
                        <div className="absolute inset-0 w-full h-full">
                            <Image
                                src={cat.icon!}
                                alt={categoryName}
                                loader={imageLoader}
                                fill
                                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Gradient Overlay for Text Contrast and Effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80" />
                        </div>
                        
                        {/* Text Content (Always white/bottom) */}
                        <div className="absolute bottom-0 left-0 p-6 z-10 w-full text-white">
                            <h3 className="text-2xl font-extrabold mb-1 line-clamp-1">
                                {categoryName}
                            </h3>
                            <div className="flex items-center text-sm font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                                Shop Now <ChevronRightIcon className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </>
                ) : (
                    /* --- ICON CARD LAYOUT (Fallback/Simpler) --- */
                    <div className="text-center">
                        <div className="w-16 h-16 mb-3 mx-auto rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center text-3xl text-blue-600 dark:text-blue-400">
                            {defaultIcon.length > 2 ? <ArrowRightCircleIcon className="w-8 h-8"/> : <span>{defaultIcon}</span>}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-2 line-clamp-1">
                            {categoryName}
                        </h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 flex items-center justify-center">
                            View Products <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </p>
                    </div>
                )}
            </Link>
        </motion.div>
    );
};

// =========================================================
// --- MAIN CATEGORIES PAGE COMPONENT ---
// =========================================================

export default function CategoriesPage() {
    const store = useStore();
    const categories = store?.storeFormData?.StoreCategory || [];
    const storeSlug = store?.storeFormData?.slug;

    if (!storeSlug) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl font-medium text-gray-600 dark:text-gray-300">Store not found</p>
            </div>
        );
    }

    // Separate categories into those with images and those without for a dynamic layout
    const categoriesWithImages = categories.filter(cat => cat.icon && cat.icon.startsWith('http'));
    const categoriesWithoutImages = categories.filter(cat => !cat.icon || !cat.icon.startsWith('http'));
    
    // Combine them, prioritizing image categories for visual impact
    const sortedCategories = [...categoriesWithImages, ...categoriesWithoutImages];

    return (
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen pt-20 pb-16">
            <Section 
                title="Shop by Category"
                // subtitle="Explore our curated collections of products and programs designed to help you thrive."
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {categories.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            <p>No categories available.</p>
                        </div>
                    ) : (
                        <motion.div 
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8" // Increased gap and refined grid
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {sortedCategories.map((cat: IStoreCategory) => (
                                <CategoryCard key={cat.id} cat={cat} storeSlug={storeSlug} />
                            ))}
                        </motion.div>
                    )}
                </div>
            </Section>
        </div>
    );
}