'use client';

import { useStateContext } from '@/contexts/ContextProvider';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { MarketListingForm } from '@/types/typings';
import useSWR from 'swr';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const productVariants = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const ProductGridItem = ({ product, isFeatured = false, primary, secondary }: { product: MarketListingForm, isFeatured?: boolean, primary: string, secondary: string, slug: string }) => {
  const discount = product.sellingPrice && product.finalPrice && product.sellingPrice > product.finalPrice
    ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
    : null;

  const rawImage = product.images?.[0];
  const imageSrc = (typeof rawImage === 'string' ? rawImage : (rawImage as any)?.url) || 'https://via.placeholder.com/300';

  return (
    <motion.div
      variants={productVariants}
      className={`relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-black/5 dark:shadow-white/5 overflow-hidden group border border-gray-100 dark:border-slate-800 transition-all duration-500 hover:-translate-y-2 ${isFeatured ? 'md:col-span-2' : ''}`}
    >
      {/* Image Area */}
      <Link href={`/ecommerceshoes/products/${product.id}`} className="relative block w-full bg-gray-50 dark:bg-slate-800/50 overflow-hidden" style={{ height: isFeatured ? '450px' : '280px' }}>
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          style={{ objectFit: isFeatured ? 'cover' : 'contain' }}
          className="p-6 transition-transform duration-700 group-hover:scale-110"
          loader={loader}
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <span className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            Quick View
          </span>
        </div>

        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-4 left-4 z-10 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg" style={{ backgroundColor: secondary }}>
            {discount}% OFF
          </div>
        )}
      </Link>

      {/* Details Area */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-clip" title={product.name}>
            {product.name}
          </h4>
          <div className="flex items-center gap-1 text-yellow-500 shrink-0">
            <StarIcon className="w-4 h-4" />
            <span className="text-xs font-black">4.5</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black" style={{ color: primary }}>
              ${(product.finalPrice ?? 0).toFixed(2)}
            </span>
            {product.sellingPrice && product.finalPrice && product.sellingPrice > product.finalPrice && (
              <span className="text-sm line-through text-gray-400 dark:text-gray-500 font-medium">
                ${product.sellingPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <button 
            className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-white hover:text-white transition-all"
            style={{ '--hover-bg': primary } as any}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = primary)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function PopularProducts({ id, themeSettings, marketplaceListings, slug = 'store' }: any) {
  const primary = themeSettings?.primaryColor || '#f97316';
  const secondary = themeSettings?.secondaryColor || '#3b82f6';

  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isFeatured&limit=5`;
  const { data, isLoading } = useSWR(url, createCachedFetcher(`products-${id}-featured`), {
    fallbackData: marketplaceListings?.length ? { data: marketplaceListings } : undefined,
  });

  const productsToShow: MarketListingForm[] = data?.data?.length > 0 ? data.data : [];

  if (isLoading && !productsToShow.length) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-6"><SkeletonGrid count={5} /></div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gray-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              Top Picks, <br /><span style={{ color: primary }}>Just for You</span>
            </h2>
            <p className="mt-4 text-gray-600 dark:text-slate-400 max-w-xl font-medium">
              Explore our most sought-after products, hand-picked for their style, comfort, and uncompromising quality.
            </p>
          </div>
          <Link href={`/ecommerceshoes/products`} className="hidden md:flex items-center gap-2 font-bold text-sm uppercase tracking-widest hover:opacity-70 transition-opacity dark:text-white">
            View Collection <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        >
          {productsToShow.slice(0, 5).map((product, index) => (
            <ProductGridItem
              key={product.id || index}
              product={product}
              isFeatured={index === 0}
              primary={primary}
              secondary={secondary}
              slug={slug}
            />
          ))}
        </motion.div>

        {/* Mobile View All */}
        <div className="mt-12 md:hidden flex justify-center">
          <Link href={`/ecommerceshoes/products`} className="px-8 py-4 rounded-full text-white font-bold shadow-xl shadow-orange-500/20" style={{ backgroundColor: primary }}>
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}