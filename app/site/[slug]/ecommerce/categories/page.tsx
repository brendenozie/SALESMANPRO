'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRightIcon, ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import Section from '@/components/site/Section/Section';
import { useStore } from '@/contexts/StoreContext';
import clsx from 'clsx';
import { IStoreCategory } from '@/types/typings';

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1, 
        transition: { staggerChildren: 0.07, delayChildren: 0.1 } 
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        transition: { type: 'spring', stiffness: 100, damping: 15 } 
    },
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// =========================================================
// --- CATEGORY CARD COMPONENT ---
// =========================================================

const CategoryCard = ({ cat, storeSlug }: { cat: IStoreCategory, storeSlug: string }) => {
    // Check if icon is a URL or a simple emoji/string
    const isImageUrl = cat.icon?.startsWith('http') || cat.icon?.startsWith('/');
    const categoryName = cat.displayName || (cat as any).category?.name || 'Category';
    
    // Path logic: Adjust this to match your folder structure exactly
    const linkHref = `/${storeSlug}/products?category=${cat.id}`;

    return (
        <motion.div variants={cardVariants}>
            <Link
                href={linkHref}
                className={clsx(
                    "group relative block rounded-2xl overflow-hidden transition-all duration-300",
                    isImageUrl 
                        ? "shadow-lg hover:shadow-2xl h-64 md:h-80" 
                        : "bg-white dark:bg-gray-800 shadow-md hover:shadow-lg h-40 flex items-center justify-center p-6 border border-gray-100 dark:border-gray-700"
                )}
            >
                {isImageUrl ? (
                    <>
                        <div className="absolute inset-0 w-full h-full">
                            <Image
                                src={cat.icon!}
                                alt={categoryName}
                                loader={imageLoader}
                                fill
                                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </div>
                        
                        <div className="absolute bottom-0 left-0 p-5 z-10 w-full text-white">
                            <h3 className="text-xl font-bold mb-1 line-clamp-1 group-hover:translate-x-1 transition-transform">
                                {categoryName}
                            </h3>
                            <div className="flex items-center text-xs font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                Shop Collection <ChevronRightIcon className="w-3 h-3 ml-1" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-14 h-14 mb-3 mx-auto rounded-2xl bg-primary/10 dark:bg-gray-700 flex items-center justify-center text-3xl">
                            {(!cat.icon || cat.icon.length > 4) ? (
                                <ArrowRightCircleIcon className="w-8 h-8 text-primary"/>
                            ) : (
                                <span>{cat.icon}</span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                            {categoryName}
                        </h3>
                        <p className="text-xs text-primary font-semibold mt-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            View More <ChevronRightIcon className="w-3 h-3 ml-1" />
                        </p>
                    </div>
                )}
            </Link>
        </motion.div>
    );
};

// =========================================================
// --- MAIN CATEGORIES PAGE ---
// =========================================================

export default function CategoriesPage() {
    const store = useStore();
    const categories = store?.storeFormData?.StoreCategory || [];
    const storeSlug = store?.storeFormData?.slug;

    // Use memo to prevent re-sorting on every render
    const sortedCategories = useMemo(() => {
        const withImg = categories.filter(cat => cat.icon?.startsWith('http') || cat.icon?.startsWith('/'));
        const withoutImg = categories.filter(cat => !cat.icon?.startsWith('http') && !cat.icon?.startsWith('/'));
        return [...withImg, ...withoutImg];
    }, [categories]);

    if (!storeSlug) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400 font-medium">Loading store details...</div>
            </div>
        );
    }

    return (
        <main className="bg-gray-50 dark:bg-gray-950 min-h-screen pt-24 pb-20">
            <Section title="Shop by Category">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                    {categories.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                            <p className="text-gray-500">No categories found in this store.</p>
                        </div>
                    ) : (
                        <motion.div 
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
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
        </main>
    );
}