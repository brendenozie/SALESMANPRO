'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '@/components/site/SkeletonGrid/SkeletonGrid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from "framer-motion";

// -------------------------
// NEW: Modern animation
// -------------------------
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

// -------------------------
// NEW: Your Mock Products Fallback
// -------------------------
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Midnight Velvet Blazer',
    sellingPrice: 150,
    finalPrice: 120,
    isDiscounted: true,
    discount: 20,
    isNewArrival: true,
    isOnOffer: true,
    isFlashDeal: false,
    isFeatured: true,
    isAvailable: true,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['Formal', 'Winter'],
    brand: 'LuxeWear',
  },
  {
    id: '2',
    name: 'Urban Street Bomber',
    sellingPrice: 85,
    finalPrice: 85,
    isDiscounted: false,
    isFlashDeal: true,
    isFeatured: true,
    isAvailable: true,
    images: [
      'https://images.unsplash.com/photo-1551028919-32163f06d420?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['Streetwear', 'Casual'],
    brand: 'StreetPulse',
  },
  {
    id: '3',
    name: 'Silk Summer Dress',
    sellingPrice: 200,
    finalPrice: 200,
    isNewArrival: true,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['Summer', 'Luxury'],
    brand: 'Ethereal',
  },
  {
    id: '4',
    name: 'Classic Denim Trucker',
    sellingPrice: 95,
    finalPrice: 75,
    isDiscounted: true,
    discount: 20,
    isOnOffer: true,
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['Denim', 'Vintage'],
    brand: 'BlueHeritage',
  },
];


const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export default function PopularProducts({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?id=${id}&flag=isFeatured&limit=8`;
  const fetcher = createCachedFetcher(`products-${id}-isFeatured`);

  // Retrieve cached data
  const fallbackData = typeof window !== 'undefined'
    ? (() => {
        try {
          return JSON.parse(
            localStorage.getItem(`swr-cache:products-${id}-isFeatured:${url}`) || 'null'
          );
        } catch {
          return null;
        }
      })()
    : null;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
    refreshInterval: 120000,
    fallbackData: fallbackData || undefined,
  });

  // -------------------------
  // PRIORITY:
  // 1. API data
  // 2. fallback cached data
  // 3. MOCK_PRODUCTS fallback
  // -------------------------

  const products =
    data?.data?.length > 0 ? data.data : MOCK_PRODUCTS;

  if (isLoading && !fallbackData) return <SkeletonGrid count={8} />;
  if (error) console.warn("API Error:", error);

  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Trending Now
          </h2>
          <p className="text-slate-500 max-w-md">
            Explore our most popular items, curated just for you based on current seasonal trends.
          </p>
        </div>

        <a
          href="#"
          className="hidden md:flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all"
        >
          View All Products <ArrowRightIcon className="w-5 h-5" />
        </a>
      </div>

      {/* Product Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>

      {/* Mobile "View All" */}
      <div className="mt-12 text-center md:hidden">
        <button className="px-6 py-3 border border-slate-300 rounded-full text-slate-700 font-semibold">
          View All
        </button>
      </div>

    </section>
  );
}
