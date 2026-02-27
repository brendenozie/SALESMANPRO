'use client';

import { useStateContext } from '@/contexts/ContextProvider';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { MarketListingForm } from '@/types/typings';

// --- New Imports for Data Fetching ---
import useSWR from 'swr';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Loader for Next.js image optimization
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// ... [Keep dummyProducts array here as fallback] ...
const dummyProducts: MarketListingForm[] = [
  // ... (Your existing dummy data) ...
];

const staggerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const productVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

// --- Product Grid Item (Unchanged Logic, just ensuring types) ---
const ProductGridItem = ({ product, isFeatured = false, primary, secondary, slug }: { product: MarketListingForm, isFeatured?: boolean, primary: string, secondary: string, slug: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { cart } = useStateContext(); // Keeping context usage if you need cart logic later

  const discount = product.sellingPrice && product.finalPrice && product.sellingPrice > product.finalPrice
    ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
    : null;

  // Safe image source logic
  const rawImage = product.images && product.images.length > 0 ? product.images[0] : null;
  // Handle if rawImage is an object (Sanity/CMS style) or string url
  const imageUrl = (typeof rawImage === 'string') 
    ? rawImage 
    : (rawImage as any)?.url || 'https://via.placeholder.com/300';
    
  const imageSrc = imageUrl && imageUrl.trim() !== '' ? imageUrl : 'https://via.placeholder.com/300';

  return (
    <motion.div
      className={`relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 ${isFeatured ? 'md:col-span-2' : ''}`}
      variants={productVariants}
    >
      <Link href={`/ecommerceshoes/products/${product.id}`} className="relative block w-full" style={{ height: isFeatured ? '500px' : '300px' }}>
        <Image
          src={imageSrc}
          alt={product.name}
          layout="fill"
          objectFit={isFeatured ? 'cover' : 'contain'}
          className="transition-transform duration-500 group-hover:scale-110"
          loader={loader}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white text-md font-semibold px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            View Details
          </motion.span>
        </div>
        {discount !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute top-3 left-3 z-10 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-md"
            style={{ backgroundColor: secondary }}
          >
            -{discount}% OFF
          </motion.div>
        )}
      </Link>

      <div className="p-5 flex flex-col justify-between flex-grow">
        <h4 className="text-xl font-bold text-gray-900 mb-2 truncate" title={product.name}>
          {product.name}
        </h4>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold" style={{ color: primary }}>
            {(product.finalPrice ?? 0).toFixed(2)}
          </span>
          {product.sellingPrice && product.finalPrice && product.sellingPrice > product.finalPrice && (
            <span className="text-base line-through text-gray-500">
              {product.sellingPrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1 text-yellow-500 text-sm">
          <StarIcon className="w-5 h-5" />
          <span className="font-semibold">4.5</span>
          <span className="text-gray-500 ml-1">(149 reviews)</span>
        </div>
      </div>
    </motion.div>
  );
};

interface PopularProductsProps {
  id: string; // Added ID to props for API fetching
  themeSettings?: any;
  marketplaceListings?: MarketListingForm[]; // Optional initial data
  slug?: string;
}

export default function PopularProducts({ id, themeSettings, marketplaceListings, slug }: PopularProductsProps) {
  const primary = themeSettings?.primaryColor || '#f97316';
  const secondary = themeSettings?.secondaryColor || '#3b82f6';

  // --- Data Fetching Logic ---
  // We request 'isFeatured' products, or generic products if you prefer. 
  // Limiting to 5 to match the specific grid layout (1 big + 2 small + 2 small row if expanded, or just 1 big 2 small).
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isFeatured&limit=5`;
  const cacheKey = `products-${id}-isFeatured`;
  const fetcher = createCachedFetcher(cacheKey);

  // Use passed marketplaceListings as fallbackData for immediate render if available
  const { data, error, isLoading } = useSWR(url, fetcher, {
    fallbackData: marketplaceListings && marketplaceListings.length > 0 ? { data: marketplaceListings } : undefined,
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  // Determine which products to show: API data -> Prop Data -> Dummy Data
  const productsToShow: MarketListingForm[] = 
    data?.data?.length > 0 ? data.data : 
    (marketplaceListings && marketplaceListings.length > 0) ? marketplaceListings : 
    dummyProducts;

  // --- Loading State ---
  // Using SkeletonGrid, but we might want a custom one for this specific layout later.
  if (isLoading && !productsToShow.length) {
    return (
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
           <SkeletonGrid count={5} />
        </div>
      </section>
    );
  }

  if (error && !productsToShow.length) return null; // Or handle error gracefully

  return (
    <section className="py-20 bg-gray-100 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        {/* Section Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Top Picks, <br /> Just for You
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Explore our most sought-after products, hand-picked for their style, comfort, and quality.
        </p>

        {/* Product Grid with preserved dynamic layout */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10"
          variants={staggerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          {productsToShow.slice(0, 5).map((product, index) => (
            <ProductGridItem
              key={product.id || index}
              product={product}
              isFeatured={index === 0} // This preserves your "Big First Item" design
              primary={primary}
              secondary={secondary}
              slug={product.id || 'your-store'}
            />
          ))}
        </motion.div>

        {/* See More Button */}
        <div className="mt-20">
          <Link href={`/ecommerceshoes/products`} passHref legacyBehavior>
            <motion.a
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              style={{ backgroundColor: primary }}
              className="inline-block px-10 py-4 text-white rounded-full font-semibold shadow-xl cursor-pointer"
            >
              View All Products
            </motion.a>
          </Link>
        </div>
      </div>
    </section>
  );
}