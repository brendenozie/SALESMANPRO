'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRightIcon, CubeIcon, TagIcon } from '@heroicons/react/24/solid';

// --- MOCK INTERFACES for local use (Replace with actual imports if needed) ---
interface ISubcategory {
    id: string;
    slug: string;
    name: string;
}

interface IStoreCategory {
    id: string;
    slug: string;
    displayName: string;
    image?: string;
    subcategories: ISubcategory[];
}

// --- Mock Data for Fallback ---
const fallbackCategories: IStoreCategory[] = [
    {
        id: 'cat1',
        slug: 'hardware',
        displayName: 'Enterprise Hardware',
        image: 'https://images.unsplash.com/photo-1549490349-801282101348?q=80&w=2670&auto=format&fit=crop',
        subcategories: [
            { id: 'sub1', slug: 'servers', name: 'Servers & Storage' },
            { id: 'sub2', slug: 'networking', name: 'Networking Gear' },
        ],
    },
    {
        id: 'cat2',
        slug: 'software',
        displayName: 'Cloud Software',
        image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2670&auto=format&fit=crop',
        subcategories: [
            { id: 'sub3', slug: 'crm', name: 'CRM Solutions' },
            { id: 'sub4', slug: 'erp', name: 'ERP Systems' },
        ],
    },
    {
        id: 'cat3',
        slug: 'services',
        displayName: 'Consulting Services',
        image: 'https://images.unsplash.com/photo-1543269865-0a740fa7c42b?q=80&w=2670&auto=format&fit=crop',
        subcategories: [
            { id: 'sub5', slug: 'strategy', name: 'IT Strategy' },
            { id: 'sub6', slug: 'security', name: 'Cyber Security' },
        ],
    },
];
// --- End Mock Data ---


// --- Helper: Image Loader (Kept Consistent) ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Component Props ---
interface EnhancedCategoriesSectionProps {
  categories?: IStoreCategory[];
  slug: string;
  isSubPage?: boolean;
}

// --- Animation Variants (Updated for cleaner corporate look) ---
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  hover: { scale: 1.03, boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }, // Indigo shadow
};

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// --- Core Component ---
export default function EnhancedCategoriesSection({ categories, slug, isSubPage = false }: EnhancedCategoriesSectionProps) {
  const router = useRouter();
  
  const actualCategories = (categories && categories.length > 0) ? categories : fallbackCategories;
  
  // Logic remains the same, but uses actualCategories
  const isShowSubcategories = isSubPage || actualCategories.length < 4;
  
  const itemsToDisplay = isShowSubcategories
    ? actualCategories.flatMap(cat => cat.subcategories).slice(0, 8)
    : actualCategories;

  // Function to determine the image source
  const getImageUrl = (item: any): string => {
    if ('name' in item && 'slug' in item) { // Assumes ISubcategory
        // Placeholder for subcategories if they lack images in the API structure
        return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop';
    }
    // Assumes IStoreCategory
    return item.image || 'https://images.unsplash.com/photo-1549490349-801282101348?q=80&w=2670&auto=format&fit=crop';
  };

  const getName = (item: any): string => {
    if ('name' in item && 'slug' in item) { // ISubcategory
        return item.name;
    }
    return item.displayName || item.category?.name || 'Unknown Category';
  };

  const getSlug = (item: any): string => {
    if ('name' in item && 'slug' in item) { // ISubcategory
        const parentCategory = actualCategories.find(cat => cat.subcategories.includes(item));
        return `${slug}/category/${parentCategory?.slug}/${item.slug}`;
    }
    // IStoreCategory
    return `${slug}/category/${item.slug || item.id}`;
  };

  return (
    // Updated background to light gray/dark gray
    <section className="py-24 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden relative">
        {/* Subtle Grid Background (Consistent Theme) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            {/* Section Header - Styled for Corporate/Editorial Theme */}
            <motion.div
                className="text-center mb-16 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <div className="flex items-center justify-center gap-2 mb-3">
                    {isShowSubcategories ? 
                        <TagIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> : 
                        <CubeIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    }
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-sm">
                        {isShowSubcategories ? 'Deep Dive Topics' : 'Product Catalog'}
                    </span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                    {isShowSubcategories ? 'Jump to Subcategories' : 'Explore Diverse Product Worlds'}
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    Browse our full range of solutions, organized by key domains.
                </p>
            </motion.div>

            {/* Categories Grid */}
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {itemsToDisplay?.map((item, index) => {
                    const name = getName(item);
                    const imageUrl = getImageUrl(item);
                    const itemSlug = getSlug(item);

                    return (
                        <motion.div
                            key={item.id}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            whileHover="hover"
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{
                                delay: index * 0.08,
                            }}
                            // Adjusted styling for a cleaner card
                            className="relative rounded-xl overflow-hidden shadow-xl cursor-pointer group aspect-video border-2 border-transparent hover:border-indigo-500 transition-colors duration-300"
                            onClick={() => router.push(itemSlug)}
                            aria-label={`Explore ${name}`}
                        >
                            {/* Image */}
                            <Image
                                src={imageUrl}
                                alt={name || 'Category image'}
                                fill
                                loader={loader}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                // Slightly brighter default image
                                className="object-cover w-full h-full brightness-[.75] group-hover:brightness-[.6] group-hover:scale-105 transition-all duration-500 ease-in-out"
                                priority={index < 4}
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent group-hover:from-black/90 transition-all duration-300" />

                            {/* Text Content */}
                            <motion.div
                                className="absolute bottom-6 left-6 right-6 z-10 flex flex-col items-start"
                                variants={textVariants}
                                transition={{ delay: index * 0.08 + 0.3, duration: 0.5 }}
                            >
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-lg">{name}</h3>
                                <div className="inline-flex items-center text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300">
                                    <span className="text-sm font-medium">Browse Solutions</span>
                                    <ArrowRightIcon className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </section>
  );
}