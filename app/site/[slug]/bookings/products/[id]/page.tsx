// app/[slug]/products/[productId]/page.tsx
"use client";

import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb'; // This import is for server-side
import Image from 'next/image';
// import ProductCard from '@/components/shop/ProductCard'; // Assuming ProductCard is the correct component for individual products
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { StarIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import { useStateContext } from '@/contexts/ContextProvider';
import { StoreForm, MarketListingForm } from '@/types/typings'; // Import relevant types
import ProductCard from '@/components/site/layouts/EcommerceLayout/body/components/ProductCard';
import { findCompanyCached } from '@/lib/company-fetcher';

interface PageProps {
  params: Promise<{ slug: string; productId: string }>;
}

// Ensure this is a server component as it fetches data
export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: PageProps) {
  const { slug, productId } = await params;

  // Fetch store data
  const rawStore = await findCompanyCached(slug, "lean");
  if (!rawStore) notFound();

  // Fetch product and related items
  const product = await prisma.marketplaceListings.findFirst({
    where: { id: productId, company: { slug } },
    // Ensure images are included if your schema supports it and it's needed
    // include: { images: true }, // Uncomment if 'images' is a relation in your Prisma schema
  });
  if (!product) notFound();

  // Assuming product.images is an array of objects with a 'url' property
  // Add a fallback for images if the include is not enabled or data structure differs
  // const productWithImages = {
  //   ...product,
  //   images: product.images || [{ url: '/placeholder-image.png' }], // Fallback for images
  //   rating: 4.5, // product.rating ||  Default rating if not available
  //   reviews: 100, // product.reviews || Default reviews if not available
  // };


  const related = await prisma.marketplaceListings.findMany({
    where: {
      companyId: product.companyId,
      productCategoryId: product.productCategoryId,
      NOT: { id: product.id },
    },
    take: 4,
    // include: { images: true }, // Uncomment if 'images' is a relation in your Prisma schema
  });

  // Prepare related products with fallback images
  const relatedWithImages = related.map(item => ({
    ...item,
    images: item.images || [{ url: '/placeholder-image.png' }],
  }));

  return (
    // Pass rawStore to ProductDetail to access theme settings in client component
    <ProductDetail product={product as MarketListingForm} related={relatedWithImages as MarketListingForm[]} storeData={rawStore as unknown as StoreForm} />
  );
}

// ProductDetail is a client component
function ProductDetail({ product, related, storeData }: {
  product: MarketListingForm;
  related: MarketListingForm[];
  storeData: StoreForm;
}) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);

  // Access theme settings from storeData passed from the server
  const primary = storeData.themeSettings?.primaryColor || '#10B981'; // Default: Emerald
  const secondary = storeData.themeSettings?.secondaryColor || '#3B82F6'; // Default: Blue

  const quantity = cart.find((c: any) => c.id === product.id)?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleDecreaseQuantity = () => {
    decreaseQuantity(product.id);
  };

  const currentImage = product.images?.[mainIndex]?.url || '/placeholder-image.png';

  // Variants for image animation
  const imageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-black text-gray-800 dark:text-gray-200 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image Gallery */}
        <div className="lg:sticky lg:top-8 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={mainIndex} // Key changes to re-trigger animation on image change
              variants={imageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="relative w-full aspect-video md:aspect-square lg:aspect-video rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <Image
                src={currentImage || 'https://via.placeholder.com/600x400?text=No+Image'}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain bg-white dark:bg-gray-800" // Use object-contain and a background for better fit
              />
            </motion.div>
          </AnimatePresence>

          <div className="flex mt-6 space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {product.images?.map((img: any, idx: number) => (
              <motion.button
                key={idx}
                onClick={() => setMainIndex(idx)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ${
                  idx === mainIndex ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : 'ring-2 ring-gray-300 dark:ring-gray-700'
                }`}
                style={idx === mainIndex ? { borderColor: primary, boxShadow: `0 0 0 4px ${primary}` } : {}} // Dynamic ring color
              >
                <Image
                  src={img.url || 'https://via.placeholder.com/96x96?text=No+Image'}
                  alt={`${product.name}-${idx}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-6 w-6 transition-colors duration-200 ${
                    // product.rating && product.rating > i ? 'text-yellow-400' : 
                    'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-lg font-medium text-gray-700 dark:text-gray-300">
              {/* {product.rating ? `(${product.rating.toFixed(1)})` :  */}
              {'(No reviews yet)'}
            </span>
            {/* {product.reviews && product.reviews > 0 && (
              <span className="text-gray-500 dark:text-gray-400">({product.reviews} reviews)</span>
            )} */}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-extrabold" style={{ color: primary }}>
              ${product.finalPrice?.toFixed(2) || '0.00'}
            </span>
            {typeof product.sellingPrice === 'number' && typeof product.finalPrice === 'number' && product.sellingPrice > product.finalPrice && (
              <span className="text-2xl line-through text-gray-500 dark:text-gray-400">
                ${product.sellingPrice.toFixed(2)}
              </span>
            )}
            {typeof product.sellingPrice === 'number' && typeof product.finalPrice === 'number' && product.sellingPrice > product.finalPrice && (
              <span className="ml-3 px-3 py-1 bg-red-500 text-white rounded-full text-lg font-bold">
                -{Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)}%
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {product.description || 'No description available for this product.'}
          </p>

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {quantity > 0 ? (
              <div className="flex items-center space-x-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDecreaseQuantity}
                  className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-red-100 dark:hover:bg-red-700 transition-all duration-200 shadow-sm"
                >
                  <MinusIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </motion.button>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{quantity}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddToCart}
                  className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-green-100 dark:hover:bg-green-700 transition-all duration-200 shadow-sm"
                >
                  <PlusIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full sm:w-auto flex-grow px-8 py-4 rounded-xl text-white font-bold text-xl shadow-lg transition-all duration-300 hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                }}
              >
                Add to Cart
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div title="You might also like" className="bg-gray-50 dark:bg-gray-900 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Iterating directly over related products and rendering ProductCard */}
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </div>
      )}

      <NewsletterSection />
    </div>
  );
}